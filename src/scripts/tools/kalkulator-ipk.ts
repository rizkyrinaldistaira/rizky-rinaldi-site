import { $, escapeHtml } from './common.ts';
import { ips as calcIps, ipk as calcIpk, requiredIps } from './formulas.ts';

type Scale = [string, number][];
const PRESETS: Record<string, Scale> = {
  p1: [['A', 4], ['B+', 3.5], ['B', 3], ['C+', 2.5], ['C', 2], ['D', 1], ['E', 0]],
  p2: [['A', 4], ['A-', 3.75], ['B+', 3.5], ['B', 3], ['B-', 2.75], ['C+', 2.5], ['C', 2], ['D', 1], ['E', 0]],
  p3: [['A', 4], ['B', 3], ['C', 2], ['D', 1], ['E', 0]],
};
let scale: Scale = PRESETS.p2.map(([l, p]) => [l, p]);

type Course = { name: string; sks: number; letter: string };
type Sem = { label: string; sks: number; ips: number };
const courses: Course[] = [{ name: '', sks: 3, letter: 'A' }];
const sems: Sem[] = [];

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');
const num = (s: string) => parseFloat(String(s).replace(',', '.'));
const point = (l: string) => scale.find(([x]) => x === l)?.[1] ?? 0;
const maxPoint = () => Math.max(...scale.map(([, p]) => p));

const coursesEl = $('#ik-courses');
const semsEl = $('#ik-sems');
const scaleSel = $('#ik-scale') as HTMLSelectElement;
const curSks = $('#ik-cur-sks') as HTMLInputElement;
const curIpk = $('#ik-cur-ipk') as HTMLInputElement;
const targetEl = $('#ik-target') as HTMLInputElement;
const nextSks = $('#ik-next-sks') as HTMLInputElement;

const card = (label: string, value: string, hint = '') =>
  `<div class="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3"><p class="text-xs font-semibold text-slate-500">${label}</p><p class="text-2xl font-extrabold text-slate-900">${value}</p>${hint ? `<p class="text-xs text-slate-500">${hint}</p>` : ''}</div>`;

// ---------- skala ----------
function renderScaleEdit() {
  const box = $('#ik-scale-edit');
  box.innerHTML = '';
  scale.forEach(([l, p], i) => {
    const d = document.createElement('div');
    d.innerHTML = `<label class="tl-label" for="ik-w-${i}">Bobot ${escapeHtml(l)}</label><input id="ik-w-${i}" type="number" step="0.01" min="0" max="10" value="${p}" class="tl-input" data-i="${i}" />`;
    box.appendChild(d);
  });
}
$('#ik-scale-edit').addEventListener('input', (e) => {
  const inp = e.target as HTMLInputElement;
  const v = num(inp.value);
  if (isFinite(v)) scale[Number(inp.dataset.i)][1] = v;
  recalcAll();
});
scaleSel.addEventListener('change', () => {
  scale = PRESETS[scaleSel.value].map(([l, p]) => [l, p]);
  courses.forEach((c) => {
    if (!scale.some(([l]) => l === c.letter)) c.letter = scale[0][0];
  });
  renderScaleEdit();
  renderCourses();
  recalcAll();
});

// ---------- mata kuliah ----------
function renderCourses() {
  coursesEl.innerHTML = '';
  courses.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 items-center gap-3';
    row.innerHTML = `
      <input class="tl-input col-span-12 sm:col-span-6" type="text" data-k="name" data-i="${i}" placeholder="Mata kuliah ${i + 1}" aria-label="Nama mata kuliah ${i + 1}" value="${escapeHtml(c.name)}" />
      <input class="tl-input col-span-4 sm:col-span-2" type="number" min="1" max="12" step="1" data-k="sks" data-i="${i}" aria-label="SKS mata kuliah ${i + 1}" value="${c.sks}" />
      <select class="tl-input col-span-6 sm:col-span-3" data-k="letter" data-i="${i}" aria-label="Nilai mata kuliah ${i + 1}">
        ${scale.map(([l, p]) => `<option value="${escapeHtml(l)}" ${l === c.letter ? 'selected' : ''}>${escapeHtml(l)} (${fmt(p)})</option>`).join('')}
      </select>
      <button type="button" class="tl-icon col-span-2 sm:col-span-1" data-del="${i}" aria-label="Hapus mata kuliah ${i + 1}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    coursesEl.appendChild(row);
  });
}
coursesEl.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement;
  if (!t.dataset.k) return;
  const c = courses[Number(t.dataset.i)];
  if (t.dataset.k === 'name') c.name = t.value;
  if (t.dataset.k === 'sks') c.sks = num(t.value);
  if (t.dataset.k === 'letter') c.letter = t.value;
  recalcIps();
});
coursesEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button[data-del]') as HTMLElement | null;
  if (!b) return;
  courses.splice(Number(b.dataset.del), 1);
  renderCourses();
  recalcIps();
});
$('#ik-add-course').addEventListener('click', () => {
  courses.push({ name: '', sks: 3, letter: scale[0][0] });
  renderCourses();
  recalcIps();
});
$('#ik-clear-courses').addEventListener('click', () => {
  courses.length = 0;
  courses.push({ name: '', sks: 3, letter: scale[0][0] });
  renderCourses();
  recalcIps();
});

function ipsNow() {
  const valid = courses.filter((c) => isFinite(c.sks) && c.sks > 0);
  return calcIps(valid.map((c) => ({ sks: c.sks, point: point(c.letter) })));
}
function recalcIps() {
  const r = ipsNow();
  $('#ik-ips-out').innerHTML = card('Total SKS', String(r.sks)) + card('Total mutu', fmt(r.mutu)) + card('IPS', r.sks ? fmt(r.ips) : '-', r.sks ? `nilai eksak ${fmt(r.ips, 4)}` : '');
}

// ---------- semester dan IPK ----------
function renderSems() {
  semsEl.innerHTML = '';
  sems.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 items-center gap-3';
    row.innerHTML = `
      <input class="tl-input col-span-12 sm:col-span-5" type="text" data-k="label" data-i="${i}" aria-label="Nama semester ${i + 1}" value="${escapeHtml(s.label)}" />
      <input class="tl-input col-span-5 sm:col-span-3" type="number" min="1" step="1" data-k="sks" data-i="${i}" aria-label="SKS semester ${i + 1}" placeholder="SKS" value="${isFinite(s.sks) ? s.sks : ''}" />
      <input class="tl-input col-span-5 sm:col-span-3" type="number" min="0" step="0.01" data-k="ips" data-i="${i}" aria-label="IPS semester ${i + 1}" placeholder="IPS" value="${isFinite(s.ips) ? Math.round(s.ips * 10000) / 10000 : ''}" />
      <button type="button" class="tl-icon col-span-2 sm:col-span-1" data-del="${i}" aria-label="Hapus semester ${i + 1}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    semsEl.appendChild(row);
  });
}
semsEl.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement;
  if (!t.dataset.k) return;
  const s = sems[Number(t.dataset.i)];
  if (t.dataset.k === 'label') s.label = t.value;
  if (t.dataset.k === 'sks') s.sks = num(t.value);
  if (t.dataset.k === 'ips') s.ips = num(t.value);
  recalcIpk();
});
semsEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button[data-del]') as HTMLElement | null;
  if (!b) return;
  sems.splice(Number(b.dataset.del), 1);
  renderSems();
  recalcIpk();
});
$('#ik-add-sem').addEventListener('click', () => {
  sems.push({ label: `Semester ${sems.length + 1}`, sks: NaN, ips: NaN });
  renderSems();
  recalcIpk();
});
$('#ik-add-from-ips').addEventListener('click', () => {
  const r = ipsNow();
  if (!r.sks) return;
  sems.push({ label: `Semester ${sems.length + 1}`, sks: r.sks, ips: r.ips });
  renderSems();
  recalcIpk();
});

function ipkNow() {
  const valid = sems.filter((s) => isFinite(s.sks) && s.sks > 0 && isFinite(s.ips) && s.ips >= 0);
  return calcIpk(valid.map((s) => ({ sks: s.sks, ips: s.ips })));
}
function recalcIpk() {
  const r = ipkNow();
  $('#ik-ipk-out').innerHTML = sems.length ? card('Total SKS', String(r.sks)) + card('Total mutu', fmt(r.mutu)) + card('IPK', r.sks ? fmt(r.ipk) : '-', r.sks ? `nilai eksak ${fmt(r.ipk, 4)}` : '') : '<p class="text-sm text-slate-500 sm:col-span-3">Tambahkan semester untuk melihat IPK kumulatif.</p>';
  if (r.sks) {
    curSks.value = String(r.sks);
    curIpk.value = String(Math.round(r.ipk * 10000) / 10000);
    auto = { sks: r.sks, ipk: Math.round(r.ipk * 10000) / 10000, mutu: r.mutu };
  } else auto = null;
  recalcSim();
}

// ---------- simulasi ----------
// Selama kolom tidak diubah pengguna, pakai total mutu eksak dari riwayat (bukan IPK yang dibulatkan).
let auto: { sks: number; ipk: number; mutu: number } | null = null;
function recalcSim() {
  const out = $('#ik-sim-out');
  const cs = num(curSks.value);
  const ci = num(curIpk.value);
  const tg = num(targetEl.value);
  const ns = num(nextSks.value);
  if (!isFinite(tg)) {
    out.innerHTML = '<p class="text-sm text-slate-500">Isi target IPK untuk melihat IPS yang dibutuhkan.</p>';
    return;
  }
  if (!isFinite(cs) || cs < 0 || !isFinite(ci) || ci < 0) {
    out.innerHTML = '<div class="tl-status tl-status-error">Isi SKS yang sudah ditempuh dan IPK saat ini dengan angka yang valid.</div>';
    return;
  }
  if (!isFinite(ns) || ns < 1) {
    out.innerHTML = '<div class="tl-status tl-status-error">Isi SKS semester depan minimal 1.</div>';
    return;
  }
  const mx = maxPoint();
  if (tg < 0 || tg > mx) {
    out.innerHTML = `<div class="tl-status tl-status-error">Target IPK harus di antara 0 dan ${fmt(mx)}.</div>`;
    return;
  }
  const untouched = auto !== null && cs === auto.sks && Math.abs(ci - auto.ipk) < 1e-12;
  const need = requiredIps(cs, untouched ? auto!.mutu : cs * ci, ns, tg);
  if (need <= 0) {
    out.innerHTML = `<div class="tl-status tl-status-success">Target ${fmt(tg)} sudah terlampaui. IPK Anda tetap di atas target berapa pun IPS semester depan.</div>`;
  } else if (need > mx + 1e-9) {
    out.innerHTML = `<div class="tl-status tl-status-error">Target ${fmt(tg)} tidak dapat dicapai dalam satu semester. Dibutuhkan IPS ${fmt(need)}, melebihi nilai maksimum ${fmt(mx)}. Butuh lebih dari satu semester.</div>`;
  } else {
    out.innerHTML = `<div class="grid gap-3 sm:grid-cols-3">${card('IPS yang dibutuhkan', fmt(need), `nilai eksak ${fmt(need, 4)}`)}${card('Untuk IPK target', fmt(tg))}${card('Dengan SKS semester depan', String(ns))}</div>`;
  }
}
[curSks, curIpk, targetEl, nextSks].forEach((el) => el.addEventListener('input', recalcSim));

function recalcAll() {
  recalcIps();
  recalcIpk();
}
renderScaleEdit();
renderCourses();
renderSems();
recalcAll();
