import { $, bindDropzone, baseName, downloadBlob, enableReorder, escapeHtml, formatBytes, moveItem, nextFrame, setStatus } from './common.ts';
import { getPDFLib, openPdfJsDoc, openPdfLibDoc, parseRanges, readBytes, renderThumb } from './pdf.ts';
import { createZip } from './zip.ts';

type Pg = { orig: number; rot: number; sel: boolean };
const root = $('#pm');
const mode = root.dataset.mode as 'pisah' | 'hapus' | 'atur';
const canRotate = mode === 'atur';
const canDelete = mode !== 'pisah';
const canReorder = mode === 'atur';

const statusEl = $('#pm-status');
const work = $('#pm-work');
const info = $('#pm-info');
const grid = $('#pm-grid');
const resultEl = $('#pm-result');
const rangeInput = $('#pm-range') as HTMLInputElement;

let file: File | null = null;
let srcBytes: Uint8Array;
let srcDoc: any;
let jsDoc: any = null;
let total = 0;
let pages: Pg[] = [];
const thumbs = new Map<number, HTMLCanvasElement>();
const queued = new Set<number>();
const queue: number[] = [];
let rendering = false;
let generation = 0;

const safeBase = () => baseName(file!.name).replace(/[\\/:*?"<>|]+/g, '_');

function rotatedCanvas(src: HTMLCanvasElement, deg: number): HTMLCanvasElement {
  const r = ((deg % 360) + 360) % 360;
  if (r === 0) {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    c.getContext('2d')!.drawImage(src, 0, 0);
    return c;
  }
  const c = document.createElement('canvas');
  const swap = r === 90 || r === 270;
  c.width = swap ? src.height : src.width;
  c.height = swap ? src.width : src.height;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((r * Math.PI) / 180);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}

function updateInfo() {
  const sel = pages.filter((p) => p.sel).length;
  info.textContent = `${file!.name} · ${formatBytes(file!.size)} · ${pages.length} dari ${total} halaman ditampilkan · ${sel} terpilih`;
}

function cardFor(p: Pg, idx: number): HTMLElement {
  const d = document.createElement('div');
  d.className = 'tl-page' + (p.sel ? ' is-selected' : '');
  d.dataset.orig = String(p.orig);
  d.tabIndex = 0;
  d.setAttribute('role', 'checkbox');
  d.setAttribute('aria-checked', String(p.sel));
  d.setAttribute('aria-label', `Halaman ${p.orig + 1}`);
  d.draggable = canReorder;
  d.innerHTML = `
    <span class="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${p.sel ? 'bg-gold-500' : 'bg-slate-300'}" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
    <div class="tl-box"></div>
    <div class="mt-2 flex items-center justify-between gap-1 text-xs text-slate-600">
      <span class="font-semibold">Hal. ${p.orig + 1}${p.rot ? ` <span class="text-gold-700">(${p.rot}°)</span>` : ''}</span>
      ${
        canReorder
          ? `<span class="flex gap-1">
        <button type="button" class="tl-icon" style="width:1.6rem;height:1.6rem" data-act="left" aria-label="Geser halaman ${p.orig + 1} ke kiri" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>
        <button type="button" class="tl-icon" style="width:1.6rem;height:1.6rem" data-act="right" aria-label="Geser halaman ${p.orig + 1} ke kanan" ${idx === pages.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
      </span>`
          : ''
      }
    </div>`;
  const box = d.querySelector('.tl-box')!;
  const t = thumbs.get(p.orig);
  if (t) box.appendChild(rotatedCanvas(t, p.rot));
  else {
    const ph = document.createElement('div');
    ph.className = 'tl-thumb-ph';
    ph.style.aspectRatio = '3 / 4';
    box.appendChild(ph);
  }
  return d;
}

let observer: IntersectionObserver | null = null;
function render() {
  observer?.disconnect();
  grid.innerHTML = '';
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const orig = Number((e.target as HTMLElement).dataset.orig);
        if (!thumbs.has(orig) && !queued.has(orig)) {
          queued.add(orig);
          queue.push(orig);
          pump();
        }
      });
    },
    { rootMargin: '400px' },
  );
  pages.forEach((p, i) => {
    const c = cardFor(p, i);
    grid.appendChild(c);
    observer!.observe(c);
  });
  updateInfo();
}

async function pump() {
  if (rendering || !jsDoc) return;
  rendering = true;
  const gen = generation;
  while (queue.length) {
    const orig = queue.shift()!;
    try {
      const c = await renderThumb(jsDoc, orig + 1, 180);
      if (gen !== generation) return;
      thumbs.set(orig, c);
      grid.querySelectorAll(`.tl-page[data-orig="${orig}"]`).forEach((card) => {
        const p = pages.find((x) => x.orig === orig)!;
        const box = card.querySelector('.tl-box')!;
        box.innerHTML = '';
        box.appendChild(rotatedCanvas(c, p.rot));
      });
    } catch {
      /* pratinjau gagal: tetap dapat dipakai tanpa gambar */
    }
    await nextFrame();
  }
  rendering = false;
}

function fresh() {
  pages = Array.from({ length: total }, (_, i) => ({ orig: i, rot: 0, sel: false }));
}

bindDropzone($('#pm-drop'), {
  accept: ['pdf'],
  multiple: false,
  onReject: (n) => setStatus(statusEl, 'error', `Hanya file PDF yang diterima. Dilewati: ${n.map(escapeHtml).join(', ')}.`),
  onFiles: async ([f]) => {
    setStatus(statusEl, 'info', 'Membaca PDF…');
    setStatus(resultEl, null);
    work.classList.add('hidden');
    generation++;
    thumbs.clear();
    queued.clear();
    queue.length = 0;
    rendering = false;
    try {
      srcDoc = await openPdfLibDoc(f);
      srcBytes = await readBytes(f);
      file = f;
      total = srcDoc.getPageCount();
      jsDoc = null;
      try {
        jsDoc = await openPdfJsDoc(srcBytes);
      } catch {
        jsDoc = null;
      }
      fresh();
      setStatus(statusEl, null);
      work.classList.remove('hidden');
      render();
    } catch (e: any) {
      file = null;
      setStatus(statusEl, 'error', escapeHtml(e.message));
    }
  },
});

// ---- seleksi ----
grid.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button[data-act]') as HTMLElement | null;
  const card = (e.target as HTMLElement).closest('.tl-page') as HTMLElement | null;
  if (!card) return;
  const idx = Array.from(grid.children).indexOf(card);
  if (btn) {
    const act = btn.dataset.act;
    if (act === 'left' && idx > 0) moveItem(pages, idx, idx - 1);
    if (act === 'right' && idx < pages.length - 1) moveItem(pages, idx, idx + 1);
    setStatus(resultEl, null);
    render();
    return;
  }
  pages[idx].sel = !pages[idx].sel;
  const y = window.scrollY;
  render();
  window.scrollTo({ top: y });
});
grid.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  const card = (e.target as HTMLElement).closest('.tl-page') as HTMLElement | null;
  if (!card || (e.target as HTMLElement).closest('button')) return;
  e.preventDefault();
  const idx = Array.from(grid.children).indexOf(card);
  pages[idx].sel = !pages[idx].sel;
  render();
  (grid.children[idx] as HTMLElement).focus();
});
if (canReorder)
  enableReorder(grid, '.tl-page', (from, to) => {
    moveItem(pages, from, to);
    setStatus(resultEl, null);
    render();
  });

$('#pm-all').addEventListener('click', () => (pages.forEach((p) => (p.sel = true)), render()));
$('#pm-none').addEventListener('click', () => (pages.forEach((p) => (p.sel = false)), render()));
$('#pm-invert').addEventListener('click', () => (pages.forEach((p) => (p.sel = !p.sel)), render()));
$('#pm-range-btn').addEventListener('click', applyRange);
rangeInput.addEventListener('keydown', (e) => e.key === 'Enter' && applyRange());
function applyRange() {
  try {
    const nums = new Set(parseRanges(rangeInput.value, total));
    let hit = 0;
    pages.forEach((p) => {
      p.sel = nums.has(p.orig + 1);
      if (p.sel) hit++;
    });
    setStatus(statusEl, hit ? null : 'error', hit ? '' : 'Halaman pada rentang itu tidak ada di daftar (mungkin sudah dihapus).');
    render();
  } catch (e: any) {
    setStatus(statusEl, 'error', escapeHtml(e.message));
  }
}

// ---- pengeditan ----
function targets(): Pg[] {
  const s = pages.filter((p) => p.sel);
  return s.length ? s : pages;
}
if (canRotate) {
  $('#pm-rotl').addEventListener('click', () => (targets().forEach((p) => (p.rot = (p.rot + 270) % 360)), render()));
  $('#pm-rotr').addEventListener('click', () => (targets().forEach((p) => (p.rot = (p.rot + 90) % 360)), render()));
}
if (canDelete) {
  $('#pm-del').addEventListener('click', () => {
    const n = pages.filter((p) => p.sel).length;
    if (!n) return setStatus(statusEl, 'error', 'Pilih dulu halaman yang akan dihapus.');
    if (n === pages.length) return setStatus(statusEl, 'error', 'PDF harus menyisakan minimal satu halaman.');
    pages = pages.filter((p) => !p.sel);
    setStatus(statusEl, 'info', `${n} halaman dihapus dari daftar. Klik "Simpan PDF" untuk mengunduh hasilnya.`);
    setStatus(resultEl, null);
    render();
  });
  $('#pm-reset').addEventListener('click', () => {
    fresh();
    setStatus(statusEl, null);
    setStatus(resultEl, null);
    render();
  });
}

// ---- ekspor ----
async function buildPdf(list: Pg[]): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await getPDFLib();
  const out = await PDFDocument.create();
  const copied = await out.copyPages(srcDoc, list.map((p) => p.orig));
  copied.forEach((pg: any, i: number) => {
    const r = list[i].rot;
    if (r) pg.setRotation(degrees((pg.getRotation().angle + r) % 360));
    out.addPage(pg);
  });
  return out.save();
}

function showResult(blob: Blob, filename: string, note: string) {
  setStatus(statusEl, null);
  resultEl.className = 'mt-5';
  resultEl.innerHTML = `
    <div class="tl-status tl-status-success flex flex-wrap items-center gap-3 justify-between">
      <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${note} (${formatBytes(blob.size)}).</span>
      <button type="button" id="pm-dl" class="tl-btn"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh ${escapeHtml(filename)}</button>
    </div>`;
  $('#pm-dl').addEventListener('click', () => downloadBlob(blob, filename));
}

async function guarded(fn: () => Promise<void>) {
  setStatus(resultEl, null);
  try {
    await fn();
  } catch (e: any) {
    setStatus(statusEl, 'error', escapeHtml(e.message || 'Terjadi kesalahan.'));
  }
}

if (mode === 'pisah') {
  $('#pm-extract').addEventListener('click', () =>
    guarded(async () => {
      const sel = pages.filter((p) => p.sel);
      if (!sel.length) throw new Error('Pilih minimal satu halaman dengan mengkliknya atau mengisi rentang.');
      setStatus(statusEl, 'info', 'Membuat PDF…');
      await nextFrame();
      const bytes = await buildPdf(sel);
      showResult(new Blob([bytes], { type: 'application/pdf' }), `${safeBase()}-halaman-terpilih.pdf`, `${sel.length} halaman diambil`);
    }),
  );
  $('#pm-zip-each').addEventListener('click', () =>
    guarded(async () => {
      const entries: { name: string; data: Uint8Array }[] = [];
      const pad = String(total).length;
      for (let i = 0; i < total; i++) {
        if (i % 3 === 0) {
          setStatus(statusEl, 'info', `Membuat file ${i + 1} dari ${total}…`);
          await nextFrame();
        }
        entries.push({ name: `${safeBase()}-hal-${String(i + 1).padStart(pad, '0')}.pdf`, data: await buildPdf([{ orig: i, rot: 0, sel: true }]) });
      }
      showResult(createZip(entries), `${safeBase()}-per-halaman.zip`, `${total} file PDF dibuat`);
    }),
  );
  $('#pm-zip-parts').addEventListener('click', () =>
    guarded(async () => {
      const text = ($('#pm-parts') as HTMLInputElement).value.trim();
      if (!text) throw new Error('Isi rentang, misalnya 1-3; 4-6; 7-10.');
      const groups = text.split(';').map((s) => s.trim()).filter(Boolean);
      const entries: { name: string; data: Uint8Array }[] = [];
      for (let g = 0; g < groups.length; g++) {
        let nums: number[];
        try {
          nums = parseRanges(groups[g], total);
        } catch (e: any) {
          throw new Error(`Bagian ${g + 1} ("${groups[g]}"): ${e.message}`);
        }
        setStatus(statusEl, 'info', `Membuat bagian ${g + 1} dari ${groups.length}…`);
        await nextFrame();
        const label = groups[g].replace(/\s+/g, '').replace(/,/g, '_');
        entries.push({ name: `${safeBase()}-bagian-${g + 1}-hal-${label}.pdf`, data: await buildPdf(nums.map((n) => ({ orig: n - 1, rot: 0, sel: true }))) });
      }
      showResult(createZip(entries), `${safeBase()}-bagian.zip`, `${entries.length} file PDF dibuat`);
    }),
  );
} else {
  $('#pm-save').addEventListener('click', () =>
    guarded(async () => {
      if (!pages.length) throw new Error('Tidak ada halaman untuk disimpan.');
      setStatus(statusEl, 'info', 'Menyimpan PDF…');
      await nextFrame();
      const bytes = await buildPdf(pages);
      const suffix = mode === 'hapus' ? 'tanpa-halaman-terhapus' : 'diatur';
      showResult(new Blob([bytes], { type: 'application/pdf' }), `${safeBase()}-${suffix}.pdf`, `${pages.length} halaman disimpan`);
    }),
  );
}
