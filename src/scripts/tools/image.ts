// Pembantu gambar berbasis kanvas browser.

export type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

export async function decodeImage(file: File): Promise<Decoded> {
  try {
    let bmp: ImageBitmap;
    try {
      // Terapkan orientasi EXIF (foto HP) secara eksplisit agar foto tidak miring.
      bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    } catch {
      bmp = await createImageBitmap(file);
    }
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    // cadangan: elemen <img>
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error('decode'));
        i.src = url;
      });
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error(`"${file.name}" tidak dapat dibaca browser ini. Format seperti HEIC belum didukung. Ubah dulu ke JPG atau PNG.`);
    }
  }
}

// Batas area kanvas. Dijaga konservatif karena Safari di iPhone membatasi memori kanvas lebih ketat.
export const MAX_PIXELS = 16_000_000;

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function drawScaled(src: Decoded, w: number, h: number, background: string | null): HTMLCanvasElement {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d')!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src.source, 0, 0, c.width, c.height);
  return c;
}

export function toBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Gagal membuat gambar.'))), type, quality));
}

let webpOk: boolean | null = null;
export async function supportsWebpEncode(): Promise<boolean> {
  if (webpOk !== null) return webpOk;
  try {
    const b = await toBlob(makeCanvas(2, 2), 'image/webp', 0.8);
    webpOk = b.type === 'image/webp';
  } catch {
    webpOk = false;
  }
  return webpOk;
}

/** Menyisipkan kerapatan piksel (DPI) pada berkas JPEG berformat JFIF. */
export async function setJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  // Struktur: FF D8 | FF E0 len(2) 'JFIF\0' ver(2) units(1) Xd(2) Yd(2)
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff && buf[3] === 0xe0 && buf[6] === 0x4a && buf[7] === 0x46) {
    buf[13] = 1;
    buf[14] = (dpi >> 8) & 0xff;
    buf[15] = dpi & 0xff;
    buf[16] = (dpi >> 8) & 0xff;
    buf[17] = dpi & 0xff;
    return new Blob([buf], { type: 'image/jpeg' });
  }
  return blob;
}

export const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'];
export function mimeOfExt(ext: string): string {
  return ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/' + ext;
}
