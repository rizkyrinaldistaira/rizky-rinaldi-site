import { $, baseName, bindDropzone, downloadBlob, escapeHtml, formatBytes, nextFrame, setStatus } from './common.ts';
import { MAX_PIXELS, setJpegDpi, toBlob } from './image.ts';
import { friendlyPdfError, openPdfJsDoc, parseRanges, readBytes } from './pdf.ts';
import { createZip } from './zip.ts';

type Out = { name: string; blob: Blob };
let doc: any = null;
let fileName = '';
let total = 0;
let outs: Out[] = [];
let cancel = false;
let running = false;

const statusEl = $('#pg-status');
const opts = $('#pg-opts');
const info = $('#pg-info');
const results = $('#pg-results');
const progress = $('#pg-progress');
const runBtn = $('#pg-run') as HTMLButtonElement;
const cancelBtn = $('#pg-cancel') as HTMLButtonElement;
const zipBtn = $('#pg-zip') as HTMLButtonElement;
const formatEl = $('#pg-format') as HTMLSelectElement;
const dpiEl = $('#pg-dpi') as HTMLSelectElement;
const qEl = $('#pg-q') as HTMLInputElement;
const pagesEl = $('#pg-pages') as HTMLInputElement;

qEl.addEventListener('input', () => ($('#pg-qv').textContent = qEl.value));
const syncFormat = () => $('#pg-qwrap').classList.toggle('hidden', formatEl.value !== 'jpeg');
formatEl.addEventListener('change', syncFormat);

function reset() {
  try {
    doc?.destroy?.();
  } catch {}
  doc = null;
  total = 0;
  outs = [];
  results.innerHTML = '';
  progress.textContent = '';
  pagesEl.value = '';
  zipBtn.classList.add('hidden');
  opts.classList.add('hidden');
  setStatus(statusEl, null);
}

bindDropzone($('#pg-drop'), {
  accept: ['pdf'],
  multiple: false,
  onReject: (n) => setStatus(statusEl, 'error', `Hanya file PDF yang didukung: ${n.map(escapeHtml).join(', ')}.`),
  onFiles: async ([f]) => {
    if (running) return setStatus(statusEl, 'info', 'Tunggu proses yang sedang berjalan selesai, atau klik "Hentikan".');
    reset();
    try {
      let d: any;
      try {
        d = await openPdfJsDoc(await readBytes(f));
      } catch (e) {
        throw new Error(friendlyPdfError(e, f.name));
      }
      if ((await d.getPermissions()) !== null) {
        d.destroy?.();
        throw new Error(friendlyPdfError(new Error('encrypted'), f.name));
      }
      doc = d;
      fileName = f.name;
      total = d.numPages;
      info.textContent = `${f.name} · ${total} halaman · ${formatBytes(f.size)}`;
      opts.classList.remove('hidden');
      syncFormat();
    } catch (e: any) {
      setStatus(statusEl, 'error', escapeHtml(e?.message || 'Gagal membuka PDF.'));
    }
  },
});

$('#pg-clear').addEventListener('click', () => {
  if (running) cancel = true;
  reset();
});
cancelBtn.addEventListener('click', () => (cancel = true));

runBtn.addEventListener('click', async () => {
  if (!doc || running) return;
  setStatus(statusEl, null);
  let list: number[];
  try {
    list = pagesEl.value.trim() ? parseRanges(pagesEl.value, total) : Array.from({ length: total }, (_, i) => i + 1);
  } catch (e: any) {
    return setStatus(statusEl, 'error', escapeHtml(e.message));
  }
  const fmt = formatEl.value;
  const ext = fmt === 'jpeg' ? 'jpg' : 'png';
  const mime = fmt === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dpi = parseInt(dpiEl.value, 10);
  const q = parseInt(qEl.value, 10) / 100;
  const digits = Math.max(2, String(total).length);
  const myDoc = doc;
  running = true;
  cancel = false;
  runBtn.disabled = true;
  cancelBtn.classList.remove('hidden');
  zipBtn.classList.add('hidden');
  results.innerHTML = '';
  outs = [];
  let capped = 0;
  try {
    for (let i = 0; i < list.length; i++) {
      if (cancel || doc !== myDoc) break;
      const n = list[i];
      progress.textContent = `Memproses halaman ${n} (${i + 1} dari ${list.length})…`;
      await nextFrame();
      const page = await myDoc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      let scale = dpi / 72;
      let px = base.width * scale * base.height * scale;
      if (px > MAX_PIXELS) {
        scale *= Math.sqrt(MAX_PIXELS / px);
        capped++;
      }
      const vp = page.getViewport({ scale });
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(vp.width));
      c.height = Math.max(1, Math.round(vp.height));
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, canvas: c, viewport: vp }).promise;
      page.cleanup();
      let blob = await toBlob(c, mime, fmt === 'jpeg' ? q : undefined);
      if (fmt === 'jpeg') blob = await setJpegDpi(blob, Math.round(scale * 72));
      const th = document.createElement('canvas');
      const ts = Math.min(1, 260 / Math.max(c.width, c.height));
      th.width = Math.max(1, Math.round(c.width * ts));
      th.height = Math.max(1, Math.round(c.height * ts));
      const tctx = th.getContext('2d')!;
      tctx.imageSmoothingQuality = 'high';
      tctx.drawImage(c, 0, 0, th.width, th.height);
      const w = c.width;
      const h = c.height;
      c.width = c.height = 0;
      const name = `${baseName(fileName)}-hal-${String(n).padStart(digits, '0')}.${ext}`;
      outs.push({ name, blob });
      const card = document.createElement('div');
      card.className = 'tl-page';
      card.innerHTML = `
        <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><img alt="Hasil halaman ${n}" class="mx-auto block max-h-56 w-auto" src="${th.toDataURL('image/jpeg', 0.8)}" /></div>
        <p class="mt-2 text-xs font-bold text-slate-600">Halaman ${n}</p>
        <p class="text-xs text-slate-500">${w} × ${h} px · ${formatBytes(blob.size)}</p>
        <button type="button" class="tl-ghost mt-2"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh ${ext.toUpperCase()}</button>`;
      card.querySelector('button')!.addEventListener('click', () => downloadBlob(blob, name));
      results.appendChild(card);
    }
    const done = outs.length;
    if (cancel) progress.textContent = `Dihentikan. ${done} halaman sudah selesai.`;
    else progress.textContent = `Selesai: ${done} gambar.`;
    if (capped) setStatus(statusEl, 'info', `${capped} halaman sangat besar, jadi kejernihannya diturunkan otomatis agar tidak melebihi memori perangkat.`);
    zipBtn.classList.toggle('hidden', done < 2);
  } catch (e: any) {
    setStatus(statusEl, 'error', escapeHtml(e?.message || 'Gagal mengubah halaman menjadi gambar.'));
  } finally {
    running = false;
    runBtn.disabled = false;
    cancelBtn.classList.add('hidden');
  }
});

zipBtn.addEventListener('click', async () => {
  const entries = [];
  for (const o of outs) entries.push({ name: o.name, data: new Uint8Array(await o.blob.arrayBuffer()) });
  downloadBlob(createZip(entries), `${baseName(fileName)}-gambar.zip`);
});
