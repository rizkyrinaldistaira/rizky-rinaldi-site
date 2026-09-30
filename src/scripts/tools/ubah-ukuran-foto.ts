import { $, $$, baseName, bindDropzone, downloadBlob, escapeHtml, formatBytes, setStatus } from './common.ts';
import { IMG_EXT, MAX_PIXELS, decodeImage, makeCanvas, setJpegDpi, toBlob, type Decoded } from './image.ts';

let dec: Decoded | null = null;
let fileName = 'foto';
let cx = 0.5;
let cy = 0.5;

const statusEl = $('#uf-status');
const work = $('#uf-work');
const resultEl = $('#uf-result');
const info = $('#uf-info');
const preview = $('#uf-preview') as HTMLCanvasElement;
const unitEl = $('#uf-unit') as HTMLSelectElement;
const wEl = $('#uf-w') as HTMLInputElement;
const hEl = $('#uf-h') as HTMLInputElement;
const dpiEl = $('#uf-dpi') as HTMLSelectElement;
const lockEl = $('#uf-lock') as HTMLInputElement;
const zoomEl = $('#uf-zoom') as HTMLInputElement;
const bgEl = $('#uf-bg') as HTMLInputElement;
const formatEl = $('#uf-format') as HTMLSelectElement;
const qEl = $('#uf-q') as HTMLInputElement;
const fit = () => ($('#uf input[name=uf-fit]:checked') as HTMLInputElement).value as 'cover' | 'contain' | 'stretch';

function toPx(v: number, unit: string, dpi: number): number {
  if (unit === 'px') return Math.round(v);
  return Math.round(unit === 'cm' ? (v / 2.54) * dpi : (v / 25.4) * dpi);
}
function target(): { tw: number; th: number } | { error: string } {
  const w = parseFloat(wEl.value);
  const h = parseFloat(hEl.value);
  if (!(w > 0) || !(h > 0)) return { error: 'Isi lebar dan tinggi dengan angka lebih dari 0.' };
  const unit = unitEl.value;
  const dpi = parseInt(dpiEl.value, 10);
  const tw = toPx(w, unit, dpi);
  const th = toPx(h, unit, dpi);
  if (tw < 1 || th < 1) return { error: 'Ukuran terlalu kecil. Naikkan lebar, tinggi, atau resolusi.' };
  if (tw > 10000 || th > 10000 || tw * th > MAX_PIXELS) return { error: `Ukuran terlalu besar (${tw} × ${th} px). Kecilkan ukuran atau resolusinya.` };
  return { tw, th };
}

function cropRect(tw: number, th: number) {
  const sw = dec!.width;
  const sh = dec!.height;
  const aspect = tw / th;
  let cw: number, ch: number;
  if (sw / sh > aspect) {
    ch = sh;
    cw = ch * aspect;
  } else {
    cw = sw;
    ch = cw / aspect;
  }
  const z = parseFloat(zoomEl.value) || 1;
  cw /= z;
  ch /= z;
  const sx = Math.min(Math.max(cx * sw - cw / 2, 0), sw - cw);
  const sy = Math.min(Math.max(cy * sh - ch / 2, 0), sh - ch);
  cx = (sx + cw / 2) / sw;
  cy = (sy + ch / 2) / sh;
  return { sx, sy, cw, ch };
}

function draw(c: HTMLCanvasElement, tw: number, th: number) {
  c.width = tw;
  c.height = th;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bgEl.value;
  ctx.fillRect(0, 0, tw, th);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const sw = dec!.width;
  const sh = dec!.height;
  const f = fit();
  if (f === 'stretch') ctx.drawImage(dec!.source, 0, 0, tw, th);
  else if (f === 'contain') {
    const s = Math.min(tw / sw, th / sh);
    const dw = sw * s;
    const dh = sh * s;
    ctx.drawImage(dec!.source, (tw - dw) / 2, (th - dh) / 2, dw, dh);
  } else {
    const r = cropRect(tw, th);
    ctx.drawImage(dec!.source, r.sx, r.sy, r.cw, r.ch, 0, 0, tw, th);
  }
}

function refresh() {
  if (!dec) return;
  const t = target();
  ($('#uf-qwrap') as HTMLElement).classList.toggle('hidden', formatEl.value !== 'jpeg');
  zoomEl.disabled = fit() !== 'cover';
  preview.classList.toggle('cursor-grab', fit() === 'cover');
  if ('error' in t) {
    info.textContent = t.error;
    info.className = 'mt-4 text-sm font-medium text-red-700';
    return;
  }
  info.className = 'mt-4 text-sm font-medium text-slate-700';
  const unit = unitEl.value;
  const phys = unit === 'px' ? '' : ` · ${wEl.value} × ${hEl.value} ${unit} pada ${dpiEl.value} dpi`;
  info.textContent = `Hasil: ${t.tw} × ${t.th} px${phys}`;
  const maxW = 340;
  const maxH = 440;
  const s = Math.min(maxW / t.tw, maxH / t.th, 1);
  draw(preview, Math.max(1, Math.round(t.tw * s)), Math.max(1, Math.round(t.th * s)));
}

function setSize(w: number, h: number, unit: string) {
  unitEl.value = unit;
  wEl.value = String(w);
  hEl.value = String(h);
}
function fmtNum(v: number) {
  return unitEl.value === 'px' ? String(Math.round(v)) : String(Math.round(v * 100) / 100);
}

bindDropzone($('#uf-drop'), {
  accept: IMG_EXT,
  multiple: false,
  onReject: (n) => setStatus(statusEl, 'error', `Format tidak didukung: ${n.map(escapeHtml).join(', ')}. Gunakan JPG, PNG, atau WebP.`),
  onFiles: async ([f]) => {
    setStatus(resultEl, null);
    try {
      dec?.close();
      dec = await decodeImage(f);
      fileName = baseName(f.name);
      cx = cy = 0.5;
      zoomEl.value = '1';
      setStatus(statusEl, null);
      work.classList.remove('hidden');
      chooseCustom();
    } catch (e: any) {
      dec = null;
      work.classList.add('hidden');
      setStatus(statusEl, 'error', escapeHtml(e.message));
    }
  },
});

function highlight(btn: HTMLElement) {
  $$('#uf-presets .tl-chip').forEach((b) => b.classList.toggle('is-on', b === btn));
}
function chooseCustom() {
  highlight($('#uf-presets [data-custom]'));
  lockEl.checked = true;
  const w = Math.min(dec!.width, 800);
  setSize(w, Math.round((w * dec!.height) / dec!.width), 'px');
  refresh();
}
$$('#uf-presets .tl-chip').forEach((b) =>
  b.addEventListener('click', () => {
    if (!dec) return;
    if (b.dataset.custom) return chooseCustom();
    highlight(b);
    lockEl.checked = false;
    (document.querySelector('#uf input[name=uf-fit][value=cover]') as HTMLInputElement).checked = true;
    dpiEl.value = '300';
    setSize(parseFloat(b.dataset.w!), parseFloat(b.dataset.h!), 'cm');
    cx = cy = 0.5;
    zoomEl.value = '1';
    refresh();
  }),
);

// kunci rasio
wEl.addEventListener('input', () => {
  if (lockEl.checked && dec) hEl.value = fmtNum((parseFloat(wEl.value) * dec.height) / dec.width) || '';
  highlight($('#uf-presets [data-custom]'));
  refresh();
});
hEl.addEventListener('input', () => {
  if (lockEl.checked && dec) wEl.value = fmtNum((parseFloat(hEl.value) * dec.width) / dec.height) || '';
  highlight($('#uf-presets [data-custom]'));
  refresh();
});
unitEl.addEventListener('change', refresh);
dpiEl.addEventListener('change', refresh);
bgEl.addEventListener('input', refresh);
zoomEl.addEventListener('input', refresh);
formatEl.addEventListener('change', refresh);
qEl.addEventListener('input', () => ($('#uf-qv').textContent = qEl.value));
$$('#uf input[name=uf-fit]').forEach((r) => r.addEventListener('change', refresh));

// geser gambar pada pratinjau (mode isi penuh)
let drag: { x: number; y: number } | null = null;
preview.addEventListener('pointerdown', (e) => {
  if (!dec || fit() !== 'cover') return;
  drag = { x: e.clientX, y: e.clientY };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!drag || !dec) return;
  const t = target();
  if ('error' in t) return;
  const rect = preview.getBoundingClientRect();
  const r = cropRect(t.tw, t.th);
  cx -= ((e.clientX - drag.x) * (r.cw / rect.width)) / dec.width;
  cy -= ((e.clientY - drag.y) * (r.ch / rect.height)) / dec.height;
  drag = { x: e.clientX, y: e.clientY };
  refresh();
});
['pointerup', 'pointercancel'].forEach((ev) => preview.addEventListener(ev, () => (drag = null)));

$('#uf-run').addEventListener('click', async () => {
  if (!dec) return;
  const t = target();
  if ('error' in t) return setStatus(statusEl, 'error', escapeHtml(t.error));
  setStatus(statusEl, null);
  try {
    const c = makeCanvas(t.tw, t.th);
    draw(c, t.tw, t.th);
    const jpeg = formatEl.value === 'jpeg';
    let blob = await toBlob(c, jpeg ? 'image/jpeg' : 'image/png', jpeg ? parseInt(qEl.value, 10) / 100 : undefined);
    const dpi = parseInt(dpiEl.value, 10);
    if (jpeg && unitEl.value !== 'px') blob = await setJpegDpi(blob, dpi);
    const name = `${fileName}-${t.tw}x${t.th}.${jpeg ? 'jpg' : 'png'}`;
    const url = URL.createObjectURL(blob);
    resultEl.className = 'mt-6';
    resultEl.innerHTML = `
      <div class="tl-status tl-status-success flex flex-wrap items-center gap-4 justify-between">
        <span class="flex items-center gap-3">
          <img src="${url}" alt="Hasil foto" class="h-16 w-auto rounded-lg border border-emerald-200 bg-white" />
          <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Selesai: ${t.tw} × ${t.th} px, ${formatBytes(blob.size)}.</span>
        </span>
        <button type="button" id="uf-dl" class="tl-btn"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh ${escapeHtml(name)}</button>
      </div>`;
    $('#uf-dl').addEventListener('click', () => downloadBlob(blob, name));
  } catch (e: any) {
    setStatus(statusEl, 'error', escapeHtml(e.message || 'Gagal membuat foto.'));
  }
});
