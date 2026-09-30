// Web Worker: menjalankan deteksi dan render di luar utas utama agar animasi dan antarmuka tetap mulus.
import { detect, renderScan, type RenderJob } from './scan-core.ts';

type Msg =
  | { id: number; type: 'detect'; buf: ArrayBuffer; w: number; h: number }
  | ({ id: number; type: 'render'; buf: ArrayBuffer } & Omit<RenderJob, 'rgba'>);

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  try {
    if (m.type === 'detect') {
      const r = detect(new Uint8ClampedArray(m.buf), m.w, m.h);
      (self as any).postMessage({ id: m.id, ...r });
    } else {
      const r = renderScan({ rgba: new Uint8ClampedArray(m.buf), w: m.w, h: m.h, quad: m.quad, maxSide: m.maxSide, filter: m.filter, inset: m.inset, aspect: m.aspect, refine: m.refine });
      (self as any).postMessage({ id: m.id, buf: r.data.buffer, w: r.w, h: r.h, snapped: r.snapped }, [r.data.buffer]);
    }
  } catch (err: any) {
    (self as any).postMessage({ id: m.id, error: String(err?.message || err) });
  }
};
