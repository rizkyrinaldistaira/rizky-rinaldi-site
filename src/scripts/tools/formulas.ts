// Rumus untuk tool penelitian dan akademik. Murni TypeScript tanpa impor,
// sehingga dapat diuji langsung dengan Node dan dijalankan di browser.

/** Nilai kritis z dua sisi untuk tingkat kepercayaan umum (dihitung dari invers normal baku). */
export function zForConfidence(level: number): number {
  const p = 1 - (1 - level) / 2;
  return normInv(p);
}

/** Invers distribusi normal baku (algoritma Acklam), akurasi sekitar 1e-9. */
export function normInv(p: number): number {
  if (p <= 0 || p >= 1) throw new Error('p harus di antara 0 dan 1');
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number, r: number;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > phigh) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5;
  r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** Slovin: n = N / (1 + N e^2). Hasil dibulatkan ke atas. */
export function slovin(N: number, e: number) {
  const raw = N / (1 + N * e * e);
  return { raw, n: Math.ceil(raw - 1e-9) };
}

/** Krejcie dan Morgan (1970): s = X2 N P (1-P) / (d2 (N-1) + X2 P (1-P)). Dibulatkan seperti tabel aslinya. */
export function krejcieMorgan(N: number, chi2 = 3.841, P = 0.5, d = 0.05) {
  const raw = (chi2 * N * P * (1 - P)) / (d * d * (N - 1) + chi2 * P * (1 - P));
  return { raw, n: Math.round(raw) };
}

/** Cochran: n0 = z2 p q / e2, lalu koreksi populasi terbatas n = n0 / (1 + (n0 - 1)/N). */
export function cochran(N: number | null, z: number, p = 0.5, e = 0.05) {
  const n0 = (z * z * p * (1 - p)) / (e * e);
  const finite = N && N > 0 ? n0 / (1 + (n0 - 1) / N) : n0;
  return { n0, raw: finite, n: Math.ceil(finite - 1e-9) };
}

// ---------- Cronbach alpha ----------

export type AlphaItem = { mean: number; sd: number; corrected: number | null; alphaIfDeleted: number | null };
export type AlphaResult = {
  n: number;
  k: number;
  alpha: number;
  totalMean: number;
  totalSd: number;
  items: AlphaItem[];
};

const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const variance = (a: number[]) => {
  const m = mean(a);
  return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
};
const corr = (x: number[], y: number[]) => {
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
};

function alphaOf(cols: number[][]): number {
  const k = cols.length;
  const n = cols[0].length;
  const totals = Array.from({ length: n }, (_, i) => cols.reduce((s, c) => s + c[i], 0));
  const sumVar = cols.reduce((s, c) => s + variance(c), 0);
  const totVar = variance(totals);
  return (k / (k - 1)) * (1 - sumVar / totVar);
}

/** rows: responden (baris) x butir (kolom). Semua sel harus angka. */
export function cronbach(rows: number[][]): AlphaResult {
  const n = rows.length;
  const k = rows[0].length;
  if (n < 3) throw new Error('Minimal 3 responden.');
  if (k < 2) throw new Error('Minimal 2 butir.');
  const cols = Array.from({ length: k }, (_, j) => rows.map((r) => r[j]));
  const totals = rows.map((r) => r.reduce((s, x) => s + x, 0));
  const alpha = alphaOf(cols);
  const items: AlphaItem[] = cols.map((c, j) => {
    const rest = totals.map((t, i) => t - c[i]);
    const others = cols.filter((_, idx) => idx !== j);
    return {
      mean: mean(c),
      sd: Math.sqrt(variance(c)),
      corrected: corr(c, rest),
      alphaIfDeleted: k > 2 ? alphaOf(others) : null,
    };
  });
  return { n, k, alpha, totalMean: mean(totals), totalSd: Math.sqrt(variance(totals)), items };
}

export function interpretAlpha(a: number): string {
  if (!isFinite(a)) return 'Tidak dapat ditafsirkan';
  if (a >= 0.9) return 'Sangat tinggi';
  if (a >= 0.8) return 'Tinggi';
  if (a >= 0.7) return 'Dapat diterima';
  if (a >= 0.6) return 'Rendah (batas minimum pada sebagian buku di Indonesia)';
  return 'Kurang memadai';
}

// ---------- IPS dan IPK ----------

export type Course = { sks: number; point: number };

export function ips(courses: Course[]) {
  const sks = courses.reduce((s, c) => s + c.sks, 0);
  const mutu = courses.reduce((s, c) => s + c.sks * c.point, 0);
  return { sks, mutu, ips: sks > 0 ? mutu / sks : 0 };
}

/** IPK kumulatif dari beberapa semester: sum(sks * ips) / sum(sks). */
export function ipk(semesters: { sks: number; ips: number }[]) {
  const sks = semesters.reduce((s, x) => s + x.sks, 0);
  const mutu = semesters.reduce((s, x) => s + x.sks * x.ips, 0);
  return { sks, mutu, ipk: sks > 0 ? mutu / sks : 0 };
}

/** IPS yang dibutuhkan pada semester depan untuk mencapai IPK target. */
export function requiredIps(currentSks: number, currentMutu: number, nextSks: number, target: number) {
  const need = (target * (currentSks + nextSks) - currentMutu) / nextSks;
  return need;
}
