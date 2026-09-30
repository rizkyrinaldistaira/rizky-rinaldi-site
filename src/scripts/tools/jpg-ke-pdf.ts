import { $, bindDropzone, downloadBlob, enableReorder, escapeHtml, formatBytes, moveItem, nextFrame, setStatus } from './common.ts';
import { IMG_EXT, decodeImage, drawScaled, toBlob } from './image.ts';
import { getPDFLib } from './pdf.ts';

type Item = { file: File; url: string; w: number; h: number };
const items: Item[] = [];
const list = $('#jp-list');
const statusEl = $('#jp-status');
const opts = $('#jp-opts');
const actions = $('#jp-actions');
const summary = $('#jp-summary');
const result = $('#jp-result');
const makeBtn = $('#jp-make') as HTMLButtonElement;
const sel = (id: string) => ($(id) as HTMLSelectElement).value;

function render() {
  list.innerHTML = '';
  items.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'tl-row';
    row.draggable = true;
    row.innerHTML = `
      <span class="w-6 text-center text-sm font-bold text-gold-700">${i + 1}</span>
      <img src="${it.url}" alt="" class="h-12 w-12 rounded-lg border border-slate-200 object-cover" draggable="false" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-800" title="${escapeHtml(it.file.name)}">${escapeHtml(it.file.name)}</p>
        <p class="text-xs text-slate-500">${it.w} × ${it.h} px &middot; ${formatBytes(it.file.size)}</p>
      </div>
      <button type="button" class="tl-icon" data-act="up" aria-label="Naikkan ${escapeHtml(it.file.name)}" ${i === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="down" aria-label="Turunkan ${escapeHtml(it.file.name)}" ${i === items.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="del" aria-label="Hapus ${escapeHtml(it.file.name)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    row.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        const act = (b as HTMLElement).dataset.act;
        if (act === 'up' && i > 0) moveItem(items, i, i - 1);
        if (act === 'down' && i < items.length - 1) moveItem(items, i, i + 1);
        if (act === 'del') {
          URL.revokeObjectURL(items[i].url);
          items.splice(i, 1);
        }
        setStatus(result, null);
        render();
      }),
    );
    list.appendChild(row);
  });
  const has = items.length > 0;
  opts.classList.toggle('hidden', !has);
  actions.classList.toggle('hidden', !has);
  summary.textContent = has ? `${items.length} gambar, ${formatBytes(items.reduce((s, x) => s + x.file.size, 0))}` : '';
}

enableReorder(list, '.tl-row', (from, to) => {
  moveItem(items, from, to);
  setStatus(result, null);
  render();
});

bindDropzone($('#jp-drop'), {
  accept: IMG_EXT,
  multiple: true,
  onReject: (n) => setStatus(statusEl, 'error', `Format tidak didukung: ${n.map(escapeHtml).join(', ')}. Gunakan JPG, PNG, atau WebP.`),
  onFiles: async (files) => {
    const errors: string[] = [];
    for (const f of files) {
      try {
        const d = await decodeImage(f);
        items.push({ file: f, url: URL.createObjectURL(f), w: d.width, h: d.height });
        d.close();
      } catch (e: any) {
        errors.push(escapeHtml(e.message));
      }
    }
    setStatus(statusEl, errors.length ? 'error' : null, errors.join('<br>'));
    setStatus(result, null);
    render();
  },
});

$('#jp-clear').addEventListener('click', () => {
  items.forEach((i) => URL.revokeObjectURL(i.url));
  items.length = 0;
  setStatus(result, null);
  setStatus(statusEl, null);
  render();
});

const PAGE: Record<string, [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] };
const mm = (v: number) => (v * 72) / 25.4;

makeBtn.addEventListener('click', async () => {
  makeBtn.disabled = true;
  setStatus(result, null);
  try {
    const { PDFDocument } = await getPDFLib();
    const out = await PDFDocument.create();
    const quality = parseFloat(sel('#jp-quality'));
    const size = sel('#jp-size');
    const orient = sel('#jp-orient');
    const margin = mm(parseFloat(sel('#jp-margin')));
    let n = 0;
    for (const it of items) {
      n++;
      setStatus(statusEl, 'info', `Memproses gambar ${n} dari ${items.length}…`);
      await nextFrame();
      const dec = await decodeImage(it.file);
      const s = Math.min(1, 3000 / Math.max(dec.width, dec.height));
      const w = Math.round(dec.width * s);
      const h = Math.round(dec.height * s);
      const canvas = drawScaled(dec, w, h, '#ffffff');
      dec.close();
      const blob = await toBlob(canvas, 'image/jpeg', quality);
      const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      let pw: number, ph: number;
      if (size === 'fit') {
        pw = w * 0.75 + margin * 2;
        ph = h * 0.75 + margin * 2;
      } else {
        [pw, ph] = PAGE[size];
        const landscape = orient === 'landscape' || (orient === 'auto' && w > h);
        if (landscape) [pw, ph] = [ph, pw];
      }
      const scale = Math.min((pw - margin * 2) / w, (ph - margin * 2) / h);
      const dw = w * scale;
      const dh = h * scale;
      const page = out.addPage([pw, ph]);
      page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    }
    const bytes = await out.save();
    const pdf = new Blob([bytes], { type: 'application/pdf' });
    setStatus(statusEl, null);
    result.className = 'mt-5';
    result.innerHTML = `
      <div class="tl-status tl-status-success flex flex-wrap items-center gap-3 justify-between">
        <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Berhasil: ${out.getPageCount()} halaman, ${formatBytes(pdf.size)}.</span>
        <button type="button" id="jp-dl" class="tl-btn"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh gambar.pdf</button>
      </div>`;
    $('#jp-dl').addEventListener('click', () => downloadBlob(pdf, 'gambar.pdf'));
  } catch (e: any) {
    setStatus(statusEl, 'error', escapeHtml(e.message || 'Gagal membuat PDF.'));
  } finally {
    makeBtn.disabled = false;
  }
});
