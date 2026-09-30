# Tools rizkyrinaldi.my.id

Semua tool berjalan di browser pengunjung. Tidak ada file yang diunggah ke server.

## Struktur

| Lokasi | Isi |
|---|---|
| `src/data/tools.ts` | Sumber tunggal data tool: judul, deskripsi, langkah, FAQ, tool terkait, tautan artikel |
| `src/layouts/ToolPage.astro` | Kerangka halaman tiap tool, termasuk data terstruktur (JSON-LD) |
| `src/pages/tools/index.astro` | Halaman indeks `/tools/` |
| `src/pages/tools/<kategori>/<slug>.astro` | Satu berkas kecil per halaman tool |
| `src/tools/*.astro` | Markup antarmuka tiap tool |
| `src/scripts/tools/*.ts` | Logika tiap tool. `formulas.ts` dan `calc.ts` murni TypeScript tanpa DOM |
| `public/vendor/` | pdf-lib (MIT) dan pdf.js (Apache-2.0), disimpan di situs sendiri tanpa CDN |
| `src/styles/global.css` | Gaya bersama, diawali `.tl-` (bagian "Tools") |

## Menambah tool baru

1. Tambahkan objek baru pada `src/data/tools.ts` (id, kategori, slug, teks, FAQ, tool terkait).
2. Buat `src/tools/NamaTool.astro` (markup) dan `src/scripts/tools/nama-tool.ts` (logika).
3. Buat `src/pages/tools/<kategori>/<slug>.astro` yang membungkus komponen dengan `ToolPage`.
4. Indeks, sitemap, dan footer memperbarui diri dari `tools.ts`.

## Pustaka pihak ketiga

- `public/vendor/pdf-lib`: fork `@cantoo/pdf-lib` 2.11.1 (MIT).
- `public/vendor/pdfjs`: `pdfjs-dist` 6.3.289 build legacy (Apache-2.0). Berkas `.mjs` diganti nama menjadi `.js`
  karena sebagian hosting statis menyajikan `.mjs` dengan tipe MIME yang salah.
- Untuk memperbarui, unduh paket dengan `npm pack`, salin berkas yang sama, lalu uji semua tool PDF.

## Scan Dokumen

Alurnya: **deteksi tepi, penyempurnaan sudut, pelurusan perspektif, filter, penajaman**. Semua mesin berupa TypeScript murni tanpa DOM
di `src/scripts/tools/` sehingga dapat diuji di Node, dan berjalan di Web Worker (`scan-worker.ts`) agar animasi tetap mulus.
Jika Worker tidak tersedia, `scan-dokumen.ts` memakai cadangan di utas utama lewat `import('./scan-core.ts')`.

- `scan-detect.ts`: mencari empat sudut kertas pada gambar sekitar 640 px. Tiga kandidat masker (kecerahan, jarak warna dari tepi, tepi
  Canny), komponen terbesar, cangkang cembung, lalu segi empat penutup minimum. Hasil hanya diterima bila skor >= 0,6 dan dukungan tepi
  >= 0,8; selain itu mengembalikan `null` (lebih aman mengaku tidak yakin daripada memotong salah).
- `scan-refine.ts`: menelusuri tiap sisi pada foto resolusi penuh, mencocokkan garis dengan pembuangan pencilan, menghitung ulang sudut.
  Galat sudut turun sekitar 6 kali lipat pada uji sintetis. Hanya dipakai untuk sudut hasil deteksi otomatis, bukan sudut yang diatur manual.
- `scan-warp.ts`: estimasi rasio kertas dari geometri perspektif (Zhang-He) dengan pagar panjang fokus, penguncian ke A4/Letter/F4
  bila selisih < 3,5%, ukuran keluaran berbasis luas (tidak memperbesar melebihi detail asli), dan warp bilinear. Mode rasio manual tersedia.
- `scan-effects.ts`: normalisasi latar (flat-field), kurva tingkat, penajaman unsharp, dan enam filter.
- `scan-core.ts`: `detect()` dan `renderScan()` yang dipakai worker dan cadangannya.

Batas yang diketahui: kertas putih di atas alas putih sering tidak terdeteksi (editor sudut manual tersedia); estimasi rasio mengandalkan
asumsi kamera biasa; tidak ada deteksi arah teks maupun OCR; HEIC tidak didukung. Validasi deteksi baru dilakukan pada adegan sintetis
berkunci jawaban (`/tmp/make_scenes.py` bukan bagian repo), belum pada koleksi foto nyata. PDF terenkripsi atau terbatas ditolak.

Uji: kartu memakai keadaan `is-queued/scanning/detected/ready/updating/error`; animasi dilewati bila `prefers-reduced-motion`.

## Catatan pengujian

Diuji otomatis pada Chromium (Chrome, Edge, Chrome Android): fungsi tiap tool, hasil unduhan diperiksa isinya,
tampilan pada lebar 320, 390, 768, dan 1280 px, aksesibilitas dasar, dan beban PDF 300 halaman.
Safari (iPhone) dan Firefox belum diuji otomatis. Uji manual pada perangkat nyata sebelum diumumkan.

## PDF ke Gambar

`pdf-ke-gambar.ts`: satu PDF dibuka dengan pdf.js (PDF terenkripsi atau terbatas ditolak), halaman dipilih dengan `parseRanges`, tiap halaman
dirender pada skala dpi/72 dan dibatasi `MAX_PIXELS` (16 juta piksel) lalu ditandai kepada pengguna. JPG diberi metadata dpi (`setJpegDpi`).
Hanya blob dan thumbnail kecil yang disimpan, sehingga aman untuk PDF panjang. Proses dapat dihentikan.

## Buat ZIP (kategori Berkas & ZIP)

`buat-zip.ts`: daftar berkas bebas jenis (`bindDropzone` dengan `accept: []` berarti semua jenis), urutan lewat seret atau tombol,
aturan nama massal (nomor urut, awalan, akhiran, cari-ganti, spasi, huruf kecil, folder). Fungsi `plan()` menghitung nama baru untuk
pratinjau dan pembuatan ZIP dari satu sumber yang sama. Nama dirapikan agar aman lintas sistem, dan kembar dibedakan tanpa peduli huruf
besar/kecil. ZIP ditulis `createZip` (tanpa kompresi, tanpa Zip64), seluruh isi dimuat di memori, sehingga total dibatasi 1,5 GB.
Belum ada ekstraktor ZIP.
