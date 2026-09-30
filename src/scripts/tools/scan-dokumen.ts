import { $, $$, baseName, bindDropzone, downloadBlob, enableReorder, escapeHtml, formatBytes, moveItem, setStatus } from './common.ts';
import { IMG_EXT, MAX_PIXELS, decodeImage, drawScaled, toBlob } from './image.ts';
import { friendlyPdfError, getPDFLib, openPdfJsDoc, readBytes } from './pdf.ts';
import { applyScan, type EffectId } from './scan-effects.ts';
import { createZip } from './zip.ts';

type Src = { file: File; pdf: boolean };
/** Satu halaman hasil scan. Yang disimpan hanya JPEG hasil dan thumbnail kecil, bukan kanvas besar. */
type Page = { blob: Blob; w: number; h: number; rot: number; thumb: HTMLCanvasElement; src: string };
type Opts = { effect: EffectId; strength: number; dpi: number; q: number; look: boolean };

const files: Src[] = [];
let pages: Page[] = [];
let effect: EffectId = 'otomatis';
let running = false;
let cancelled = false;
let outBase = 'scan-dokumen';
let jpegQ = 0.75;

const statusEl = $('#sc-status');
const filesEl = $('#sc-files');
const optsEl = $('#sc-opts');
const runBtn = $('#sc-run') as HTMLButtonElement;
const cancelBtn = $('#sc-cancel') as HTMLButtonElement;
const progressEl = $('#sc-progress');
const barEl = $('#sc-bar');
const barFill = $('#sc-bar-fill');
const ptext = $('#sc-ptext');
const resultsEl = $('#sc-results');
const gridEl = $('#sc-grid');
const summaryEl = $('#sc-summary');
const staleEl = $('#sc-stale');
const dlStatus = $('#sc-dlstatus');
const strengthEl = $('#sc-strength') as HTMLInputElement;
const dpiEl = $('#sc-dpi') as HTMLSelectElement;
const qEl = $('#sc-q') as HTMLSelectElement;
const lookEl = $('#sc-look') as HTMLInputElement;
const marginEl = $('#sc-margin') as HTMLSelectElement;
const dialog = $('#sc-dialog') as HTMLDialogElement;
const dialogImg = $('#sc-dialog-img') as HTMLImageElement;

const A4: [number, number] = [595.28, 841.89];
const pad2 = (n: number) => String(n).padStart(2, '0');
const yieldUi = () =>
  new Promise<void>((r) => (document.hidden ? setTimeout(r, 0) : requestAnimationFrame(() => setTimeout(r, 0))));

// ---------- daftar file ----------
function renderFiles() {
  filesEl.innerHTML = '';
  files.forEach((f) => {
    const row = document.createElement('div');
    row.className = 'tl-row';
    row.innerHTML = `
      <i class="fa-solid ${f.pdf ? 'fa-file-pdf' : 'fa-file-image'} text-gold-600" aria-hidden="true"></i>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-800" title="${escapeHtml(f.file.name)}">${escapeHtml(f.file.name)}</p>
        <p class="text-xs text-slate-500">${f.pdf ? 'PDF' : 'Gambar'} &middot; ${formatBytes(f.file.size)}</p>
      </div>
      <button type="button" class="tl-icon" aria-label="Hapus ${escapeHtml(f.file.name)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    row.querySelector('button')!.addEventListener('click', () => {
      if (running) return;
      files.splice(files.indexOf(f), 1);
      renderFiles();
      markStale();
    });
    filesEl.appendChild(row);
  });
  optsEl.classList.toggle('hidden', files.length === 0);
}

function markStale() {
  if (pages.length) staleEl.classList.remove('hidden');
}

bindDropzone($('#sc-drop'), {
  accept: ['pdf', ...IMG_EXT],
  multiple: true,
  onReject: (n) => setStatus(statusEl, 'error', `Format tidak didukung: ${n.map(escapeHtml).join(', ')}. Gunakan PDF, JPG, PNG, atau WebP.`),
  onFiles: (list) => {
    if (running) return setStatus(statusEl, 'info', 'Tunggu scan selesai atau batalkan dulu sebelum menambah file.');
    setStatus(statusEl, null);
    list.forEach((file) => files.push({ file, pdf: /\.pdf$/i.test(file.name) }));
    renderFiles();
    markStale();
  },
});

$('#sc-clear').addEventListener('click', () => {
  if (running) return;
  files.length = 0;
  clearPages();
  renderFiles();
  setStatus(statusEl, null);
  progressEl.classList.add('hidden');
});

// ---------- pengaturan ----------
const radios = $$('#sc-effects [role=radio]');
function pick(btn: HTMLElement) {
  radios.forEach((r) => {
    const on = r === btn;
    r.setAttribute('aria-checked', String(on));
    r.tabIndex = on ? 0 : -1;
  });
  effect = btn.dataset.effect as EffectId;
  markStale();
}
radios.forEach((r, i) => {
  r.addEventListener('click', () => pick(r));
  r.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    const next = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0;
    if (!next) return;
    e.preventDefault();
    const t = radios[(i + next + radios.length) % radios.length];
    t.focus();
    pick(t);
  });
});
strengthEl.addEventListener('input', () => {
  $('#sc-strength-v').textContent = strengthEl.value;
  markStale();
});
[dpiEl, qEl, lookEl].forEach((el) => el.addEventListener('change', markStale));

// ---------- pemrosesan ----------
function setProgress(fraction: number, text: string) {
  const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
  (barFill as HTMLElement).style.width = pct + '%';
  barEl.setAttribute('aria-valuenow', String(pct));
  ptext.textContent = text;
}

async function renderPdfPage(doc: any, n: number, dpi: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 });
  let scale = dpi / 72;
  if (base.width * scale * base.height * scale > MAX_PIXELS) scale *= Math.sqrt(MAX_PIXELS / (base.width * scale * base.height * scale));
  const vp = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(vp.width));
  canvas.height = Math.max(1, Math.round(vp.height));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport: vp }).promise;
  page.cleanup();
  return canvas;
}

/** Terapkan efek, simpan sebagai JPEG, buat thumbnail, lalu bebaskan kanvas besar. */
async function finishPage(canvas: HTMLCanvasElement, o: Opts, srcName: string): Promise<Page> {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, w, h);
  applyScan(img.data, w, h, { effect: o.effect, strength: o.strength, scannerLook: o.look });
  ctx.putImageData(img, 0, 0);
  const blob = await toBlob(canvas, 'image/jpeg', o.q);
  const tw = 260;
  const thumb = document.createElement('canvas');
  thumb.width = tw;
  thumb.height = Math.max(1, Math.round((h * tw) / w));
  const tctx = thumb.getContext('2d')!;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
  canvas.width = canvas.height = 0;
  return { blob, w, h, rot: 0, thumb, src: srcName };
}

function readOpts(): Opts {
  return { effect, strength: parseInt(strengthEl.value, 10) / 100, dpi: parseInt(dpiEl.value, 10), q: parseFloat(qEl.value), look: lookEl.checked };
}

function clearPages() {
  pages = [];
  gridEl.innerHTML = '';
  resultsEl.classList.add('hidden');
  staleEl.classList.add('hidden');
  setStatus(dlStatus, null);
}

async function run() {
  if (!files.length || running) return;
  running = true;
  cancelled = false;
  runBtn.disabled = true;
  cancelBtn.classList.remove('hidden');
  setStatus(statusEl, null);
  clearPages();
  const o = readOpts();
  jpegQ = o.q;
  outBase = files.length === 1 ? baseName(files[0].file.name) : 'scan-dokumen';
  progressEl.classList.remove('hidden');
  resultsEl.classList.remove('hidden');
  const errors: string[] = [];

  for (let fi = 0; fi < files.length && !cancelled; fi++) {
    const f = files[fi];
    const label = `File ${fi + 1} dari ${files.length}: ${f.file.name}`;
    setProgress(fi / files.length, label);
    await yieldUi();
    try {
      if (f.pdf) {
        let doc: any;
        try {
          doc = await openPdfJsDoc(await readBytes(f.file));
        } catch (e) {
          throw new Error(friendlyPdfError(e, f.file.name));
        }
        try {
          if ((await doc.getPermissions()) !== null) throw new Error(friendlyPdfError(new Error('encrypted'), f.file.name));
          for (let p = 1; p <= doc.numPages && !cancelled; p++) {
            setProgress((fi + (p - 1) / doc.numPages) / files.length, `${label} (halaman ${p} dari ${doc.numPages})`);
            await yieldUi();
            const canvas = await renderPdfPage(doc, p, o.dpi);
            addPage(await finishPage(canvas, o, f.file.name));
          }
        } finally {
          doc.destroy?.();
        }
      } else {
        const dec = await decodeImage(f.file);
        // Hanya diperkecil, tidak pernah diperbesar: sisi terpanjang mengikuti A4 pada dpi terpilih.
        const longSide = Math.round(11.69 * o.dpi);
        const s = Math.min(1, longSide / Math.max(dec.width, dec.height));
        const w = Math.max(1, Math.round(dec.width * s));
        const h = Math.max(1, Math.round(dec.height * s));
        const canvas = drawScaled(dec, w, h, '#ffffff');
        dec.close();
        addPage(await finishPage(canvas, o, f.file.name));
      }
    } catch (e: any) {
      errors.push(escapeHtml(e?.message || `Gagal memproses ${f.file.name}`));
    }
  }

  setProgress(cancelled ? pages.length / Math.max(1, pages.length) : 1, cancelled ? `Dibatalkan. ${pages.length} halaman selesai.` : `Selesai. ${pages.length} halaman.`);
  if (errors.length) setStatus(statusEl, 'error', errors.join('<br>'));
  if (!pages.length) resultsEl.classList.add('hidden');
  running = false;
  runBtn.disabled = false;
  cancelBtn.classList.add('hidden');
  renderGrid();
}

runBtn.addEventListener('click', run);
cancelBtn.addEventListener('click', () => {
  cancelled = true;
  ptext.textContent = 'Membatalkan setelah halaman ini selesai…';
});

// ---------- kartu halaman ----------
function rotatedThumb(p: Page): HTMLCanvasElement {
  const t = p.thumb;
  const c = document.createElement('canvas');
  const swap = p.rot === 90 || p.rot === 270;
  c.width = swap ? t.height : t.width;
  c.height = swap ? t.width : t.height;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.drawImage(t, -t.width / 2, -t.height / 2);
  return c;
}

function pageName(p: Page, ext: string) {
  return `${outBase}-hal-${pad2(pages.indexOf(p) + 1)}.${ext}`;
}

function buildCard(p: Page): HTMLElement {
  const n = pages.indexOf(p) + 1;
  const card = document.createElement('div');
  card.className = 'tl-page';
  card.draggable = true;
  card.innerHTML = `
    <div class="tl-box"></div>
    <div class="mt-2 flex items-center justify-between gap-1">
      <span class="text-xs font-bold text-slate-600">Hal. ${n}${p.rot ? ` <span class="text-gold-700">(${p.rot}&deg;)</span>` : ''}</span>
      <span class="flex gap-1">
        <button type="button" class="tl-icon" data-act="left" aria-label="Geser halaman ${n} ke kiri" ${n === 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>
        <button type="button" class="tl-icon" data-act="right" aria-label="Geser halaman ${n} ke kanan" ${n === pages.length ? 'disabled' : ''}><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
      </span>
    </div>
    <div class="mt-2 flex flex-wrap gap-1">
      <button type="button" class="tl-icon" data-act="rotate" aria-label="Putar halaman ${n} 90 derajat" title="Putar"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="jpg" aria-label="Unduh halaman ${n} sebagai JPG" title="Unduh JPG"><i class="fa-solid fa-file-image" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="pdf" aria-label="Unduh halaman ${n} sebagai PDF" title="Unduh PDF"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="del" aria-label="Hapus halaman ${n}" title="Hapus"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
    </div>
    <p class="mt-1 truncate text-xs text-slate-400" title="${escapeHtml(p.src)}">${formatBytes(p.blob.size)} &middot; ${escapeHtml(p.src)}</p>`;
  card.querySelector('.tl-box')!.appendChild(rotatedThumb(p));
  return card;
}

function updateSummary() {
  const total = pages.reduce((s, p) => s + p.blob.size, 0);
  summaryEl.textContent = pages.length ? `${pages.length} halaman · sekitar ${formatBytes(total)} (ukuran PDF kurang lebih sama)` : '';
}

function addPage(p: Page) {
  pages.push(p);
  gridEl.appendChild(buildCard(p));
  updateSummary();
}

function renderGrid() {
  gridEl.innerHTML = '';
  pages.forEach((p) => gridEl.appendChild(buildCard(p)));
  updateSummary();
  resultsEl.classList.toggle('hidden', pages.length === 0);
}

// Semua tindakan mencari halaman lewat objeknya, sehingga tetap benar setelah diurutkan ulang.
gridEl.addEventListener('click', async (e) => {
  const card = (e.target as HTMLElement).closest('.tl-page') as HTMLElement | null;
  if (!card) return;
  const p = pages[Array.from(gridEl.children).indexOf(card)];
  if (!p) return;
  const btn = (e.target as HTMLElement).closest('button[data-act]') as HTMLElement | null;
  if (!btn) {
    if ((e.target as HTMLElement).closest('.tl-box')) showPreview(p);
    return;
  }
  const i = pages.indexOf(p);
  try {
    switch (btn.dataset.act) {
      case 'left':
        if (i > 0) moveItem(pages, i, i - 1);
        return renderGrid();
      case 'right':
        if (i < pages.length - 1) moveItem(pages, i, i + 1);
        return renderGrid();
      case 'rotate':
        p.rot = (p.rot + 90) % 360;
        return renderGrid();
      case 'del':
        pages.splice(i, 1);
        return renderGrid();
      case 'jpg':
        return downloadBlob(await pageJpeg(p), pageName(p, 'jpg'));
      case 'pdf':
        return downloadBlob(await buildPdf([p]), pageName(p, 'pdf'));
    }
  } catch (err: any) {
    setStatus(dlStatus, 'error', escapeHtml(err?.message || 'Gagal memproses halaman.'));
  }
});

enableReorder(gridEl, '.tl-page', (from, to) => {
  moveItem(pages, from, to);
  renderGrid();
});

// ---------- pratinjau ----------
async function showPreview(p: Page) {
  const blob = await pageJpeg(p);
  dialogImg.src = URL.createObjectURL(blob);
  $('#sc-dialog-title').textContent = `Halaman ${pages.indexOf(p) + 1} dari ${pages.length}`;
  dialog.showModal();
}
function closePreview() {
  if (dialog.open) dialog.close();
}
dialog.addEventListener('close', () => {
  if (dialogImg.src.startsWith('blob:')) URL.revokeObjectURL(dialogImg.src);
  dialogImg.removeAttribute('src');
});
$('#sc-dialog-close').addEventListener('click', closePreview);
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) closePreview();
});

// ---------- ekspor ----------
/** JPEG halaman dengan rotasi diterapkan (rotasi 0 memakai JPEG hasil apa adanya, tanpa encode ulang). */
async function pageJpeg(p: Page): Promise<Blob> {
  if (!p.rot) return p.blob;
  const bmp = await createImageBitmap(p.blob);
  const swap = p.rot === 90 || p.rot === 270;
  const c = document.createElement('canvas');
  c.width = swap ? bmp.height : bmp.width;
  c.height = swap ? bmp.width : bmp.height;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((p.rot * Math.PI) / 180);
  ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
  bmp.close();
  const out = await toBlob(c, 'image/jpeg', Math.max(0.85, jpegQ));
  c.width = c.height = 0;
  return out;
}

async function buildPdf(list: Page[]): Promise<Blob> {
  const { PDFDocument, degrees } = await getPDFLib();
  const out = await PDFDocument.create();
  const m = (parseFloat(marginEl.value) * 72) / 25.4;
  for (const p of list) {
    const img = await out.embedJpg(new Uint8Array(await p.blob.arrayBuffer()));
    const [pw, ph] = p.w > p.h ? [A4[1], A4[0]] : A4;
    const page = out.addPage([pw, ph]);
    const s = Math.min((pw - 2 * m) / p.w, (ph - 2 * m) / p.h);
    const dw = p.w * s;
    const dh = p.h * s;
    page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    // Rotasi disimpan sebagai atribut halaman: tanpa encode ulang, tanpa penurunan kualitas.
    if (p.rot) page.setRotation(degrees(p.rot));
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
    if (!pages.length) return;
    const blob = await buildPdf(pages);
    downloadBlob(blob, `${outBase}-scan.pdf`);
    setStatus(dlStatus, 'success', `PDF siap: ${pages.length} halaman, ${formatBytes(blob.size)}.`);
  }),
);

$('#sc-zip').addEventListener('click', () =>
  busy($('#sc-zip') as HTMLButtonElement, async () => {
    if (!pages.length) return;
    const entries = [];
    for (const p of pages) entries.push({ name: pageName(p, 'jpg'), data: new Uint8Array(await (await pageJpeg(p)).arrayBuffer()) });
    const zip = createZip(entries);
    downloadBlob(zip, `${outBase}-scan.zip`);
    setStatus(dlStatus, 'success', `ZIP siap: ${pages.length} gambar, ${formatBytes(zip.size)}.`);
  }),
);
