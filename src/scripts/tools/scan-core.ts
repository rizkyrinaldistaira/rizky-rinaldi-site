// Inti pemrosesan Scan Dokumen: deteksi, pelurusan perspektif, filter, dan penajaman.
// Murni (tanpa DOM) agar dapat dipakai Web Worker, cadangan di utas utama, dan uji Node.
import { detectDocument, type Detection, type Quad } from './scan-detect.ts';
import { insetQuad, outputSize, warpPerspective, type AspectMode } from './scan-warp.ts';
import { refineQuad } from './scan-refine.ts';
import { applyFilter, type FilterId } from './scan-effects.ts';

export type RenderJob = {
  rgba: Uint8ClampedArray;
  w: number;
  h: number;
  /** Sudut dokumen dalam koordinat ternormalisasi 0..1 (kiri-atas, kanan-atas, kanan-bawah, kiri-bawah). */
  quad: [number, number][];
  maxSide: number;
  filter: FilterId;
  /** Geser sudut ke dalam (pecahan diagonal) untuk membuang garis tepi kertas. */
  inset?: number;
  /** Rasio halaman: otomatis (dari geometri perspektif) atau dipaksa ke ukuran baku. */
  aspect?: AspectMode;
  /** Sempurnakan sudut pada resolusi penuh (untuk sudut hasil deteksi otomatis). */
  refine?: boolean;
};

export const FULL_QUAD: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

export function detect(rgba: Uint8ClampedArray, w: number, h: number): { quad: [number, number][] | null; score: number; method: string | null } {
  const d: Detection | null = detectDocument(rgba, w, h);
  if (!d) return { quad: null, score: 0, method: null };
  return { quad: d.quad.map((p) => [p[0] / w, p[1] / h]), score: d.score, method: d.method };
}

export function renderScan(job: RenderJob): { data: Uint8ClampedArray; w: number; h: number; snapped: string | null } {
  const q = job.quad.map((p) => [p[0] * job.w, p[1] * job.h]) as Quad;
  const isFull = job.quad.every((p, i) => Math.abs(p[0] - FULL_QUAD[i][0]) < 1e-6 && Math.abs(p[1] - FULL_QUAD[i][1]) < 1e-6);
  const refined = !isFull && job.refine ? refineQuad(job.rgba, job.w, job.h, q) : q;
  const quad = isFull ? q : insetQuad(refined, job.inset ?? 0.006);
  const size = isFull ? { w: Math.round(Math.min(job.w, job.maxSide * (job.w >= job.h ? 1 : job.w / job.h))), h: 0, snapped: null as string | null } : outputSize(quad, job.maxSide, job.w, job.h, job.aspect ?? 'auto');
  if (isFull) {
    const s = Math.min(1, job.maxSide / Math.max(job.w, job.h));
    size.w = Math.max(2, Math.round(job.w * s));
    size.h = Math.max(2, Math.round(job.h * s));
  }
  const data = warpPerspective(job.rgba, job.w, job.h, quad, size.w, size.h);
  applyFilter(data, size.w, size.h, job.filter);
  return { data, w: size.w, h: size.h, snapped: size.snapped };
}
