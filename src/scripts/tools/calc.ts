// Pengurai dan pengevaluasi ekspresi untuk kalkulator ilmiah.
// Tanpa eval: tokenizer + parser turun-rekursif. Murni TypeScript, tanpa impor.

export class CalcError extends Error {}

export type Angle = 'deg' | 'rad';
export type Context = { angle: Angle; ans?: number; mem?: number };

type Tok = { t: 'num' | 'id' | 'op' | 'lp' | 'rp' | 'sep' | 'end'; v: string; n?: number };

const FUNCS1: Record<string, (x: number, c: Context) => number> = {
  sin: (x, c) => trig(Math.sin, x, c),
  cos: (x, c) => trig(Math.cos, x, c),
  tan: (x, c) => {
    const r = toRad(x, c);
    if (Math.abs(Math.cos(r)) < 1e-12) throw new CalcError('tan tidak terdefinisi pada sudut ini');
    return clean(Math.tan(r));
  },
  asin: (x, c) => inv(Math.asin, x, c),
  acos: (x, c) => inv(Math.acos, x, c),
  atan: (x, c) => fromRad(Math.atan(x), c),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  asinh: (x) => Math.asinh(x),
  acosh: (x) => real(Math.acosh(x)),
  atanh: (x) => real(Math.atanh(x)),
  ln: (x) => {
    if (x <= 0) throw new CalcError('ln hanya untuk bilangan positif');
    return Math.log(x);
  },
  log: (x) => {
    if (x <= 0) throw new CalcError('log hanya untuk bilangan positif');
    return clean(Math.log10(x));
  },
  log2: (x) => {
    if (x <= 0) throw new CalcError('log2 hanya untuk bilangan positif');
    return clean(Math.log2(x));
  },
  sqrt: (x) => {
    if (x < 0) throw new CalcError('Akar kuadrat bilangan negatif bukan bilangan real');
    return Math.sqrt(x);
  },
  cbrt: (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
  exp: (x) => Math.exp(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  fact: (x) => factorial(x),
};

const FUNCS2: Record<string, (a: number, b: number) => number> = {
  pow: (a, b) => power(a, b),
  root: (x, n) => {
    if (n === 0) throw new CalcError('Akar ke-0 tidak terdefinisi');
    if (x < 0 && Math.abs(n % 2) !== 1) throw new CalcError('Akar genap bilangan negatif bukan bilangan real');
    return x < 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n);
  },
  ncr: (n, r) => nCr(n, r),
  npr: (n, r) => nPr(n, r),
  mod: (a, b) => {
    if (b === 0) throw new CalcError('Pembagian dengan nol');
    return ((a % b) + b) % b;
  },
};

const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E };

function toRad(x: number, c: Context) {
  return c.angle === 'deg' ? (x * Math.PI) / 180 : x;
}
function fromRad(x: number, c: Context) {
  return clean(c.angle === 'deg' ? (x * 180) / Math.PI : x);
}
function trig(fn: (x: number) => number, x: number, c: Context) {
  return clean(fn(toRad(x, c)));
}
function inv(fn: (x: number) => number, x: number, c: Context) {
  if (x < -1 || x > 1) throw new CalcError('Nilai harus di antara -1 dan 1');
  return fromRad(fn(x), c);
}
function real(x: number) {
  if (!isFinite(x) || Number.isNaN(x)) throw new CalcError('Hasil bukan bilangan real');
  return x;
}
/** Buang galat pembulatan kecil, misalnya sin(180) = 1.2e-16 menjadi 0. */
export function clean(x: number) {
  if (Math.abs(x) < 1e-14) return 0;
  return parseFloat(x.toPrecision(15));
}
function power(a: number, b: number) {
  const r = Math.pow(a, b);
  if (Number.isNaN(r)) throw new CalcError('Hasil bukan bilangan real');
  if (!isFinite(r)) throw new CalcError('Hasil terlalu besar');
  return r;
}
function factorial(x: number) {
  if (!Number.isInteger(x) || x < 0) throw new CalcError('Faktorial hanya untuk bilangan bulat tak negatif');
  if (x > 170) throw new CalcError('Faktorial terlalu besar (maksimum 170)');
  let r = 1;
  for (let i = 2; i <= x; i++) r *= i;
  return r;
}
function nCr(n: number, r: number) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) throw new CalcError('nCr memerlukan bilangan bulat dengan 0 ≤ r ≤ n');
  r = Math.min(r, n - r);
  let res = 1;
  for (let i = 1; i <= r; i++) res = (res * (n - r + i)) / i;
  return Math.round(res);
}
function nPr(n: number, r: number) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) throw new CalcError('nPr memerlukan bilangan bulat dengan 0 ≤ r ≤ n');
  let res = 1;
  for (let i = 0; i < r; i++) res *= n - i;
  return res;
}

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, ' pi ')
    .replace(/\s+/g, ' ')
    .trim();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || ((ch === '.' || ch === ',') && /[0-9]/.test(s[i + 1] ?? ''))) {
      const m = /^(\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i))!;
      const num = parseFloat(m[0].replace(',', '.'));
      out.push({ t: 'num', v: m[0], n: num });
      i += m[0].length;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      const m = /^[a-zA-Z][a-zA-Z0-9]*/.exec(s.slice(i))![0];
      out.push({ t: 'id', v: m.toLowerCase() });
      i += m.length;
      continue;
    }
    if (ch === '√') {
      out.push({ t: 'id', v: 'sqrt' });
      i++;
      continue;
    }
    if ('+-*/^!%'.includes(ch)) {
      out.push({ t: 'op', v: ch });
      i++;
      continue;
    }
    if (ch === '(') {
      out.push({ t: 'lp', v: ch });
      i++;
      continue;
    }
    if (ch === ')') {
      out.push({ t: 'rp', v: ch });
      i++;
      continue;
    }
    if (ch === ';') {
      out.push({ t: 'sep', v: ch });
      i++;
      continue;
    }
    throw new CalcError(`Karakter tidak dikenali: ${ch}`);
  }
  out.push({ t: 'end', v: '' });
  return out;
}

class Parser {
  private p = 0;
  private toks: Tok[];
  private ctx: Context;
  constructor(toks: Tok[], ctx: Context) {
    this.toks = toks;
    this.ctx = ctx;
  }
  private peek() {
    return this.toks[this.p];
  }
  private next() {
    return this.toks[this.p++];
  }
  parse(): number {
    if (this.peek().t === 'end') throw new CalcError('Ekspresi kosong');
    const v = this.expr();
    if (this.peek().t !== 'end') {
      const t = this.peek();
      if (t.t === 'rp') throw new CalcError('Kurung tutup berlebih');
      throw new CalcError('Ekspresi tidak lengkap atau tidak valid');
    }
    return v;
  }
  private expr(): number {
    let v = this.term();
    while (this.peek().t === 'op' && (this.peek().v === '+' || this.peek().v === '-')) {
      const op = this.next().v;
      const r = this.term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  private startsPrimary(): boolean {
    const t = this.peek();
    return t.t === 'num' || t.t === 'id' || t.t === 'lp';
  }
  private term(): number {
    let v = this.unary();
    for (;;) {
      const t = this.peek();
      if (t.t === 'op' && (t.v === '*' || t.v === '/')) {
        this.next();
        const r = this.unary();
        if (t.v === '/') {
          if (r === 0) throw new CalcError('Pembagian dengan nol');
          v = v / r;
        } else v = v * r;
      } else if (this.startsPrimary()) {
        if (t.t === 'num' && this.toks[this.p - 1]?.t === 'num') throw new CalcError('Operator hilang di antara dua angka');
        v = v * this.unary();
      } else break;
    }
    return v;
  }
  private unary(): number {
    const t = this.peek();
    if (t.t === 'op' && (t.v === '-' || t.v === '+')) {
      this.next();
      const v = this.unary();
      return t.v === '-' ? -v : v;
    }
    return this.power();
  }
  private power(): number {
    const base = this.postfix();
    const t = this.peek();
    if (t.t === 'op' && t.v === '^') {
      this.next();
      const ex = this.unary();
      return power(base, ex);
    }
    return base;
  }
  private postfix(): number {
    let v = this.primary();
    for (;;) {
      const t = this.peek();
      if (t.t === 'op' && t.v === '!') {
        this.next();
        v = factorial(v);
      } else if (t.t === 'op' && t.v === '%') {
        this.next();
        v = v / 100;
      } else break;
    }
    return v;
  }
  private primary(): number {
    const t = this.next();
    if (t.t === 'num') return t.n!;
    if (t.t === 'lp') {
      const v = this.expr();
      if (this.peek().t !== 'rp') throw new CalcError('Kurung buka belum ditutup');
      this.next();
      return v;
    }
    if (t.t === 'id') {
      const name = t.v;
      if (name === 'ans') return this.ctx.ans ?? 0;
      if (name === 'm') return this.ctx.mem ?? 0;
      if (name in CONSTS) return CONSTS[name];
      const one = FUNCS1[name];
      const two = FUNCS2[name];
      if (name === 'round') return this.roundFn();
      if (one || two) {
        if (this.peek().t !== 'lp') {
          if (name === 'sqrt' && (this.peek().t === 'num' || this.peek().t === 'id')) return FUNCS1.sqrt(this.postfixNoUnary(), this.ctx);
          throw new CalcError(`Fungsi ${name} memerlukan tanda kurung`);
        }
        this.next();
        const args = this.args();
        if (one) {
          if (name === 'log' && args.length === 2) {
            if (args[1] <= 0 || args[1] === 1) throw new CalcError('Basis logaritma tidak valid');
            if (args[0] <= 0) throw new CalcError('log hanya untuk bilangan positif');
            return clean(Math.log(args[0]) / Math.log(args[1]));
          }
          if (args.length !== 1) throw new CalcError(`Fungsi ${name} memerlukan 1 argumen`);
          return FUNCS1[name](args[0], this.ctx);
        }
        if (args.length !== 2) throw new CalcError(`Fungsi ${name} memerlukan 2 argumen, dipisah dengan titik koma`);
        return FUNCS2[name](args[0], args[1]);
      }
      throw new CalcError(`Fungsi atau konstanta tidak dikenal: ${t.v}`);
    }
    if (t.t === 'end') throw new CalcError('Ekspresi tidak lengkap');
    throw new CalcError('Ekspresi tidak valid');
  }
  private postfixNoUnary(): number {
    return this.postfix();
  }
  private roundFn(): number {
    if (this.peek().t !== 'lp') throw new CalcError('Fungsi round memerlukan tanda kurung');
    this.next();
    const a = this.args();
    if (a.length < 1 || a.length > 2) throw new CalcError('round memerlukan 1 atau 2 argumen');
    const d = a[1] ?? 0;
    const f = Math.pow(10, d);
    return Math.round(a[0] * f + Number.EPSILON * Math.sign(a[0])) / f;
  }
  private args(): number[] {
    const out: number[] = [];
    if (this.peek().t === 'rp') {
      this.next();
      return out;
    }
    for (;;) {
      out.push(this.expr());
      const t = this.next();
      if (t.t === 'sep') continue;
      if (t.t === 'rp') break;
      throw new CalcError('Kurung buka belum ditutup');
    }
    return out;
  }
}

export function evaluate(expr: string, ctx: Context): number {
  const v = new Parser(tokenize(expr), ctx).parse();
  if (Number.isNaN(v)) throw new CalcError('Hasil bukan bilangan real');
  if (!isFinite(v)) throw new CalcError('Hasil terlalu besar');
  return clean(v);
}

/** Format tampilan Indonesia: koma desimal, maksimum 12 angka bermakna, tanpa pemisah ribuan. */
export function formatResult(v: number): string {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  let s: string;
  if (abs >= 1e15 || abs < 1e-9) {
    s = v.toExponential(9).replace(/\.?0+e/, 'e').replace('e+', 'e');
  } else {
    s = String(parseFloat(v.toPrecision(12)));
    if (s.includes('e')) s = v.toFixed(12).replace(/\.?0+$/, '');
  }
  return s.replace('.', ',');
}
