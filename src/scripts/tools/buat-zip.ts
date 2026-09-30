import { $, bindDropzone, downloadBlob, enableReorder, escapeHtml, formatBytes, moveItem, nextFrame, setStatus } from './common.ts';
import { createZip } from './zip.ts';

const WARN_BYTES = 400 * 1024 * 1024;
const MAX_BYTES = 1.5 * 1024 * 1024 * 1024; // ZIP tanpa Zip64 dan seluruh isi dimuat di memori

let files: File[] = [];
const statusEl = $('#bz-status');
const opts = $('#bz-opts');
const list = $('#bz-list');
const summary = $('#bz-summary');
const progress = $('#bz-progress');
const runBtn = $('#bz-run') as HTMLButtonElement;
const val = (id: string) => ($(id) as HTMLInputElement | HTMLSelectElement).value;

/** Buang karakter yang tidak aman di Windows, macOS, dan Linux. */
function safeName(s: string, fallback: string): string {
  let out = s
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .replace(/[. ]+$/, '');
  if (out.length > 150) out = out.slice(0, 150).trim();
  return out || fallback;
}

function splitName(name: string): { stem: string; ext: string } {
  const i = name.lastIndexOf('.');
  return i > 0 ? { stem: name.slice(0, i), ext: name.slice(i) } : { stem: name, ext: '' };
}

/** Nama baru untuk setiap berkas, sesuai aturan, unik tanpa membedakan huruf besar dan kecil. */
function plan(): string[] {
  const numOn = ($('#bz-num') as HTMLInputElement).checked;
  const start = Math.max(0, parseInt(val('#bz-start'), 10) || 0);
  const digits = Math.max(2, String(start + files.length - 1).length);
  const prefix = val('#bz-prefix');
  const suffix = val('#bz-suffix');
  const find = val('#bz-find');
  const repl = val('#bz-repl');
  const space = val('#bz-space');
  const lower = val('#bz-case') === 'lower';
  const folder = safeName(val('#bz-folder'), '');
  const used = new Set<string>();
  return files.map((f, i) => {
    let { stem, ext } = splitName(f.name);
    if (find) stem = stem.split(find).join(repl);
    if (space) stem = stem.replace(/\s+/g, space);
    let full = (numOn ? String(start + i).padStart(digits, '0') + '_' : '') + prefix + stem + suffix;
    full = safeName(full, 'berkas');
    if (lower) (full = full.toLowerCase()), (ext = ext.toLowerCase());
    let name = full + ext;
    let n = 2;
    while (used.has(name.toLowerCase())) name = `${full}-${n++}${ext}`;
    used.add(name.toLowerCase());
    return (folder ? folder + '/' : '') + name;
  });
}

function render() {
  const names = plan();
  const total = files.reduce((s, f) => s + f.size, 0);
  opts.classList.toggle('hidden', files.length === 0);
  summary.textContent = files.length ? `${files.length} berkas · ${formatBytes(total)}` : '';
  list.innerHTML = '';
  files.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'tl-row';
    row.draggable = true;
    row.innerHTML = `
      <span class="w-6 text-center text-xs font-bold text-slate-400">${i + 1}</span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-xs text-slate-500" title="${escapeHtml(f.name)}">${escapeHtml(f.name)} · ${formatBytes(f.size)}</p>
        <p class="truncate text-sm font-semibold text-slate-800" title="${escapeHtml(names[i])}"><i class="fa-solid fa-arrow-right mr-1 text-xs text-gold-600" aria-hidden="true"></i>${escapeHtml(names[i])}</p>
      </div>
      <span class="flex shrink-0 gap-1">
        <button type="button" class="tl-icon" data-act="up" aria-label="Naikkan ${escapeHtml(f.name)}" ${i === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
        <button type="button" class="tl-icon" data-act="down" aria-label="Turunkan ${escapeHtml(f.name)}" ${i === files.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>
        <button type="button" class="tl-icon" data-act="del" aria-label="Hapus ${escapeHtml(f.name)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
      </span>`;
    list.appendChild(row);
  });
  if (total > MAX_BYTES) setStatus(statusEl, 'error', `Total ${formatBytes(total)} melebihi batas sekitar 1,5 GB. Kurangi berkas atau bagi menjadi beberapa ZIP.`);
  else if (total > WARN_BYTES) setStatus(statusEl, 'info', `Total ${formatBytes(total)} cukup besar. Di HP proses ini bisa gagal karena memori terbatas.`);
  else setStatus(statusEl, null);
}

bindDropzone($('#bz-drop'), {
  accept: [],
  multiple: true,
  onFiles: (added) => {
    files.push(...added);
    progress.textContent = '';
    render();
  },
});

list.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('button[data-act]') as HTMLElement | null;
  if (!btn) return;
  const row = btn.closest('.tl-row')!;
  const i = Array.from(list.children).indexOf(row);
  if (btn.dataset.act === 'up' && i > 0) moveItem(files, i, i - 1);
  else if (btn.dataset.act === 'down' && i < files.length - 1) moveItem(files, i, i + 1);
  else if (btn.dataset.act === 'del') files.splice(i, 1);
  render();
});
enableReorder(list, '.tl-row', (from, to) => {
  moveItem(files, from, to);
  render();
});
['#bz-num', '#bz-start', '#bz-prefix', '#bz-suffix', '#bz-find', '#bz-repl', '#bz-space', '#bz-case', '#bz-folder'].forEach((id) => {
  $(id).addEventListener('input', render);
  $(id).addEventListener('change', render);
});
$('#bz-clear').addEventListener('click', () => {
  files = [];
  progress.textContent = '';
  render();
});

runBtn.addEventListener('click', async () => {
  if (!files.length) return;
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > MAX_BYTES) return setStatus(statusEl, 'error', `Total ${formatBytes(total)} melebihi batas sekitar 1,5 GB.`);
  runBtn.disabled = true;
  const names = plan();
  const entries = [];
  try {
    for (let i = 0; i < files.length; i++) {
      progress.textContent = `Membaca berkas ${i + 1} dari ${files.length}…`;
      await nextFrame();
      entries.push({ name: names[i], data: new Uint8Array(await files[i].arrayBuffer()) });
    }
    progress.textContent = 'Menyusun ZIP…';
    await nextFrame();
    const zip = createZip(entries);
    const zipName = safeName(val('#bz-zipname'), 'berkas').replace(/\.zip$/i, '') + '.zip';
    downloadBlob(zip, zipName);
    progress.textContent = `ZIP siap: ${zipName}, ${entries.length} berkas, ${formatBytes(zip.size)}.`;
  } catch (e: any) {
    progress.textContent = '';
    setStatus(statusEl, 'error', escapeHtml(e?.message || 'Gagal membuat ZIP. Berkas mungkin terlalu besar untuk memori perangkat.'));
  } finally {
    runBtn.disabled = false;
  }
});
