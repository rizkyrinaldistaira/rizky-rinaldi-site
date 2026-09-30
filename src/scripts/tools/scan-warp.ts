// Koreksi perspektif ("meluruskan" dokumen). Fungsi murni tanpa DOM.
import type { Pt, Quad } from './scan-detect.ts';

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Geser tiap sudut ke arah pusat sebesar frac x diagonal, untuk membuang garis tepi kertas yang ikut terpotong. */
export function insetQuad(q: Quad, frac: number): Quad {
  const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
  const cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
  const diag = Math.hypot(q[2][0] - q[0][0], q[2][1] - q[0][1]);
  return q.map((p) => {
    const dx = cx - p[0];
    const dy = cy - p[1];
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(0.2, (frac * diag) / d);
    return [p[0] + dx * k, p[1] + dy * k] as Pt;
  }) as Quad;
}

const ASPECTS = [
  { r: Math.SQRT2, name: 'A4' },
  { r: 11 / 8.5, name: 'Letter' },
  { r: 330 / 215, name: 'F4' },
];

/**
 * Memperkirakan rasio lebar/tinggi kertas sebenarnya dari segiempat hasil foto berperspektif
 * (metode Zhang dan He, "Whiteboard scanning and image enhancement"). Mengasumsikan piksel persegi
 * dan titik utama di tengah gambar. Mengembalikan null bila geometrinya merosot.
 */
export function estimateAspect(q: Quad, imgW: number, imgH: number): { ratio: number; f: number } | null {
  const s = Math.max(imgW, imgH);
  const cx = imgW / 2;
  const cy = imgH / 2;
  const m = q.map((p) => [(p[0] - cx) / s, (p[1] - cy) / s, 1]);
  const m1 = m[0]; // kiri-atas
  const m2 = m[1]; // kanan-atas
  const m3 = m[3]; // kiri-bawah
  const m4 = m[2]; // kanan-bawah
  const crs = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const c14 = crs(m1, m4);
  const d2 = dot(crs(m2, m4), m3);
  const d3 = dot(crs(m3, m4), m2);
  if (Math.abs(d2) < 1e-12 || Math.abs(d3) < 1e-12) return null;
  const k2 = dot(c14, m3) / d2;
  const k3 = dot(c14, m2) / d3;
  const n2 = [k2 * m2[0] - m1[0], k2 * m2[1] - m1[1], k2 * m2[2] - m1[2]];
  const n3 = [k3 * m3[0] - m1[0], k3 * m3[1] - m1[1], k3 * m3[2] - m1[2]];
  const den = n2[2] * n3[2];
  let ratio2: number;
  let fNorm = Infinity;
  if (Math.abs(den) < 1e-9) {
    // Tanpa perspektif (jajaran genjang): rasio dari panjang sisi pada bidang gambar.
    ratio2 = (n2[0] * n2[0] + n2[1] * n2[1]) / (n3[0] * n3[0] + n3[1] * n3[1]);
  } else {
    const f2 = -(n2[0] * n3[0] + n2[1] * n3[1]) / den;
    if (!(f2 > 1e-6) || !isFinite(f2)) return null;
    ratio2 = ((n2[0] * n2[0] + n2[1] * n2[1]) / f2 + n2[2] * n2[2]) / ((n3[0] * n3[0] + n3[1] * n3[1]) / f2 + n3[2] * n3[2]);
    fNorm = Math.sqrt(f2); // dalam satuan sisi terpanjang gambar
  }
  if (!(ratio2 > 0) || !isFinite(ratio2)) return null;
  const r = Math.sqrt(ratio2);
  return r > 0.2 && r < 5 ? { ratio: r, f: fNorm } : null;
}

const polyArea4 = (q: Quad) => Math.abs(((q[2][0] - q[0][0]) * (q[3][1] - q[1][1]) - (q[3][0] - q[1][0]) * (q[2][1] - q[0][1])) / 2);

/**
 * Ukuran keluaran (lebar, tinggi). Rasio diperkirakan dari geometri perspektif bila ukuran gambar diberikan,
 * lalu dikunci ke ukuran baku (A4, Letter, F4) bila sangat dekat. Detail asli dipertahankan: luas keluaran
 * mengikuti luas segiempat sumber, tidak pernah diperbesar melebihi itu.
 */
export type AspectMode = 'auto' | 'a4' | 'letter' | 'f4';

export function outputSize(q: Quad, maxSide: number, imgW?: number, imgH?: number, mode: AspectMode = 'auto'): { w: number; h: number; snapped: string | null; aspect: number } {
  const side = Math.max(dist(q[0], q[1]), dist(q[3], q[2])) / Math.max(dist(q[0], q[3]), dist(q[1], q[2]));
  const est = imgW && imgH ? estimateAspect(q, imgW, imgH) : null; // lebar / tinggi
  // Pagar pengaman: estimasi hanya dipercaya bila panjang fokus hasil hitungannya masuk akal untuk kamera
  // nyata (sekitar 0,35 sampai 1,8 kali sisi terpanjang gambar). Selain itu asumsi kamera dilanggar
  // (misalnya foto sudah dipotong), sehingga rasio sisi yang terukur dipakai.
  let R: number = est && est.f > 0.35 && est.f < 1.8 || (est && !isFinite(est.f) && Math.abs(Math.log(est.ratio / side)) < Math.log(1.15)) ? est!.ratio : side;
  if (mode !== 'auto') {
    const forced = ASPECTS.find((a) => a.name.toLowerCase() === mode)!.r;
    R = side >= 1 ? forced : 1 / forced;
  }
  let snapped: string | null = mode !== 'auto' ? ASPECTS.find((a) => a.name.toLowerCase() === mode)!.name : null;
  const long = Math.max(R, 1 / R);
  let bestErr = mode === 'auto' ? 0.035 : 0;
  for (const a of ASPECTS) {
    const err = Math.abs(long - a.r) / a.r;
    if (err < bestErr) {
      bestErr = err;
      snapped = a.name;
      R = R >= 1 ? a.r : 1 / a.r;
    }
  }
  const area = polyArea4(q);
  let W = Math.sqrt(area * R);
  let H = Math.sqrt(area / R);
  const scale = Math.min(1, maxSide / Math.max(W, H));
  return { w: Math.max(2, Math.round(W * scale)), h: Math.max(2, Math.round(H * scale)), snapped, aspect: R };
}

/** Homografi dari kotak satuan (0..1) ke segiempat q (metode Heckbert). Mengembalikan [a,b,c,d,e,f,g,h]. */
export function unitToQuad(q: Quad): number[] {
  const [x0, y0] = q[0];
  const [x1, y1] = q[1];
  const [x2, y2] = q[2];
  const [x3, y3] = q[3];
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) return [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0];
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const h = (dx1 * dy3 - dx3 * dy1) / det;
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h];
}

/** Pengecilan kotak dengan faktor bulat (anti-aliasing saat sumber jauh lebih besar dari keluaran). */
export function boxDownscale(src: Uint8ClampedArray, w: number, h: number, f: number): { data: Uint8ClampedArray; w: number; h: number } {
  const nw = Math.max(1, Math.floor(w / f));
  const nh = Math.max(1, Math.floor(h / f));
  const out = new Uint8ClampedArray(nw * nh * 4);
  const inv = 1 / (f * f);
  for (let y = 0; y < nh; y++)
    for (let x = 0; x < nw; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < f; dy++) {
        let p = ((y * f + dy) * w + x * f) * 4;
        for (let dx = 0; dx < f; dx++, p += 4) {
          r += src[p];
          g += src[p + 1];
          b += src[p + 2];
        }
      }
      const o = (y * nw + x) * 4;
      out[o] = r * inv;
      out[o + 1] = g * inv;
      out[o + 2] = b * inv;
      out[o + 3] = 255;
    }
  return { data: out, w: nw, h: nh };
}

/** Meluruskan segiempat q dari citra sumber ke persegi panjang outW x outH (sampling bilinear). */
export function warpPerspective(src: Uint8ClampedArray, sw: number, sh: number, q: Quad, outW: number, outH: number): Uint8ClampedArray {
  // Pra-saring bila sumber jauh lebih besar dari keluaran, agar teks tidak bergerigi.
  const qa = Math.abs(((q[2][0] - q[0][0]) * (q[3][1] - q[1][1]) - (q[3][0] - q[1][0]) * (q[2][1] - q[0][1])) / 2);
  const ratio = Math.sqrt(qa / (outW * outH));
  let data = src;
  let w = sw;
  let h = sh;
  let quad = q;
  if (ratio >= 2) {
    const f = Math.floor(ratio);
    const d = boxDownscale(src, sw, sh, f);
    data = d.data;
    w = d.w;
    h = d.h;
    quad = q.map((p) => [(p[0] * d.w) / sw, (p[1] * d.h) / sh] as Pt) as Quad;
  }
  const [a, b, c, d, e, f, g, hh] = unitToQuad(quad);
  const out = new Uint8ClampedArray(outW * outH * 4);
  const maxX = w - 1;
  const maxY = h - 1;
  for (let j = 0; j < outH; j++) {
    const v = (j + 0.5) / outH;
    let o = j * outW * 4;
    for (let i = 0; i < outW; i++, o += 4) {
      const u = (i + 0.5) / outW;
      const den = g * u + hh * v + 1;
      let X = (a * u + b * v + c) / den - 0.5;
      let Y = (d * u + e * v + f) / den - 0.5;
      X = X < 0 ? 0 : X > maxX ? maxX : X;
      Y = Y < 0 ? 0 : Y > maxY ? maxY : Y;
      const x0 = X | 0;
      const y0 = Y | 0;
      const x1 = x0 < maxX ? x0 + 1 : x0;
      const y1 = y0 < maxY ? y0 + 1 : y0;
      const fx = X - x0;
      const fy = Y - y0;
      const p00 = (y0 * w + x0) * 4;
      const p10 = (y0 * w + x1) * 4;
      const p01 = (y1 * w + x0) * 4;
      const p11 = (y1 * w + x1) * 4;
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;
      out[o] = data[p00] * w00 + data[p10] * w10 + data[p01] * w01 + data[p11] * w11;
      out[o + 1] = data[p00 + 1] * w00 + data[p10 + 1] * w10 + data[p01 + 1] * w01 + data[p11 + 1] * w11;
      out[o + 2] = data[p00 + 2] * w00 + data[p10 + 2] * w10 + data[p01 + 2] * w01 + data[p11 + 2] * w11;
      out[o + 3] = 255;
    }
  }
  return out;
}
