// Penyempurnaan sudut pada resolusi penuh. Deteksi berjalan pada gambar kecil (sekitar 640 px), sehingga galat
// beberapa piksel di sana menjadi belasan piksel pada foto penuh. Di sini tiap sisi kertas ditelusuri pada foto
// asli: pada banyak titik di sepanjang sisi dicari tepi terkuat tegak lurus sisi, garis dicocokkan dengan
// pembuangan pencilan, lalu sudut dihitung ulang dari perpotongan garis. Fungsi murni tanpa DOM.
import type { Pt, Quad } from './scan-detect.ts';

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function lineIntersect(p1: Pt, d1: Pt, p2: Pt, d2: Pt): Pt | null {
  const den = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
  return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
}

/** Cocokkan garis (titik pusat + arah satuan) dengan kuadrat terkecil, membuang pencilan bertahap. */
function fitLine(pts: Pt[]): { c: Pt; d: Pt; n: number } | null {
  let use = pts;
  for (let it = 0; it < 4; it++) {
    if (use.length < 8) return null;
    let mx = 0;
    let my = 0;
    for (const p of use) (mx += p[0]), (my += p[1]);
    mx /= use.length;
    my /= use.length;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (const p of use) {
      const dx = p[0] - mx;
      const dy = p[1] - my;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const d: Pt = [Math.cos(ang), Math.sin(ang)];
    const res = use.map((p) => Math.abs(-(p[0] - mx) * d[1] + (p[1] - my) * d[0]));
    const sorted = res.slice().sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    const thr = Math.max(1.5, 3 * med);
    const inl = use.filter((_, i) => res[i] <= thr);
    if (inl.length === use.length || inl.length < 8) return { c: [mx, my], d, n: use.length };
    use = inl;
  }
  return null;
}

export function refineQuad(rgba: Uint8ClampedArray, w: number, h: number, q: Quad): Quad {
  const L = (x: number, y: number) => {
    // luma bilinear
    x = x < 0 ? 0 : x > w - 1.001 ? w - 1.001 : x;
    y = y < 0 ? 0 : y > h - 1.001 ? h - 1.001 : y;
    const x0 = x | 0;
    const y0 = y | 0;
    const fx = x - x0;
    const fy = y - y0;
    const g = (xx: number, yy: number) => {
      const p = (yy * w + xx) * 4;
      return rgba[p] * 0.299 + rgba[p + 1] * 0.587 + rgba[p + 2] * 0.114;
    };
    return (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy;
  };
  const diag = Math.hypot(w, h);
  const lines: ({ c: Pt; d: Pt } | null)[] = [];
  for (let i = 0; i < 4; i++) {
    const a = q[i];
    const b = q[(i + 1) % 4];
    const len = dist(a, b);
    const tx = (b[0] - a[0]) / (len || 1);
    const ty = (b[1] - a[1]) / (len || 1);
    const nx = -ty;
    const ny = tx;
    const R = Math.max(8, Math.round(0.03 * Math.min(len, diag / 2))); // jangkauan pencarian tegak lurus sisi
    const N = Math.min(80, Math.max(12, Math.floor(len / 10)));
    const cand: { p: Pt; g: number }[] = [];
    for (let s = 0; s < N; s++) {
      const t = 0.1 + (0.8 * s) / (N - 1);
      const px = a[0] + (b[0] - a[0]) * t;
      const py = a[1] + (b[1] - a[1]) * t;
      let best = 0;
      let bestO = 0;
      let bestSigned = 0;
      const step = Math.max(1, R / 40);
      for (let o = -R; o <= R; o += step) {
        // gradien tegak lurus sisi, dirata-ratakan di sepanjang sisi agar tahan noise
        let g = 0;
        for (let k = -2; k <= 2; k++) {
          const sx = px + tx * k * 3 + nx * o;
          const sy = py + ty * k * 3 + ny * o;
          g += L(sx + nx * 2, sy + ny * 2) - L(sx - nx * 2, sy - ny * 2);
        }
        g /= 5;
        if (Math.abs(g) > best) {
          best = Math.abs(g);
          bestO = o;
          bestSigned = g;
        }
      }
      if (best >= 10) cand.push({ p: [px + nx * bestO, py + ny * bestO], g: bestSigned });
    }
    if (cand.length < 8) {
      lines.push(null);
      continue;
    }
    // Pertahankan hanya tepi yang tandanya searah mayoritas (kertas di satu sisi, alas di sisi lain).
    const pos = cand.filter((c) => c.g > 0).length;
    const sign = pos >= cand.length / 2 ? 1 : -1;
    const use = cand.filter((c) => Math.sign(c.g) === sign).map((c) => c.p);
    const f = fitLine(use);
    lines.push(f && f.n >= 8 ? { c: f.c, d: f.d } : null);
  }
  const out: Pt[] = [];
  for (let i = 0; i < 4; i++) {
    const prev = lines[(i + 3) % 4];
    const cur = lines[i];
    const orig = q[i];
    let p: Pt | null = null;
    if (prev && cur) p = lineIntersect(prev.c, prev.d, cur.c, cur.d);
    // Tolak perubahan besar: penyempurnaan hanya untuk koreksi halus.
    out.push(p && dist(p, orig) < 0.025 * diag ? p : orig);
  }
  return out as Quad;
}
