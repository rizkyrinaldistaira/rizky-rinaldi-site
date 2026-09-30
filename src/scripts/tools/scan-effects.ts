// Filter Scan Dokumen (ala CamScanner). Fungsi murni tanpa DOM: dapat diuji di Node dan dijalankan di Web Worker.
//
// Inti filter Ajaib, Terang, Dokumen, dan Hitam putih adalah koreksi latar (flat-field): kecerahan kertas
// diperkirakan per blok, dihaluskan, lalu tiap piksel dibagi perkiraan itu. Kertas menjadi putih merata walau
// cahaya tidak rata atau ada bayangan, sesuatu yang tidak bisa dicapai dengan ambang tunggal.

import { boxBlur } from './scan-detect.ts';

export type FilterId = 'asli' | 'ajaib' | 'terang' | 'dokumen' | 'hitamputih' | 'abuabu';

type Grid = { grid: Float32Array; bs: number; gw: number; gh: number };

/** Kecerahan (luma) 0..255 tiap piksel. */
export function luminance(data: Uint8ClampedArray, n: number): Uint8Array {
  const lum = new Uint8Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) lum[i] = (data[p] * 77 + data[p + 1] * 150 + data[p + 2] * 29) >> 8;
  return lum;
}

/** Perkiraan kecerahan kertas per blok: persentil ke-85, didilatasi lalu dihaluskan. */
function backgroundGrid(lum: Uint8Array, w: number, h: number): Grid {
  const bs = Math.max(12, Math.round(Math.min(w, h) / 32));
  const gw = Math.ceil(w / bs);
  const gh = Math.ceil(h / bs);
  const raw = new Float32Array(gw * gh);
  const step = Math.max(1, Math.floor(bs / 10));
  const hist = new Uint32Array(256);
  for (let gy = 0; gy < gh; gy++) {
    const y0 = gy * bs;
    const y1 = Math.min(h, y0 + bs);
    for (let gx = 0; gx < gw; gx++) {
      const x0 = gx * bs;
      const x1 = Math.min(w, x0 + bs);
      hist.fill(0);
      let cnt = 0;
      for (let y = y0; y < y1; y += step) {
        const row = y * w;
        for (let x = x0; x < x1; x += step) {
          hist[lum[row + x]]++;
          cnt++;
        }
      }
      const target = cnt * 0.85;
      let acc = 0;
      let v = 255;
      for (let i = 0; i < 256; i++) {
        acc += hist[i];
        if (acc >= target) {
          v = i;
          break;
        }
      }
      raw[gy * gw + gx] = v;
    }
  }
  // Dilatasi 3x3 (maks) agar blok yang dipenuhi tinta tidak menarik perkiraan ke bawah.
  const dil = new Float32Array(gw * gh);
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++) {
      let m = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy >= 0 && yy < gh && xx >= 0 && xx < gw) m = Math.max(m, raw[yy * gw + xx]);
        }
      dil[y * gw + x] = m;
    }
  // Haluskan dua kali (kotak 3x3) lalu beri batas bawah agar area gelap tidak diperkuat berlebihan.
  let cur = dil;
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(gw * gh);
    for (let y = 0; y < gh; y++)
      for (let x = 0; x < gw; x++) {
        let s = 0;
        let c = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy >= 0 && yy < gh && xx >= 0 && xx < gw) {
              s += cur[yy * gw + xx];
              c++;
            }
          }
        out[y * gw + x] = s / c;
      }
    cur = out;
  }
  for (let i = 0; i < cur.length; i++) cur[i] = Math.max(48, cur[i]);
  return { grid: cur, bs, gw, gh };
}

/** Koefisien interpolasi bilinear dari grid ke piksel. */
function axisMap(n: number, bs: number, g: number) {
  const i0 = new Int32Array(n);
  const i1 = new Int32Array(n);
  const f = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = Math.min(g - 1, Math.max(0, (i + 0.5) / bs - 0.5));
    const a = Math.floor(v);
    i0[i] = a;
    i1[i] = Math.min(g - 1, a + 1);
    f[i] = v - a;
  }
  return { i0, i1, f };
}

/** Titik hitam otomatis: persentil ke-1 dari kecerahan setelah koreksi latar, dibatasi 0..60. */
function autoBlackPoint(lum: Uint8Array, g: Grid, w: number, h: number): number {
  const ax = axisMap(w, g.bs, g.gw);
  const ay = axisMap(h, g.bs, g.gh);
  const hist = new Uint32Array(256);
  let cnt = 0;
  for (let y = 0; y < h; y += 4) {
    const r0 = ay.i0[y] * g.gw;
    const r1 = ay.i1[y] * g.gw;
    const fy = ay.f[y];
    for (let x = 0; x < w; x += 4) {
      const fx = ax.f[x];
      const bg = (g.grid[r0 + ax.i0[x]] * (1 - fx) + g.grid[r0 + ax.i1[x]] * fx) * (1 - fy) + (g.grid[r1 + ax.i0[x]] * (1 - fx) + g.grid[r1 + ax.i1[x]] * fx) * fy;
      const v = Math.min(255, (lum[y * w + x] * 255) / bg);
      hist[v | 0]++;
      cnt++;
    }
  }
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= cnt * 0.01) return Math.min(60, i);
  }
  return 0;
}

type Params = { lo: number | 'auto'; hi: number; gray: boolean; gamma: number; sat: number; s: number };

const PRESETS: Record<Exclude<FilterId, 'asli'>, Params> = {
  ajaib: { lo: 'auto', hi: 250, gray: false, gamma: 0.92, sat: 1.22, s: 0.5 },
  terang: { lo: 0, hi: 235, gray: false, gamma: 0.78, sat: 1.1, s: 0.3 },
  dokumen: { lo: 70, hi: 215, gray: false, gamma: 1, sat: 1.0, s: 0.6 },
  hitamputih: { lo: 85, hi: 195, gray: true, gamma: 1, sat: 1, s: 1 },
  abuabu: { lo: 25, hi: 240, gray: true, gamma: 0.95, sat: 1, s: 0.3 },
};

function flatField(data: Uint8ClampedArray, w: number, h: number, pr: Params) {
  const lum = luminance(data, w * h);
  const g = backgroundGrid(lum, w, h);
  const lo = pr.lo === 'auto' ? Math.min(40, autoBlackPoint(lum, g, w, h)) : pr.lo;
  const span = Math.max(1, pr.hi - lo);
  // Tabel pencarian: level, kurva-S, dan gamma dihitung sekali untuk 256 nilai.
  const lut = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    let x = (v - lo) / span;
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    x = x + pr.s * (x * x * (3 - 2 * x) - x);
    x = Math.pow(x, pr.gamma);
    lut[v] = Math.round(x * 255);
  }
  const ax = axisMap(w, g.bs, g.gw);
  const ay = axisMap(h, g.bs, g.gh);
  const grid = g.grid;
  for (let y = 0; y < h; y++) {
    const r0 = ay.i0[y] * g.gw;
    const r1 = ay.i1[y] * g.gw;
    const fy = ay.f[y];
    let p = y * w * 4;
    for (let x = 0; x < w; x++, p += 4) {
      const fx = ax.f[x];
      const a0 = ax.i0[x];
      const a1 = ax.i1[x];
      const bg = (grid[r0 + a0] * (1 - fx) + grid[r0 + a1] * fx) * (1 - fy) + (grid[r1 + a0] * (1 - fx) + grid[r1 + a1] * fx) * fy;
      const gain = 255 / bg;
      let r = Math.min(255, data[p] * gain);
      let gg = Math.min(255, data[p + 1] * gain);
      let b = Math.min(255, data[p + 2] * gain);
      const l = 0.299 * r + 0.587 * gg + 0.114 * b;
      if (pr.gray) r = gg = b = l;
      else if (pr.sat !== 1) {
        r = l + (r - l) * pr.sat;
        gg = l + (gg - l) * pr.sat;
        b = l + (b - l) * pr.sat;
        r = r < 0 ? 0 : r > 255 ? 255 : r;
        gg = gg < 0 ? 0 : gg > 255 ? 255 : gg;
        b = b < 0 ? 0 : b > 255 ? 255 : b;
      }
      data[p] = lut[r | 0];
      data[p + 1] = lut[gg | 0];
      data[p + 2] = lut[b | 0];
    }
  }
}

/** Penajaman (unsharp mask) pada kecerahan saja, agar warna tidak bergeser dan noise warna tidak menguat. */
export function sharpen(data: Uint8ClampedArray, w: number, h: number, amount: number) {
  if (amount <= 0) return;
  const n = w * h;
  const lum = luminance(data, n);
  const r = Math.max(1, Math.round(Math.max(w, h) / 1800));
  const blur = boxBlur(lum, w, h, r, 2);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    let d = lum[i] - blur[i];
    if (d > -2 && d < 2) continue; // abaikan noise halus
    d *= amount;
    data[p] += d;
    data[p + 1] += d;
    data[p + 2] += d;
  }
}

/** Menerapkan filter pada data RGBA (diubah di tempat), lalu menajamkan. */
export function applyFilter(data: Uint8ClampedArray, w: number, h: number, filter: FilterId): void {
  if (filter !== 'asli') flatField(data, w, h, PRESETS[filter]);
  sharpen(data, w, h, filter === 'asli' ? 0.35 : filter === 'hitamputih' ? 0.55 : 0.8);
}

export const FILTERS: { id: FilterId; name: string; desc: string }[] = [
  { id: 'ajaib', name: 'Ajaib', desc: 'Cerah, warna hidup' },
  { id: 'dokumen', name: 'Dokumen', desc: 'Kertas putih, teks tegas' },
  { id: 'terang', name: 'Terang', desc: 'Lebih terang dan bersih' },
  { id: 'hitamputih', name: 'Hitam putih', desc: 'Kontras tinggi untuk teks' },
  { id: 'abuabu', name: 'Abu-abu', desc: 'Nuansa abu-abu lembut' },
  { id: 'asli', name: 'Asli', desc: 'Tanpa filter' },
];
