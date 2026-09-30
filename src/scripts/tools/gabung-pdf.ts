import { $ , bindDropzone, downloadBlob, enableReorder, escapeHtml, formatBytes, moveItem, nextFrame, setStatus } from './common.ts';
import { getPDFLib, openPdfLibDoc, readBytes } from './pdf.ts';

type Item = { id: number; file: File; pages: number };
const items: Item[] = [];
let seq = 1;

const drop = $('#gp-drop');
const list = $('#gp-list');
const status = $('#gp-status');
const actions = $('#gp-actions');
const summary = $('#gp-summary');
const result = $('#gp-result');
const mergeBtn = $('#gp-merge') as HTMLButtonElement;

function render() {
  list.innerHTML = '';
  items.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'tl-row';
    row.draggable = true;
    row.innerHTML = `
      <span class="w-6 text-center text-sm font-bold text-gold-700">${i + 1}</span>
      <i class="fa-solid fa-file-pdf text-gold-600" aria-hidden="true"></i>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-800" title="${escapeHtml(it.file.name)}">${escapeHtml(it.file.name)}</p>
        <p class="text-xs text-slate-500">${it.pages} halaman &middot; ${formatBytes(it.file.size)}</p>
      </div>
      <button type="button" class="tl-icon" data-act="up" aria-label="Naikkan ${escapeHtml(it.file.name)}" ${i === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="down" aria-label="Turunkan ${escapeHtml(it.file.name)}" ${i === items.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>
      <button type="button" class="tl-icon" data-act="del" aria-label="Hapus ${escapeHtml(it.file.name)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    row.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        const act = (b as HTMLElement).dataset.act;
        if (act === 'up' && i > 0) moveItem(items, i, i - 1);
        if (act === 'down' && i < items.length - 1) moveItem(items, i, i + 1);
        if (act === 'del') items.splice(i, 1);
        setStatus(result, null);
        render();
      }),
    );
    list.appendChild(row);
  });
  const totalPages = items.reduce((s, x) => s + x.pages, 0);
  const totalSize = items.reduce((s, x) => s + x.file.size, 0);
  actions.classList.toggle('hidden', items.length === 0);
  mergeBtn.disabled = items.length < 2;
  summary.textContent = items.length ? `${items.length} file, ${totalPages} halaman, ${formatBytes(totalSize)}` + (items.length < 2 ? ' (minimal 2 file)' : '') : '';
}

enableReorder(list, '.tl-row', (from, to) => {
  moveItem(items, from, to);
  setStatus(result, null);
  render();
});

bindDropzone(drop, {
  accept: ['pdf'],
  multiple: true,
  onReject: (names) => setStatus(status, 'error', `Hanya file PDF yang diterima. Dilewati: ${names.map(escapeHtml).join(', ')}.`),
  onFiles: async (files) => {
    setStatus(status, 'info', 'Membaca file…');
    const errors: string[] = [];
    for (const f of files) {
      try {
        const doc = await openPdfLibDoc(f);
        items.push({ id: seq++, file: f, pages: doc.getPageCount() });
      } catch (e: any) {
        errors.push(escapeHtml(e.message));
      }
    }
    setStatus(status, errors.length ? 'error' : null, errors.join('<br>'));
    setStatus(result, null);
    render();
  },
});

$('#gp-clear').addEventListener('click', () => {
  items.length = 0;
  setStatus(result, null);
  setStatus(status, null);
  render();
});

mergeBtn.addEventListener('click', async () => {
  mergeBtn.disabled = true;
  setStatus(result, null);
  try {
    const { PDFDocument } = await getPDFLib();
    const out = await PDFDocument.create();
    let n = 0;
    for (const it of items) {
      n++;
      setStatus(status, 'info', `Menggabungkan file ${n} dari ${items.length}…`);
      await nextFrame();
      const src = await PDFDocument.load(await readBytes(it.file));
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p: any) => out.addPage(p));
    }
    const bytes = await out.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    setStatus(status, null);
    result.className = 'mt-5';
    result.innerHTML = `
      <div class="tl-status tl-status-success flex flex-wrap items-center gap-3 justify-between">
        <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Berhasil: ${out.getPageCount()} halaman, ${formatBytes(blob.size)}.</span>
        <button type="button" id="gp-dl" class="tl-btn"><i class="fa-solid fa-download" aria-hidden="true"></i> Unduh gabungan.pdf</button>
      </div>`;
    $('#gp-dl').addEventListener('click', () => downloadBlob(blob, 'gabungan.pdf'));
  } catch (e: any) {
    setStatus(status, 'error', escapeHtml(e.message || 'Gagal menggabungkan PDF.'));
  } finally {
    mergeBtn.disabled = items.length < 2;
  }
});
