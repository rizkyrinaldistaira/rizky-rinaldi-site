import { $, $$, baseName, bindDropzone, downloadBlob, escapeHtml, extOf, formatBytes, nextFrame, setStatus, uniqueName } from './common.ts';
import { IMG_EXT, MAX_PIXELS, decodeImage, drawScaled, supportsWebpEncode, toBlob, type Decoded } from './image.ts';
import { createZip } from './zip.ts';

type Row = { file: File; el: HTMLElement; out?: { blob: Blob; name: string } };
const rows: Row[] = [];
const results = $('#kg-results');
const statusEl = $('#kg-status');
const opts = $('#kg-opts');
const runBtn = $('#kg-run') as HTMLButtonElement;
const zipBtn = $('#kg-zip') as HTMLButtonElement;
const targetEl = $('#kg-target') as HTMLInputElement;
const formatEl = $('#kg-format') as HTMLSelectElement;

supportsWebpEncode().then((ok) => {
  if (!ok) {
    const o = formatEl.querySelector('option[value=webp]') as HTMLOptionElement;
    o.disabled = true;
    o.textContent = 'WebP (tidak didukung browser ini)';
  }
});

$$('#kg .tl-chip[data-kb]').forEach((b) =>
  b.addEventListener('click', () => {
    targetEl.value = b.dataset.kb!;
  }),
);

function rowHtml(r: Row, msg: string, extra = '') {
  return `
    <i class="fa-solid fa-image text-gold-600" aria-hidden="true"></i>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-slate-800" title="${escapeHtml(r.file.name)}">${escapeHtml(r.file.name)}</p>
      <p class="text-xs text-slate-500">${msg}</p>
    </div>${extra}`;
}
function paint(r: Row, msg: string, extra = '') {
  r.el.innerHTML = rowHtml(r, msg, extra);
}

bindDropzone($('#kg-drop'), {
  accept: IMG_EXT,
  multiple: true,
  onReject: (n) => setStatus(statusEl, 'error', `Format tidak didukung: ${n.map(escapeHtml).join(', ')}. Gunakan JPG, PNG, atau WebP.`),
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

$('#kg-clear').addEventListener('click', () => {
  rows.length = 0;
  results.innerHTML = '';
  opts.classList.add('hidden');
  setStatus(statusEl, null);
});

/** Mencari kualitas tertinggi yang masih di bawah target; bila mustahil, dimensi diperkecil bertahap. */
async function compress(dec: Decoded, target: number, mime: string, alphaBg: string | null) {
  let scale = 1;
  if (dec.width * dec.height > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / (dec.width * dec.height));
  let last: { blob: Blob; w: number; h: number; q: number } | null = null;
  for (let attempt = 0; attempt < 14; attempt++) {
    const w = Math.max(1, Math.round(dec.width * scale));
    const h = Math.max(1, Math.round(dec.height * scale));
    const canvas = drawScaled(dec, w, h, alphaBg);
    const top = await toBlob(canvas, mime, 0.92);
    if (top.size <= target) return { blob: top, w, h, q: 0.92, reached: true };
    const bottom = await toBlob(canvas, mime, 0.3);
    last = { blob: bottom, w, h, q: 0.3 };
    if (bottom.size <= target) {
      let lo = 0.3,
        hi = 0.92,
        best = { blob: bottom, q: 0.3 };
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2;
        const b = await toBlob(canvas, mime, mid);
        if (b.size <= target) {
          best = { blob: b, q: mid };
          lo = mid;
        } else hi = mid;
      }
      return { blob: best.blob, w, h, q: best.q, reached: true };
    }
    if (Math.min(w, h) <= 120) break;
    scale *= 0.85;
  }
  return { ...last!, reached: false };
}

runBtn.addEventListener('click', async () => {
  const kb = parseFloat(targetEl.value);
  if (!isFinite(kb) || kb < 10) return setStatus(statusEl, 'error', 'Isi ukuran target minimal 10 KB.');
  const target = Math.floor(kb * 1024);
  const fmt = formatEl.value;
  const mime = fmt === 'webp' ? 'image/webp' : 'image/jpeg';
  const ext = fmt === 'webp' ? 'webp' : 'jpg';
  setStatus(statusEl, null);
  runBtn.disabled = true;
  const used = new Set<string>();
  let done = 0;
  for (const r of rows) {
    paint(r, `${formatBytes(r.file.size)} · memproses…`);
    await nextFrame();
    try {
      const srcExt = extOf(r.file.name);
      const keepable = r.file.size <= target && ['jpg', 'jpeg', 'png', 'webp'].includes(srcExt);
      if (keepable) {
        r.out = { blob: r.file, name: uniqueName(r.file.name, used) };
        paint(r, `${formatBytes(r.file.size)} · sudah di bawah target, file asli dipertahankan`, dlBtn());
      } else {
        const dec = await decodeImage(r.file);
        const res = await compress(dec, target, mime, mime === 'image/jpeg' ? '#ffffff' : null);
        dec.close();
        const name = uniqueName(`${baseName(r.file.name)}-kompres.${ext}`, used);
        r.out = { blob: res.blob, name };
        const pct = Math.max(0, Math.round((1 - res.blob.size / r.file.size) * 100));
        const note = res.reached ? '' : ` <span class="text-red-600">Target belum tercapai, ini hasil terkecil yang mungkin.</span>`;
        paint(r, `${formatBytes(r.file.size)} → <strong>${formatBytes(res.blob.size)}</strong> · ${res.w} × ${res.h} px · hemat ${pct}%${note}`, dlBtn());
      }
      done++;
      r.el.querySelector('button')!.addEventListener('click', () => downloadBlob(r.out!.blob, r.out!.name));
    } catch (e: any) {
      paint(r, `<span class="text-red-600">${escapeHtml(e.message || 'Gagal memproses.')}</span>`);
    }
  }
  runBtn.disabled = false;
  zipBtn.classList.toggle('hidden', done < 2);
});
function dlBtn() {
  return `<button type="button" class="tl-ghost" data-dl><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh</button>`;
}

zipBtn.addEventListener('click', async () => {
  const entries = [];
  for (const r of rows) if (r.out) entries.push({ name: r.out.name, data: new Uint8Array(await r.out.blob.arrayBuffer()) });
  downloadBlob(createZip(entries), 'gambar-terkompres.zip');
});
