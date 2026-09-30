import { $, baseName, bindDropzone, downloadBlob, escapeHtml, formatBytes, nextFrame, setStatus, uniqueName } from './common.ts';
import { IMG_EXT, MAX_PIXELS, decodeImage, drawScaled, supportsWebpEncode, toBlob } from './image.ts';
import { createZip } from './zip.ts';

type Row = { file: File; el: HTMLElement; out?: { blob: Blob; name: string } };
const rows: Row[] = [];
const results = $('#fg-results');
const statusEl = $('#fg-status');
const opts = $('#fg-opts');
const runBtn = $('#fg-run') as HTMLButtonElement;
const zipBtn = $('#fg-zip') as HTMLButtonElement;
const formatEl = $('#fg-format') as HTMLSelectElement;
const qEl = $('#fg-q') as HTMLInputElement;
const qv = $('#fg-qv');

qEl.addEventListener('input', () => (qv.textContent = qEl.value));
supportsWebpEncode().then((ok) => {
  if (!ok) {
    const o = formatEl.querySelector('option[value=webp]') as HTMLOptionElement;
    o.disabled = true;
    o.textContent = 'WebP (tidak didukung browser ini)';
  }
});

const paint = (r: Row, msg: string, extra = '') =>
  (r.el.innerHTML = `
    <i class="fa-solid fa-image text-gold-600" aria-hidden="true"></i>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-slate-800" title="${escapeHtml(r.file.name)}">${escapeHtml(r.file.name)}</p>
      <p class="text-xs text-slate-500">${msg}</p>
    </div>${extra}`);

bindDropzone($('#fg-drop'), {
  accept: IMG_EXT,
  multiple: true,
  onReject: (n) => setStatus(statusEl, 'error', `Format tidak didukung: ${n.map(escapeHtml).join(', ')}. Format HEIC belum didukung.`),
  onFiles: (files) => {
    setStatus(statusEl, null);
    files.forEach((f) => {
      const el = document.createElement('div');
      el.className = 'tl-row';
      const r: Row = { file: f, el };
      rows.push(r);
      paint(r, `${formatBytes(f.size)} · menunggu`);
      results.appendChild(el);
    });
    opts.classList.remove('hidden');
    zipBtn.classList.add('hidden');
  },
});

$('#fg-clear').addEventListener('click', () => {
  rows.length = 0;
  results.innerHTML = '';
  opts.classList.add('hidden');
  setStatus(statusEl, null);
});

runBtn.addEventListener('click', async () => {
  const fmt = formatEl.value;
  const mime = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'png' ? 'image/png' : 'image/webp';
  const ext = fmt === 'jpeg' ? 'jpg' : fmt;
  const q = parseInt(qEl.value, 10) / 100;
  const bg = ($('#fg-bg') as HTMLInputElement).value;
  const maxW = parseInt(($('#fg-max') as HTMLInputElement).value, 10) || 0;
  setStatus(statusEl, null);
  runBtn.disabled = true;
  const used = new Set<string>();
  let done = 0;
  for (const r of rows) {
    paint(r, `${formatBytes(r.file.size)} · memproses…`);
    await nextFrame();
    try {
      const dec = await decodeImage(r.file);
      let s = maxW > 0 && dec.width > maxW ? maxW / dec.width : 1;
      if (dec.width * dec.height * s * s > MAX_PIXELS) s = Math.sqrt(MAX_PIXELS / (dec.width * dec.height));
      const w = Math.round(dec.width * s);
      const h = Math.round(dec.height * s);
      const canvas = drawScaled(dec, w, h, fmt === 'jpeg' ? bg : null);
      dec.close();
      const blob = await toBlob(canvas, mime, fmt === 'png' ? undefined : q);
      const name = uniqueName(`${baseName(r.file.name)}.${ext}`, used);
      r.out = { blob, name };
      paint(r, `${formatBytes(r.file.size)} → <strong>${formatBytes(blob.size)}</strong> · ${w} × ${h} px · ${ext.toUpperCase()}`, `<button type="button" class="tl-ghost"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh</button>`);
      r.el.querySelector('button')!.addEventListener('click', () => downloadBlob(blob, name));
      done++;
    } catch (e: any) {
      paint(r, `<span class="text-red-600">${escapeHtml(e.message || 'Gagal memproses.')}</span>`);
    }
  }
  runBtn.disabled = false;
  zipBtn.classList.toggle('hidden', done < 2);
});

zipBtn.addEventListener('click', async () => {
  const entries = [];
  for (const r of rows) if (r.out) entries.push({ name: r.out.name, data: new Uint8Array(await r.out.blob.arrayBuffer()) });
  downloadBlob(createZip(entries), 'gambar-diubah.zip');
});
