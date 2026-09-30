// Mesin efek Scan Dokumen. Fungsi murni tanpa DOM: bisa diuji langsung di Node.
//
// Inti efek "Otomatis", "Dokumen", dan "Hitam Putih" adalah koreksi latar (flat-field):
// tingkat kecerahan kertas diperkirakan per blok, dihaluskan, lalu setiap piksel dibagi
// dengan perkiraan itu. Hasilnya kertas menjadi putih merata walau foto diambil dengan
// cahaya tidak rata atau ada bayangan, sesuatu yang tidak bisa dicapai dengan ambang tunggal.

export type EffectId = 'asli' | 'otomatis' | 'dokumen' | 'hitamputih' | 'kontras' | 'vintage';

export type ScanOptions = {
  effect: EffectId;
  /** 0 sampai 1: campuran antara gambar asli (0) dan hasil efek penuh (1). */
  strength: number;
  /** Tambahkan bayangan tepi dan noise halus ala scanner flatbed. */
  scannerLook?: boolean;
  /** Benih acak agar hasil dapat diulang (untuk pengujian). */
  seed?: number;
};

type Grid = { grid: Float32Array; bs: number; gw: number; gh: number };

/** Kecerahan (luma) 0..255 tiap piksel. */
function luminance(data: Uint8ClampedArray, n: number): Uint8Array {
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

function normalizedEffect(data: Uint8ClampedArray, w: number, h: number, effect: EffectId, k: number) {
  const gray = effect === 'hitamputih';
  const lum = luminance(data, w * h);
  const g = backgroundGrid(lum, w, h);
  let lo = 70;
  let hi = 215;
  if (effect === 'otomatis') {
    lo = autoBlackPoint(lum, g, w, h);
    hi = 255;
  } else if (effect === 'hitamputih') {
    lo = 60;
    hi = 220;
  }
  const inv = 255 / Math.max(1, hi - lo);
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
      const or = data[p];
      const og = data[p + 1];
      const ob = data[p + 2];
      let r = Math.min(255, or * gain);
      let gg = Math.min(255, og * gain);
      let b = Math.min(255, ob * gain);
      if (gray) {
        const l = 0.299 * r + 0.587 * gg + 0.114 * b;
        r = gg = b = l;
      }
      r = (r - lo) * inv;
      gg = (gg - lo) * inv;
      b = (b - lo) * inv;
      r = r < 0 ? 0 : r > 255 ? 255 : r;
      gg = gg < 0 ? 0 : gg > 255 ? 255 : gg;
      b = b < 0 ? 0 : b > 255 ? 255 : b;
      data[p] = or + (r - or) * k;
      data[p + 1] = og + (gg - og) * k;
      data[p + 2] = ob + (b - ob) * k;
    }
  }
}

function contrastEffect(data: Uint8ClampedArray, n: number, k: number) {
  const f = 1.5;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    for (let c = 0; c < 3; c++) {
      const o = data[p + c];
      let v = (o - 128) * f + 128;
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      data[p + c] = o + (v - o) * k;
    }
  }
}

function vintageEffect(data: Uint8ClampedArray, n: number, k: number) {
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    // Matriks sepia standar lalu sedikit memudar.
    const sr = (0.393 * r + 0.769 * g + 0.189 * b) * 0.94 + 10;
    const sg = (0.349 * r + 0.686 * g + 0.168 * b) * 0.94 + 8;
    const sb = (0.272 * r + 0.534 * g + 0.131 * b) * 0.94 + 4;
    data[p] = r + (Math.min(255, sr) - r) * k;
    data[p + 1] = g + (Math.min(255, sg) - g) * k;
    data[p + 2] = b + (Math.min(255, sb) - b) * k;
  }
}

/** Bayangan tepi ala scanner flatbed dan noise luma halus. Deterministik menurut benih. */
function scannerLook(data: Uint8ClampedArray, w: number, h: number, seed: number) {
  let s = seed >>> 0 || 1;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const band = Math.max(6, Math.round(Math.min(w, h) * 0.025));
  for (let y = 0; y < h; y++) {
    const dy = Math.min(y, h - 1 - y);
    let p = y * w * 4;
    for (let x = 0; x < w; x++, p += 4) {
      const d = Math.min(dy, x, w - 1 - x);
      let f = 1;
      if (d < band) {
        const t = (band - d) / band;
        f = 1 - 0.18 * t * t;
      }
      const n = (rand() - 0.5) * 5;
      data[p] = data[p] * f + n;
      data[p + 1] = data[p + 1] * f + n;
      data[p + 2] = data[p + 2] * f + n;
    }
  }
}

/** Menerapkan efek pada data RGBA (diubah di tempat). */
export function applyScan(data: Uint8ClampedArray, w: number, h: number, opt: ScanOptions): void {
  const k = Math.min(1, Math.max(0, opt.strength));
  const e = opt.effect;
  if (e !== 'asli' && k > 0) {
    if (e === 'otomatis' || e === 'dokumen' || e === 'hitamputih') normalizedEffect(data, w, h, e, k);
    else if (e === 'kontras') contrastEffect(data, w * h, k);
    else if (e === 'vintage') vintageEffect(data, w * h, k);
  }
  if (opt.scannerLook) scannerLook(data, w, h, opt.seed ?? 1);
}

export const EFFECTS: { id: EffectId; name: string; desc: string }[] = [
  { id: 'otomatis', name: 'Otomatis', desc: 'Ratakan cahaya, warna tetap' },
  { id: 'dokumen', name: 'Dokumen', desc: 'Kertas putih, teks tegas' },
  { id: 'hitamputih', name: 'Hitam putih', desc: 'Abu-abu bersih untuk teks' },
  { id: 'kontras', name: 'Kontras', desc: 'Pertajam tanpa ratakan cahaya' },
  { id: 'vintage', name: 'Vintage', desc: 'Nuansa kuning kecokelatan' },
  { id: 'asli', name: 'Asli', desc: 'Tanpa efek' },
];
