import { $, escapeHtml } from './common.ts';
import { CalcError, evaluate, formatResult, type Angle } from './calc.ts';

const expr = $('#kc-expr') as HTMLInputElement;
const resultEl = $('#kc-result');
const errorEl = $('#kc-error');
const modeEl = $('#kc-mode');
const memEl = $('#kc-mem');
const angleBtn = $('#kc-angle');
const histEl = $('#kc-history');
const emptyEl = $('#kc-empty');

let angle: Angle = 'deg';
let ans = 0;
let mem = 0;
let justEvaluated = false;
let current: number | null = null;
const history: { e: string; r: string }[] = [];

if (window.matchMedia('(pointer: coarse)').matches) expr.inputMode = 'none'; // HP: pakai tombol, bukan keyboard layar

const ctx = () => ({ angle, ans, mem });

function preview() {
  errorEl.textContent = '';
  const text = expr.value.trim();
  if (!text) {
    current = null;
    resultEl.textContent = '0';
    resultEl.classList.remove('text-slate-400');
    return;
  }
  try {
    current = evaluate(text, ctx());
    resultEl.textContent = formatResult(current);
    resultEl.classList.add('text-slate-400');
  } catch {
    current = null;
    resultEl.textContent = '…';
    resultEl.classList.add('text-slate-400');
  }
}

function equals() {
  const text = expr.value.trim();
  if (!text) return;
  try {
    const v = evaluate(text, ctx());
    ans = v;
    current = v;
    const shown = formatResult(v);
    resultEl.textContent = shown;
    resultEl.classList.remove('text-slate-400');
    errorEl.textContent = '';
    history.unshift({ e: text, r: shown });
    if (history.length > 20) history.pop();
    renderHistory();
    justEvaluated = true;
  } catch (e) {
    errorEl.textContent = e instanceof CalcError ? e.message : 'Ekspresi tidak valid';
    resultEl.textContent = 'Galat';
    resultEl.classList.remove('text-slate-400');
  }
}

function insert(text: string) {
  const isOp = /^[+\-−×÷^!%]$/.test(text);
  if (justEvaluated) {
    expr.value = isOp ? 'Ans' + text : text;
    justEvaluated = false;
  } else {
    const s = expr.selectionStart ?? expr.value.length;
    const e = expr.selectionEnd ?? expr.value.length;
    expr.value = expr.value.slice(0, s) + text + expr.value.slice(e);
    const pos = s + text.length;
    expr.setSelectionRange(pos, pos);
  }
  expr.focus({ preventScroll: true });
  preview();
}

function renderHistory() {
  histEl.innerHTML = '';
  history.forEach((h, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" class="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-amber-50" data-i="${i}">
      <span class="min-w-0 truncate text-slate-600">${escapeHtml(h.e)}</span><span class="flex-shrink-0 font-semibold text-slate-900">= ${escapeHtml(h.r)}</span></button>`;
    histEl.appendChild(li);
  });
  emptyEl.classList.toggle('hidden', history.length > 0);
}
histEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button[data-i]') as HTMLElement | null;
  if (!b) return;
  expr.value = history[Number(b.dataset.i)].e;
  justEvaluated = false;
  preview();
  expr.focus({ preventScroll: true });
});

function memValue(): number | null {
  if (expr.value.trim()) {
    try {
      return evaluate(expr.value, ctx());
    } catch {
      errorEl.textContent = 'Selesaikan ekspresi dulu sebelum memakai memori.';
      return null;
    }
  }
  return ans;
}
function updateMem() {
  memEl.classList.toggle('hidden', mem === 0);
  memEl.title = `Memori: ${formatResult(mem)}`;
}

$('#kc').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button.tl-key') as HTMLElement | null;
  if (!b) return;
  if (b.dataset.ins) return insert(b.dataset.ins);
  switch (b.dataset.act) {
    case 'eq':
      return equals();
    case 'clear':
      expr.value = '';
      justEvaluated = false;
      return preview();
    case 'back':
      if (justEvaluated) justEvaluated = false;
      expr.value = expr.value.slice(0, -1);
      return preview();
    case 'angle':
      angle = angle === 'deg' ? 'rad' : 'deg';
      angleBtn.textContent = angle.toUpperCase();
      modeEl.textContent = angle.toUpperCase();
      return preview();
    case 'mc':
      mem = 0;
      return updateMem();
    case 'mplus': {
      const v = memValue();
      if (v !== null) mem += v;
      return updateMem();
    }
    case 'mminus': {
      const v = memValue();
      if (v !== null) mem -= v;
      return updateMem();
    }
  }
});

expr.addEventListener('input', () => {
  justEvaluated = false;
  expr.value = expr.value.replace(/\*/g, '×').replace(/\//g, '÷');
  preview();
});
expr.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    equals();
  } else if (e.key === 'Escape') {
    expr.value = '';
    preview();
  }
});
$('#kc-hclear').addEventListener('click', () => {
  history.length = 0;
  renderHistory();
});
$('#kc-copy').addEventListener('click', async () => {
  const text = resultEl.textContent ?? '';
  if (!text || text === '…' || text === 'Galat') return;
  try {
    await navigator.clipboard.writeText(text);
    errorEl.textContent = '';
    const btn = $('#kc-copy');
    const old = btn.innerHTML;
    btn.textContent = 'Tersalin';
    setTimeout(() => (btn.innerHTML = old), 1200);
  } catch {
    errorEl.textContent = 'Browser menolak menyalin. Blok hasil lalu salin manual.';
  }
});
renderHistory();
