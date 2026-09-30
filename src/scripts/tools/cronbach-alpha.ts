import { $, escapeHtml, setStatus } from './common.ts';
import { cronbach, interpretAlpha } from './formulas.ts';

const dataEl = $('#ca-data') as HTMLTextAreaElement;
const msg = $('#ca-msg');
const out = $('#ca-out');
const f3 = (v: number | null) => (v === null || !isFinite(v) ? '-' : v.toFixed(3).replace('.', ','));
const f2 = (v: number) => v.toFixed(2).replace('.', ',');

const SAMPLE = '4\t5\t4\t5\n3\t3\t4\t3\n5\t5\t5\t4\n2\t3\t2\t3\n4\t4\t5\t4\n3\t2\t3\t3';

/** Mengurai teks tempel. Pemisah: tab, koma, titik koma, atau spasi. */
export function parseData(text: string) {
  const lines = text.split(/\r?\n/);
  const rows: number[][] = [];
  const skipped: string[] = [];
  let width = 0;
  let headerSkipped = false;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const parts = line.split(/[\t;,\s]+/).filter(Boolean);
    const nums = parts.map((p) => Number(p.replace(',', '.')));
    const bad = nums.some((n) => !isFinite(n));
    if (bad) {
      if (rows.length === 0 && !headerSkipped) {
        headerSkipped = true;
        return;
      }
      skipped.push(`baris ${i + 1} (ada sel kosong atau bukan angka)`);
      return;
    }
    if (!width) width = nums.length;
    if (nums.length !== width) {
      skipped.push(`baris ${i + 1} (jumlah kolom ${nums.length}, seharusnya ${width})`);
      return;
    }
    rows.push(nums);
  });
  return { rows, skipped, headerSkipped };
}

function run() {
  setStatus(msg, null);
  out.innerHTML = '';
  const { rows, skipped, headerSkipped } = parseData(dataEl.value);
  if (!dataEl.value.trim()) return setStatus(msg, 'error', 'Tempel data angket terlebih dulu.');
  if (rows.length === 0) return setStatus(msg, 'error', 'Tidak ada baris berisi angka yang dapat dibaca.');
  const k = rows[0].length;
  const min = parseFloat(($('#ca-min') as HTMLInputElement).value);
  const max = parseFloat(($('#ca-max') as HTMLInputElement).value);
  const revText = ($('#ca-rev') as HTMLInputElement).value.trim();
  const rev = new Set<number>();
  if (revText) {
    for (const p of revText.split(/[,;\s]+/).filter(Boolean)) {
      const n = Number(p);
      if (!Number.isInteger(n) || n < 1 || n > k) return setStatus(msg, 'error', `Nomor butir "${escapeHtml(p)}" tidak valid. Data memiliki ${k} butir (nomor 1 sampai ${k}).`);
      rev.add(n - 1);
    }
    if (!isFinite(min) || !isFinite(max) || min >= max) return setStatus(msg, 'error', 'Isi skor terendah dan tertinggi skala dengan benar (terendah harus lebih kecil).');
  }
  const outOfRange = isFinite(min) && isFinite(max) ? rows.some((r) => r.some((v) => v < min || v > max)) : false;
  const data = rows.map((r) => r.map((v, j) => (rev.has(j) ? min + max - v : v)));
  let res;
  try {
    res = cronbach(data);
  } catch (e: any) {
    return setStatus(msg, 'error', escapeHtml(e.message));
  }
  const notes: string[] = [];
  if (headerSkipped) notes.push('Baris judul pada bagian atas dilewati.');
  if (skipped.length) notes.push(`Baris dilewati: ${skipped.slice(0, 6).map(escapeHtml).join('; ')}${skipped.length > 6 ? `, dan ${skipped.length - 6} lainnya` : ''}.`);
  if (outOfRange) notes.push(`Ada skor di luar rentang ${min} sampai ${max}. Periksa data atau pengaturan skala.`);
  if (rev.size) notes.push(`Skor butir ${Array.from(rev).map((x) => x + 1).join(', ')} dibalik (${min}+${max} dikurangi skor).`);
  if (res.n < 30) notes.push(`Hanya ${res.n} responden. Nilai alfa pada sampel sekecil ini kurang stabil.`);
  if (res.alpha < 0) notes.push('Alfa bernilai negatif. Ini biasanya berarti ada butir yang bernada terbalik dan perlu dibalik skornya.');
  if (notes.length) setStatus(msg, skipped.length || outOfRange || res.alpha < 0 ? 'error' : 'info', notes.join('<br>'));

  const tafsir = interpretAlpha(res.alpha);
  const rows_html = res.items
    .map((it, j) => {
      const lowR = it.corrected !== null && it.corrected < 0.3;
      const raises = it.alphaIfDeleted !== null && it.alphaIfDeleted > res.alpha + 1e-9;
      const flag = lowR || raises ? `<span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">${lowR ? 'r rendah' : ''}${lowR && raises ? ', ' : ''}${raises ? 'alfa naik bila dihapus' : ''}</span>` : '';
      return `<tr><td>${j + 1}${rev.has(j) ? ' (dibalik)' : ''}</td><td>${f2(it.mean)}</td><td>${f2(it.sd)}</td><td>${f3(it.corrected)}</td><td>${f3(it.alphaIfDeleted)}</td><td>${flag}</td></tr>`;
    })
    .join('');
  out.innerHTML = `
    <div class="grid gap-3 sm:grid-cols-4">
      ${[['Cronbach\'s alpha', f3(res.alpha), tafsir], ['Responden', String(res.n), ''], ['Butir', String(res.k), ''], ['Rata-rata skor total', f2(res.totalMean), `SD ${f2(res.totalSd)}`]]
        .map(([l, v, h], i) => `<div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3"><p class="text-xs font-semibold text-slate-500">${l}</p><p class="text-2xl font-extrabold text-slate-900" ${i === 0 ? 'id="ca-alpha"' : ''}>${v}</p>${h ? `<p class="text-xs text-slate-500">${h}</p>` : ''}</div>`)
        .join('')}
    </div>
    <div class="tl-table-wrap mt-5" role="region" tabindex="0" aria-label="Tabel analisis butir">
      <table class="tl-table">
        <thead><tr><th>Butir</th><th>Rata-rata</th><th>SD</th><th>r butir-total terkoreksi</th><th>Alfa bila butir dihapus</th><th>Catatan</th></tr></thead>
        <tbody id="ca-items">${rows_html}</tbody>
      </table>
    </div>
    <p class="mt-3 text-xs text-slate-500">Korelasi butir-total terkoreksi di bawah 0,30 sering dijadikan tanda butir perlu diperiksa. Keputusan menghapus butir sebaiknya mempertimbangkan isi butir, bukan angka saja.</p>`;
}

$('#ca-run').addEventListener('click', run);
$('#ca-sample').addEventListener('click', () => {
  dataEl.value = SAMPLE;
  ($('#ca-rev') as HTMLInputElement).value = '';
  ($('#ca-min') as HTMLInputElement).value = '1';
  ($('#ca-max') as HTMLInputElement).value = '5';
  run();
});
$('#ca-clear').addEventListener('click', () => {
  dataEl.value = '';
  ($('#ca-rev') as HTMLInputElement).value = '';
  out.innerHTML = '';
  setStatus(msg, null);
});
