// Pemuat pustaka PDF (disimpan di /vendor, tanpa CDN pihak ketiga) dan pembantu halaman.
import { loadScript } from './common.ts';

let libPromise: Promise<any> | null = null;
export function getPDFLib(): Promise<any> {
  if (!libPromise) {
    libPromise = loadScript('/vendor/pdf-lib/pdf-lib.min.js').then(() => (window as any).PDFLib);
  }
  return libPromise;
}

let jsPromise: Promise<any> | null = null;
export function getPdfJs(): Promise<any> {
  if (!jsPromise) {
    const url = '/vendor/pdfjs/pdf.min.js';
    jsPromise = import(/* @vite-ignore */ url).then((m: any) => {
      m.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
      return m;
    });
  }
  return jsPromise;
}

export async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function friendlyPdfError(e: unknown, name: string): string {
  const msg = String((e as any)?.message ?? e);
  if (/encrypt|password/i.test(msg))
    return `"${name}" terenkripsi: dikunci dengan kata sandi, atau diberi pembatasan oleh pembuatnya (misalnya larangan menyalin atau mencetak). Tool ini tidak memproses PDF terenkripsi.`;
  return `"${name}" tidak dapat dibaca sebagai PDF (berkas mungkin rusak atau bukan PDF).`;
}

export async function openPdfLibDoc(file: File) {
  const { PDFDocument } = await getPDFLib();
  const bytes = await readBytes(file);
  try {
    return await PDFDocument.load(bytes);
  } catch (e) {
    throw new Error(friendlyPdfError(e, file.name));
  }
}

export async function openPdfJsDoc(bytes: Uint8Array) {
  const pdfjs = await getPdfJs();
  return pdfjs.getDocument({
    data: bytes.slice(0),
    standardFontDataUrl: '/vendor/pdfjs/standard_fonts/',
    wasmUrl: '/vendor/pdfjs/wasm/',
  }).promise;
}

export async function renderThumb(doc: any, pageNumber: number, width: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = (width * (window.devicePixelRatio > 1 ? 1.5 : 1)) / base.width;
  const vp = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(vp.width);
  canvas.height = Math.ceil(vp.height);
  await page.render({ canvasContext: canvas.getContext('2d')!, canvas, viewport: vp }).promise;
  return canvas;
}

/** "1-3, 5, 8-10" menjadi indeks halaman (basis 1), berurutan dan unik. Melempar galat bila tidak valid. */
export function parseRanges(text: string, total: number): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const parts = text.split(/[,;\s]+/).filter(Boolean);
  if (!parts.length) throw new Error('Isi rentang halaman, misalnya 1-3, 5.');
  for (const p of parts) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(p);
    if (!m) throw new Error(`Rentang "${p}" tidak valid. Gunakan angka dan tanda hubung, misalnya 1-3, 5.`);
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    if (a < 1 || b < 1) throw new Error('Nomor halaman dimulai dari 1.');
    if (a > total || b > total) throw new Error(`Halaman ${Math.max(a, b)} melebihi jumlah halaman (${total}).`);
    if (a > b) throw new Error(`Rentang "${p}" terbalik. Tulis dari angka kecil ke besar.`);
    for (let i = a; i <= b; i++) if (!seen.has(i)) (seen.add(i), out.push(i));
  }
  return out;
}
