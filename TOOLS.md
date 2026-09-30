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

## Catatan pengujian

Diuji otomatis pada Chromium (Chrome, Edge, Chrome Android): fungsi tiap tool, hasil unduhan diperiksa isinya,
tampilan pada lebar 320, 390, 768, dan 1280 px, aksesibilitas dasar, dan beban PDF 300 halaman.
Safari (iPhone) dan Firefox belum diuji otomatis. Uji manual pada perangkat nyata sebelum diumumkan.
