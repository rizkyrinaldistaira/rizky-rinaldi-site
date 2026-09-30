// Fungsi umum untuk semua tool. Semua berjalan di browser pengunjung.

/** Pintasan pemilih elemen; melempar galat jelas bila elemen tidak ada (membantu menemukan salah ketik id). */
export function $(sel: string, root: ParentNode = document): HTMLElement {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Elemen tidak ditemukan: ${sel}`);
  return el as HTMLElement;
}
export function $$(sel: string, root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll(sel)) as HTMLElement[];
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0).replace('.', ',')} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 2 : 1).replace('.', ',')} MB`;
}

export function baseName(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

const loaded = new Map<string, Promise<void>>();
export function loadScript(url: string): Promise<void> {
  if (loaded.has(url)) return loaded.get(url)!;
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat pustaka. Periksa koneksi internet lalu muat ulang halaman.'));
    document.head.appendChild(s);
  });
  loaded.set(url, p);
  return p;
}

export type StatusKind = 'info' | 'error' | 'success';
export function setStatus(el: HTMLElement | null, kind: StatusKind | null, html = '') {
  if (!el) return;
  if (!kind || !html) {
    el.className = 'hidden';
    el.innerHTML = '';
    return;
  }
  el.className = `tl-status tl-status-${kind} mt-4`;
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  el.innerHTML = html;
}

export function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

/** Menghubungkan area seret-lepas ke input file. */
export function bindDropzone(
  root: HTMLElement,
  opts: {
    accept: string[]; // ekstensi tanpa titik, huruf kecil; array kosong = semua jenis berkas
    multiple: boolean;
    onFiles: (files: File[]) => void;
    onReject?: (names: string[]) => void;
  },
) {
  const input = root.querySelector('input[type=file]') as HTMLInputElement;
  input.multiple = opts.multiple;
  if (opts.accept.length) input.accept = opts.accept.map((e) => '.' + e).join(',');
  const allowed = (name: string) => !opts.accept.length || opts.accept.includes(extOf(name));
  const handle = (list: FileList | File[]) => {
    const all = Array.from(list);
    const good = all.filter((f) => allowed(f.name));
    const bad = all.filter((f) => !allowed(f.name)).map((f) => f.name);
    if (bad.length && opts.onReject) opts.onReject(bad);
    if (good.length) opts.onFiles(opts.multiple ? good : [good[0]]);
  };
  root.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    input.click();
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });
  input.addEventListener('change', () => {
    if (input.files) handle(input.files);
    input.value = '';
  });
  ['dragenter', 'dragover'].forEach((ev) =>
    root.addEventListener(ev, (e) => {
      e.preventDefault();
      root.classList.add('is-drag');
    }),
  );
  ['dragleave', 'drop'].forEach((ev) =>
    root.addEventListener(ev, (e) => {
      e.preventDefault();
      root.classList.remove('is-drag');
    }),
  );
  root.addEventListener('drop', (e) => {
    const dt = (e as DragEvent).dataTransfer;
    if (dt?.files) handle(dt.files);
  });
}

/** Urutan ulang daftar lewat seret-lepas (desktop). Tombol naik/turun tetap disediakan untuk HP. */
export function enableReorder(list: HTMLElement, itemSelector: string, onMove: (from: number, to: number) => void) {
  let from = -1;
  list.addEventListener('dragstart', (e) => {
    const it = (e.target as HTMLElement).closest(itemSelector) as HTMLElement | null;
    if (!it) return;
    from = Array.from(list.children).indexOf(it);
    it.classList.add('is-dragging');
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', String(from));
  });
  list.addEventListener('dragover', (e) => {
    if (from < 0) return;
    e.preventDefault();
  });
  list.addEventListener('drop', (e) => {
    if (from < 0) return;
    e.preventDefault();
    const it = (e.target as HTMLElement).closest(itemSelector) as HTMLElement | null;
    if (!it) return;
    const to = Array.from(list.children).indexOf(it);
    if (to >= 0 && to !== from) onMove(from, to);
    from = -1;
  });
  list.addEventListener('dragend', () => {
    from = -1;
    list.querySelectorAll('.is-dragging').forEach((n) => n.classList.remove('is-dragging'));
  });
}

export function moveItem<T>(arr: T[], from: number, to: number) {
  const [x] = arr.splice(from, 1);
  arr.splice(to, 0, x);
}

/** Nama berkas unik dalam satu paket ZIP. */
export function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const i = name.lastIndexOf('.');
  const stem = i > 0 ? name.slice(0, i) : name;
  const ext = i > 0 ? name.slice(i) : '';
  let n = 2;
  while (used.has(`${stem}-${n}${ext}`)) n++;
  const out = `${stem}-${n}${ext}`;
  used.add(out);
  return out;
}
