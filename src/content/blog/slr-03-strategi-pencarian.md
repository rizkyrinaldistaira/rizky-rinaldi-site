---
title: 'Strategi Pencarian Sistematis untuk SLR: Database, Kata Kunci, dan Search String'
description: 'Panduan pencarian SLR: memilih database, menyusun kata kunci dan search string Boolean dari PICOC, mengujinya, dan mendokumentasikannya sesuai PRISMA-S.'
pubDate: '2026-09-29'
series: 'Belajar Menulis Systematic Literature Review (SLR)'
seriesPart: 3
seriesDescription: 'Panduan bertahap menulis Systematic Literature Review (SLR) yang sistematis, transparan, dan dapat direplikasi, dari merumuskan pertanyaan sampai menulis laporan berstandar PRISMA.'
seriesIcon: 'fa-clipboard-check'
---

## Pendahuluan

Seorang mahasiswa mengetik "pengaruh media digital terhadap hasil belajar PAI" di Google, membuka tiga puluh hasil pertama, lalu menyatakan bahwa pencarian SLR-nya sudah selesai. Ketika dosen bertanya, "Kalau saya mengulang pencarian ini besok, apakah saya mendapat hasil yang sama? Di mana daftar kata kuncinya? Database mana saja yang Anda pakai, dan kapan?", ia tidak dapat menjawab satu pun.

Itu bukan pencarian sistematis. **Pencarian sistematis** adalah pencarian yang terencana, komprehensif, terdokumentasi, dan dapat diulang oleh orang lain. Kelengkapan dan ketepatan pencarian menentukan kualitas seluruh review, karena studi yang tidak pernah ditemukan tidak akan pernah bisa dinilai atau disintesis.

Artikel ini adalah Part 3 dari seri *Belajar Menulis Systematic Literature Review (SLR)*. Setelah [Part 2](/blog/slr-02-pertanyaan-review-protokol) menghasilkan pertanyaan review dan kerangka PICOC, kini kita mengubahnya menjadi strategi pencarian yang konkret: memilih database, menyusun kata kunci dan *search string*, mengujinya, memperluasnya, lalu mendokumentasikannya.

> **Catatan penting.**
> Informasi tentang database, sintaks, dan layanan dicek pada 29 September 2026 dan dapat berubah.
> *Search string* pada artikel ini saya susun sebagai **ilustrasi sintaks** dan belum dijalankan pada database sesungguhnya. Angka hasil pencarian pada tabel contoh adalah **rekaan** untuk latihan. Uji sendiri setiap string pada database yang Anda pakai.
> Ketersediaan database bergantung pada langganan kampus Anda, jadi tanyakan kepada pustakawan.

**Setelah membaca artikel ini, Anda diharapkan mampu:**

- menjelaskan tujuan dan ciri pencarian yang sistematis;
- mengubah kerangka PICOC menjadi blok konsep beserta sinonimnya;
- memakai operator Boolean, tanda kutip, pemotongan kata, dan kode bidang dengan benar;
- memilih kombinasi database yang sesuai dengan bidang Anda;
- menyusun, menguji, dan menyempurnakan *search string*;
- mendokumentasikan pencarian dengan cara yang dapat direplikasi.

---

## 1. Prinsip Pencarian Sistematis

### 1.1 Sensitivitas dan presisi

Dua ukuran ini sering diperlukan untuk memahami mengapa pencarian SLR terasa "boros".

| Ukuran | Pengertian | Contoh |
|---|---|---|
| **Sensitivitas** (*recall*) | Proporsi studi relevan yang berhasil ditemukan dari seluruh studi relevan yang ada | Ada 50 studi relevan; pencarian menemukan 45, sehingga sensitivitasnya 90% |
| **Presisi** | Proporsi hasil pencarian yang benar-benar relevan | Pencarian menghasilkan 500 rekaman; 40 relevan, sehingga presisinya 8% |

Keduanya saling tarik-menarik. Semakin lebar jaringnya, semakin banyak studi relevan tertangkap, tetapi semakin banyak pula yang tidak relevan. Bab tentang pencarian pada *Cochrane Handbook* (Lefebvre dkk., 2019) menjelaskan bahwa pencarian untuk review sistematis umumnya diarahkan pada **sensitivitas tinggi**, sehingga presisi yang rendah adalah hal yang wajar. Jangan kaget jika ratusan rekaman harus disaring untuk mendapat segelintir studi yang masuk.

### 1.2 Empat ciri pencarian yang baik

| Ciri | Penjelasan |
|---|---|
| **Terencana** | Strategi ditetapkan pada protokol, bukan diimprovisasi sambil jalan |
| **Komprehensif** | Memakai beberapa sumber dan mencakup sinonim serta variasi istilah |
| **Terdokumentasi** | Setiap database, string, tanggal, dan hasil dicatat |
| **Dapat diulang** | Orang lain yang memakai string dan database yang sama seharusnya memperoleh hasil serupa |

---

## 2. Dari PICOC ke Blok Konsep

### 2.1 Pilih konsep yang perlu dicari

Tidak semua unsur PICOC dimasukkan ke dalam string. Memasukkan terlalu banyak konsep menurunkan sensitivitas karena mensyaratkan semuanya muncul sekaligus. Praktik yang lazim adalah mencari terutama konsep **populasi**, **intervensi atau fenomena**, dan **konteks** bila perlu, sedangkan konsep luaran dan pembanding sering tidak dicari agar tidak melewatkan studi yang menyebutnya dengan istilah berbeda. Pertimbangkan hal ini bersama pembimbing dan sesuaikan dengan hasil pencarian percobaan.

### 2.2 Bangun blok konsep beserta sinonimnya

Setiap konsep menjadi satu **blok**. Di dalam blok, istilah dihubungkan dengan **OR**. Antar blok, dihubungkan dengan **AND**.

> **Contoh kasus (dari Part 2).**
> **Pertanyaan:** Bagaimana pengaruh media pembelajaran digital terhadap hasil belajar PAI pada siswa SD/MI di Indonesia (2015–2025)?

| Blok | Konsep | Istilah bahasa Inggris | Istilah bahasa Indonesia |
|---|---|---|---|
| **A** | Populasi: siswa SD/MI | elementary school, primary school, primary education | sekolah dasar, madrasah ibtidaiyah |
| **B** | Intervensi: media digital | digital media, interactive media, educational video, e-module, educational game, gamification, mobile learning | media digital, media interaktif, video pembelajaran, e-modul, game edukasi |
| **C** | Bidang: PAI | Islamic education, Islamic religious education, Islamic studies, fiqh | pendidikan agama Islam, PAI, fikih |
| **D** | Konteks: Indonesia | Indonesia | Indonesia |
| *Opsional* | Luaran: hasil belajar | learning outcome, learning result, academic achievement | hasil belajar, prestasi belajar |

Tips mencari sinonim:

- Baca **kata kunci penulis** dan abstrak dari beberapa artikel kunci yang sudah Anda temukan.
- Cari padanan istilah pada **tesaurus** database, bila ada (bagian 3.2).
- Pertimbangkan **variasi ejaan** (misalnya *program* dan *programme*), **singkatan** (PAI, AR, VR), serta **bentuk tunggal dan jamak**.

---

## 3. Kosakata Pencarian

### 3.1 Kata bebas dan istilah terkontrol

| Jenis | Penjelasan | Kelebihan | Keterbatasan |
|---|---|---|---|
| **Kata bebas** (*free text*) | Kata atau frasa yang Anda ketik dan dicari pada judul, abstrak, atau kata kunci | Tersedia di semua database | Perlu banyak sinonim dan variasi |
| **Istilah terkontrol** (*controlled vocabulary*) | Istilah baku yang dipakai pengindeks, dikelompokkan dalam tesaurus | Menangkap artikel yang memakai istilah berbeda untuk konsep yang sama | Tidak semua database memilikinya, dan artikel baru mungkin belum terindeks |

### 3.2 Tesaurus

Beberapa database menyediakan tesaurus, misalnya MeSH pada PubMed dan **ERIC Thesaurus** pada ERIC (bidang pendidikan). Tesaurus membantu menemukan istilah baku dan istilah yang lebih luas atau lebih sempit. Namun jangan mengandalkan istilah terkontrol saja. Kombinasikan dengan kata bebas agar artikel yang belum terindeks tetap tertangkap.

---

## 4. Operator dan Sintaks

### 4.1 Operator dasar

| Operator | Fungsi | Contoh |
|---|---|---|
| **OR** | Salah satu istilah cukup muncul. Dipakai *di dalam* blok | `"digital media" OR "interactive media"` |
| **AND** | Semua blok harus terpenuhi. Dipakai *antar* blok | `(blok A) AND (blok B)` |
| **NOT** / **AND NOT** | Mengecualikan istilah. Pakai sangat hemat | `learning AND NOT "machine learning"` |
| **Tanda kurung** | Mengelompokkan istilah agar urutan evaluasinya jelas | `(a OR b) AND (c OR d)` |
| **Tanda kutip** | Mencari frasa | `"elementary school"` |
| **Pemotongan kata** `*` | Mencari berbagai akhiran | `school*` menemukan school, schools, schooling |
| **Kartu pengganti** `?` | Mengganti satu huruf | `behavio?r` menemukan behavior dan behaviour |

**Selalu gunakan tanda kurung.** Platform pencarian mengevaluasi operator menurut urutan prioritas tertentu. Pada Scopus, misalnya, panduan menyebut OR dievaluasi lebih dahulu, kemudian operator kedekatan, lalu AND, dan AND NOT terakhir (Elsevier, n.d.). Tanpa tanda kurung yang tegas, string Anda dapat berarti sesuatu yang berbeda dari yang Anda maksud.

**Hati-hati dengan pemotongan kata yang terlalu pendek**, seperti `med*`, yang akan menangkap terlalu banyak kata tak relevan.

### 4.2 Sintaks berbeda pada tiap platform

Setiap database punya bahasa perintah sendiri. Jangan menyalin string mentah-mentah antar platform. Terjemahkan sesuai sintaksnya, dan periksa panduan bantuan platform.

| Platform | Cara membatasi ke judul, abstrak, kata kunci | Frasa dan pemotongan | Kedekatan kata |
|---|---|---|---|
| **Scopus** | `TITLE-ABS-KEY( ... )` (Elsevier, n.d.) | `"frasa"` (longgar, kata harus dalam bidang yang sama); `{frasa}` (persis); `*` dan `?` (Sydney University Library, n.d.) | `W/n` (dalam n kata); `PRE/n` (urutan sesuai) |
| **Web of Science** | `TS=( ... )` (topik) | Tanda kutip untuk frasa; `*`, `?`, dan `$`; pemotongan di depan kata diperbolehkan (UBC Library, n.d.) | `NEAR/n` |
| **PubMed** | `[tiab]` (judul dan abstrak) | Tanda kutip; pemotongan `*` | Tersedia dalam format tertentu |
| **Google Scholar** | Tidak ada kode bidang yang lengkap | Tanda kutip dan `OR` | Terbatas |

Panduan perpustakaan menyebut bahwa Scopus menangani bentuk jamak dan variasi ejaan secara otomatis pada pencarian biasa (UBC Library, n.d.), tetapi perilaku ini bisa berbeda untuk frasa persis dan dapat berubah. Uji sendiri, jangan berasumsi.

> **Tentang Google Scholar.** Google Scholar sangat berguna untuk menemukan artikel, tetapi kurang cocok sebagai sumber **utama** pada SLR. Gusenbauer dan Haddaway (2020) menguji 28 sistem pencarian akademik dan menyimpulkan bahwa Google Scholar tidak layak menjadi sistem pencarian utama untuk review sistematis, antara lain karena hasil pencariannya tidak selalu dapat direplikasi. Gunakan Google Scholar sebagai **pelengkap**, misalnya untuk penelusuran sitasi.

---

## 5. Memilih Database

### 5.1 Kriteria memilih

| Kriteria | Pertanyaan |
|---|---|
| **Cakupan bidang** | Apakah database ini memuat literatur bidang saya? |
| **Cakupan wilayah dan bahasa** | Apakah memuat penelitian Indonesia dan berbahasa Indonesia bila saya perlukan? |
| **Fitur pencarian** | Apakah mendukung operator Boolean, kode bidang, dan pemotongan kata? |
| **Reproduksibilitas** | Apakah hasilnya konsisten bila diulang, dan dapat diekspor? |
| **Akses** | Apakah tersedia gratis atau lewat langganan kampus saya? |

### 5.2 Berapa database?

Tidak ada angka baku. Bramer, Rethlefsen, Kleijnen, dan Franco (2017) mengkaji kombinasi database untuk review sistematis dan menemukan bahwa tidak ada satu database tunggal yang cukup; penggabungan beberapa database meningkatkan kelengkapan. Praktisnya, pilih **beberapa database yang saling melengkapi**, lalu justifikasi pilihan Anda pada protokol.

### 5.3 Contoh pilihan menurut bidang

| Bidang | Database yang lazim dipertimbangkan | Catatan |
|---|---|---|
| **Pendidikan** | ERIC; Scopus; Web of Science; DOAJ; Portal Garuda dan SINTA untuk literatur Indonesia | ERIC gratis dan memiliki tesaurus. Lihat catatan tentang cakupan ERIC di bawah |
| **Informatika, rekayasa perangkat lunak** | IEEE Xplore; ACM Digital Library; Scopus; ScienceDirect; SpringerLink | Sering perlu langganan; periksa akses kampus |
| **Kesehatan** | PubMed/MEDLINE; Embase; Cochrane CENTRAL; CINAHL | Umumnya menyediakan tesaurus |
| **Pelengkap (semua bidang)** | Google Scholar; DOAJ; repositori kampus | Bukan sumber utama |

> **Contoh nyata mengapa tanggal pencarian penting: ERIC.**
> ERIC adalah database pendidikan gratis yang disponsori Institute of Education Sciences (IES), Departemen Pendidikan AS.
> Pada Maret 2025, sebuah perpustakaan universitas melaporkan bahwa ERIC menyampaikan rencana mengurangi cakupan jurnal yang diindeks sekitar 45% mulai 24 April 2025, sementara rekaman yang sudah ada diperkirakan tetap tersedia (OISE Library, 2025).
> Status terbaru perlu Anda cek sendiri. Yang penting: **cakupan database dapat berubah**, sehingga hasil pencarian yang sama bisa berbeda antar waktu. Karena itu, catat tanggal setiap pencarian dan jelaskan keterbatasannya.

### 5.4 Sumber gratis dan berlangganan

- **Umumnya gratis:** ERIC, PubMed, DOAJ, Google Scholar, dan Portal Garuda.
- **Umumnya berlangganan:** Scopus, Web of Science, dan sebagian besar basis data penerbit. Tanyakan pustakawan kampus tentang akses, termasuk akses dari luar kampus.

Portal Garuda penting untuk literatur Indonesia (lihat [artikel tentang mencari jurnal referensi](/blog/cara-mencari-jurnal-referensi-skripsi)), tetapi fitur pencariannya lebih sederhana dibanding database internasional. Pecah string panjang menjadi beberapa pencarian sederhana, lalu catat masing-masing.

---

## 6. Menyusun *Search String* Langkah demi Langkah

Empat langkah dasarnya:

1. **Tulis blok konsep.** Gunakan tabel pada bagian 2.2 sebagai bahan.
2. **Gabungkan sinonim tiap blok dengan OR.** Beri tanda kutip pada frasa, dan pakai pemotongan kata secara terukur.
3. **Gabungkan blok dengan AND**, dan beri tanda kurung pada tiap blok.
4. **Terjemahkan ke sintaks platform** yang akan dipakai.

### Contoh: string Scopus (ilustratif)

```
TITLE-ABS-KEY (
  ( "elementary school*" OR "primary school*" OR "primary education"
    OR "madrasah ibtidaiyah" OR "sekolah dasar" )
  AND
  ( "digital media" OR "interactive media" OR "educational video*"
    OR "learning video*" OR "e-module*" OR "educational game*"
    OR gamification OR "mobile learning" OR "learning application*" )
  AND
  ( "Islamic education" OR "Islamic religious education"
    OR "Islamic studies" OR "pendidikan agama Islam" OR fiqh )
  AND
  ( Indonesia* )
)
AND PUBYEAR > 2014 AND PUBYEAR < 2026
```

### Variasi dengan blok luaran

Bila ingin menambah blok luaran, tambahkan satu blok lagi:

```
AND ( "learning outcome*" OR "learning result*"
      OR "academic achievement" OR "hasil belajar" )
```

**Pertimbangkan pertukarannya.** Menambah blok luaran meningkatkan presisi, tetapi berisiko melewatkan studi yang mengukur hasil belajar dengan istilah lain. Karena SLR mengutamakan sensitivitas, banyak peneliti mulai tanpa blok luaran, lalu melihat apakah jumlah hasilnya masih terkelola.

### Contoh untuk informatika (pemetaan sistem informasi akademik)

```
TITLE-ABS-KEY (
  ( "academic information system*" OR "student information system*"
    OR "school information system*" OR "sistem informasi akademik" )
  AND
  ( "system development" OR "software development" OR waterfall
    OR prototyp* OR agile OR "rapid application development" )
  AND
  ( Indonesia* )
)
AND PUBYEAR > 2017 AND PUBYEAR < 2026
```

### Contoh sederhana untuk Portal Garuda atau Google Scholar (bahasa Indonesia)

Karena fiturnya terbatas, pecah menjadi beberapa pencarian dan catat masing-masing:

```
"media digital" "hasil belajar" "pendidikan agama Islam" sekolah dasar
"media interaktif" "hasil belajar" "pendidikan agama Islam"
"video pembelajaran" "hasil belajar" fikih madrasah ibtidaiyah
```

---

## 7. Menguji dan Menyempurnakan Pencarian

### 7.1 Uji dengan artikel kunci

Kumpulkan **artikel kunci** yang Anda yakin relevan (misalnya 5 sampai 10 artikel dari pencarian awal, atau dari saran pembimbing). Setelah menjalankan string, periksa apakah semua artikel kunci itu **ditemukan**. Bila ada yang tidak muncul, cari tahu mengapa: apakah ada sinonim yang terlewat, kata kunci berbeda, atau blok terlalu ketat? Kitchenham dan Charters (2007) juga menyarankan pencarian percobaan dan pemeriksaan hasilnya terhadap studi yang sudah diketahui.

### 7.2 Tinjau sampel hasil

Lihat 30 sampai 50 hasil pertama dan sebagian hasil acak. Adakah pola ketidakrelevanan yang berulang? Bila ada, pertimbangkan mempersempit istilah yang terlalu longgar. Namun berhati-hatilah menambah `NOT`, karena dapat membuang studi relevan.

### 7.3 Telaah sejawat strategi pencarian (PRESS)

Pedoman **PRESS** (*Peer Review of Electronic Search Strategies*; McGowan dkk., 2016) menyediakan daftar periksa untuk menelaah strategi pencarian oleh orang lain. Fokusnya mencakup penerjemahan pertanyaan penelitian, operator Boolean dan kedekatan, istilah terkontrol, pencarian kata bebas, ejaan dan sintaks, serta batasan dan filter. Minta pembimbing atau pustakawan kampus meninjau string Anda sebelum dijalankan penuh.

### 7.4 Batasan dan filter dipakai dengan hati-hati

| Batasan | Manfaat | Risiko |
|---|---|---|
| **Tahun** | Membatasi pada periode relevan | Melewatkan studi penting di luar periode |
| **Bahasa** | Menyesuaikan kemampuan membaca | Bias bahasa: studi berbahasa lain terlewat |
| **Jenis dokumen** | Fokus pada artikel dan prosiding | Melewatkan laporan atau literatur abu-abu |

Setiap batasan harus **dijustifikasi pada protokol** dan dicatat.

---

## 8. Melengkapi Pencarian Database

Pencarian database hampir tidak pernah cukup. Beberapa cara melengkapinya:

| Cara | Penjelasan |
|---|---|
| **Penelusuran sitasi ke belakang** (*backward snowballing*) | Memeriksa daftar pustaka studi yang sudah terpilih |
| **Penelusuran sitasi ke depan** (*forward snowballing*) | Mencari siapa yang mengutip studi terpilih, misalnya lewat "Cited by" pada Google Scholar |
| **Penelusuran manual** | Membuka daftar isi jurnal atau prosiding kunci pada bidang Anda |
| **Menghubungi penulis** | Menanyakan studi yang belum terbit atau belum terindeks |
| **Literatur abu-abu** | Laporan, repositori, dan prosiding, bila relevan dengan pertanyaan |

Wohlin (2014) menguraikan pedoman *snowballing* pada SLR di bidang rekayasa perangkat lunak, dan pendekatan ini juga banyak dipakai lintas bidang.

---

## 9. Mendokumentasikan Pencarian

### 9.1 Mengapa dan apa yang dicatat

Pencarian yang tidak terdokumentasi tidak dapat diulang, sehingga tidak dapat disebut sistematis. **PRISMA-S** adalah ekstensi PRISMA khusus untuk pelaporan pencarian literatur, terdiri atas 16 butir yang dikelompokkan pada sumber informasi dan metode, strategi pencarian, telaah sejawat, dan pengelolaan rekaman (Rethlefsen dkk., 2021). PRISMA 2020 sendiri juga meminta laporan sumber informasi beserta tanggal pencarian terakhir dan strategi pencarian lengkap untuk setiap database (Page dkk., 2021).

Catat untuk setiap sumber:

- nama database **dan platform** (misalnya Scopus di platform Elsevier);
- **tanggal** pencarian;
- **string lengkap** yang persis dijalankan, termasuk kode bidang;
- **batasan dan filter** yang dipakai;
- **jumlah hasil**;
- cara ekspor dan versi berkas.

### 9.2 Contoh log pencarian

**Contoh log (angka rekaan untuk latihan):**

| Sumber | Platform | Tanggal | Metode | Filter | Hasil |
|---|---|---|---|---|---|
| Scopus | Elsevier | 12 Okt 2026 | String pada bagian 6, TITLE-ABS-KEY | 2015–2025 | 214 |
| ERIC | eric.ed.gov | 12 Okt 2026 | Versi sederhana dari string | 2015–2025 | 96 |
| Portal Garuda | garuda | 13 Okt 2026 | Tiga pencarian bahasa Indonesia | 2015–2025 | 187 |
| DOAJ | doaj.org | 13 Okt 2026 | Versi sederhana dari string | 2015–2025 | 41 |
| Google Scholar | scholar.google.com | 14 Okt 2026 | Tiga pencarian; 100 hasil teratas tiap pencarian ditinjau | 2015–2025 | 300 ditinjau |
| **Total sebelum penghapusan duplikat** | | | | | **838** |

Log ini nantinya menjadi bahan **diagram alir PRISMA** (Part 4). Simpan string lengkap di lampiran skripsi.

---

## 10. Mengekspor dan Mengelola Hasil

1. **Ekspor** hasil dari tiap database ke format yang dikenali pengelola referensi (umumnya RIS, BibTeX, atau CSV). Banyak platform membatasi jumlah rekaman per unduhan, jadi ekspor bertahap bila perlu.
2. **Impor** ke pengelola referensi seperti Zotero, satu koleksi per database, agar asal rekaman tetap tercatat.
3. **Hapus duplikat.** Rekaman yang sama sering muncul dari beberapa database. Zotero dan alat penyaringan seperti Rayyan menyediakan fitur pendeteksi duplikat, tetapi hasilnya perlu diperiksa manual. **Catat jumlah sebelum dan sesudah** penghapusan duplikat.
4. **Simpan cadangan** berkas ekspor asli.

Jumlah rekaman pada tiap tahap inilah yang akan Anda laporkan pada diagram alir PRISMA di Part 4.

---

## 11. Sepuluh Kesalahan yang Paling Sering Terjadi

1. **Mengetik seluruh judul atau pertanyaan** ke kotak pencarian sebagai satu kalimat.
2. **Mengandalkan satu database**, terutama Google Scholar sebagai sumber utama.
3. **Tidak memakai sinonim**, singkatan, dan variasi ejaan.
4. **Memasukkan semua unsur PICOC**, sehingga string terlalu ketat.
5. **Tidak memakai tanda kurung**, sehingga urutan operator tidak sesuai maksud.
6. **Menyalin string yang sama ke semua platform** tanpa menyesuaikan sintaks.
7. **Memakai `NOT` sembarangan** dan membuang studi relevan.
8. **Tidak menguji string dengan artikel kunci.**
9. **Tidak mencatat tanggal, platform, dan string lengkap.**
10. **Tidak melaporkan batasan dan filter** yang dipakai.

---

## 12. Latihan

**Soal 1.** Untuk pertanyaan review *"Bagaimana pengaruh aplikasi kuis interaktif terhadap motivasi belajar siswa madrasah ibtidaiyah di Indonesia?"*, susun tiga blok konsep beserta sinonim Inggris dan Indonesianya.

**Soal 2.** Perbaiki string berikut: `pengaruh media digital terhadap hasil belajar siswa AND sekolah dasar OR madrasah`. Apa masalahnya?

**Soal 3.** Pencarian Anda menemukan 6 dari 8 artikel kunci. Apa yang akan Anda lakukan?

**Jawaban.**

1. **Blok A (populasi):** "madrasah ibtidaiyah" OR "elementary madrasah" OR "primary school*" OR "sekolah dasar". **Blok B (intervensi):** "interactive quiz*" OR "quiz application*" OR "educational quiz*" OR kahoot OR "aplikasi kuis". **Blok C (konteks):** Indonesia*. Blok luaran (motivasi belajar) sengaja tidak dimasukkan untuk menjaga sensitivitas, atau ditambahkan bila hasil terlalu banyak.
2. Masalahnya: (a) seluruh kalimat dimasukkan sebagai satu frasa, (b) tanpa tanda kurung, `AND` dan `OR` dievaluasi menurut urutan prioritas platform sehingga maknanya bisa berbeda dari maksud Anda, (c) tanpa sinonim. Perbaikan: `("media digital" OR "media interaktif" OR "digital media") AND ("hasil belajar" OR "learning outcome*") AND ("sekolah dasar" OR "madrasah ibtidaiyah" OR "elementary school*")`.
3. Periksa dua artikel yang tidak ditemukan: istilah apa yang mereka pakai pada judul, abstrak, dan kata kunci, lalu tambahkan sinonim yang terlewat atau longgarkan blok yang terlalu ketat. Jalankan lagi, catat perubahannya di log, dan periksa hasilnya terhadap seluruh artikel kunci.

---

## Pertanyaan yang Sering Diajukan

**Bolehkah SLR hanya memakai Google Scholar?**
Tidak dianjurkan. Google Scholar kurang cocok sebagai sumber utama karena hasilnya tidak selalu dapat direplikasi dan fitur pencariannya terbatas (Gusenbauer & Haddaway, 2020). Jadikan ia pelengkap.

**Berapa database yang harus dipakai?**
Tidak ada angka baku. Pilih beberapa database yang saling melengkapi dan justifikasi pilihannya. Bila kampus memiliki ketentuan, ikuti.

**Bagaimana kalau kampus saya tidak berlangganan Scopus?**
Gunakan database yang dapat Anda akses (misalnya ERIC, DOAJ, Portal Garuda, dan sumber berlangganan yang tersedia), lalu nyatakan keterbatasannya secara terbuka. Tanyakan juga kepada pustakawan tentang akses alternatif.

**Perlukah mengulang pencarian sebelum menyelesaikan review?**
Bila jeda antara pencarian awal dan penulisan akhir cukup lama, mengulang atau memperbarui pencarian dapat berguna. Catat tanggal pencarian ulang.

---

## Rangkuman

- **Pencarian sistematis** terencana, komprehensif, terdokumentasi, dan dapat diulang. Sensitivitas tinggi diutamakan, sehingga presisi rendah adalah hal wajar.
- Ubah **PICOC menjadi blok konsep**: sinonim dihubungkan dengan **OR**, antar blok dengan **AND**, dan selalu **gunakan tanda kurung**.
- **Sintaks berbeda antar platform.** Terjemahkan string sesuai Scopus (`TITLE-ABS-KEY`), Web of Science (`TS=`), dan lainnya, jangan menyalin mentah-mentah.
- **Google Scholar** cocok sebagai pelengkap, bukan sumber utama. Pilih **beberapa database** yang saling melengkapi, dan sadari bahwa cakupan database dapat berubah.
- **Uji string** dengan artikel kunci, tinjau sampel hasil, dan mintalah telaah sejawat (PRESS).
- **Lengkapi** dengan penelusuran sitasi, penelusuran manual, dan literatur abu-abu bila relevan.
- **Dokumentasikan** database, platform, tanggal, string lengkap, filter, dan jumlah hasil (PRISMA-S), lalu ekspor dan hapus duplikat.

## Pertanyaan Refleksi

1. Blok konsep mana pada pertanyaan review Anda yang wajib dicari, dan mana yang sebaiknya tidak dimasukkan?
2. Apakah semua sinonim, singkatan, dan variasi ejaan penting sudah ada dalam bloknya?
3. Apakah artikel kunci Anda semuanya ditemukan oleh string yang Anda susun?
4. Bila orang lain mengulang pencarian Anda besok, dapatkah ia melakukannya hanya dari catatan Anda?

## Artikel Lanjutan

Bagian berikutnya, **Part 4**, membahas **seleksi studi**: menerapkan kriteria inklusi dan eksklusi pada judul dan abstrak lalu teks lengkap, menghapus duplikat, menghitung kesepakatan penilai, dan menyusun **diagram alir PRISMA**.

Bagian sebelumnya: [Part 1: Apa Itu SLR?](/blog/slr-01-pengertian-jenis-review) dan [Part 2: Merumuskan Pertanyaan Review dan Menyusun Protokol](/blog/slr-02-pertanyaan-review-protokol).

---

## Daftar Pustaka

Bramer, W. M., Rethlefsen, M. L., Kleijnen, J., & Franco, O. H. (2017). Optimal database combinations for literature searches in systematic reviews: A prospective exploratory study. *Systematic Reviews, 6*, Article 245.

Elsevier. (n.d.). *Scopus search tips*. https://dev.elsevier.com/sc_search_tips.html

Gusenbauer, M., & Haddaway, N. R. (2020). Which academic search systems are suitable for systematic reviews or meta-analyses? Evaluating retrieval qualities of Google Scholar, PubMed, and 26 other resources. *Research Synthesis Methods, 11*(2), 181–217. https://doi.org/10.1002/jrsm.1378

Kitchenham, B., & Charters, S. (2007). *Guidelines for performing systematic literature reviews in software engineering* (Version 2.3; EBSE Technical Report EBSE-2007-01). Keele University and University of Durham.

Lefebvre, C., Glanville, J., Briscoe, S., Featherstone, R., Littlewood, A., Marshall, C., ... Wieland, L. S. (2019). Searching for and selecting studies. In J. P. T. Higgins, J. Thomas, J. Chandler, M. Cumpston, T. Li, M. J. Page, & V. A. Welch (Eds.), *Cochrane handbook for systematic reviews of interventions* (2nd ed.). Wiley-Blackwell.

McGowan, J., Sampson, M., Salzwedel, D. M., Cogo, E., Foerster, V., & Lefebvre, C. (2016). PRESS Peer Review of Electronic Search Strategies: 2015 guideline statement. *Journal of Clinical Epidemiology, 75*, 40–46.

OISE Library, University of Toronto. (2025). *Education Resources Information Centre (ERIC)* [Blog post]. https://oise.library.utoronto.ca/oise-library-blog/education-resources-information-centre-eric

Page, M. J., McKenzie, J. E., Bossuyt, P. M., Boutron, I., Hoffmann, T. C., Mulrow, C. D., ... Moher, D. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. *BMJ, 372*, Article n71. https://doi.org/10.1136/bmj.n71

Rethlefsen, M. L., Kirtley, S., Waffenschmidt, S., Ayala, A. P., Moher, D., Page, M. J., Koffel, J. B., & PRISMA-S Group. (2021). PRISMA-S: An extension to the PRISMA statement for reporting literature searches in systematic reviews. *Systematic Reviews, 10*, Article 39. https://doi.org/10.1186/s13643-020-01542-z

Sydney University Library. (n.d.). *Scopus searching guide*. https://library.sydney.edu.au/content/dam/library/documents/support/scopus_searchingguide.pdf

UBC Library. (n.d.). *Searching health sciences databases: Article search syntax*. University of British Columbia. https://guides.library.ubc.ca/spph/articles

Wohlin, C. (2014). Guidelines for snowballing in systematic literature reviews and replications in software engineering. In *Proceedings of the 18th International Conference on Evaluation and Assessment in Software Engineering* (Article 38). ACM.

*Catatan: daftar penulis pada beberapa rujukan (Lefebvre dkk., 2019; Page dkk., 2021) dipersingkat; lihat sumber aslinya untuk daftar lengkap. Informasi tentang database dan sintaks diperiksa pada 29 September 2026 dan dapat berubah.*
