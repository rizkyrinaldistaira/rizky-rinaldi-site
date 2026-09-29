---
title: 'Populasi, Sampel, dan Teknik Sampling: Panduan Lengkap dengan Contoh Kasus'
description: 'Memahami populasi, sampel, teknik probability dan non-probability sampling, rumus Slovin dan keterbatasannya, serta penentuan informan pada penelitian kualitatif.'
pubDate: '2026-09-29'
series: 'Belajar Metodologi Penelitian'
seriesPart: 3
seriesDescription: 'Panduan lengkap memahami metodologi penelitian ilmiah dari dasar hingga mahir. Cocok untuk mahasiswa yang sedang menyusun skripsi atau tesis.'
seriesIcon: 'fa-flask'
category: 'Metodologi Penelitian'
tags: ['sampling', 'populasi', 'sampel', 'Slovin', 'skripsi']
---

## Pendahuluan

Perhatikan potongan Bab III skripsi berikut, yang sangat mirip dengan yang sering ditemui di ruang bimbingan:

> *"Populasi dalam penelitian ini adalah seluruh siswa SD Negeri 21 Medan. Sampel ditentukan dengan rumus Slovin dengan tingkat kesalahan 5%, sehingga diperoleh 15 responden, yang seluruhnya diambil dari siswa kelas V."*

Ada tiga masalah di dalam dua kalimat itu. Populasinya seluruh sekolah, tetapi sampelnya hanya dari satu kelas. Rumus Slovin dipakai tanpa menjelaskan mengapa dan untuk siapa. Dan jumlah 15 itu tidak menjelaskan bagaimana responden dipilih. Ketiganya berujung pada satu pertanyaan yang tidak bisa dijawab: **kesimpulan penelitian ini berlaku untuk siapa?**

Artikel ini adalah Part 3 dari seri *Belajar Metodologi Penelitian*. Setelah membahas hakikat metodologi (Part 1) dan jenis-jenis penelitian (Part 2), kita masuk ke salah satu bagian yang paling sering keliru: bagaimana menentukan **siapa yang diteliti** dan **berapa banyak**. Bagian ini mencakup populasi, sampel, teknik sampling, ukuran sampel, rumus Slovin beserta keterbatasannya, dan penentuan informan pada penelitian kualitatif.

> **Catatan tentang contoh.** Nama sekolah, jumlah siswa, dan data pada contoh di artikel ini bersifat ilustrasi untuk keperluan pembelajaran, bukan data penelitian yang sebenarnya.

**Setelah membaca artikel ini, Anda diharapkan mampu:**

- membedakan populasi target, populasi terjangkau, dan sampel;
- memilih teknik sampling probabilitas maupun nonprobabilitas yang sesuai dengan tujuan penelitian;
- menghitung ukuran sampel dengan beberapa rumus dan memahami batasannya;
- menjelaskan mengapa rumus Slovin tidak berlaku untuk semua penelitian;
- menentukan informan dan kecukupan data pada penelitian kualitatif;
- menuliskan bagian populasi dan sampel di Bab III secara konsisten.

---

## 1. Konsep Dasar

### 1.1 Istilah-istilah kunci

| Istilah | Pengertian | Contoh |
|---|---|---|
| **Populasi** | Wilayah generalisasi yang terdiri atas objek atau subjek dengan kualitas dan karakteristik tertentu yang ditetapkan peneliti untuk dipelajari dan ditarik kesimpulannya (Sugiyono, 2019) | Seluruh siswa kelas V SD Negeri 21 Medan |
| **Sampel** | Bagian dari jumlah dan karakteristik yang dimiliki populasi (Sugiyono, 2019) | 50 siswa kelas V yang terpilih |
| **Unit analisis** | Satuan yang datanya dianalisis | Siswa, guru, kelas, atau sekolah |
| **Kerangka sampel** (*sampling frame*) | Daftar lengkap anggota populasi tempat sampel ditarik | Daftar absensi atau data pokok siswa kelas V |
| **Parameter dan statistik** | Parameter adalah nilai sebenarnya pada populasi; statistik adalah nilai yang dihitung dari sampel untuk menaksir parameter | Rata-rata motivasi seluruh siswa (parameter) dan rata-rata motivasi sampel (statistik) |
| **Representatif** | Sampel mencerminkan karakteristik populasi | Proporsi laki-laki dan perempuan pada sampel mirip populasi |

Sugiyono (2019) menegaskan bahwa populasi bukan sekadar jumlah orang atau benda, tetapi mencakup seluruh karakteristik yang dimiliki subjek atau objek itu. Populasi juga tidak selalu manusia. Ia bisa berupa sekolah, kelas, dokumen, atau benda lain yang menjadi objek penelitian.

### 1.2 Populasi target dan populasi terjangkau

Fraenkel, Wallen, dan Hyun (2012) membedakan dua tingkat populasi:

- **Populasi target** adalah kelompok besar yang ingin peneliti jadikan dasar generalisasi.
- **Populasi terjangkau** (*accessible population*) adalah kelompok yang benar-benar dapat dijangkau peneliti. Sampel ditarik dari sini.

Semakin lebar jarak antara populasi target dan populasi terjangkau, semakin hati-hati peneliti harus dalam menggeneralisasi.

> **Contoh Kasus.** Seorang mahasiswa ingin menyimpulkan tentang "siswa SD di Kota Medan" (populasi target). Karena keterbatasan waktu dan izin, ia hanya dapat mengakses satu sekolah (populasi terjangkau). Kesimpulannya tidak boleh berbunyi "siswa SD di Kota Medan memiliki motivasi tinggi", karena sampelnya tidak ditarik dari populasi sebesar itu. Rumusan yang jujur adalah "siswa kelas V di SD Negeri 21 Medan".

### 1.3 Kriteria inklusi dan eksklusi

Populasi perlu ditulis dengan karakteristik yang jelas. Kriteria **inklusi** menyatakan siapa yang termasuk, dan kriteria **eksklusi** menyatakan siapa yang dikeluarkan.

> **Contoh Kasus.** Populasi: siswa kelas V SD Negeri 21 Medan tahun ajaran berjalan.
> **Inklusi:** terdaftar aktif sebagai siswa kelas V dan hadir pada saat pengambilan data.
> **Eksklusi:** siswa yang sedang sakit lama atau pindah sekolah selama penelitian.

### 1.4 Mengapa "sampel harus berasal dari populasi"

Ini adalah prinsip yang dilanggar pada contoh di pendahuluan. **Sampel hanya dapat mewakili populasi tempat ia ditarik.** Jika populasi didefinisikan sebagai seluruh siswa sekolah, sampel harus ditarik dari seluruh tingkat kelas. Jika penelitian dibatasi pada kelas V sejak awal, populasinya adalah siswa kelas V, dan sampel dari kelas V menjadi konsisten. Kesalahan ini sudah dibahas dari sisi konsistensi pada [Part 2](/blog/metodologi-02-jenis-penelitian), dan di sini kita membahasnya dari sisi teknis.

---

## 2. Mengapa Perlu Sampling, dan Kapan Tidak Perlu?

Penelitian dengan sampel dipakai karena meneliti seluruh populasi sering tidak praktis, baik dari segi waktu, biaya, maupun tenaga. Namun sampel yang baik memungkinkan peneliti menarik kesimpulan tentang populasi dengan tingkat ketelitian yang dapat diperkirakan (Cohen, Manion, & Morrison, 2018).

**Sampling tidak selalu diperlukan.** Jika populasi kecil, seluruh anggota dapat diteliti. Cara ini disebut **total sampling**, atau **sampling jenuh** dalam istilah Sugiyono (2019), atau **sensus**. Di Indonesia, pedoman praktis yang sering dirujuk berasal dari Arikunto (2013): jika subjek kurang dari 100, lebih baik diambil semuanya sehingga penelitiannya menjadi penelitian populasi. Jika lebih besar, dapat diambil sebagian, misalnya 10–15% atau 20–25%. Perlu dipahami bahwa ini **pedoman praktis**, bukan hasil perhitungan statistik. Alasan ilmiah tetap perlu dijelaskan.

> **Contoh Kasus.** Populasi: siswa kelas V terdiri atas dua rombongan belajar, kelas VA 29 siswa dan kelas VB 29 siswa, total 58 siswa. Karena jumlahnya kecil, peneliti memilih **total sampling**: seluruh 58 siswa menjadi sampel. Tidak ada ketidakpastian akibat penarikan sampel, dan kesimpulan berlaku untuk populasi yang sama, yaitu siswa kelas V.

---

## 3. Teknik Sampling Probabilitas (*Probability Sampling*)

Pada teknik ini, setiap anggota populasi memiliki peluang yang diketahui untuk terpilih. Keunggulannya, peneliti dapat memperkirakan kesalahan sampling dan menggeneralisasi hasil secara lebih dapat dipertanggungjawabkan (Cohen et al., 2018). Syarat praktisnya adalah tersedianya kerangka sampel yang lengkap.

### 3.1 Simple random sampling (acak sederhana)

Setiap anggota populasi punya peluang sama. Pemilihan dapat memakai undian, tabel angka acak, atau fungsi acak di perangkat lunak.

> **Contoh Kasus.** Populasi 120 guru PAI dengan daftar nama lengkap. Peneliti memberi nomor 1 sampai 120, lalu mengacak dengan fungsi `=RAND()` di lembar kerja dan mengambil 30 nomor teratas.
> **Cocok bila:** populasi relatif homogen dan kerangka sampel tersedia.
> **Keterbatasan:** tidak menjamin subkelompok penting terwakili.

### 3.2 Systematic sampling (sistematis)

Peneliti memilih setiap anggota ke-*k* dari daftar, dengan titik awal yang dipilih acak. Interval dihitung dengan `k = N / n`.

> **Contoh Kasus.** N = 120 guru dan sampel yang dikehendaki n = 30, sehingga k = 120 / 30 = 4. Titik awal acak jatuh pada nomor 3, maka sampelnya adalah nomor 3, 7, 11, 15, dan seterusnya sampai 30 orang.
> **Catatan klasifikasi.** Sugiyono (2019) memasukkan sampling sistematis ke kelompok nonprobabilitas, sedangkan banyak buku teks metodologi lain memandangnya sebagai teknik probabilitas selama titik awalnya dipilih acak. Karena itu, tuliskan cara pengambilannya secara eksplisit dan sebutkan rujukan yang dipakai.
> **Hati-hati:** jika daftar memiliki pola berkala yang selaras dengan interval, hasilnya bisa bias.

### 3.3 Stratified random sampling (acak berstrata)

Populasi dibagi menjadi lapisan (strata) berdasarkan karakteristik penting, lalu sampel diambil secara acak dari setiap lapisan. Ada dua bentuk: **proporsional**, yaitu jumlah sampel tiap strata sebanding dengan ukuran strata, dan **disproporsional**, yaitu jumlah sampel tidak sebanding, misalnya karena ada strata yang sangat kecil tetapi penting.

> **Contoh Kasus.** Penelitian tentang literasi digital guru PAI di satu kecamatan. Populasi 240 guru: 120 di SD, 60 di MI, dan 60 di SMP. Misalkan ukuran sampel total ditetapkan 148 (lihat tabel Krejcie dan Morgan pada bagian 5). Alokasi proporsional:
>
> | Strata | Populasi | Perhitungan | Sampel |
> |---|---|---|---|
> | SD | 120 | 120/240 × 148 | 74 |
> | MI | 60 | 60/240 × 148 | 37 |
> | SMP | 60 | 60/240 × 148 | 37 |
> | **Total** | **240** | | **148** |
>
> Dalam tiap strata, guru dipilih secara acak. Dengan cara ini, ketiga jenjang terwakili sesuai proporsinya.

### 3.4 Cluster sampling (klaster atau area)

Peneliti memilih **kelompok** (klaster) secara acak, bukan individu. Setelah itu, seluruh anggota klaster terpilih, atau sebagian dari mereka, diteliti. Teknik ini cocok ketika daftar individu sulit diperoleh tetapi daftar kelompok tersedia, misalnya sekolah atau kelas.

> **Contoh Kasus.** Sebuah kabupaten memiliki 12 SD negeri. Peneliti mengacak 4 sekolah, lalu meneliti seluruh guru PAI di sekolah terpilih.
> **Keterbatasan:** anggota dalam satu klaster cenderung mirip, sehingga ketelitian per responden dapat lebih rendah dibandingkan acak sederhana pada ukuran yang sama.

---

## 4. Teknik Sampling Nonprobabilitas (*Nonprobability Sampling*)

Pada teknik ini, peluang terpilih tidak diketahui, dan pemilihan bergantung pada pertimbangan peneliti atau kemudahan akses. Konsekuensinya, kesalahan sampling tidak dapat dihitung secara statistik dan generalisasi ke populasi lebih terbatas.

| Teknik | Cara kerja | Cocok untuk | Keterbatasan |
|---|---|---|---|
| **Purposive** | Anggota dipilih berdasarkan kriteria yang ditetapkan peneliti | Penelitian yang membutuhkan subjek dengan karakteristik khusus, terutama kualitatif | Bergantung pada penilaian peneliti; kriteria harus dijelaskan |
| **Convenience/aksidental** | Siapa saja yang mudah dijangkau atau kebetulan ditemui | Studi awal atau eksplorasi | Risiko bias tinggi; hasil sulit digeneralisasi |
| **Kuota** | Jumlah dari tiap kategori ditetapkan, lalu dipenuhi tanpa pengacakan | Ketika proporsi kategori penting tetapi kerangka sampel tidak ada | Pemilihan dalam kategori tidak acak |
| **Snowball** | Partisipan awal merekomendasikan partisipan berikutnya | Kelompok yang sulit dijangkau | Sampel cenderung homogen, mengikuti jejaring partisipan awal |
| **Total/jenuh** | Seluruh populasi dijadikan sampel | Populasi kecil | Tidak praktis untuk populasi besar |

Etikan, Musa, dan Alkassim (2016) membandingkan dua teknik yang sering dipakai mahasiswa. **Convenience sampling** memilih partisipan yang mudah dijangkau, sedangkan **purposive sampling** memilih partisipan berdasarkan pertimbangan peneliti tentang siapa yang paling mampu memberi informasi. Keduanya nonprobabilitas, sehingga temuannya tidak boleh diklaim mewakili populasi secara statistik.

> **Kesalahan yang sering terjadi.** Menulis "teknik sampling yang digunakan adalah purposive sampling" tanpa menyebut kriterianya. Purposive bukan berarti "sesuka peneliti". Kriteria harus dinyatakan dan dijustifikasi, misalnya "guru PAI yang telah mengajar minimal lima tahun dan menggunakan media digital dalam pembelajaran".

---

## 5. Menentukan Ukuran Sampel Kuantitatif

Tidak ada satu rumus yang cocok untuk semua penelitian. Pilihan rumus bergantung pada tujuan, jenis analisis, dan ketersediaan informasi tentang populasi.

### 5.1 Rumus Slovin

Rumus yang sangat populer di skripsi Indonesia:

```
n = N / (1 + N × e²)

n = ukuran sampel
N = ukuran populasi
e = batas toleransi kesalahan (misalnya 0,05 untuk 5%)
```

> **Contoh perhitungan.** N = 250 siswa.
> - Dengan e = 5%: n = 250 / (1 + 250 × 0,0025) = 250 / 1,625 = 153,8, dibulatkan menjadi **154**.
> - Dengan e = 10%: n = 250 / (1 + 250 × 0,01) = 250 / 3,5 = 71,4, dibulatkan menjadi **72**.

Rumus ini praktis, tetapi perlu dipahami keterbatasannya. Tejada dan Punzalan (2012) menyoroti bahwa rumus Slovin sering dipakai secara keliru, terutama tanpa memperhatikan asumsi dan tujuan estimasi, serta dengan batas kesalahan yang dipilih sembarangan. Dari sisi matematika, rumus ini dapat dipahami sebagai bentuk sederhana dari rumus estimasi proporsi dengan asumsi variasi maksimum (proporsi 0,5) dan tingkat kepercayaan sekitar 95% (Cochran, 1977). Artinya, Slovin dirancang untuk **mengestimasi proporsi pada survei dengan sampel acak**. Rumus ini tidak dirancang untuk semua desain.

**Kapan Slovin tidak tepat:**

1. **Penelitian kualitatif.** Informan tidak ditentukan dengan rumus statistik (lihat bagian 6).
2. **Eksperimen dan kuasi-eksperimen.** Ukuran sampel lebih tepat ditentukan lewat analisis daya uji (*power analysis*).
3. **Populasi sangat kecil.** Hasilnya nyaris sama dengan jumlah populasi. Contoh: N = 30 dengan e = 5% menghasilkan n = 27,9 atau sekitar 28, praktis hampir seluruh populasi. Untuk kasus seperti ini, total sampling lebih masuk akal.
4. **Teknik nonprobabilitas.** Rumus mengandaikan pengambilan acak. Memakainya lalu memilih responden secara purposif tidak konsisten.
5. **Populasi yang belum jelas.** Rumus membutuhkan N yang diketahui.

> **Kembali ke kasus di pendahuluan.** Jika populasi kelas V berjumlah 58 siswa, Slovin dengan e = 5% menghasilkan 50,7 (sekitar 51) dan dengan e = 10% menghasilkan 36,7 (sekitar 37). Untuk populasi sekecil itu, banyak peneliti memilih total sampling. Yang tidak dapat dilakukan adalah mendefinisikan populasi sebagai seluruh siswa sekolah, menghitung sampel dengan Slovin dari angka itu, lalu mengambilnya hanya dari kelas V.

### 5.2 Tabel Krejcie dan Morgan

Krejcie dan Morgan (1970) menyusun tabel ukuran sampel berdasarkan populasi tertentu, dengan asumsi tingkat kepercayaan 95%, proporsi 0,5, dan derajat ketelitian 0,05. Beberapa nilai dari tabel tersebut:

| Populasi (N) | Sampel (n) |
|---|---|
| 30 | 28 |
| 50 | 44 |
| 100 | 80 |
| 250 | 152 |
| 500 | 217 |
| 1.000 | 278 |

Tabel ini praktis, dan hasilnya untuk populasi 250 (152) berdekatan dengan Slovin 5% (154).

### 5.3 Rumus Cochran

Cochran (1977) memberikan pendekatan untuk estimasi proporsi. Untuk populasi besar atau tak terhingga:

```
n₀ = (z² × p × q) / e²
```

Dengan z = 1,96 (kepercayaan 95%), p = 0,5, q = 0,5, dan e = 0,05, diperoleh n₀ = 384,16, dibulatkan menjadi 385. Untuk populasi terbatas dilakukan koreksi:

```
n = n₀ / (1 + (n₀ − 1) / N)
```

> **Contoh perhitungan.** N = 250: n = 384,16 / (1 + 383,16 / 250) = 384,16 / 2,5326 = 151,7, dibulatkan menjadi **152**. Hasil ini sama dengan tabel Krejcie dan Morgan, dan tidak berjauhan dengan Slovin 5%.

### 5.4 Pedoman minimal dan analisis daya uji

Untuk penelitian korelasional, komparatif, dan eksperimen, tujuannya adalah **mendeteksi hubungan atau perbedaan** yang ada, dan bukan mengestimasi proporsi. Karena itu, pendekatan yang lebih tepat adalah **analisis daya uji** (*power analysis*), yang menghitung jumlah subjek yang diperlukan berdasarkan ukuran efek yang diharapkan, taraf signifikansi, dan daya uji (Cohen, 1988). Perangkat lunak seperti G*Power (Faul, Erdfelder, Lang, & Buchner, 2007) dapat membantu perhitungan ini.

Sebagai pegangan kasar, Fraenkel et al. (2012) menyebut jumlah minimal yang sering dikutip, misalnya sekitar 30 subjek per kelompok pada penelitian komparatif dan eksperimen. Angka seperti ini adalah **batas bawah kasar**, bukan target ideal, dan bukan pengganti perhitungan daya uji.

### 5.5 Ringkasan pemilihan pendekatan

| Situasi | Pendekatan yang lazim |
|---|---|
| Populasi kecil (kurang dari 100), kuantitatif | Total sampling (Arikunto, 2013) |
| Survei dengan populasi diketahui dan sampel acak | Krejcie dan Morgan, Cochran, atau Slovin dengan justifikasi |
| Korelasional, komparatif, eksperimen | Analisis daya uji dan pedoman minimal per kelompok |
| Kualitatif | Kecukupan data dan kejenuhan informasi, tanpa rumus |
| PTK | Subjek tindakan adalah kelas yang diberi tindakan; tidak memerlukan sampling statistik |

---

## 6. Sampling pada Penelitian Kualitatif

### 6.1 Logika yang berbeda

Penelitian kualitatif tidak bertujuan menggeneralisasi ke populasi secara statistik. Tujuannya memperoleh pemahaman mendalam. Karena itu, peneliti memilih **partisipan atau informan yang kaya informasi** (Patton, 2015). Istilah "populasi" dan "sampel" dalam pengertian statistik tidak dipakai. Sugiyono (2019) menyebut objek penelitian kualitatif sebagai situasi sosial yang terdiri atas tempat, pelaku, dan aktivitas.

Sebagai gantinya, kualitas temuan dijaga melalui kredibilitas dan **transferabilitas**, yaitu sejauh mana temuan dapat diterapkan pada konteks lain yang serupa (Lincoln & Guba, 1985). Untuk itu, peneliti perlu menggambarkan konteks dan partisipan dengan rinci.

### 6.2 Strategi memilih informan

Patton (2015) menguraikan banyak strategi purposive. Beberapa yang paling berguna bagi mahasiswa:

| Strategi | Ide dasar | Contoh |
|---|---|---|
| **Kasus tipikal** | Memilih kasus yang mewakili keadaan umum | Guru PAI dengan pengalaman mengajar rata-rata |
| **Variasi maksimum** | Memilih partisipan yang sangat beragam untuk menangkap rentang pengalaman | Guru dari sekolah negeri, swasta, dan madrasah |
| **Kriteria** | Semua partisipan memenuhi kriteria tertentu | Guru yang telah memakai media digital minimal satu tahun |
| **Kasus kritis** | Kasus yang sangat menentukan atau bermakna khusus | Sekolah pertama yang menjalankan program literasi Al-Qur'an |
| **Snowball** | Rekomendasi berantai dari partisipan | Guru yang direkomendasikan rekan sejawat sebagai praktisi baik |

Pada *grounded theory*, dikenal **theoretical sampling**, yaitu pemilihan sumber data berikutnya berdasarkan konsep yang sedang berkembang dari analisis (Glaser & Strauss, 1967).

### 6.3 Berapa jumlah informan? Konsep kejenuhan

Tidak ada angka yang berlaku universal. Penentu utamanya adalah **kecukupan data** dan **kejenuhan informasi** (*saturasi*), yaitu titik ketika data tambahan tidak lagi memunculkan tema atau informasi baru yang berarti. Guest, Bunce, dan Johnson (2006) menemukan dalam studi mereka bahwa sebagian besar tema sudah muncul dalam dua belas wawancara pertama pada kelompok yang relatif homogen. Kajian sistematis atas studi empiris tentang saturasi oleh Hennink dan Kaiser (2022) juga menunjukkan bahwa saturasi dapat dicapai dengan jumlah yang relatif kecil pada penelitian dengan tujuan terfokus dan partisipan yang relatif homogen, tetapi bergantung pada tujuan penelitian, keragaman partisipan, dan kedalaman wawancara. Karena itu, angka pada studi tersebut hanya gambaran, bukan aturan.

> **Contoh Kasus (fenomenologi).**
> **Judul:** *Pengalaman Guru PAI dalam Menghadapi Tantangan Pembelajaran pada Era Digital.*
> **Kriteria informan:** guru PAI SD/MI, mengajar minimal tiga tahun, dan telah menggunakan media digital dalam pembelajaran.
> **Pemilihan:** purposive dengan kriteria di atas, ditambah snowball untuk menjangkau guru yang direkomendasikan rekan.
> **Jumlah:** ditentukan oleh kecukupan data. Peneliti berhenti menambah informan ketika wawancara baru tidak lagi memunculkan tema baru, dan mencatat alasan ini dalam laporan.
>
> **Kesalahan yang perlu dihindari:** menulis "jumlah informan ditentukan dengan rumus Slovin". Rumus itu tidak relevan untuk penelitian yang tidak bertujuan mengestimasi parameter populasi.

> **Contoh Kasus (studi kasus).**
> **Judul:** *Implementasi Program Literasi Al-Qur'an di SD Negeri 21 Medan: Studi Kasus.*
> Kasusnya adalah program di satu sekolah. Informan dipilih karena keterlibatan mereka dalam program.
>
> | Kelompok informan | Alasan dipilih | Data |
> |---|---|---|
> | Kepala sekolah | Pengambil kebijakan program | Wawancara |
> | Guru PAI | Pelaksana utama | Wawancara, observasi |
> | Koordinator program | Mengetahui perencanaan dan evaluasi | Wawancara, dokumen |
> | Siswa peserta | Merasakan langsung pelaksanaan | Wawancara kelompok kecil |

---

## 7. Sampling pada Eksperimen dan PTK

### 7.1 Pengacakan sampel tidak sama dengan pengacakan penugasan

Dua hal yang sering tertukar:

- ***Random sampling*** (pengacakan pengambilan sampel) menyangkut **siapa yang masuk ke penelitian**. Ini berkaitan dengan kemampuan menggeneralisasi (validitas eksternal).
- ***Random assignment*** (pengacakan penugasan) menyangkut **siapa yang masuk ke kelompok mana**. Ini berkaitan dengan kemampuan menyimpulkan sebab-akibat (validitas internal) (Shadish, Cook, & Campbell, 2002).

Penelitian dapat memiliki salah satunya, keduanya, atau tidak sama sekali.

### 7.2 Situasi umum di sekolah

Di sekolah, siswa biasanya berada dalam kelas yang sudah terbentuk sehingga tidak dapat diacak satu per satu. Pada kuasi-eksperimen, peneliti memakai **kelas utuh**. Meskipun demikian, peneliti tetap dapat meningkatkan mutu, misalnya dengan **mengundi** kelas mana yang menjadi kelompok eksperimen dan mana yang kontrol, lalu menunjukkan bahwa kemampuan awal kedua kelas setara.

> **Contoh Kasus.** Populasi: siswa kelas V SD Negeri 21 Medan, terdiri atas kelas VA dan VB. Peneliti mengundi: kelas VA menjadi kelompok eksperimen dan kelas VB menjadi kelompok kontrol. Pretest menunjukkan skor awal kedua kelas tidak berbeda bermakna. Pengundian ini bukan acak pada tingkat individu, sehingga desainnya tetap kuasi-eksperimen, tetapi kualitasnya lebih baik daripada memilih kelas menurut kemudahan.

### 7.3 Pada PTK

Penelitian Tindakan Kelas berfokus pada perbaikan praktik di kelas tertentu. Subjeknya adalah kelas yang diberi tindakan (Kemmis, McTaggart, & Nixon, 2014), sehingga tidak diperlukan rumus penentuan sampel. Yang perlu dijelaskan adalah karakteristik kelas dan alasan pemilihannya sebagai subjek tindakan.

---

## 8. Cara Menulis Populasi dan Sampel di Bab III

### 8.1 Penelitian kuantitatif

Uraian yang baik menjawab lima pertanyaan berurutan: siapa populasinya, berapa jumlahnya, bagaimana sampel diambil, berapa ukurannya, dan mengapa dipilih demikian.

> **Contoh.**
> *"Populasi dalam penelitian ini adalah seluruh siswa kelas V SD Negeri 21 Medan tahun ajaran berjalan yang berjumlah 58 siswa (kelas VA 29 siswa dan kelas VB 29 siswa). Mengingat jumlah populasi kurang dari 100, seluruh anggota populasi dijadikan sampel dengan teknik total sampling (Arikunto, 2013). Dengan demikian, sampel penelitian berjumlah 58 siswa."*

Bandingkan dengan contoh di pendahuluan. Versi ini konsisten: populasi, teknik, jumlah, dan alasan saling mendukung.

### 8.2 Penelitian kualitatif

> **Contoh.**
> *"Informan penelitian dipilih secara purposif berdasarkan kriteria: (1) guru PAI SD/MI, (2) memiliki pengalaman mengajar minimal tiga tahun, dan (3) menggunakan media digital dalam pembelajaran. Informan tambahan diperoleh melalui rekomendasi informan sebelumnya (snowball). Penambahan informan dihentikan ketika data yang diperoleh tidak lagi memunculkan informasi baru (kejenuhan data)."*

---

## 9. Empat Kasus Ringkas: Dari Judul ke Rancangan Pengambilan Subjek

| Judul (ilustratif) | Populasi/informan | Teknik | Ukuran | Alasan |
|---|---|---|---|---|
| *Tingkat Motivasi Belajar PAI Siswa Kelas V SDN 21 Medan* | Seluruh siswa kelas V (58 siswa) | Total sampling | 58 | Populasi kecil dan penelitian populasi lebih tepat |
| *Tingkat Literasi Digital Guru PAI di Kecamatan X* | 240 guru PAI (SD 120, MI 60, SMP 60) | Stratified proportional random sampling | 148 | Populasi bertingkat; ukuran mengacu tabel Krejcie dan Morgan |
| *Pengaruh Metode Demonstrasi terhadap Kemampuan Praktik Salat Kelas V* (kuasi-eksperimen) | Siswa kelas V (kelas VA dan VB) | Kelas utuh, penetapan eksperimen dan kontrol dengan undian | Seluruh siswa kedua kelas | Kelas tidak dapat diacak per individu |
| *Pengalaman Guru PAI Menghadapi Tantangan Era Digital* (fenomenologi) | Guru PAI dengan kriteria tertentu | Purposive dan snowball | Sampai data jenuh | Tujuan adalah kedalaman makna, bukan generalisasi |

---

## 10. Sepuluh Kesalahan yang Paling Sering Terjadi

1. **Populasi tidak sesuai batas penelitian.** Judul menyebut kelas V, populasi ditulis seluruh siswa sekolah.
2. **Sampel tidak berasal dari populasi yang didefinisikan.**
3. **Memakai Slovin pada penelitian kualitatif.**
4. **Memakai Slovin pada populasi yang sangat kecil**, sehingga hasilnya hampir sama dengan populasi.
5. **Menghitung ukuran sampel secara probabilistik, lalu memilih responden secara nonprobabilitas**, tanpa menyadari inkonsistensinya.
6. **Menulis "purposive sampling" tanpa kriteria yang jelas.**
7. **Memakai convenience sampling tetapi menggeneralisasi ke populasi luas.**
8. **Mencampuradukkan populasi dengan lokasi.** Sekolah adalah lokasi, sedangkan populasi adalah siapa atau apa yang diteliti di sekolah itu.
9. **Tidak menjelaskan alasan pemilihan ukuran sampel.** Rumus yang disebut tanpa alasan tidak menjelaskan apa-apa.
10. **Kesimpulan yang melampaui populasi.** Sampel dari satu kelas tidak dapat menghasilkan kesimpulan tentang seluruh sekolah.

---

## 11. Latihan

**Soal 1.** Sebuah penelitian survei tentang kedisiplinan beribadah melibatkan populasi 80 guru PAI di satu kabupaten. Teknik dan ukuran sampel apa yang masuk akal?

**Soal 2.** Seorang mahasiswa fenomenologi menulis: "Jumlah informan ditentukan dengan rumus Slovin dari populasi guru PAI se-kecamatan." Apa yang keliru?

**Soal 3.** Populasi siswa kelas VII terdiri atas tiga kelas dengan 30 siswa per kelas. Peneliti ingin melakukan kuasi-eksperimen dengan dua kelompok. Bagaimana sebaiknya subjek ditetapkan?

**Jawaban.**

1. Karena populasinya 80 (kurang dari 100), pilihan yang wajar adalah **total sampling** (n = 80) dengan rujukan Arikunto (2013). Alternatifnya, jika ingin memakai rumus, Slovin dengan e = 5% menghasilkan 80 / (1 + 80 × 0,0025) = 66,7, atau sekitar 67. Namun untuk populasi sekecil itu, selisihnya kecil dan total sampling lebih sederhana serta menghilangkan ketidakpastian akibat sampling.
2. Ada dua hal yang keliru. Pertama, fenomenologi tidak bertujuan mengestimasi parameter populasi, sehingga rumus statistik tidak relevan. Kedua, informan fenomenologi dipilih berdasarkan pengalaman terhadap fenomena, bukan dari seluruh guru se-kecamatan. Perbaikannya: pilih informan secara purposif dengan kriteria yang jelas, lalu tentukan jumlah berdasarkan kecukupan data.
3. Dua kelas dipilih sebagai kelas eksperimen dan kontrol. Peneliti dapat mengundi kelas mana yang menjadi eksperimen dan mana yang kontrol, atau memilih dua kelas yang kemampuan awalnya setara berdasarkan pretest atau nilai sebelumnya. Populasinya tetap harus ditulis konsisten. Jika populasinya seluruh siswa kelas VII (90 siswa) dan hanya dua kelas yang dipakai, jelaskan bahwa dua kelas itu dipilih sebagai kelas utuh dan batasi generalisasinya.

---

## Rangkuman

- **Populasi** ditetapkan sesuai batas penelitian, dan **sampel hanya dapat mewakili populasi tempat ia ditarik**.
- Bedakan **populasi target** dan **populasi terjangkau**, dan batasi kesimpulan sesuai populasi yang benar-benar dijangkau.
- **Total sampling** cocok untuk populasi kecil. **Probability sampling** (acak sederhana, sistematis, berstrata, klaster) memungkinkan generalisasi yang lebih kuat. **Nonprobability sampling** (purposive, convenience, kuota, snowball) memerlukan justifikasi dan pembatasan generalisasi.
- **Ukuran sampel** ditentukan sesuai tujuan: Slovin, Krejcie dan Morgan, atau Cochran untuk survei; analisis daya uji untuk korelasional dan eksperimen.
- **Slovin bukan rumus wajib skripsi.** Ia tidak tepat untuk penelitian kualitatif, eksperimen, populasi sangat kecil, atau teknik nonprobabilitas (Tejada & Punzalan, 2012).
- Pada penelitian **kualitatif**, informan dipilih purposif berdasarkan kriteria dan jumlahnya ditentukan oleh **kecukupan dan kejenuhan data**.
- Bedakan **random sampling** dan **random assignment**.

## Pertanyaan Refleksi

1. Tuliskan populasi penelitian Anda (atau mahasiswa bimbingan Anda) dalam satu kalimat yang mencantumkan karakteristik, lokasi, dan periode. Apakah batasnya sama dengan batas pada judul?
2. Jika teknik sampling Anda nonprobabilitas, kesimpulan apa yang dapat dan tidak dapat Anda tarik?
3. Dalam penelitian kualitatif Anda, apa kriteria informan, dan bagaimana Anda akan tahu bahwa data sudah cukup?
4. Apakah alasan Anda memilih ukuran sampel tertentu dapat dijelaskan tanpa hanya menyebut nama rumus?

## Artikel Lanjutan

Bagian berikutnya membahas **teknik pengumpulan data dan instrumen penelitian**, yaitu kapan menggunakan angket, tes, wawancara, observasi, dan dokumentasi, serta apa yang sebenarnya harus disusun mahasiswa: kisi-kisi, indikator, pedoman wawancara, dan lembar observasi.

Untuk membaca bagian sebelumnya: [Part 1: Apa Itu Metodologi Penelitian?](/blog/metodologi-01-pengertian) dan [Part 2: Jenis-Jenis Penelitian dan Cara Menentukannya](/blog/metodologi-02-jenis-penelitian).

---

## Daftar Pustaka

Arikunto, S. (2013). *Prosedur penelitian: Suatu pendekatan praktik* (Edisi revisi). Jakarta: Rineka Cipta.

Cochran, W. G. (1977). *Sampling techniques* (3rd ed.). New York: John Wiley & Sons.

Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2nd ed.). Hillsdale, NJ: Lawrence Erlbaum Associates.

Cohen, L., Manion, L., & Morrison, K. (2018). *Research methods in education* (8th ed.). London: Routledge.

Etikan, I., Musa, S. A., & Alkassim, R. S. (2016). Comparison of convenience sampling and purposive sampling. *American Journal of Theoretical and Applied Statistics, 5*(1), 1–4.

Faul, F., Erdfelder, E., Lang, A.-G., & Buchner, A. (2007). G*Power 3: A flexible statistical power analysis program for the social, behavioral, and biomedical sciences. *Behavior Research Methods, 39*(2), 175–191.

Fraenkel, J. R., Wallen, N. E., & Hyun, H. H. (2012). *How to design and evaluate research in education* (8th ed.). New York: McGraw-Hill.

Glaser, B. G., & Strauss, A. L. (1967). *The discovery of grounded theory: Strategies for qualitative research*. Chicago: Aldine.

Guest, G., Bunce, A., & Johnson, L. (2006). How many interviews are enough? An experiment with data saturation and variability. *Field Methods, 18*(1), 59–82.

Hennink, M., & Kaiser, B. N. (2022). Sample sizes for saturation in qualitative research: A systematic review of empirical tests. *Social Science & Medicine, 292*, 114523.

Kemmis, S., McTaggart, R., & Nixon, R. (2014). *The action research planner: Doing critical participatory action research*. Singapore: Springer.

Krejcie, R. V., & Morgan, D. W. (1970). Determining sample size for research activities. *Educational and Psychological Measurement, 30*(3), 607–610.

Lincoln, Y. S., & Guba, E. G. (1985). *Naturalistic inquiry*. Beverly Hills, CA: SAGE Publications.

Patton, M. Q. (2015). *Qualitative research and evaluation methods* (4th ed.). Thousand Oaks, CA: SAGE Publications.

Shadish, W. R., Cook, T. D., & Campbell, D. T. (2002). *Experimental and quasi-experimental designs for generalized causal inference*. Boston: Houghton Mifflin.

Sugiyono. (2019). *Metode penelitian kuantitatif, kualitatif, dan R&D*. Bandung: Alfabeta.

Tejada, J. J., & Punzalan, J. R. B. (2012). On the misuse of Slovin's formula. *The Philippine Statistician, 61*(1), 129–136.
