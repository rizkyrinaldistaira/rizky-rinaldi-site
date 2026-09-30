import { $, escapeHtml, setStatus } from './common.ts';
import { cochran, krejcieMorgan, slovin } from './formulas.ts';

const nEl = $('#us-n') as HTMLInputElement;
const eEl = $('#us-e') as HTMLInputElement;
const confEl = $('#us-conf') as HTMLSelectElement;
const pEl = $('#us-p') as HTMLInputElement;
const out = $('#us-out');
const msg = $('#us-msg');

const Z: Record<string, number> = { '90': 1.645, '95': 1.96, '99': 2.576 };
const CHI2: Record<string, number> = { '90': 2.706, '95': 3.841, '99': 6.635 };
const num = (s: string) => parseFloat(String(s).replace(',', '.'));
const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');

function cardHtml(id: string, title: string, n: number, formula: string, detail: string, sentence: string, warn: string) {
  return `
  <div class="rounded-2xl border border-slate-200 bg-white p-5">
    <p class="text-xs font-semibold uppercase tracking-wider text-gold-700">${title}</p>
    <p class="mt-1 text-4xl font-extrabold text-slate-900" data-n="${id}">${n}</p>
    <p class="text-xs text-slate-500">responden</p>
    <p class="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">${formula}</p>
    <p class="mt-2 text-xs text-slate-500">${detail}</p>
    <p class="mt-3 text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2">${warn}</p>
    <button type="button" class="tl-ghost mt-3" data-copy="${escapeHtml(sentence)}" style="padding:0.35rem 0.9rem"><i class="fa-regular fa-copy" aria-hidden="true"></i> Salin kalimat</button>
  </div>`;
}

function calc() {
  const N = num(nEl.value);
  const eP = num(eEl.value);
  const pP = num(pEl.value);
  if (!nEl.value.trim()) {
    out.innerHTML = '';
    setStatus(msg, null);
    return;
  }
  if (!Number.isInteger(N) || N < 1) return fail('Jumlah populasi harus bilangan bulat minimal 1.');
  if (!(eP >= 0.1 && eP <= 50)) return fail('Batas kesalahan harus di antara 0,1% dan 50%.');
  if (!(pP >= 1 && pP <= 99)) return fail('Proporsi populasi harus di antara 1% dan 99%.');
  setStatus(msg, null);
  const e = eP / 100;
  const p = pP / 100;
  const conf = confEl.value;

  const sl = slovin(N, e);
  const km = krejcieMorgan(N, CHI2[conf], p, e);
  const co = cochran(N, Z[conf], p, e);
  const cap = (n: number) => Math.min(n, N);

  const confTxt = `${conf}%`;
  const eTxt = `${fmt(eP, eP % 1 ? 1 : 0)}%`;
  const slSentence = `Ukuran sampel ditentukan dengan rumus Slovin, n = N / (1 + N·e²), dengan N = ${N} dan e = ${eTxt}, sehingga diperoleh n = ${cap(sl.n)} responden.`;
  const kmSentence = `Ukuran sampel ditentukan dengan rumus Krejcie dan Morgan (1970) pada tingkat kepercayaan ${confTxt}, P = ${fmt(p, 2)}, dan d = ${eTxt}, dengan N = ${N}, sehingga diperoleh s = ${cap(km.n)} responden.`;
  const coSentence = `Ukuran sampel ditentukan dengan rumus Cochran (1977) dengan koreksi populasi terbatas pada tingkat kepercayaan ${confTxt}, p = ${fmt(p, 2)}, dan e = ${eTxt}, dengan N = ${N}, sehingga diperoleh n = ${cap(co.n)} responden.`;

  out.innerHTML =
    cardHtml('slovin', 'Slovin', cap(sl.n), 'n = N / (1 + N·e²)', `Nilai eksak ${fmt(sl.raw)}. Dibulatkan ke atas.`, slSentence, 'Tidak untuk penelitian kualitatif atau eksperimen. Tidak memakai tingkat kepercayaan.') +
    cardHtml('km', 'Krejcie dan Morgan', cap(km.n), 'S = X²·N·P(1−P) / [d²(N−1) + X²·P(1−P)]', `Nilai eksak ${fmt(km.raw)}. Dibulatkan seperti tabel aslinya (1970). X² = ${CHI2[conf]}.`, kmSentence, N >= 100000 ? 'Untuk populasi sangat besar, tabel asli mencantumkan 384; rumus memberi nilai mendekati itu.' : 'Tabel aslinya memakai e = 5% dan kepercayaan 95%. Nilai lain dihitung dengan rumus yang sama.') +
    cardHtml('cochran', 'Cochran', cap(co.n), 'n₀ = z²·p·q / e², lalu n = n₀ / (1 + (n₀−1)/N)', `n₀ = ${fmt(co.n0)}, z = ${Z[conf]}. Dibulatkan ke atas.`, coSentence, 'Fleksibel mengatur kepercayaan dan proporsi. Cocok untuk survei proporsi.');

  const note: string[] = [];
  if (N < 100) note.push('Populasi kurang dari 100. Pedoman praktis menyarankan mengambil seluruh populasi sebagai sampel (total sampling).');
  if (sl.n > N || km.n > N || co.n > N) note.push('Ada hasil yang melebihi jumlah populasi, sehingga ditampilkan sebatas jumlah populasi.');
  setStatus(msg, note.length ? 'info' : null, note.map(escapeHtml).join('<br>'));
}
function fail(m: string) {
  out.innerHTML = '';
  setStatus(msg, 'error', escapeHtml(m));
}

[nEl, eEl, confEl, pEl].forEach((el) => el.addEventListener('input', calc));
out.addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest('button[data-copy]') as HTMLElement | null;
  if (!b) return;
  try {
    await navigator.clipboard.writeText(b.dataset.copy!);
    const old = b.innerHTML;
    b.textContent = 'Tersalin';
    setTimeout(() => (b.innerHTML = old), 1200);
  } catch {
    setStatus(msg, 'error', 'Browser menolak menyalin. Blok kalimat lalu salin manual.');
  }
});
