// Deteksi tepi dokumen. Fungsi murni tanpa DOM, dapat diuji di Node dan dijalankan di Web Worker.
//
// Tiga kandidat "mask kertas" dibuat dengan cara berbeda (kecerahan, jarak warna dari latar,
// dan tepi), masing-masing dibersihkan, diambil komponen terbesarnya, lalu dicocokkan ke
// segiempat. Kandidat terbaik dipilih berdasarkan skor bentuk. Bila tidak ada yang meyakinkan,
// hasilnya null dan pemanggil memakai seluruh gambar (pengguna dapat mengatur sudut manual).

export type Pt = [number, number];
export type Quad = [Pt, Pt, Pt, Pt]; // kiri-atas, kanan-atas, kanan-bawah, kiri-bawah
export type Detection = { quad: Quad; score: number; method: 'kecerahan' | 'warna' | 'tepi'; support: number };

// ---------- utilitas citra ----------
function luma(rgba: Uint8ClampedArray, n: number): Uint8Array {
  const out = new Uint8Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) out[i] = (rgba[p] * 77 + rgba[p + 1] * 150 + rgba[p + 2] * 29) >> 8;
  return out;
}

/** Blur kotak terpisah dengan jumlah bergulir (tepi diklem). */
export function boxBlur(src: Uint8Array, w: number, h: number, r: number, passes = 1): Uint8Array {
  let a: Uint8Array = src;
  const tmp = new Uint8Array(w * h);
  for (let ps = 0; ps < passes; ps++) {
    const out = new Uint8Array(w * h);
    const win = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let s = 0;
      for (let k = -r; k <= r; k++) s += a[row + Math.min(w - 1, Math.max(0, k))];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = (s / win) | 0;
        s += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
      for (let y = 0; y < h; y++) {
        out[y * w + x] = (s / win) | 0;
        s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
      }
    }
    a = out;
  }
  return a === src ? src.slice() : a;
}

function otsu(vals: Uint8Array): number {
  const hist = new Float64Array(256);
  for (let i = 0; i < vals.length; i++) hist[vals[i]]++;
  const total = vals.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let thr = 0;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const v = wB * wF * (mB - mF) * (mB - mF);
    if (v > best) {
      best = v;
      thr = t;
    }
  }
  return thr;
}

/** Dilatasi biner persegi (jari-jari r) dengan jumlah bergulir terpisah. */
function dilate(mask: Uint8Array, w: number, h: number, r: number): Uint8Array {
  if (r <= 0) return mask.slice();
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let s = 0;
    for (let k = 0; k <= Math.min(r, w - 1); k++) s += mask[row + k];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = s > 0 ? 1 : 0;
      if (x + r + 1 < w) s += mask[row + x + r + 1];
      if (x - r >= 0) s -= mask[row + x - r];
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let k = 0; k <= Math.min(r, h - 1); k++) s += tmp[k * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s > 0 ? 1 : 0;
      if (y + r + 1 < h) s += tmp[(y + r + 1) * w + x];
      if (y - r >= 0) s -= tmp[(y - r) * w + x];
    }
  }
  return out;
}
function invert(m: Uint8Array): Uint8Array {
  const o = new Uint8Array(m.length);
  for (let i = 0; i < m.length; i++) o[i] = m[i] ? 0 : 1;
  return o;
}
function erode(mask: Uint8Array, w: number, h: number, r: number): Uint8Array {
  return invert(dilate(invert(mask), w, h, r));
}

/** Komponen terhubung terbesar (4-tetangga). Mengembalikan mask komponen dan luasnya. */
function largestComponent(mask: Uint8Array, w: number, h: number): { mask: Uint8Array; area: number } {
  const n = w * h;
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  let bestStart = -1;
  let bestArea = 0;
  for (let i = 0; i < n; i++) {
    if (!mask[i] || seen[i]) continue;
    let sp = 0;
    stack[sp++] = i;
    seen[i] = 1;
    let area = 0;
    while (sp) {
      const p = stack[--sp];
      area++;
      const x = p % w;
      const y = (p / w) | 0;
      if (x > 0 && mask[p - 1] && !seen[p - 1]) (seen[p - 1] = 1), (stack[sp++] = p - 1);
      if (x < w - 1 && mask[p + 1] && !seen[p + 1]) (seen[p + 1] = 1), (stack[sp++] = p + 1);
      if (y > 0 && mask[p - w] && !seen[p - w]) (seen[p - w] = 1), (stack[sp++] = p - w);
      if (y < h - 1 && mask[p + w] && !seen[p + w]) (seen[p + w] = 1), (stack[sp++] = p + w);
    }
    if (area > bestArea) {
      bestArea = area;
      bestStart = i;
    }
  }
  const out = new Uint8Array(n);
  if (bestStart < 0) return { mask: out, area: 0 };
  let sp = 0;
  stack[sp++] = bestStart;
  out[bestStart] = 1;
  while (sp) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0 && mask[p - 1] && !out[p - 1]) (out[p - 1] = 1), (stack[sp++] = p - 1);
    if (x < w - 1 && mask[p + 1] && !out[p + 1]) (out[p + 1] = 1), (stack[sp++] = p + 1);
    if (y > 0 && mask[p - w] && !out[p - w]) (out[p - w] = 1), (stack[sp++] = p - w);
    if (y < h - 1 && mask[p + w] && !out[p + w]) (out[p + w] = 1), (stack[sp++] = p + w);
  }
  return { mask: out, area: bestArea };
}

/** Isi lubang: semua piksel latar yang tidak terhubung ke tepi gambar menjadi bagian objek. */
function fillHoles(mask: Uint8Array, w: number, h: number): Uint8Array {
  const n = w * h;
  const bg = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;
  const push = (p: number) => {
    if (!mask[p] && !bg[p]) {
      bg[p] = 1;
      stack[sp++] = p;
    }
  };
  for (let x = 0; x < w; x++) (push(x), push((h - 1) * w + x));
  for (let y = 0; y < h; y++) (push(y * w), push(y * w + w - 1));
  while (sp) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = bg[i] ? 0 : 1;
  return out;
}

function boundaryPoints(mask: Uint8Array, w: number, h: number): Pt[] {
  const pts: Pt[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (!mask[p]) continue;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !mask[p - 1] || !mask[p + 1] || !mask[p - w] || !mask[p + w]) pts.push([x, y]);
    }
  return pts;
}

// ---------- geometri ----------
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function convexHull(points: Pt[]): Pt[] {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const lower: Pt[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function polyArea(p: Pt[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/** Douglas-Peucker pada rantai terbuka. */
function dp(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 3) return pts;
  const a = pts[0];
  const b = pts[pts.length - 1];
  let idx = -1;
  let dmax = 0;
  const len = dist(a, b) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(cross(a, b, pts[i])) / len;
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax <= eps) return [a, b];
  const left = dp(pts.slice(0, idx + 1), eps);
  const right = dp(pts.slice(idx), eps);
  return left.slice(0, -1).concat(right);
}
function simplifyClosed(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 8) return pts;
  let far = 0;
  let dm = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[0], pts[i]);
    if (d > dm) {
      dm = d;
      far = i;
    }
  }
  const c1 = dp(pts.slice(0, far + 1), eps);
  const c2 = dp(pts.slice(far).concat([pts[0]]), eps);
  return c1.slice(0, -1).concat(c2.slice(0, -1));
}

function lineIntersect(p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null {
  const d1x = p2[0] - p1[0];
  const d1y = p2[1] - p1[1];
  const d2x = p4[0] - p3[0];
  const d2y = p4[1] - p3[1];
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((p3[0] - p1[0]) * d2y - (p3[1] - p1[1]) * d2x) / den;
  return [p1[0] + t * d1x, p1[1] + t * d1y];
}

/** Segiempat pembungkus terkecil dari poligon cembung: hapus sisi yang paling sedikit menambah luas. */
function fitQuad(poly: Pt[], diag: number): Pt[] | null {
  let pts = simplifyClosed(poly, 0.004 * diag);
  if (pts.length < 4) return null;
  const s = polyArea(pts) >= 0 ? 1 : -1;
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  let guard = 0;
  while (pts.length > 4 && guard++ < 200) {
    const n = pts.length;
    let bestI = -1;
    let bestInc = Infinity;
    let bestP: Pt | null = null;
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const next = pts[(i + 2) % n];
      const p = lineIntersect(prev, a, next, b);
      if (!p) continue;
      if (cross(a, b, p) * s >= 0) continue; // harus di luar sisi ab
      if ((p[0] - a[0]) * (a[0] - prev[0]) + (p[1] - a[1]) * (a[1] - prev[1]) <= 0) continue;
      if ((p[0] - b[0]) * (b[0] - next[0]) + (p[1] - b[1]) * (b[1] - next[1]) <= 0) continue;
      if (Math.hypot(p[0] - cx, p[1] - cy) > 3 * diag) continue;
      const inc = Math.abs(cross(a, b, p)) / 2;
      if (inc < bestInc) {
        bestInc = inc;
        bestI = i;
        bestP = p;
      }
    }
    if (bestI < 0 || !bestP) return null;
    const i = bestI;
    const j = (i + 1) % n;
    const out: Pt[] = [];
    for (let k = 0; k < n; k++) {
      if (k === i) out.push(bestP);
      else if (k === j) continue;
      else out.push(pts[k]);
    }
    pts = out;
  }
  return pts.length === 4 ? pts : null;
}

/** Urutkan searah jarum jam mulai dari kiri-atas (jumlah x+y terkecil). */
export function orderQuad(p: Pt[]): Quad {
  const cx = p.reduce((a, q) => a + q[0], 0) / 4;
  const cy = p.reduce((a, q) => a + q[1], 0) / 4;
  const sorted = p.slice().sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
  let start = 0;
  let m = Infinity;
  sorted.forEach((q, i) => {
    if (q[0] + q[1] < m) {
      m = q[0] + q[1];
      start = i;
    }
  });
  return [sorted[start], sorted[(start + 1) % 4], sorted[(start + 2) % 4], sorted[(start + 3) % 4]] as Quad;
}

function angleDev(q: Quad): number {
  let worst = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[(i + 3) % 4];
    const b = q[i];
    const c = q[(i + 1) % 4];
    const v1: Pt = [a[0] - b[0], a[1] - b[1]];
    const v2: Pt = [c[0] - b[0], c[1] - b[1]];
    const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / ((Math.hypot(...v1) * Math.hypot(...v2)) || 1);
    const ang = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    worst = Math.max(worst, Math.abs(ang - 90));
  }
  return worst;
}
function isConvex(q: Quad): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const c = cross(q[i], q[(i + 1) % 4], q[(i + 2) % 4]);
    const sg = c > 0 ? 1 : -1;
    if (sign && sg !== sign) return false;
    sign = sg;
  }
  return true;
}

// ---------- kandidat mask ----------
function borderMedian(rgba: Uint8ClampedArray, w: number, h: number): [number, number, number] {
  const t = Math.max(2, Math.round(0.03 * Math.min(w, h)));
  const hs = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  let cnt = 0;
  const add = (x: number, y: number) => {
    const p = (y * w + x) * 4;
    hs[0][rgba[p]]++;
    hs[1][rgba[p + 1]]++;
    hs[2][rgba[p + 2]]++;
    cnt++;
  };
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) if (x < t || y < t || x >= w - t || y >= h - t) add(x, y);
  const med = (hist: Uint32Array) => {
    let a = 0;
    for (let i = 0; i < 256; i++) {
      a += hist[i];
      if (a >= cnt / 2) return i;
    }
    return 128;
  };
  return [med(hs[0]), med(hs[1]), med(hs[2])];
}

function maskBrightness(gray: Uint8Array, w: number, h: number): Uint8Array | null {
  const blur = boxBlur(gray, w, h, 2, 2);
  const t = otsu(blur);
  const m = new Uint8Array(w * h);
  let c = 0;
  for (let i = 0; i < m.length; i++) if (blur[i] > t) (m[i] = 1), c++;
  const f = c / m.length;
  return f < 0.06 || f > 0.94 ? null : m;
}

function maskColor(rgba: Uint8ClampedArray, w: number, h: number): Uint8Array | null {
  const [br, bg, bb] = borderMedian(rgba, w, h);
  const d = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < d.length; i++, p += 4) {
    const v = (Math.abs(rgba[p] - br) + Math.abs(rgba[p + 1] - bg) + Math.abs(rgba[p + 2] - bb)) / 3;
    d[i] = v > 255 ? 255 : v;
  }
  const blur = boxBlur(d, w, h, 2, 2);
  const t = Math.max(16, otsu(blur));
  const m = new Uint8Array(w * h);
  let c = 0;
  for (let i = 0; i < m.length; i++) if (blur[i] > t) (m[i] = 1), c++;
  const f = c / m.length;
  return f < 0.06 || f > 0.94 ? null : m;
}

type Grad = { mag: Float32Array; hi: number };
function gradient(gray: Uint8Array, w: number, h: number): Grad {
  const blur = boxBlur(gray, w, h, 1, 2);
  const n = w * h;
  const mag = new Float32Array(n);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const gx = -blur[p - w - 1] - 2 * blur[p - 1] - blur[p + w - 1] + blur[p - w + 1] + 2 * blur[p + 1] + blur[p + w + 1];
      const gy = -blur[p - w - 1] - 2 * blur[p - w] - blur[p - w + 1] + blur[p + w - 1] + 2 * blur[p + w] + blur[p + w + 1];
      mag[p] = Math.abs(gx) + Math.abs(gy);
    }
  const sorted = Float32Array.from(mag).sort();
  return { mag, hi: Math.max(40, sorted[Math.floor(n * 0.94)]) };
}

/** Seberapa besar bagian sisi segiempat yang benar-benar berimpit dengan tepi citra (0..1). */
function edgeSupport(q: Quad, g: Grad, w: number, h: number): number {
  const thr = Math.max(50, 0.25 * g.hi);
  let ok = 0;
  let tot = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i];
    const b = q[(i + 1) % 4];
    const len = dist(a, b);
    const nx = -(b[1] - a[1]) / (len || 1);
    const ny = (b[0] - a[0]) / (len || 1);
    const steps = Math.max(1, Math.floor(len / 2));
    for (let s = 0; s <= steps; s++) {
      const x = a[0] + ((b[0] - a[0]) * s) / steps;
      const y = a[1] + ((b[1] - a[1]) * s) / steps;
      tot++;
      if (x < 4 || y < 4 || x > w - 5 || y > h - 5) {
        ok++; // sisi berimpit dengan bingkai foto: dokumen terpotong bingkai, wajar
        continue;
      }
      let m = 0;
      for (let o = -4; o <= 4; o++) {
        const xx = Math.round(x + nx * o);
        const yy = Math.round(y + ny * o);
        if (xx >= 0 && yy >= 0 && xx < w && yy < h) m = Math.max(m, g.mag[yy * w + xx]);
      }
      if (m >= thr) ok++;
    }
  }
  return tot ? ok / tot : 0;
}

function maskEdges(g: Grad, w: number, h: number): Uint8Array | null {
  const n = w * h;
  const mag = g.mag;
  const hi = g.hi;
  const lo = hi * 0.45;
  const edge = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;
  for (let i = 0; i < n; i++) if (mag[i] >= hi) (edge[i] = 1), (stack[sp++] = i);
  while (sp) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p / w) | 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const q = yy * w + xx;
        if (!edge[q] && mag[q] >= lo) (edge[q] = 1), (stack[sp++] = q);
      }
  }
  const thick = dilate(edge, w, h, 2);
  // Latar = piksel non-tepi yang terhubung ke tepi gambar; objek = sisanya.
  const bg = new Uint8Array(n);
  sp = 0;
  const push = (p: number) => {
    if (!thick[p] && !bg[p]) (bg[p] = 1), (stack[sp++] = p);
  };
  for (let x = 0; x < w; x++) (push(x), push((h - 1) * w + x));
  for (let y = 0; y < h; y++) (push(y * w), push(y * w + w - 1));
  while (sp) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }
  const obj = new Uint8Array(n);
  let c = 0;
  for (let i = 0; i < n; i++) if (!bg[i]) (obj[i] = 1), c++;
  const f = c / n;
  if (f < 0.06 || f > 0.94) return null;
  return erode(obj, w, h, 2);
}

// ---------- analisis mask ----------
function analyze(mask: Uint8Array, w: number, h: number, method: Detection['method'], g: Grad): Detection | null {
  const closed = erode(dilate(mask, w, h, 3), w, h, 3);
  const comp = largestComponent(closed, w, h);
  if (comp.area < 0.08 * w * h) return null;
  const filled = fillHoles(comp.mask, w, h);
  let area = 0;
  for (let i = 0; i < filled.length; i++) if (filled[i]) area++;
  const hull = convexHull(boundaryPoints(filled, w, h));
  if (hull.length < 4) return null;
  const diag = Math.hypot(w, h);
  const raw = fitQuad(hull, diag);
  if (!raw) return null;
  const quad = orderQuad(raw);
  if (!isConvex(quad)) return null;
  const qArea = Math.abs(polyArea(quad));
  const areaFrac = qArea / (w * h);
  const fill = area / (qArea || 1);
  const dev = angleDev(quad);
  const top = dist(quad[0], quad[1]);
  const bot = dist(quad[3], quad[2]);
  const left = dist(quad[0], quad[3]);
  const right = dist(quad[1], quad[2]);
  const ratioOk = Math.min(top, bot) / Math.max(top, bot) > 0.35 && Math.min(left, right) / Math.max(left, right) > 0.35;
  let score = 0.3 * Math.min(1, Math.max(0, (areaFrac - 0.1) / 0.3)) + 0.45 * Math.min(1, Math.max(0, (fill - 0.75) / 0.2)) + 0.25 * Math.min(1, Math.max(0, 1 - (dev - 25) / 40));
  if (areaFrac > 0.985) score *= 0.6;
  if (!ratioOk) score *= 0.5;
  // Bentuk bagus saja tidak cukup: sisi-sisinya harus berimpit dengan tepi nyata pada foto.
  const support = edgeSupport(quad, g, w, h);
  score *= Math.min(1, Math.max(0, (support - 0.3) / 0.5));
  return { quad, score, method, support };
}

/** Semua kandidat (untuk pengujian dan diagnosis). */
export function detectAll(rgba: Uint8ClampedArray, w: number, h: number): Detection[] {
  const gray = luma(rgba, w * h);
  const g = gradient(gray, w, h);
  const cands: [Uint8Array | null, Detection['method']][] = [
    [maskBrightness(gray, w, h), 'kecerahan'],
    [maskColor(rgba, w, h), 'warna'],
    [maskEdges(g, w, h), 'tepi'],
  ];
  const out: Detection[] = [];
  for (const [m, method] of cands) {
    if (!m) continue;
    const d = analyze(m, w, h, method, g);
    if (d) out.push(d);
  }
  return out;
}

/** Mendeteksi dokumen. Koordinat hasil dalam piksel gambar masukan. Null bila tidak meyakinkan. */
export function detectDocument(rgba: Uint8ClampedArray, w: number, h: number): Detection | null {
  let best: Detection | null = null;
  const rank = (d: Detection) => d.score + 0.25 * d.support; // dukungan tepi memutus seri antar kandidat
  for (const d of detectAll(rgba, w, h)) if (!best || rank(d) > rank(best)) best = d;
  // Lebih baik mengaku tidak yakin daripada memotong salah dengan percaya diri.
  return best && best.score >= 0.6 && best.support >= 0.8 ? best : null;
}
