import { $, $$, baseName, bindDropzone, downloadBlob, enableReorder, escapeHtml, formatBytes, moveItem, setStatus } from './common.ts';
import { IMG_EXT, MAX_PIXELS, decodeImage, drawScaled, toBlob } from './image.ts';
import { friendlyPdfError, getPDFLib, openPdfJsDoc, readBytes } from './pdf.ts';
import type { FilterId } from './scan-effects.ts';
import type { AspectMode } from './scan-warp.ts';
import { createZip } from './zip.ts';

type Q = [number, number][]; // empat sudut ternormalisasi 0..1: kiri-atas, kanan-atas, kanan-bawah, kiri-bawah
const FULL: Q = [[0, 0], [1, 0], [1, 1], [0, 1]];
const isFull = (q: Q) => q.every((p, i) => Math.abs(p[0] - FULL[i][0]) < 1e-6 && Math.abs(p[1] - FULL[i][1]) < 1e-6);

type Result = { blob: Blob; w: number; h: number; thumb: HTMLCanvasElement };
type Page = {
  id: number;
  file: File; // sumber (foto, atau halaman PDF yang sudah dirender)
  srcName: string; // nama berkas asli
  fromPdf: boolean;
  previewUrl: string;
  detectData: { buf: ArrayBuffer; w: number; h: number } | null;
  quad: Q;
  mode: 'auto' | 'manual' | 'full';
  detected: boolean | null;
  rot: number;
  result: Result | null;
  state: string;
  el: HTMLElement;
  error?: string;
};

const QUALITY = { standar: { maxSide: 1800, q: 0.82 }, tajam: { maxSide: 2600, q: 0.88 }, maksimal: { maxSide: 3400, q: 0.92 } } as const;
const A4: [number, number] = [595.28, 841.89];

const statusEl = $('#sc-status');
const liveEl = $('#sc-live');
const optsEl = $('#sc-opts');
const resultsEl = $('#sc-results');
const gridEl = $('#sc-grid');
const summaryEl = $('#sc-summary');
const dlStatus = $('#sc-dlstatus');
const qualityEl = $('#sc-quality') as HTMLSelectElement;
const aspectEl = $('#sc-aspect') as HTMLSelectElement;
const pdfSizeEl = $('#sc-pdfsize') as HTMLSelectElement;
const marginEl = $('#sc-margin') as HTMLSelectElement;

let pages: Page[] = [];
let filter: FilterId = 'ajaib';
let seq = 0;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const yieldUi = () => new Promise<void>((r) => (document.hidden ? setTimeout(r, 0) : requestAnimationFrame(() => setTimeout(r, 0))));
const pad2 = (n: number) => String(n).padStart(2, '0');
const announce = (t: string) => (liveEl.textContent = t);
const cfg = () => QUALITY[qualityEl.value as keyof typeof QUALITY];

// ---------- worker (dengan cadangan di utas utama) ----------
let worker: Worker | null = null;
let useFallback = false;
let core: typeof import('./scan-core.ts') | null = null;
const pending = new Map<number, { res: (v: any) => void; rej: (e: Error) => void }>();
let callSeq = 0;

function getWorker(): Worker | null {
  if (useFallback) return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./scan-worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const m = e.data;
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      m.error ? p.rej(new Error(m.error)) : p.res(m);
    };
    worker.onerror = () => {
      useFallback = true;
      worker = null;
      pending.forEach((p) => p.rej(new Error('worker gagal')));
      pending.clear();
    };
  } catch {
    useFallback = true;
    worker = null;
  }
  return worker;
}

async function call(type: 'detect' | 'render', payload: any, transfer: Transferable[] = []): Promise<any> {
  const w = getWorker();
  if (w) {
    return new Promise((res, rej) => {
      const id = ++callSeq;
      pending.set(id, { res, rej });
      w.postMessage({ id, type, ...payload }, transfer);
    });
  }
  core ||= await import('./scan-core.ts');
  await wait(0);
  if (type === 'detect') return core.detect(new Uint8ClampedArray(payload.buf), payload.w, payload.h);
  const r = core.renderScan({ rgba: new Uint8ClampedArray(payload.buf), w: payload.w, h: payload.h, quad: payload.quad, maxSide: payload.maxSide, filter: payload.filter, inset: payload.inset, aspect: payload.aspect, refine: payload.refine });
  return { buf: r.data.buffer, w: r.w, h: r.h, snapped: r.snapped };
}

// ---------- pemasukan file ----------
function setStage(p: Page, ar: number) {
  const inner = p.el.querySelector('.tl-in') as HTMLElement;
  const box = 0.75;
  if (ar >= box) {
    inner.style.width = '100%';
    inner.style.height = (box / ar) * 100 + '%';
  } else {
    inner.style.height = '100%';
    inner.style.width = (ar / box) * 100 + '%';
  }
}

function buildCard(p: Page) {
  const el = document.createElement('div');
  el.className = 'tl-page tl-scan is-queued';
  el.draggable = true;
  el.setAttribute('role', 'group');
  el.innerHTML = `
    <div class="tl-box">
      <div class="tl-in">
        <img class="tl-orig" alt="Foto asli" src="${p.previewUrl}" draggable="false" />
        <img class="tl-res" alt="Hasil scan" draggable="false" />
        <svg class="tl-quad" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,0 100,0 100,100 0,100"></polygon><circle cx="0" cy="0"></circle><circle cx="0" cy="0"></circle><circle cx="0" cy="0"></circle><circle cx="0" cy="0"></circle></svg>
        <div class="tl-beam"></div>
        <div class="tl-brackets" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        <div class="tl-flash"></div>
      </div>
      <div class="tl-caption" data-cap>Menunggu…</div>
    </div>
    <div class="mt-2 flex items-center justify-between gap-1">
      <span class="text-xs font-bold text-slate-600" data-label></span>
      <span class="flex gap-1">
        <button type="button" class="tl-icon" data-act="left"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>
        <button type="button" class="tl-icon" data-act="right"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
      </span>
    </div>
    <div class="mt-2 flex flex-wrap gap-1">
      <button type="button" class="tl-icon" data-act="edit" title="Atur tepi"><i class="fa-solid fa-crop-simple" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="rotate" title="Putar"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="jpg" title="Unduh JPG"><i class="fa-solid fa-file-image" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="pdf" title="Unduh PDF"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="del" title="Hapus"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
    </div>
    <p class="mt-1 truncate text-xs text-slate-400" data-meta></p>`;
  p.el = el;
  setStage(p, 0.75);
  gridEl.appendChild(el);
}

function refreshLabels() {
  pages.forEach((p, i) => {
    const n = i + 1;
    p.el.setAttribute('aria-label', `Halaman ${n}`);
    (p.el.querySelector('[data-label]') as HTMLElement).innerHTML = `Hal. ${n}${p.rot ? ` <span class="text-gold-700">(${p.rot}&deg;)</span>` : ''}`;
    const set = (act: string, label: string, disabled?: boolean) => {
      const b = p.el.querySelector(`[data-act=${act}]`) as HTMLButtonElement;
      b.setAttribute('aria-label', label);
      if (disabled !== undefined) b.disabled = disabled;
    };
    set('left', `Geser halaman ${n} ke kiri`, i === 0);
    set('right', `Geser halaman ${n} ke kanan`, i === pages.length - 1);
    set('edit', `Atur tepi halaman ${n}`);
    set('rotate', `Putar halaman ${n} 90 derajat`);
    set('jpg', `Unduh halaman ${n} sebagai JPG`);
    set('pdf', `Unduh halaman ${n} sebagai PDF`);
    set('del', `Hapus halaman ${n}`);
  });
  const total = pages.reduce((s, p) => s + (p.result?.blob.size ?? 0), 0);
  const ready = pages.filter((p) => p.result).length;
  summaryEl.textContent = pages.length ? `${ready} dari ${pages.length} halaman siap${ready ? ` · sekitar ${formatBytes(total)}` : ''}` : '';
  resultsEl.classList.toggle('hidden', pages.length === 0);
  optsEl.classList.toggle('hidden', pages.length === 0);
}

function renderOrder() {
  pages.forEach((p) => gridEl.appendChild(p.el)); // memindahkan simpul yang sama, animasi dan keadaan tetap
  refreshLabels();
}

function setState(p: Page, state: 'queued' | 'scanning' | 'detected' | 'ready' | 'updating' | 'error', caption = '') {
  const c = p.el.classList;
  ['is-queued', 'is-scanning', 'is-detected', 'is-ready', 'is-updating', 'is-error'].forEach((k) => c.remove(k));
  if (state === 'updating') c.add('is-ready', 'is-updating');
  else c.add('is-' + state);
  p.state = state;
  (p.el.querySelector('[data-cap]') as HTMLElement).textContent = caption;
}

function metaText(p: Page): string {
  const size = p.result ? formatBytes(p.result.blob.size) : '';
  const note = p.error ? p.error : p.fromPdf ? 'Halaman PDF' : p.mode === 'manual' ? 'Tepi diatur manual' : p.mode === 'full' ? 'Seluruh gambar' : p.detected ? 'Dipotong dan diluruskan otomatis' : 'Tepi tidak terdeteksi, seluruh gambar';
  return [size, note].filter(Boolean).join(' · ');
}

async function addImageFile(file: File, srcName: string, fromPdf: boolean) {
  const dec = await decodeImage(file);
  const maxPrev = 900;
  const s = Math.min(1, maxPrev / Math.max(dec.width, dec.height));
  const prev = drawScaled(dec, Math.max(1, Math.round(dec.width * s)), Math.max(1, Math.round(dec.height * s)), '#ffffff');
  const previewUrl = URL.createObjectURL(await toBlob(prev, 'image/jpeg', 0.85));
  let detectData: Page['detectData'] = null;
  if (!fromPdf) {
    const ds = Math.min(1, 640 / Math.max(dec.width, dec.height));
    const dw = Math.max(1, Math.round(dec.width * ds));
    const dh = Math.max(1, Math.round(dec.height * ds));
    const dc = drawScaled(dec, dw, dh, '#ffffff');
    const id = dc.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, dw, dh);
    detectData = { buf: id.data.buffer, w: dw, h: dh };
    dc.width = dc.height = 0;
  }
  const ar = dec.width / dec.height;
  dec.close();
  prev.width = prev.height = 0;
  const p: Page = { id: ++seq, file, srcName, fromPdf, previewUrl, detectData, quad: FULL.map((x) => [...x]) as Q, mode: fromPdf ? 'full' : 'auto', detected: null, rot: 0, result: null, state: 'queued', el: null as any };
  pages.push(p);
  buildCard(p);
  setStage(p, ar);
  refreshLabels();
  jobs.push({ page: p, kind: 'scan' });
  void pump();
}

async function addPdf(file: File) {
  let doc: any;
  try {
    doc = await openPdfJsDoc(await readBytes(file));
  } catch (e) {
    throw new Error(friendlyPdfError(e, file.name));
  }
  try {
    if ((await doc.getPermissions()) !== null) throw new Error(friendlyPdfError(new Error('encrypted'), file.name));
    const target = Math.min(3400, cfg().maxSide);
    for (let n = 1; n <= doc.numPages; n++) {
      announce(`Membaca ${file.name}, halaman ${n} dari ${doc.numPages}`);
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      let scale = target / Math.max(base.width, base.height);
      if (base.width * scale * base.height * scale > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / (base.width * scale * base.height * scale));
      const vp = page.getViewport({ scale });
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(vp.width));
      c.height = Math.max(1, Math.round(vp.height));
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, canvas: c, viewport: vp }).promise;
      page.cleanup();
      const blob = await toBlob(c, 'image/jpeg', 0.94);
      c.width = c.height = 0;
      await addImageFile(new File([blob], `${baseName(file.name)}-p${n}.jpg`, { type: 'image/jpeg' }), file.name, true);
      await yieldUi();
    }
  } finally {
    doc.destroy?.();
  }
}

bindDropzone($('#sc-drop'), {
  accept: ['pdf', ...IMG_EXT],
  multiple: true,
  onReject: (n) => setStatus(statusEl, 'error', `Format tidak didukung: ${n.map(escapeHtml).join(', ')}. Gunakan JPG, PNG, WebP, atau PDF. Foto HEIC dari iPhone: ubah dulu ke JPG.`),
  onFiles: async (list) => {
    setStatus(statusEl, null);
    const errors: string[] = [];
    for (const f of list) {
      try {
        if (/\.pdf$/i.test(f.name)) await addPdf(f);
        else await addImageFile(f, f.name, false);
      } catch (e: any) {
        errors.push(escapeHtml(e?.message || `Gagal membaca ${f.name}`));
      }
    }
    if (errors.length) setStatus(statusEl, 'error', errors.join('<br>'));
  },
});

// ---------- antrean pemrosesan ----------
const jobs: { page: Page; kind: 'scan' | 'update' }[] = [];
let pumping = false;

async function pump() {
  if (pumping) return;
  pumping = true;
  try {
    while (jobs.length) {
      const j = jobs.shift()!;
      if (!pages.includes(j.page)) continue;
      try {
        if (j.kind === 'scan') await scanPage(j.page);
        else await updatePage(j.page);
      } catch (e: any) {
        j.page.error = 'Gagal memproses. Coba ganti filter atau atur tepi.';
        setState(j.page, 'error', 'Gagal');
        (j.page.el.querySelector('[data-meta]') as HTMLElement).textContent = j.page.error;
        console.error(e);
      }
      refreshLabels();
    }
  } finally {
    pumping = false;
  }
}

async function renderPage(p: Page) {
  const dec = await decodeImage(p.file);
  const s = Math.min(1, Math.sqrt(MAX_PIXELS / (dec.width * dec.height)));
  const w = Math.max(1, Math.round(dec.width * s));
  const h = Math.max(1, Math.round(dec.height * s));
  const c = drawScaled(dec, w, h, '#ffffff');
  dec.close();
  const img = c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, w, h);
  c.width = c.height = 0;
  const { maxSide, q } = cfg();
  const r = await call('render', { buf: img.data.buffer, w, h, quad: p.quad, maxSide, filter, inset: 0.006, aspect: aspectEl.value as AspectMode, refine: p.mode === 'auto' && p.detected === true }, [img.data.buffer]);
  const out = document.createElement('canvas');
  out.width = r.w;
  out.height = r.h;
  out.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(r.buf), r.w, r.h), 0, 0);
  const blob = await toBlob(out, 'image/jpeg', q);
  const tw = 360;
  const sc = Math.min(1, tw / Math.max(r.w, r.h));
  const thumb = document.createElement('canvas');
  thumb.width = Math.max(1, Math.round(r.w * sc));
  thumb.height = Math.max(1, Math.round(r.h * sc));
  const tctx = thumb.getContext('2d')!;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(out, 0, 0, thumb.width, thumb.height);
  out.width = out.height = 0;
  p.result = { blob, w: r.w, h: r.h, thumb };
}

function thumbUrl(p: Page): string {
  const t = p.result!.thumb;
  if (!p.rot) return t.toDataURL('image/jpeg', 0.85);
  const swap = p.rot === 90 || p.rot === 270;
  const c = document.createElement('canvas');
  c.width = swap ? t.height : t.width;
  c.height = swap ? t.width : t.height;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.drawImage(t, -t.width / 2, -t.height / 2);
  return c.toDataURL('image/jpeg', 0.85);
}

function reveal(p: Page, flash: boolean) {
  const res = p.el.querySelector('.tl-res') as HTMLImageElement;
  const r = p.result!;
  const swap = p.rot === 90 || p.rot === 270;
  setStage(p, swap ? r.h / r.w : r.w / r.h);
  res.src = thumbUrl(p);
  setState(p, 'ready');
  if (flash && !reduced()) {
    p.el.classList.add('just-revealed');
    setTimeout(() => p.el.classList.remove('just-revealed'), 900);
  }
  (p.el.querySelector('[data-meta]') as HTMLElement).textContent = metaText(p);
  refreshLabels();
}

const q100 = (v: number) => +(v * 100).toFixed(2);
function drawQuad(p: Page) {
  const svg = p.el.querySelector('.tl-quad') as SVGElement;
  svg.querySelector('polygon')!.setAttribute('points', p.quad.map((q) => `${q100(q[0])},${q100(q[1])}`).join(' '));
  svg.querySelectorAll('circle').forEach((c, i) => {
    c.setAttribute('cx', String(q100(p.quad[i][0])));
    c.setAttribute('cy', String(q100(p.quad[i][1])));
  });
}

async function scanPage(p: Page) {
  const fast = p.fromPdf || reduced();
  setState(p, 'scanning', 'Memindai…');
  announce(`Memindai halaman ${pages.indexOf(p) + 1} dari ${pages.length}`);
  const t0 = performance.now();
  await yieldUi();
  if (p.mode === 'auto' && p.detectData) {
    try {
      const d = p.detectData;
      p.detectData = null;
      const r = await call('detect', { buf: d.buf, w: d.w, h: d.h }, [d.buf]);
      p.detected = !!r.quad;
      p.quad = (r.quad as Q | null) ?? (FULL.map((x) => [...x]) as Q);
    } catch {
      p.detected = false;
    }
  }
  p.detectData = null;
  const renderP = renderPage(p);
  renderP.catch(() => {});
  if (!fast) {
    await wait(Math.max(0, 1000 - (performance.now() - t0)));
    if (p.detected) {
      drawQuad(p);
      setState(p, 'detected', 'Tepi terdeteksi');
      await wait(900);
      setState(p, 'scanning', 'Meluruskan dokumen…');
    } else {
      setState(p, 'scanning', p.mode === 'auto' ? 'Tepi tidak terdeteksi, seluruh gambar dipakai' : 'Memproses…');
      await wait(700);
    }
  }
  await renderP;
  if (!pages.includes(p)) return;
  reveal(p, true);
  announce(`Halaman ${pages.indexOf(p) + 1} selesai. ${metaText(p)}`);
}

async function updatePage(p: Page) {
  setState(p, 'updating', '');
  p.error = undefined;
  await yieldUi();
  await renderPage(p);
  if (!pages.includes(p)) return;
  reveal(p, false);
}

function scheduleUpdateAll() {
  clearTimeout((scheduleUpdateAll as any).t);
  (scheduleUpdateAll as any).t = setTimeout(() => {
    for (const p of pages) {
      if (!p.result && p.state !== 'error') continue; // yang belum selesai akan memakai pengaturan terbaru
      for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].page === p) jobs.splice(i, 1);
      jobs.push({ page: p, kind: 'update' });
      setState(p, 'updating', '');
    }
    void pump();
  }, 250);
}

// ---------- pengaturan global ----------
const radios = $$('#sc-filters [role=radio]');
function pick(btn: HTMLElement) {
  radios.forEach((r) => {
    const on = r === btn;
    r.setAttribute('aria-checked', String(on));
    r.tabIndex = on ? 0 : -1;
  });
  filter = btn.dataset.filter as FilterId;
  scheduleUpdateAll();
}
radios.forEach((r, i) => {
  r.addEventListener('click', () => pick(r));
  r.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    const d = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const t = radios[(i + d + radios.length) % radios.length];
    t.focus();
    pick(t);
  });
});
[qualityEl, aspectEl].forEach((el) => el.addEventListener('change', scheduleUpdateAll));

$('#sc-clear').addEventListener('click', () => {
  jobs.length = 0;
  pages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  pages = [];
  gridEl.innerHTML = '';
  setStatus(statusEl, null);
  setStatus(dlStatus, null);
  refreshLabels();
});

// ---------- tindakan kartu ----------
gridEl.addEventListener('click', async (e) => {
  const card = (e.target as HTMLElement).closest('.tl-scan') as HTMLElement | null;
  if (!card) return;
  const p = pages.find((x) => x.el === card);
  if (!p) return;
  const btn = (e.target as HTMLElement).closest('button[data-act]') as HTMLElement | null;
  if (!btn) {
    if (p.result && (e.target as HTMLElement).closest('.tl-box')) void showPreview(p);
    return;
  }
  const i = pages.indexOf(p);
  try {
    switch (btn.dataset.act) {
      case 'left':
        if (i > 0) moveItem(pages, i, i - 1);
        return renderOrder();
      case 'right':
        if (i < pages.length - 1) moveItem(pages, i, i + 1);
        return renderOrder();
      case 'rotate':
        if (!p.result) return;
        p.rot = (p.rot + 90) % 360;
        reveal(p, false);
        return;
      case 'del':
        URL.revokeObjectURL(p.previewUrl);
        pages.splice(i, 1);
        p.el.remove();
        return refreshLabels();
      case 'edit':
        return void openEditor(p);
      case 'jpg':
        if (p.result) downloadBlob(await pageJpeg(p), pageName(p, 'jpg'));
        return;
      case 'pdf':
        if (p.result) downloadBlob(await buildPdf([p]), pageName(p, 'pdf'));
        return;
    }
  } catch (err: any) {
    setStatus(dlStatus, 'error', escapeHtml(err?.message || 'Gagal memproses halaman.'));
  }
});
enableReorder(gridEl, '.tl-scan', (from, to) => {
  moveItem(pages, from, to);
  renderOrder();
});

// ---------- pratinjau ----------
const dialog = $('#sc-dialog') as HTMLDialogElement;
const dialogImg = $('#sc-dialog-img') as HTMLImageElement;
async function showPreview(p: Page) {
  dialogImg.src = URL.createObjectURL(await pageJpeg(p));
  $('#sc-dialog-title').textContent = `Halaman ${pages.indexOf(p) + 1} dari ${pages.length}`;
  dialog.showModal();
}
dialog.addEventListener('close', () => {
  if (dialogImg.src.startsWith('blob:')) URL.revokeObjectURL(dialogImg.src);
  dialogImg.removeAttribute('src');
});
$('#sc-dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

// ---------- editor sudut ----------
const editor = $('#sc-editor') as HTMLDialogElement;
const stage = $('#sc-stage');
const stageCanvas = $('#sc-stage-canvas') as HTMLCanvasElement;
const overlay = $('#sc-overlay') as unknown as SVGSVGElement;
const poly = $('#sc-poly') as unknown as SVGPolygonElement;
const loupe = $('#sc-loupe') as HTMLCanvasElement;
const edMsg = $('#sc-editor-msg');
const NAMES = ['kiri atas', 'kanan atas', 'kanan bawah', 'kiri bawah'];
let edit: { p: Page; q: Q; cw: number; ch: number; active: number } | null = null;
const handles: SVGCircleElement[] = [];

function layoutEditor() {
  if (!edit) return;
  const rect = stage.getBoundingClientRect();
  const unit = edit.cw / Math.max(1, rect.width); // piksel kanvas per piksel layar
  poly.setAttribute('points', edit.q.map((p) => `${p[0] * edit!.cw},${p[1] * edit!.ch}`).join(' '));
  poly.setAttribute('stroke-width', String(2.5 * unit));
  handles.forEach((h, i) => {
    h.setAttribute('cx', String(edit!.q[i][0] * edit!.cw));
    h.setAttribute('cy', String(edit!.q[i][1] * edit!.ch));
    h.setAttribute('r', String(15 * unit));
    h.setAttribute('stroke-width', String(3 * unit));
    h.setAttribute('aria-valuetext', `${Math.round(edit!.q[i][0] * 100)} persen dari kiri, ${Math.round(edit!.q[i][1] * 100)} persen dari atas`);
  });
}

function drawLoupe(i: number) {
  if (!edit) return;
  const ctx = loupe.getContext('2d')!;
  const cx = edit.q[i][0] * edit.cw;
  const cy = edit.q[i][1] * edit.ch;
  const half = 26;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 220, 220);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(stageCanvas, cx - half, cy - half, half * 2, half * 2, 0, 0, 220, 220);
  ctx.strokeStyle = 'rgba(245,158,11,.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 84);
  ctx.lineTo(110, 136);
  ctx.moveTo(84, 110);
  ctx.lineTo(136, 110);
  ctx.stroke();
  const rect = stage.getBoundingClientRect();
  const px = (cx / edit.cw) * rect.width;
  const py = (cy / edit.ch) * rect.height;
  loupe.style.left = (px < 140 && py < 140 ? rect.width - 118 : 8) + 'px';
  loupe.style.top = '8px';
}

async function openEditor(p: Page) {
  const dec = await decodeImage(p.file);
  const s = Math.min(1, 1400 / Math.max(dec.width, dec.height));
  const cw = Math.max(1, Math.round(dec.width * s));
  const ch = Math.max(1, Math.round(dec.height * s));
  stageCanvas.width = cw;
  stageCanvas.height = ch;
  stageCanvas.getContext('2d')!.drawImage(dec.source, 0, 0, cw, ch);
  dec.close();
  stage.style.aspectRatio = `${cw} / ${ch}`;
  stage.style.width = `min(100%, ${(68 * cw) / ch}vh)`;
  overlay.setAttribute('viewBox', `0 0 ${cw} ${ch}`);
  const q: Q = isFull(p.quad) ? ([[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]] as Q) : (p.quad.map((x) => [...x]) as Q);
  edit = { p, q, cw, ch, active: -1 };
  handles.forEach((h) => h.remove());
  handles.length = 0;
  for (let i = 0; i < 4; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGCircleElement;
    c.setAttribute('class', 'tl-handle');
    c.setAttribute('tabindex', '0');
    c.setAttribute('role', 'slider');
    c.setAttribute('aria-label', `Sudut ${NAMES[i]}. Geser atau pakai tombol panah.`);
    c.dataset.i = String(i);
    overlay.appendChild(c);
    handles.push(c);
  }
  edMsg.textContent = p.detected === false && p.mode === 'auto' ? 'Tepi tidak terdeteksi otomatis. Geser keempat titik ke sudut dokumen.' : '';
  editor.showModal();
  layoutEditor();
}

function moveHandle(i: number, x: number, y: number) {
  if (!edit) return;
  edit.q[i] = [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))];
  layoutEditor();
  drawLoupe(i);
}
overlay.addEventListener('pointerdown', (e) => {
  const h = (e.target as Element).closest('.tl-handle') as SVGCircleElement | null;
  if (!h || !edit) return;
  edit.active = Number(h.dataset.i);
  h.setPointerCapture(e.pointerId);
  h.classList.add('is-drag');
  loupe.hidden = false;
  const r = stage.getBoundingClientRect();
  moveHandle(edit.active, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  e.preventDefault();
});
overlay.addEventListener('pointermove', (e) => {
  if (!edit || edit.active < 0) return;
  const r = stage.getBoundingClientRect();
  moveHandle(edit.active, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
});
const endDrag = () => {
  if (!edit) return;
  edit.active = -1;
  loupe.hidden = true;
  handles.forEach((h) => h.classList.remove('is-drag'));
};
overlay.addEventListener('pointerup', endDrag);
overlay.addEventListener('pointercancel', endDrag);
overlay.addEventListener('keydown', (e) => {
  const h = (e.target as Element).closest('.tl-handle') as SVGCircleElement | null;
  if (!h || !edit) return;
  const ke = e as KeyboardEvent;
  const step = ke.shiftKey ? 10 : 1;
  const r = stage.getBoundingClientRect();
  const dx = (ke.key === 'ArrowRight' ? 1 : ke.key === 'ArrowLeft' ? -1 : 0) * step;
  const dy = (ke.key === 'ArrowDown' ? 1 : ke.key === 'ArrowUp' ? -1 : 0) * step;
  if (!dx && !dy) return;
  e.preventDefault();
  const i = Number(h.dataset.i);
  moveHandle(i, edit.q[i][0] + dx / r.width, edit.q[i][1] + dy / r.height);
  loupe.hidden = true;
});
window.addEventListener('resize', layoutEditor);

$('#sc-ed-auto').addEventListener('click', async () => {
  if (!edit) return;
  const ds = Math.min(1, 640 / Math.max(edit.cw, edit.ch));
  const w = Math.max(1, Math.round(edit.cw * ds));
  const h = Math.max(1, Math.round(edit.ch * ds));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(stageCanvas, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  edMsg.textContent = 'Mendeteksi…';
  try {
    const r = await call('detect', { buf: id.data.buffer, w, h }, [id.data.buffer]);
    if (r.quad && edit) {
      edit.q = r.quad as Q;
      layoutEditor();
      edMsg.textContent = 'Tepi terdeteksi. Geser titik bila masih kurang pas.';
    } else edMsg.textContent = 'Tepi tidak terdeteksi. Geser keempat titik secara manual.';
  } catch {
    edMsg.textContent = 'Deteksi gagal. Geser titik secara manual.';
  }
});
$('#sc-ed-full').addEventListener('click', () => {
  if (!edit) return;
  edit.q = FULL.map((x) => [...x]) as Q;
  layoutEditor();
  edMsg.textContent = 'Seluruh gambar dipakai.';
});
$('#sc-ed-cancel').addEventListener('click', () => editor.close());
$('#sc-editor-close').addEventListener('click', () => editor.close());
editor.addEventListener('close', () => {
  loupe.hidden = true;
});
$('#sc-ed-apply').addEventListener('click', () => {
  if (!edit) return;
  const p = edit.p;
  p.quad = edit.q;
  p.mode = isFull(edit.q) ? 'full' : 'manual';
  p.detected = null;
  editor.close();
  edit = null;
  if (!pages.includes(p)) return;
  for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].page === p) jobs.splice(i, 1);
  jobs.push({ page: p, kind: 'update' });
  setState(p, 'updating', '');
  void pump();
});

// ---------- ekspor ----------
function outBase() {
  const names = new Set(pages.map((p) => p.srcName));
  return names.size === 1 ? baseName([...names][0]) : 'scan-dokumen';
}
function pageName(p: Page, ext: string) {
  return `${outBase()}-hal-${pad2(pages.indexOf(p) + 1)}.${ext}`;
}
async function pageJpeg(p: Page): Promise<Blob> {
  const r = p.result!;
  if (!p.rot) return r.blob;
  const bmp = await createImageBitmap(r.blob);
  const swap = p.rot === 90 || p.rot === 270;
  const c = document.createElement('canvas');
  c.width = swap ? bmp.height : bmp.width;
  c.height = swap ? bmp.width : bmp.height;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
  bmp.close();
  const out = await toBlob(c, 'image/jpeg', Math.max(0.9, cfg().q));
  c.width = c.height = 0;
  return out;
}
async function buildPdf(list: Page[]): Promise<Blob> {
  const { PDFDocument, degrees } = await getPDFLib();
  const out = await PDFDocument.create();
  const m = (parseFloat(marginEl.value) * 72) / 25.4;
  for (const p of list) {
    const r = p.result!;
    const img = await out.embedJpg(new Uint8Array(await r.blob.arrayBuffer()));
    let pw: number, ph: number;
    if (pdfSizeEl.value === 'fit') {
      pw = r.w * 0.48 + 2 * m; // 150 dpi
      ph = r.h * 0.48 + 2 * m;
    } else [pw, ph] = r.w > r.h ? [A4[1], A4[0]] : A4;
    const page = out.addPage([pw, ph]);
    const s = Math.min((pw - 2 * m) / r.w, (ph - 2 * m) / r.h);
    const dw = r.w * s;
    const dh = r.h * s;
    page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    if (p.rot) page.setRotation(degrees(p.rot)); // rotasi sebagai atribut halaman: tanpa encode ulang
  }
  return new Blob([await out.save()], { type: 'application/pdf' });
}
async function busy(btn: HTMLButtonElement, fn: () => Promise<void>) {
  const old = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Menyiapkan…';
  setStatus(dlStatus, null);
  try {
    await fn();
  } catch (e: any) {
    setStatus(dlStatus, 'error', escapeHtml(e?.message || 'Gagal membuat berkas.'));
  } finally {
    btn.disabled = false;
    btn.innerHTML = old;
  }
}
$('#sc-pdf').addEventListener('click', () =>
  busy($('#sc-pdf') as HTMLButtonElement, async () => {
    const list = pages.filter((p) => p.result);
    if (!list.length) return setStatus(dlStatus, 'info', 'Belum ada halaman yang selesai diproses.');
    const blob = await buildPdf(list);
    downloadBlob(blob, `${outBase()}-scan.pdf`);
    setStatus(dlStatus, 'success', `PDF siap: ${list.length} halaman, ${formatBytes(blob.size)}.`);
  }),
);
$('#sc-zip').addEventListener('click', () =>
  busy($('#sc-zip') as HTMLButtonElement, async () => {
    const list = pages.filter((p) => p.result);
    if (!list.length) return setStatus(dlStatus, 'info', 'Belum ada halaman yang selesai diproses.');
    const entries = [];
    for (const p of list) entries.push({ name: pageName(p, 'jpg'), data: new Uint8Array(await (await pageJpeg(p)).arrayBuffer()) });
    const zip = createZip(entries);
    downloadBlob(zip, `${outBase()}-scan.zip`);
    setStatus(dlStatus, 'success', `ZIP siap: ${list.length} gambar, ${formatBytes(zip.size)}.`);
  }),
);
