---
title: 'Analisis Data Kuantitatif: Dari Data Mentah ke Kesimpulan, Lengkap dengan Contoh Hitungan'
description: 'Panduan analisis data kuantitatif: statistik deskriptif, uji asumsi, uji-t, korelasi, regresi, ANOVA, ukuran efek, dan pelaporan, dengan contoh hitungan.'
pubDate: '2026-09-29'
series: 'Belajar Metodologi Penelitian'
seriesPart: 5
seriesDescription: 'Panduan lengkap memahami metodologi penelitian ilmiah dari dasar hingga mahir. Cocok untuk mahasiswa yang sedang menyusun skripsi atau tesis.'
seriesIcon: 'fa-flask'
---

## Pendahuluan

Seorang mahasiswa membuka Bab IV-nya dan menulis: *"Hasil uji-t menunjukkan Sig. = 0,000 sehingga metode demonstrasi berpengaruh terhadap hasil belajar."* Selesai. Tidak ada uraian tentang data, uji apa yang dipilih dan mengapa, apakah asumsinya terpenuhi, seberapa besar pengaruhnya, dan apa batasan kesimpulannya.

Ketika dosen bertanya, "Mengapa memakai uji-t? Bagaimana dengan varians kedua kelompok? Seberapa besar selisihnya dalam skor sebenarnya?", mahasiswa itu hanya bisa menjawab bahwa SPSS-nya menghasilkan angka itu. Padahal angka dari perangkat lunak hanyalah **keluaran**. Yang menentukan mutu analisis adalah keputusan-keputusan di baliknya.

Artikel ini adalah Part 5 dari seri *Belajar Metodologi Penelitian*. Setelah [instrumen dan pengumpulan data (Part 4)](/blog/metodologi-04-pengumpulan-data-instrumen), kita masuk ke pertanyaan berikutnya: **bagaimana data kuantitatif dianalisis sehingga benar-benar menjawab rumusan masalah**. Analisis data kualitatif dibahas terpisah pada Part 6.

> **Catatan tentang contoh.**
> Semua data pada artikel ini adalah **data ilustratif** yang sengaja dibuat sangat kecil supaya langkah hitungnya mudah diikuti. Bukan hasil penelitian yang sebenarnya.
> Seluruh angka pada contoh sudah dihitung ulang dengan perangkat lunak statistik. Pada penelitian nyata, ukuran sampel jauh lebih besar dan uji asumsi lebih beragam.
> Format penulisan angka (misalnya penulisan nol di depan koma) dapat berbeda antarkampus. Ikuti pedoman kampus Anda.

**Setelah membaca artikel ini, Anda diharapkan mampu:**

- memetakan alur analisis dari data mentah sampai kesimpulan;
- menyiapkan data dan menghitung statistik deskriptif, termasuk kategorisasi skor;
- memilih uji yang sesuai dengan pertanyaan, skala data, dan asumsi;
- melakukan dan menafsirkan uji asumsi, uji-t, korelasi, regresi, ANOVA, dan chi-square;
- melaporkan ukuran efek dan selang kepercayaan, bukan hanya nilai p;
- menulis hasil yang menjawab rumusan masalah dengan bahasa yang tepat.

---

## 1. Peta Alur Analisis

```
Data mentah → Persiapan data → Statistik deskriptif → Uji asumsi
   → Uji hipotesis → Ukuran efek dan interval → Interpretasi → Kesimpulan
```

| Tahap | Pertanyaan yang dijawab |
|---|---|
| **Persiapan data** | Apakah data sudah bersih, lengkap, dan diskor dengan benar? |
| **Statistik deskriptif** | Bagaimana gambaran data (pusat, sebaran, kategori)? |
| **Uji asumsi** | Apakah data memenuhi syarat uji yang akan dipakai? |
| **Uji hipotesis** | Apakah ada cukup bukti untuk menolak hipotesis nol? |
| **Ukuran efek dan interval** | Seberapa besar efek atau hubungannya, dan seberapa pasti? |
| **Interpretasi** | Apa artinya bagi rumusan masalah, dan apa batasannya? |

Prinsip utamanya: **analisis harus menjawab rumusan masalah.** Setiap rumusan masalah pada Bab I harus memiliki pasangan analisis pada Bab IV. Bila rumusan masalahnya "seberapa tinggi", jawabannya statistik deskriptif. Bila "apakah ada perbedaan", jawabannya uji beda. Bila "apakah ada hubungan", jawabannya korelasi.

---

## 2. Menyiapkan Data

Sebelum analisis apa pun, pastikan data siap. Field (2018) menekankan bahwa pemeriksaan dan pembersihan data mendahului analisis, karena kesalahan pada tahap ini akan terbawa ke seluruh hasil.

| Pemeriksaan | Yang dilakukan | Contoh |
|---|---|---|
| **Entri data** | Masukkan data ke lembar kerja atau perangkat lunak dengan satu baris per responden | Kode responden R01, R02, dan seterusnya |
| **Rentang nilai** | Periksa nilai yang mustahil | Skala 1 sampai 5, tetapi ada nilai 7 |
| **Data hilang** | Catat jumlah dan pola; putuskan cara menanganinya dan dokumentasikan | Angket kosong pada butir 9 |
| **Duplikat** | Periksa responden yang terinput dua kali | Dua baris identik |
| **Skor butir negatif** | Balik skor butir unfavorable sebelum dijumlah (lihat [Part 4](/blog/metodologi-04-pengumpulan-data-instrumen)) | Skor 5 menjadi 1 |
| **Skor total** | Jumlahkan butir sesuai definisi operasional | Total 15 butir |
| **Pencilan** (*outlier*) | Identifikasi, periksa apakah salah input, dan jangan menghapusnya tanpa alasan | Skor 15 pada sekelompok skor 55 sampai 70 |

**Tentang pencilan dan data hilang.** Jangan membuang data hanya karena tidak sesuai harapan. Jika sebuah nilai jelas salah input, perbaiki. Jika benar tetapi ekstrem, pertahankan dan laporkan, atau tunjukkan hasil dengan dan tanpa pencilan itu. Apa pun keputusannya, jelaskan di laporan.

---

## 3. Statistik Deskriptif

### 3.1 Ukuran yang lazim

| Ukuran | Kegunaan | Catatan |
|---|---|---|
| **Rata-rata** (*mean*) | Pusat data | Peka terhadap pencilan |
| **Median** | Nilai tengah | Lebih tahan terhadap pencilan |
| **Modus** | Nilai paling sering | Berguna untuk data kategori |
| **Simpangan baku** (SD) | Sebaran data di sekitar rata-rata | Selalu dilaporkan bersama rata-rata |
| **Minimum dan maksimum** | Rentang data | Membantu mendeteksi kesalahan |
| **Frekuensi dan persentase** | Sebaran data kategori | Cocok untuk data nominal dan hasil kategorisasi |

### 3.2 Kategorisasi skor

Pada penelitian deskriptif seperti *Tingkat Motivasi Belajar*, skor sering dikelompokkan ke dalam kategori. Salah satu cara yang banyak dipakai di Indonesia mengacu pada Azwar (2012): kategori ditentukan dari **rata-rata ideal (μ)** dan **simpangan baku ideal (σ)** yang dihitung dari skor minimum dan maksimum yang mungkin diperoleh.

```
μ (rata-rata ideal) = (skor maksimum + skor minimum) / 2
σ (simpangan baku ideal) = (skor maksimum − skor minimum) / 6
```

| Kategori | Rumus batas |
|---|---|
| Sangat tinggi | X lebih besar dari μ + 1,5σ |
| Tinggi | μ + 0,5σ lebih kecil dari X, sampai dengan μ + 1,5σ |
| Sedang | μ − 0,5σ lebih kecil dari X, sampai dengan μ + 0,5σ |
| Rendah | μ − 1,5σ lebih kecil dari X, sampai dengan μ − 0,5σ |
| Sangat rendah | X sampai dengan μ − 1,5σ |

> **Contoh perhitungan.**
> Angket motivasi belajar berisi 15 butir dengan skala 1 sampai 5.
> Skor minimum = 15 × 1 = 15. Skor maksimum = 15 × 5 = 75.
> μ = (75 + 15) / 2 = **45**. σ = (75 − 15) / 6 = **10**.

| Kategori | Rentang skor |
|---|---|
| Sangat tinggi | lebih dari 60 |
| Tinggi | lebih dari 50 sampai 60 |
| Sedang | lebih dari 40 sampai 50 |
| Rendah | lebih dari 30 sampai 40 |
| Sangat rendah | 30 ke bawah |

Misalkan 30 siswa menghasilkan sebaran berikut (data ilustratif). Rata-rata skor 52,3 termasuk kategori **tinggi**.

| Kategori | Frekuensi | Persentase |
|---|---|---|
| Sangat tinggi | 3 | 10,0% |
| Tinggi | 14 | 46,7% |
| Sedang | 10 | 33,3% |
| Rendah | 3 | 10,0% |
| Sangat rendah | 0 | 0,0% |
| **Jumlah** | **30** | **100%** |

Ada beberapa cara mengategorikan skor, misalnya berdasarkan rata-rata dan simpangan baku hasil data (bukan ideal) atau pembagian rentang sama besar. Pilihlah satu, jelaskan alasannya, dan ikuti pedoman kampus. Yang penting, kategori dibuat **sebelum** melihat hasil agar tidak terkesan disesuaikan.

---

## 4. Memilih Uji yang Tepat

Pemilihan uji ditentukan oleh **tujuan**, **skala data**, **jumlah kelompok atau variabel**, dan **terpenuhinya asumsi**.

| Tujuan | Jumlah kelompok atau variabel | Uji parametrik | Alternatif nonparametrik |
|---|---|---|---|
| Membandingkan dua kelompok independen | 2 kelompok | Uji-t independen (Welch bila varians tidak sama) | Mann-Whitney U |
| Membandingkan pengukuran berpasangan (sebelum dan sesudah) | 1 kelompok, 2 pengukuran | Uji-t berpasangan | Wilcoxon signed-rank |
| Membandingkan tiga kelompok atau lebih | 3 kelompok atau lebih | ANOVA satu arah dan uji lanjut | Kruskal-Wallis |
| Menguji hubungan dua variabel | 2 variabel | Korelasi Pearson | Korelasi Spearman |
| Menaksir pengaruh atau kontribusi | 1 atau lebih prediktor | Regresi linear | Konsultasikan pendekatan lain |
| Menguji hubungan dua variabel kategori | Tabel kontingensi | Chi-square | Uji eksak Fisher bila frekuensi harapan kecil |

Uji parametrik umumnya mensyaratkan data interval atau rasio. Skor total angket skala Likert sering diperlakukan sebagai interval, dengan dasar dan catatan yang dijelaskan pada [Part 4](/blog/metodologi-04-pengumpulan-data-instrumen) (Norman, 2010). Sugiyono (2019) menggolongkan statistik menurut skala data: data nominal dan ordinal umumnya dianalisis dengan statistik nonparametrik, dan data interval serta rasio dengan statistik parametrik.

---

## 5. Uji Asumsi

Setiap uji memiliki syarat. Bila syaratnya terlanggar, hasil uji bisa menyesatkan.

| Asumsi | Diperlukan oleh | Cara memeriksa | Bila terlanggar |
|---|---|---|---|
| **Normalitas** | Uji-t, ANOVA (per kelompok atau selisih), regresi (residual) | Shapiro-Wilk, diagram Q-Q, histogram | Uji nonparametrik atau transformasi |
| **Homogenitas varians** | Uji-t independen, ANOVA | Uji Levene | Uji-t Welch, ANOVA Welch |
| **Linearitas** | Korelasi Pearson, regresi | Diagram pencar | Transformasi atau korelasi Spearman |
| **Homoskedastisitas** | Regresi | Diagram sebar residual, uji Glejser | Transformasi atau galat baku robust |
| **Multikolinearitas** | Regresi berganda | VIF dan tolerance | Gabungkan atau keluarkan prediktor yang sangat berkorelasi |
| **Independensi observasi** | Hampir semua uji | Rancangan penelitian | Analisis khusus (misalnya model bertingkat) |

### 5.1 Normalitas: apa yang sebenarnya diuji

Tiga hal penting dari Field (2018) dan Ghasemi dan Zahediasl (2012):

1. **Yang perlu berdistribusi normal bukan selalu "seluruh data".** Untuk uji-t independen dan ANOVA, yang diperiksa adalah distribusi tiap kelompok. Untuk uji-t berpasangan, distribusi **selisih**. Untuk regresi, **residual**.
2. Uji **Shapiro-Wilk** (Shapiro & Wilk, 1965) sering direkomendasikan untuk sampel kecil, dan dipakai bersama pemeriksaan grafik seperti diagram Q-Q.
3. Pada sampel besar, uji formal dapat menyatakan penyimpangan yang sangat kecil sebagai signifikan, padahal tidak berdampak pada uji. Pada sampel kecil, uji formal berdaya rendah sehingga mungkin gagal mendeteksi penyimpangan. Karena itu, gunakan uji dan grafik bersama-sama.

Aturan keputusannya: **p lebih besar dari 0,05 berarti tidak ada bukti pelanggaran normalitas** (bukan bukti bahwa data pasti normal).

### 5.2 Homogenitas varians

Uji **Levene** (Levene, 1960) menguji apakah varians kelompok sama. Bila p lebih besar dari 0,05, homogenitas diterima. Bila p 0,05 atau kurang, varians berbeda dan Anda sebaiknya memakai uji-t **Welch** (Welch, 1947). Delacre, Lakens, dan Leys (2017) bahkan berargumen bahwa Welch layak menjadi pilihan bawaan pada uji-t dua kelompok independen.

---

## 6. Logika Uji Hipotesis

| Istilah | Pengertian |
|---|---|
| **Hipotesis nol (H0)** | Tidak ada perbedaan, hubungan, atau pengaruh pada populasi |
| **Hipotesis alternatif (H1)** | Ada perbedaan, hubungan, atau pengaruh |
| **Taraf signifikansi (α)** | Batas yang ditetapkan sebelumnya, lazimnya 0,05 |
| **Nilai p** | Peluang memperoleh hasil sekurang-kurangnya seekstrem yang teramati bila H0 benar |
| **Keputusan** | p kurang dari atau sama dengan α: tolak H0. p lebih besar dari α: gagal menolak H0 |

Pernyataan American Statistical Association tentang nilai p (Wasserstein & Lazar, 2016) menegaskan beberapa hal yang perlu diingat mahasiswa:

- nilai p **bukan** peluang bahwa hipotesis nol benar;
- nilai p **tidak** mengukur besarnya efek atau pentingnya hasil;
- kesimpulan ilmiah sebaiknya tidak bergantung semata-mata pada apakah p melewati ambang tertentu.

Konsekuensinya: "**gagal menolak H0**" tidak sama dengan "H0 terbukti benar", dan "**signifikan**" tidak sama dengan "besar" atau "penting". Karena itu, laporkan juga ukuran efek dan selang kepercayaan (bagian 10).

---

## 7. Contoh Lengkap: Kuasi-Eksperimen Dua Kelompok

> **Kasus (ilustratif).**
> **Judul:** *Pengaruh Metode Demonstrasi terhadap Kemampuan Praktik Salat Siswa Kelas V (Kuasi-Eksperimen).*
> **Desain:** *nonequivalent control group*. Kelompok eksperimen (metode demonstrasi) dan kelompok kontrol (ceramah), masing-masing 12 siswa. Kedua kelompok diberi pretest dan posttest dengan rubrik skor 0 sampai 100.
> **Rumusan masalah:** Apakah terdapat perbedaan kemampuan praktik salat antara kelompok eksperimen dan kelompok kontrol setelah perlakuan?

### 7.1 Data dan statistik deskriptif

| Kelompok | Pretest: rata-rata (SD) | Posttest: rata-rata (SD) | Rentang posttest |
|---|---|---|---|
| Eksperimen (n = 12) | 59,08 (6,11) | 75,25 (8,67) | 63 sampai 88 |
| Kontrol (n = 12) | 58,50 (5,02) | 67,50 (4,01) | 60 sampai 75 |

### 7.2 Kesetaraan kemampuan awal

Pada kuasi-eksperimen, kelompok tidak diacak, sehingga perlu diperiksa apakah kemampuan awalnya setara. Uji-t independen pada pretest menghasilkan **t(22) = 0,26, p = 0,801, d = 0,10**. Tidak ada bukti perbedaan kemampuan awal, dan ukuran efeknya sangat kecil. Perlu diingat bahwa p yang besar tidak membuktikan bahwa kedua kelompok setara, hanya bahwa tidak ada bukti perbedaan. Karena itu, ukuran efek dan, bila perlu, ANCOVA (bagian 7.6) menjadi pelengkap.

### 7.3 Uji asumsi

| Uji | Data | Statistik | p | Keputusan |
|---|---|---|---|---|
| Shapiro-Wilk | Eksperimen, pretest | W = 0,979 | 0,981 | Normal |
| Shapiro-Wilk | Eksperimen, posttest | W = 0,919 | 0,279 | Normal |
| Shapiro-Wilk | Kontrol, pretest | W = 0,946 | 0,572 | Normal |
| Shapiro-Wilk | Kontrol, posttest | W = 0,967 | 0,883 | Normal |
| Levene | Pretest | F(1, 22) = 0,54 | 0,471 | Varians homogen |
| Levene | **Posttest** | **F(1, 22) = 11,40** | **0,003** | **Varians tidak homogen** |

Normalitas terpenuhi pada semua kelompok, tetapi **homogenitas varians posttest terlanggar**. Simpangan baku eksperimen (8,67) hampir dua kali lipat kontrol (4,01). Karena itu, uji yang tepat untuk posttest adalah **uji-t Welch**, bukan uji-t biasa.

### 7.4 Uji hipotesis

**H0:** rata-rata posttest kelompok eksperimen sama dengan kelompok kontrol. **H1:** kedua rata-rata berbeda (uji dua sisi).

| Uji | Hasil |
|---|---|
| **Uji-t Welch** | t(15,51) = 2,81, p = 0,013 |
| Selisih rata-rata | 7,75 poin (75,25 dikurangi 67,50) |
| Selang kepercayaan 95% selisih | 1,89 sampai 13,61 |
| Ukuran efek (d Cohen, SD gabungan) | 1,15 |
| Sebagai pembanding: Mann-Whitney U | U = 111, p = 0,026 |

**Interpretasi.** p kurang dari 0,05, sehingga H0 ditolak. Kelompok eksperimen memperoleh rata-rata posttest yang lebih tinggi sekitar 7,75 poin daripada kelompok kontrol. Selang kepercayaannya cukup lebar (1,89 sampai 13,61) karena sampel kecil, sehingga besar efek yang sebenarnya belum dapat ditentukan dengan teliti. Uji nonparametrik memberi kesimpulan searah, yang menambah keyakinan bahwa hasil ini tidak bergantung pada pilihan uji.

> **Jebakan yang sering terjadi di SPSS.**
> Pada keluaran *Independent Samples Test*, SPSS menampilkan dua baris: *Equal variances assumed* dan *Equal variances not assumed*.
> Lihat dahulu kolom **Sig.** pada uji Levene. Bila lebih besar dari 0,05, baca baris pertama. Bila 0,05 atau kurang, baca baris kedua (uji Welch).
> Pada contoh ini, Levene p = 0,003, sehingga yang dibaca adalah baris kedua.

### 7.5 Peningkatan di dalam kelompok tidak cukup

Uji-t berpasangan (pretest ke posttest) menghasilkan:

| Kelompok | Rata-rata peningkatan (SD) | Hasil uji |
|---|---|---|
| Eksperimen | 16,17 (4,82) | t(11) = 11,62, p kurang dari 0,001 |
| Kontrol | 9,00 (3,16) | t(11) = 9,86, p kurang dari 0,001 |

**Kedua kelompok meningkat secara signifikan.** Artinya, peningkatan pada kelompok eksperimen saja tidak membuktikan bahwa metode demonstrasi berpengaruh, karena kelompok kontrol pun meningkat (karena belajar biasa, kematangan, atau efek pengulangan tes). Yang menjadi bukti adalah **perbandingan antar kelompok**, yaitu apakah peningkatan kelompok eksperimen lebih besar. Inilah kesalahan yang sering terjadi ketika mahasiswa hanya melaporkan uji-t berpasangan pada kelompok eksperimen.

### 7.6 Alternatif: ANCOVA

ANCOVA membandingkan posttest kedua kelompok setelah **mengendalikan skor pretest** secara statistik. Pendekatan ini sering lebih tepat pada kuasi-eksperimen karena mengoreksi selisih kemampuan awal dan biasanya menghasilkan estimasi yang lebih presisi.

| Hasil | Nilai |
|---|---|
| Rata-rata posttest terkoreksi | Eksperimen 74,97; kontrol 67,78 |
| Selisih terkoreksi | 7,19 (galat baku 1,70) |
| Uji | t(21) = 4,22, p kurang dari 0,001 |
| Kesamaan kemiringan (interaksi kelompok dan pretest) | F(1, 20) = 3,51, p = 0,076 |

Perhatikan dua hal. **Pertama**, galat baku turun dari 2,76 (uji-t Welch) menjadi 1,70, sebab pretest menjelaskan sebagian keragaman posttest. **Kedua**, ANCOVA mengasumsikan kemiringan garis regresi pretest-posttest sama pada kedua kelompok. Uji asumsi ini menghasilkan p = 0,076. Nilai itu tidak signifikan pada 0,05, tetapi dengan hanya 12 siswa per kelompok ujinya berdaya rendah, sehingga **tidak boleh dianggap bukti bahwa asumsi terpenuhi**. Pada penelitian nyata dengan sampel lebih besar, asumsi ini dapat diperiksa lebih meyakinkan.

### 7.7 Menuliskan hasil di Bab IV

> *"Uji normalitas Shapiro-Wilk menunjukkan data pretest dan posttest kedua kelompok berdistribusi normal (semua p lebih besar dari 0,05). Uji Levene menunjukkan varians posttest kedua kelompok tidak homogen, F(1, 22) = 11,40, p = 0,003, sehingga digunakan uji-t Welch. Rata-rata posttest kelompok eksperimen (M = 75,25; SD = 8,67) lebih tinggi daripada kelompok kontrol (M = 67,50; SD = 4,01), t(15,51) = 2,81, p = 0,013, dengan selisih rata-rata 7,75 poin (selang kepercayaan 95% [1,89; 13,61]; d = 1,15). Dengan demikian, H0 ditolak. Hasil ini didukung uji Mann-Whitney (U = 111, p = 0,026). Namun, karena rancangan kuasi-eksperimen tidak mengacak subjek dan sampel relatif kecil, hasil ini perlu ditafsirkan dengan hati-hati dan belum dapat digeneralisasi di luar kelompok yang diteliti."*

Perhatikan bahasanya: "**H0 ditolak**", "**didukung**", dan "**perlu ditafsirkan dengan hati-hati**", bukan "membuktikan" atau "pasti".

---

## 8. Korelasi dan Regresi

> **Kasus (ilustratif).**
> **Judul:** *Hubungan Motivasi Belajar dengan Hasil Belajar PAI Siswa Kelas V.*
> Data dari 30 siswa. Pengukuran motivasi (X) dan hasil belajar (Y). Diagram pencar menunjukkan pola linear tanpa pencilan mencolok.

### 8.1 Korelasi Pearson

Misalkan r = 0,62 dengan n = 30. Uji signifikansinya memakai:

```
t = r × √(n − 2) / √(1 − r²)
t = 0,62 × √28 / √(1 − 0,3844) = 4,18   (db = 28)
```

| Hasil | Nilai |
|---|---|
| Koefisien korelasi | r = 0,62 |
| Uji | t(28) = 4,18, p = 0,0003 (p kurang dari 0,001) |
| Selang kepercayaan 95% untuk r | 0,33 sampai 0,80 |
| Koefisien determinasi | r² = 0,384 (sekitar 38% variasi Y terkait dengan variasi X) |

**Interpretasi.** Terdapat hubungan positif yang signifikan antara motivasi dan hasil belajar, dengan kekuatan kuat menurut pedoman yang lazim di Indonesia (Sugiyono, 2019). Namun selang kepercayaannya lebar, 0,33 sampai 0,80, sehingga kekuatan hubungan yang sebenarnya belum pasti. Ingat pula bahwa **korelasi bukan kausalitas**.

### 8.2 Regresi linear sederhana

Bila tujuannya menaksir kontribusi X terhadap Y, gunakan regresi. Misalkan rata-rata dan SD data: X (rata-rata 45, SD 6) dan Y (rata-rata 70, SD 8).

| Komponen | Nilai | Cara memperoleh |
|---|---|---|
| Kemiringan (B) | 0,83 (galat baku 0,20) | B = r × (SD Y / SD X) = 0,62 × 8 / 6 |
| Konstanta | 32,80 | 70 − 0,827 × 45 |
| Beta terstandar | 0,62 | Sama dengan r pada regresi sederhana |
| Uji model | F(1, 28) = 17,48, p kurang dari 0,001 | F = t² |
| R² | 0,384 | r² |

Persamaan regresi: **Ŷ = 32,80 + 0,83X**. Setiap kenaikan 1 poin skor motivasi berkaitan dengan kenaikan sekitar 0,83 poin hasil belajar. Untuk siswa dengan skor motivasi 50, hasil belajar yang diprediksi adalah 32,80 + 0,827 × 50 ≈ 74,1.

**Prasyarat regresi** (Field, 2018): hubungan linear, residual berdistribusi normal, varians residual konstan (homoskedastisitas), dan independensi galat. Pada regresi berganda, periksa juga **multikolinearitas** dengan VIF. Nilai VIF di atas 10 (atau tolerance di bawah 0,1) sering dipakai sebagai tanda masalah (Ghozali, 2018).

**Peringatan.** Regresi pada data survei menaksir kontribusi statistik, bukan membuktikan sebab-akibat. Kesimpulan kausal bergantung pada rancangan penelitian dan dasar teori, sebagaimana dibahas pada [Part 2](/blog/metodologi-02-jenis-penelitian).

---

## 9. ANOVA dan Chi-Square

### 9.1 ANOVA satu arah: tiga kelompok

> **Kasus (ilustratif).**
> **Judul:** *Perbedaan Hasil Belajar PAI Berdasarkan Jenis Media yang Digunakan.*
> Tiga kelompok (video, gambar, teks), masing-masing 8 siswa.

| Kelompok | n | Rata-rata | SD |
|---|---|---|---|
| Video | 8 | 82,13 | 5,17 |
| Gambar | 8 | 78,13 | 4,19 |
| Teks | 8 | 70,88 | 3,14 |

**Asumsi:** Shapiro-Wilk tiap kelompok p = 0,822; 0,903; 0,865 (normal). Levene F(2, 21) = 1,05, p = 0,369 (varians homogen).

**Hasil:** **F(2, 21) = 14,43, p kurang dari 0,001, η² = 0,58.** Ada perbedaan rata-rata di antara ketiga kelompok, dan sekitar 58% variasi hasil belajar berkaitan dengan jenis media (pada sampel ini).

ANOVA hanya menyatakan bahwa **ada perbedaan di suatu tempat**. Untuk mengetahui kelompok mana yang berbeda, dipakai **uji lanjut** (*post hoc*), misalnya Tukey:

| Perbandingan | Selisih rata-rata | p |
|---|---|---|
| Video dan gambar | 4,00 | 0,168 |
| Video dan teks | 11,25 | kurang dari 0,001 |
| Gambar dan teks | 7,25 | 0,007 |

**Interpretasi.** Kelompok teks berbeda dari kelompok video maupun gambar, sedangkan video dan gambar tidak berbeda secara signifikan pada sampel ini. Jangan menjalankan banyak uji-t terpisah sebagai pengganti ANOVA dan uji lanjut, karena kesalahan tipe I menumpuk.

### 9.2 Chi-square: dua variabel kategori

> **Kasus (ilustratif).**
> **Pertanyaan:** Apakah ketuntasan belajar berkaitan dengan penggunaan media digital secara rutin? Data dari 60 siswa.

| | Tuntas | Belum tuntas | Jumlah |
|---|---|---|---|
| **Memakai media digital rutin** | 18 | 12 | 30 |
| **Tidak rutin** | 9 | 21 | 30 |

**Asumsi:** frekuensi harapan terkecil 13,5, lebih besar dari 5, sehingga syarat terpenuhi. **Hasil:** χ²(1) = 5,46, p = 0,020, φ = 0,30. Proporsi tuntas 60% pada kelompok rutin dan 30% pada kelompok tidak rutin. Terdapat hubungan yang signifikan dengan ukuran efek sedang.

---

## 10. Ukuran Efek dan Selang Kepercayaan

Nilai p hanya menjawab "adakah bukti", bukan "seberapa besar". Lakens (2013) menekankan pentingnya melaporkan ukuran efek untuk memungkinkan interpretasi praktis dan perbandingan lintas penelitian.

| Ukuran | Dipakai untuk | Patokan kasar (Cohen, 1988) |
|---|---|---|
| **d Cohen** | Selisih dua rata-rata | 0,2 kecil; 0,5 sedang; 0,8 besar |
| **r** | Hubungan dua variabel | 0,1 kecil; 0,3 sedang; 0,5 besar |
| **η²** (eta kuadrat) | Proporsi variasi pada ANOVA | 0,01 kecil; 0,06 sedang; 0,14 besar |
| **φ** atau **V Cramér** | Hubungan pada data kategori | Mengikuti patokan serupa r |

Patokan Cohen adalah **pedoman kasar**, bukan aturan. Nilai "besar" atau "kecil" yang bermakna bergantung pada konteks. Selisih 7,75 poin pada rubrik 0 sampai 100 perlu ditafsirkan berdasarkan makna praktisnya bagi pembelajaran.

**Selang kepercayaan** memberi tahu ketidakpastian estimasi. Pada contoh 7.4, selisih 7,75 dengan selang 1,89 sampai 13,61 menunjukkan bahwa efek yang sebenarnya bisa cukup kecil maupun cukup besar. Ini informasi yang tidak tampak dari p saja.

Perlu diingat pula bahwa **rumus ukuran efek bisa berbeda**. Pada contoh 7.4, memakai SD gabungan menghasilkan d = 1,15, sedangkan memakai SD kelompok kontrol (delta Glass) menghasilkan 1,93. Karena itu, selalu sebutkan rumus yang dipakai.

---

## 11. Menjawab Rumusan Masalah dan Menulis Kesimpulan

Setiap rumusan masalah harus memiliki jawaban yang jelas.

| Rumusan masalah | Analisis | Bentuk jawaban |
|---|---|---|
| Seberapa tinggi tingkat motivasi belajar siswa? | Statistik deskriptif dan kategorisasi | "Motivasi belajar berada pada kategori tinggi (M = 52,3), dengan 56,7% siswa pada kategori tinggi dan sangat tinggi." |
| Apakah terdapat perbedaan hasil belajar kelompok A dan B? | Uji-t (atau Welch/Mann-Whitney) | "Terdapat perbedaan signifikan ... t(...) = ..., p = ..., selisih ... [selang kepercayaan]." |
| Apakah terdapat hubungan X dan Y? | Korelasi | "Terdapat hubungan positif kuat, r = 0,62, p kurang dari 0,001." |
| Seberapa besar pengaruh X terhadap Y? | Regresi | "X menyumbang 38,4% variasi Y; setiap kenaikan 1 poin X berkaitan dengan kenaikan 0,83 poin Y." |

**Panduan bahasa kesimpulan:**

- Gunakan **"berdasarkan data pada sampel ini"** dan batasi pada populasi yang diteliti (lihat [Part 3](/blog/metodologi-03-populasi-sampel)).
- Hindari kata **"membuktikan"**. Gunakan "menunjukkan" atau "mendukung".
- Jangan menyimpulkan **kausalitas** dari korelasi atau desain tanpa kontrol.
- Bedakan **signifikan secara statistik** dari **bermakna secara praktis**.
- Sebutkan **keterbatasan**: ukuran sampel, pemilihan subjek, dan asumsi.

---

## 12. Perangkat Lunak dan Langkah Praktis

| Perangkat lunak | Catatan |
|---|---|
| **SPSS** | Banyak dipakai di kampus Indonesia; berlisensi. Rujukan yang umum: Pallant (2020), Field (2018), dan Ghozali (2018) |
| **JASP** dan **jamovi** | Gratis dan terbuka, dengan antarmuka mirip SPSS |
| **R** | Gratis, sangat fleksibel, kurva belajar lebih curam |
| **Microsoft Excel** | Cukup untuk statistik deskriptif dan hitungan sederhana, kurang cocok untuk uji asumsi |

Ketersediaan versi dan lisensi berubah dari waktu ke waktu, jadi periksa yang tersedia di kampus Anda. **Sebutkan nama dan versi perangkat lunak** pada Bab III atau IV.

Pada SPSS versi yang umum, beberapa menu yang berguna adalah:

- **Analyze → Descriptive Statistics → Explore**: statistik deskriptif, uji normalitas Shapiro-Wilk, dan diagram Q-Q.
- **Analyze → Compare Means → Independent-Samples T Test** dan **Paired-Samples T Test**.
- **Analyze → Compare Means → One-Way ANOVA**: ANOVA, Levene, dan uji lanjut.
- **Analyze → Correlate → Bivariate**: korelasi Pearson dan Spearman.
- **Analyze → Regression → Linear**: regresi, termasuk VIF dan diagram residual.

Nama menu dapat sedikit berbeda antarversi. Simpan berkas keluaran (*output*) dan lampirkan tabel pentingnya.

---

## 13. Sepuluh Kesalahan yang Paling Sering Terjadi

1. **Tidak menjalankan uji asumsi**, atau menjalankannya tetapi tidak menindaklanjuti hasilnya.
2. **Menguji normalitas pada seluruh data mentah** padahal seharusnya per kelompok, pada selisih, atau pada residual.
3. **Membaca baris yang salah pada keluaran uji-t** (mengabaikan hasil Levene).
4. **Hanya melaporkan "Sig. = 0,000"** tanpa statistik uji, derajat bebas, ukuran efek, dan selang kepercayaan.
5. **Menyimpulkan bahwa gagal menolak H0 berarti H0 benar.**
6. **Mengira signifikan berarti besar atau penting.**
7. **Hanya melaporkan uji-t berpasangan pada kelompok eksperimen** dan menganggapnya bukti pengaruh perlakuan.
8. **Memakai banyak uji-t sebagai pengganti ANOVA** untuk tiga kelompok atau lebih.
9. **Menghapus pencilan tanpa alasan** atau tanpa melaporkannya.
10. **Menyimpulkan kausalitas dari korelasi atau survei**, atau menggeneralisasi melebihi populasi yang diteliti.

---

## 14. Latihan

**Soal 1.** Angket 20 butir, skala 1 sampai 5. Rata-rata skor kelompok adalah 54. Tentukan kategorinya menurut pendekatan Azwar (2012).

**Soal 2.** Pada keluaran SPSS untuk uji-t independen, uji Levene menunjukkan Sig. = 0,030. Baris *Equal variances assumed*: Sig. (2-tailed) = 0,040. Baris *Equal variances not assumed*: Sig. (2-tailed) = 0,060. Apa keputusan Anda pada α = 0,05?

**Soal 3.** Sebuah penelitian melaporkan r = 0,30 dengan n = 50. Hitung t, tentukan apakah signifikan (p kira-kira 0,034), dan tafsirkan bersama r².

**Soal 4.** Dua kelompok independen, masing-masing 40 siswa. Shapiro-Wilk kelompok B: p = 0,03. Levene p = 0,40. Bagaimana Anda melanjutkan?

**Jawaban.**

1. Skor minimum = 20, maksimum = 100. μ = (100 + 20) / 2 = 60. σ = (100 − 20) / 6 = 13,33. Batas: μ − 0,5σ = 53,33 dan μ + 0,5σ = 66,67. Skor 54 berada di antara 53,33 dan 66,67, sehingga kategorinya **sedang**.
2. Levene 0,030 (kurang dari 0,05) berarti varians tidak homogen, sehingga baca baris kedua: Sig. = 0,060. Karena 0,060 lebih besar dari 0,05, **gagal menolak H0**: tidak ada bukti perbedaan yang signifikan pada α = 0,05. Baris pertama (0,040) tidak boleh dipakai.
3. t = 0,30 × √48 / √(1 − 0,09) = 2,18 dengan db = 48, p ≈ 0,034, sehingga signifikan. Namun r² = 0,09, artinya hanya sekitar 9% variasi yang terkait. Signifikan secara statistik, tetapi hubungan sedang, sehingga jangan dilebih-lebihkan.
4. Dengan n = 40 per kelompok, uji-t cukup tahan terhadap penyimpangan ringan dari normalitas, tetapi p = 0,03 patut diperhatikan. Periksa diagram Q-Q dan histogram kelompok B (adakah pencilan atau kemencengan kuat). Praktik yang baik adalah menjalankan uji-t (varians homogen) dan **Mann-Whitney sebagai pembanding**, lalu melaporkan keduanya. Bila keduanya sepakat, kesimpulan lebih meyakinkan.

---

## Pertanyaan yang Sering Diajukan

**Kalau data tidak normal, apakah harus pakai uji nonparametrik?**
Tidak selalu. Pertimbangkan ukuran sampel, bentuk penyimpangan (grafik), dan keberadaan pencilan. Pada sampel cukup besar, uji parametrik relatif tahan. Praktik yang baik adalah melaporkan uji parametrik dan nonparametrik sebagai pembanding bila ragu.

**Apakah uji normalitas wajib untuk semua penelitian?**
Hanya untuk uji yang mensyaratkannya, dan pada data yang tepat (per kelompok, selisih, atau residual). Tetapi selalu jelaskan dasar pilihan uji Anda.

**Sampel saya kecil. Masih boleh dianalisis?**
Boleh, tetapi hati-hati: uji asumsi berdaya rendah, selang kepercayaan lebar, dan generalisasi terbatas. Laporkan keterbatasan itu secara jujur.

**Harus pakai SPSS?**
Tidak. Yang penting adalah ketepatan pemilihan uji dan pelaporan. JASP, jamovi, dan R dapat menghasilkan analisis yang sama. Ikuti ketentuan kampus bila ada.

---

## Rangkuman

- Analisis harus **menjawab rumusan masalah**, dengan alur: persiapan data, deskriptif, uji asumsi, uji hipotesis, ukuran efek, lalu interpretasi.
- **Bersihkan data** sebelum analisis. Balik skor butir negatif, dan jangan menghapus pencilan tanpa alasan.
- **Kategorisasi skor** dapat memakai μ dan σ ideal (Azwar, 2012). Tetapkan sebelum melihat hasil.
- **Pilih uji** berdasarkan tujuan, skala data, jumlah kelompok, dan **terpenuhinya asumsi**.
- **Uji asumsi** pada data yang tepat: normalitas per kelompok, selisih, atau residual; homogenitas dengan Levene. Bila varians tidak homogen, pakai **uji-t Welch**.
- **Peningkatan di dalam satu kelompok tidak membuktikan pengaruh perlakuan**. Bandingkan antar kelompok, dan pertimbangkan ANCOVA.
- **Nilai p bukan segalanya.** Laporkan **ukuran efek dan selang kepercayaan**, dan hindari kesimpulan yang melampaui data.

## Pertanyaan Refleksi

1. Rumusan masalah mana pada skripsi Anda yang dijawab oleh statistik deskriptif, uji beda, korelasi, atau regresi?
2. Apakah asumsi setiap uji yang Anda rencanakan sudah Anda periksa, dan apa rencana bila terlanggar?
3. Selain nilai p, informasi apa yang Anda laporkan agar pembaca memahami besar dan ketidakpastian temuan Anda?
4. Apakah bahasa kesimpulan Anda sudah sesuai dengan kekuatan rancangan penelitian Anda?

## Artikel Lanjutan

Bagian berikutnya, **Part 6**, membahas **analisis data kualitatif**: kondensasi data, pengodean, kategori, tema, dan cara menyusun temuan yang meyakinkan.

Bagian sebelumnya: [Part 1: Apa Itu Metodologi Penelitian?](/blog/metodologi-01-pengertian), [Part 2: Jenis-Jenis Penelitian](/blog/metodologi-02-jenis-penelitian), [Part 3: Populasi, Sampel, dan Teknik Sampling](/blog/metodologi-03-populasi-sampel), dan [Part 4: Teknik Pengumpulan Data dan Instrumen](/blog/metodologi-04-pengumpulan-data-instrumen).

---

## Daftar Pustaka

Azwar, S. (2012). *Penyusunan skala psikologi* (Edisi ke-2). Yogyakarta: Pustaka Pelajar.

Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2nd ed.). Hillsdale, NJ: Lawrence Erlbaum Associates.

Delacre, M., Lakens, D., & Leys, C. (2017). Why psychologists should by default use Welch's t-test instead of Student's t-test. *International Review of Social Psychology, 30*(1), 92–101.

Field, A. (2018). *Discovering statistics using IBM SPSS Statistics* (5th ed.). London: SAGE Publications.

Ghasemi, A., & Zahediasl, S. (2012). Normality tests for statistical analysis: A guide for non-statisticians. *International Journal of Endocrinology and Metabolism, 10*(2), 486–489.

Ghozali, I. (2018). *Aplikasi analisis multivariate dengan program IBM SPSS 25* (Edisi ke-9). Semarang: Badan Penerbit Universitas Diponegoro.

Lakens, D. (2013). Calculating and reporting effect sizes to facilitate cumulative science: A practical primer for t-tests and ANOVAs. *Frontiers in Psychology, 4*, Article 863.

Levene, H. (1960). Robust tests for equality of variances. In I. Olkin, S. G. Ghurye, W. Hoeffding, W. G. Madow, & H. B. Mann (Eds.), *Contributions to probability and statistics* (pp. 278–292). Stanford, CA: Stanford University Press.

Norman, G. (2010). Likert scales, levels of measurement and the "laws" of statistics. *Advances in Health Sciences Education, 15*(5), 625–632.

Pallant, J. (2020). *SPSS survival manual* (7th ed.). Maidenhead: McGraw-Hill Education.

Shapiro, S. S., & Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). *Biometrika, 52*(3–4), 591–611.

Sugiyono. (2019). *Metode penelitian kuantitatif, kualitatif, dan R&D*. Bandung: Alfabeta.

Wasserstein, R. L., & Lazar, N. A. (2016). The ASA statement on p-values: Context, process, and purpose. *The American Statistician, 70*(2), 129–133.

Welch, B. L. (1947). The generalization of "Student's" problem when several different population variances are involved. *Biometrika, 34*(1–2), 28–35.
