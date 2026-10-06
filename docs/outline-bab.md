# Kerangka Kurikulum Mini — Python Dasar SMK Kelas X RPL

> **Target peserta:** Siswa kelas X jurusan RPL, pemula total.
> **Runtime:** Pyodide (browser) — tanpa `input()` interaktif, tanpa library eksternal.
> **Cakupan:** 5 bab, belajar mandiri via web.

---

## Bab 1 — Pengenalan Python: `print()`, Komentar, dan Membaca Error

### a. Capaian Belajar

1. **Menuliskan** program pertama menggunakan `print()` dengan teks statis satu baris maupun beberapa baris.
2. **Menjelaskan** fungsi komentar (`#`) sebagai catatan untuk manusia yang diabaikan Python.
3. **Membedakan** kode yang benar dan kode yang menghasilkan error berdasarkan pesan error yang muncul.
4. **Memperbaiki** kesalahan penulisan sederhana (`SyntaxError`, `NameError`) dengan membaca petunjuk dari pesan error.

### b. Prasyarat

- Tidak ada — ini bab pertama.
- Siswa cukup bisa membuka browser dan mengetik di area editor kode.

### c. Urutan Subtopik

1. **Apa itu Python?** — bahasa pemrograman yang populer, mudah dibaca, dan dipakai di banyak bidang. Kenapa kita belajar Python.
2. **Mengenal lingkungan kerja** — editor Pyodide di browser: area kode (tempat mengetik), tombol Run, area output (tempat hasil muncul).
3. **Perintah `print()`** — mencetak teks ke layar. Tanda kutip ganda `"..."` atau tunggal `'...'`. Mencetak beberapa baris dengan `\n` atau beberapa `print()`. Parameter `sep` dan `end`.
4. **Komentar `#`** — menulis catatan di kode yang tidak dieksekusi. Kegunaan: menjelaskan kode, menonaktifkan baris sementara.
5. **Membaca pesan error** — cara membaca `SyntaxError` dan `NameError`. Baris mana yang salah? Apa petunjuknya? Latihan memperbaiki kode yang sengaja dibuat salah.

### d. Konsep yang BOLEH Dipakai vs. BELUM BOLEH Dipakai

**✅ BOLEH dipakai di Bab 1:**

- `print("...")`
- String literal dengan tanda kutip ganda `"..."` atau tunggal `'...'`
- Escape character `\n` (baris baru)
- Parameter `sep` dan `end` di `print()`
- Komentar satu baris `#`

**❌ BELUM BOLEH dipakai di Bab 1:**

- Variabel (belum diperkenalkan)
- `input()` (belum diperkenalkan)
- Operator aritmatika (`+`, `-`, `*`, `/`)
- Percabangan (`if`, `elif`, `else`)
- Perulangan (`for`, `while`)
- Fungsi buatan sendiri (`def`)
- Tipe data selain string literal
- f-string

### e. 3 Miskonsepsi Umum Pemula

1. **Lupa tanda kutip pada teks** — Siswa menulis `print(Halo Dunia)` tanpa tanda kutip. Python menganggap `Halo` dan `Dunia` adalah nama variabel yang belum ada, sehingga muncul `NameError`. Solusi: teks selalu dibungkus tanda kutip.
2. **Mengira bisa menulis perintah bahasa Indonesia** — Siswa menulis `cetak("Halo")` atau `tampilkan "Halo"` karena mengira Python paham bahasa Indonesia. Solusi: perintah Python sudah baku dalam bahasa Inggris.
3. **Kurung atau tanda kutip tidak berpasangan** — Siswa menulis `print("Halo Dunia` (kutip penutup hilang) atau `print("Halo Dunia"` (kurung tutup hilang). Muncul `SyntaxError` yang pesannya membingungkan. Solusi: biasakan cek pasangan kurung dan kutip.

### f. Analogi Kehidupan Siswa SMK

> **`print()` itu seperti speaker pengumuman di sekolah.**
>
> Kamu (programmer) menulis naskah pengumuman di kertas. Lalu kamu serahkan ke petugas piket yang membacakannya lewat speaker (`print()`). Seluruh siswa di kelas (layar output) mendengar apa yang dibacakan. Kalau naskahnya salah ketik, speaker tetap baca apa adanya — jadi kamu harus teliti sebelum menyerahkan naskah.
>
> Komentar `#` itu seperti catatan kecil di pinggir naskah yang ditulis pakai pensil: "ini untuk pengumuman besok, jangan dibaca sekarang." Petugas piket mengabaikan catatan itu.

### g. 3 Tantangan Koding Bertingkat

**⭐ Mudah — Kartu Identitas**

Cetak kartu identitas siswa dengan format berikut (isi nama, kelas, jurusan bebas):

```
Nama   : Andi Pratama
Kelas  : X RPL 1
Jurusan: Rekayasa Perangkat Lunak
```

Output yang diharapkan:

```
Nama   : Andi Pratama
Kelas  : X RPL 1
Jurusan: Rekayasa Perangkat Lunak
```

**⭐⭐ Sedang — Struk Kantin**

Cetak struk pembelian kantin dengan rapi. Gunakan `\n` atau beberapa `print()`. Minimal 3 item.

Output yang diharapkan:

```
===== STRUK KANTIN =====
Nasi Goreng    Rp 12.000
Es Teh         Rp  5.000
Gorengan       Rp  3.000
========================
```

**⭐⭐⭐ Agak Sulit — Pola Bintang**

Cetak pola segitiga bintang 5 baris hanya menggunakan beberapa perintah `print()` (belum boleh pakai perulangan).

Output yang diharapkan:

```
*
**
***
****
*****
```

### h. 3 Jenis Soal Kuis

1. **Prediksi output** — Diberikan kode, siswa menebak apa yang tercetak di layar.
   - Contoh: `print("SMK", "Bisa", "Hebat", sep="-")` → siswa menjawab `SMK-Bisa-Hebat`.
2. **Temukan dan perbaiki kesalahan** — Diberikan kode yang error, siswa menunjuk baris yang salah dan memperbaikinya.
   - Contoh: `print("Selamat Pagi)` → kutip penutup hilang.
3. **Susun potongan kode** — Beberapa baris `print()` diacak urutannya. Siswa menyusun ulang agar output sesuai target yang ditentukan.
   - Contoh: susun 3 baris `print()` agar membentuk format undangan rapat OSIS.

### i. Estimasi Durasi Belajar Mandiri di Web

| Kegiatan | Durasi |
|----------|--------|
| Membaca materi + mencoba contoh | 20 menit |
| Mengerjakan tantangan koding | 20 menit |
| Mengerjakan kuis | 10 menit |
| **Total** | **± 50 menit** |

---

## Bab 2 — Variabel & Tipe Data

### a. Capaian Belajar

1. **Membuat** variabel dengan nama yang deskriptif dan mengisinya dengan nilai berbagai tipe data.
2. **Menjelaskan** perbedaan tipe data `int`, `float`, `str`, dan `bool` beserta contoh masing-masing.
3. **Mengecek** tipe data menggunakan `type()` dan menafsirkan hasilnya di output.
4. **Memperbaiki** kesalahan terkait penamaan variabel yang tidak valid dan pencampuran tipe data yang tidak kompatibel.

### b. Prasyarat

- Mampu menggunakan `print()` untuk mencetak teks ke layar (Bab 1).
- Mampu membaca pesan error dasar: `SyntaxError`, `NameError` (Bab 1).
- Memahami fungsi komentar `#` (Bab 1).

### c. Urutan Subtopik

1. **Apa itu variabel?** — Tempat menyimpan data yang bisa dipakai ulang. Cara membuat variabel dengan operator `=` (penugasan). Nilai bisa diganti kapan saja.
2. **Aturan penamaan variabel** — Boleh: huruf, angka (bukan di awal), underscore. Tidak boleh: diawali angka, pakai spasi, pakai kata kunci Python (`if`, `for`, `print`, dll.). Konvensi `snake_case`.
3. **Tipe data dasar** — `int` (bilangan bulat), `float` (bilangan desimal), `str` (teks dalam tanda kutip), `bool` (`True`/`False`). Cara mengenali masing-masing.
4. **Mengecek dan mengonversi tipe data** — `type()` untuk mengecek. `int()`, `float()`, `str()` untuk konversi antar tipe. Kapan konversi diperlukan.
5. **Menampilkan variabel di `print()`** — Menggunakan koma di `print()`: `print("Nama:", nama)`. Pengenalan f-string: `print(f"Nama: {nama}")`. Perbedaan keduanya.

### d. Konsep yang BOLEH Dipakai vs. BELUM BOLEH Dipakai

**✅ BOLEH dipakai di Bab 2:**

- Semua yang sudah dipelajari di Bab 1 (`print()`, komentar, string literal)
- Variabel dan operator penugasan `=`
- Tipe data: `int`, `float`, `str`, `bool`
- `type()` untuk mengecek tipe
- Konversi tipe: `int()`, `float()`, `str()`
- f-string dasar: `f"teks {variabel}"`
- Operator `+` hanya untuk demonstrasi penggabungan string (`"Halo" + " Dunia"`)

**❌ BELUM BOLEH dipakai di Bab 2:**

- `input()` (diperkenalkan di Bab 3)
- Operator aritmatika lengkap (`-`, `*`, `/`, `//`, `%`, `**`)
- Operator perbandingan (`==`, `!=`, `>`, `<`)
- Percabangan (`if`, `elif`, `else`)
- Perulangan (`for`, `while`)
- List, tuple, dictionary
- Fungsi buatan sendiri (`def`)
- Slicing string (`nama[0:3]`)
- f-string dengan ekspresi kompleks

### e. 3 Miskonsepsi Umum Pemula

1. **Mengira `=` artinya "sama dengan"** — Siswa dari pelajaran matematika terbiasa membaca `=` sebagai kesamaan. Di Python, `=` adalah operator penugasan: "simpan nilai di sebelah kanan ke variabel di sebelah kiri." Perbandingan "sama dengan" pakai `==` (dibahas di bab selanjutnya).
2. **Menggabung string dengan angka langsung** — Siswa menulis `"Umur saya " + 16` dan kaget mendapat `TypeError`. Python tidak otomatis mengonversi angka ke teks. Solusi: konversi dulu dengan `str(16)` atau pakai f-string.
3. **Nama variabel diawali angka atau pakai spasi** — Siswa menulis `1nama = "Budi"` atau `nama siswa = "Budi"` lalu bingung kenapa error. Aturan: harus diawali huruf atau underscore, tidak boleh ada spasi.

### f. Analogi Kehidupan Siswa SMK

> **Variabel itu seperti kotak loker siswa di sekolah.**
>
> Setiap loker punya label di pintunya (nama variabel, misal `loker_andi`). Di dalam loker bisa disimpan berbagai barang (nilai variabel). Kamu bisa buka loker, ambil isinya, bahkan ganti isinya kapan saja — tapi label di pintu tetap.
>
> Tipe data adalah jenis barang yang disimpan:
> - `int` = buku tulis (benda yang bisa dihitung utuh: 1, 2, 3)
> - `float` = botol air minum yang isinya bisa setengah (1.5 liter)
> - `str` = surat atau catatan (teks tertulis)
> - `bool` = saklar lampu loker (hanya dua keadaan: nyala `True` atau mati `False`)

### g. 3 Tantangan Koding Bertingkat

**⭐ Mudah — Data Diri Siswa**

Buat variabel `nama`, `kelas`, dan `jurusan`. Isi dengan datamu sendiri. Cetak dalam satu kalimat menggunakan f-string.

```python
nama = "Siti Nurhaliza"
kelas = "X RPL 2"
jurusan = "Rekayasa Perangkat Lunak"
print(f"Halo, nama saya {nama} dari kelas {kelas}, jurusan {jurusan}.")
```

Output yang diharapkan:

```
Halo, nama saya Siti Nurhaliza dari kelas X RPL 2, jurusan Rekayasa Perangkat Lunak.
```

**⭐⭐ Sedang — Struk Jajan**

Simpan harga 3 jajan di variabel bertipe `int`. Hitung total dengan operator `+`. Cetak dalam format struk sederhana.

```python
nasi_goreng = 12000
es_teh = 5000
gorengan = 3000
total = nasi_goreng + es_teh + gorengan
print("=== STRUK JAJAN ===")
print(f"Nasi Goreng : Rp {nasi_goreng}")
print(f"Es Teh      : Rp {es_teh}")
print(f"Gorengan    : Rp {gorengan}")
print(f"TOTAL       : Rp {total}")
```

Output yang diharapkan:

```
=== STRUK JAJAN ===
Nasi Goreng : Rp 12000
Es Teh      : Rp 5000
Gorengan    : Rp 3000
TOTAL       : Rp 20000
```

**⭐⭐⭐ Agak Sulit — Konversi Tipe Data**

Diberikan variabel `nilai_str = "85"` yang bertipekan string. Konversi ke `int`, tambahkan bonus 5 poin, simpan hasilnya di variabel baru. Cetak nilai awal, bonus, nilai akhir, beserta tipe data masing-masing.

```python
nilai_str = "85"
nilai_int = int(nilai_str)
bonus = 5
nilai_akhir = nilai_int + bonus
print(f"Nilai awal  : {nilai_str} (tipe: {type(nilai_str).__name__})")
print(f"Bonus       : {bonus} (tipe: {type(bonus).__name__})")
print(f"Nilai akhir : {nilai_akhir} (tipe: {type(nilai_akhir).__name__})")
```

Output yang diharapkan:

```
Nilai awal  : 85 (tipe: str)
Bonus       : 5 (tipe: int)
Nilai akhir : 90 (tipe: int)
```

### h. 3 Jenis Soal Kuis

1. **Prediksi nilai variabel** — Diberikan beberapa baris kode yang mengubah isi variabel, siswa menentukan nilai akhir yang tercetak.
   - Contoh: `x = 10` lalu `x = 20` lalu `print(x)` → siswa menjawab `20`.
2. **Tentukan tipe data** — Diberikan beberapa nilai, siswa menyebutkan tipe datanya.
   - Contoh: `3.14` → `float`, `"100"` → `str`, `True` → `bool`, `42` → `int`.
3. **Temukan dan perbaiki kesalahan** — Diberikan kode yang error karena penamaan variabel salah atau tipe data tidak cocok. Siswa menunjuk kesalahan dan memperbaiki.
   - Contoh: `2siswa = "Andi"` → nama variabel tidak boleh diawali angka, perbaiki jadi `siswa2 = "Andi"`.

### i. Estimasi Durasi Belajar Mandiri di Web

| Kegiatan | Durasi |
|----------|--------|
| Membaca materi + mencoba contoh | 25 menit |
| Mengerjakan tantangan koding | 25 menit |
| Mengerjakan kuis | 10 menit |
| **Total** | **± 60 menit** |

---

## Bab 3 — Input & Operator

### a. Capaian Belajar

1. **Mensimulasikan** penerimaan input pengguna menggunakan variabel yang di-hardcode (karena Pyodide tidak mendukung `input()` interaktif).
2. **Menggunakan** operator aritmatika (`+`, `-`, `*`, `/`, `//`, `%`, `**`) untuk menyelesaikan perhitungan sehari-hari.
3. **Menjelaskan** urutan operasi (*operator precedence*) dan cara menggunakan tanda kurung untuk mengatur urutan.
4. **Membuat** program kalkulator sederhana yang menerima "input" (variabel) dan mencetak hasil perhitungan yang diformat rapi.

### b. Prasyarat

- Mampu membuat variabel dan memahami tipe data `int`, `float`, `str`, `bool` (Bab 2).
- Mampu mencetak variabel menggunakan `print()` dan f-string (Bab 1–2).
- Mampu mengonversi tipe data dengan `int()`, `float()`, `str()` (Bab 2).

### c. Urutan Subtopik

1. **Konsep input dan simulasinya** — Bagaimana program bisa menerima data dari pengguna. Kenapa di Pyodide kita simulasikan dengan variabel. Contoh: `nama = "Andi"` sebagai pengganti `nama = input("Nama: ")`.
2. **Operator aritmatika dasar** — `+` (tambah), `-` (kurang), `*` (kali), `/` (bagi). Hasil `/` selalu `float`. Contoh perhitungan harga jajan.
3. **Operator aritmatika tambahan** — `//` (pembagian bulat), `%` (modulo / sisa bagi), `**` (pangkat). Contoh penggunaan masing-masing dalam konteks nyata.
4. **Urutan operasi dan tanda kurung** — Precedence: `**` > `*`, `/`, `//`, `%` > `+`, `-`. Tanda kurung `()` untuk memaksa urutan tertentu. Contoh perbedaan `2 + 3 * 4` vs `(2 + 3) * 4`.
5. **Operator perbandingan dan assignment gabungan** — Operator perbandingan (`==`, `!=`, `>`, `<`, `>=`, `<=`) yang menghasilkan `bool`. Assignment gabungan (`+=`, `-=`, `*=`). Pengenalan `round()` untuk pembulatan.

### d. Konsep yang BOLEH Dipakai vs. BELUM BOLEH Dipakai

**✅ BOLEH dipakai di Bab 3:**

- Semua yang sudah dipelajari di Bab 1–2
- Operator aritmatika: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- Operator perbandingan: `==`, `!=`, `>`, `<`, `>=`, `<=` (hasil `bool`)
- Assignment gabungan: `+=`, `-=`, `*=`, `/=`
- `round()` untuk pembulatan
- Simulasi input: `harga = 15000` (variabel di-hardcode)

**❌ BELUM BOLEH dipakai di Bab 3:**

- `input()` interaktif (tidak berjalan di Pyodide)
- Percabangan (`if`, `elif`, `else`)
- Perulangan (`for`, `while`)
- Operator logika `and`, `or`, `not` (boleh disebut sekilas, belum untuk logika gabungan)
- List, tuple, dictionary
- Fungsi buatan sendiri (`def`)
- Import modul apapun

### e. 3 Miskonsepsi Umum Pemula

1. **Bingung perbedaan `/` dan `//`** — Siswa mengira `7 / 2` menghasilkan `3` (seperti matematika SD). Padahal Python 3 menghasilkan `3.5`. Yang menghasilkan `3` adalah `7 // 2` (pembagian bulat). Ini sumber kebingungan yang sangat umum.
2. **Mengira `%` artinya persen** — Siswa dari pelajaran matematika mengira `%` berarti persentase. Padahal di Python, `10 % 3` menghasilkan `1` (sisa pembagian 10 dibagi 3). Operator ini sangat berguna tapi namanya membingungkan.
3. **Lupa konversi tipe saat "input"** — Siswa menulis `harga = "15000"` (dengan kutip, jadi string) lalu langsung `harga * 2`. Hasilnya bukan `30000` melainkan `"1500015000"` (string diulang 2 kali). Solusi: pastikan angka tidak dibungkus tanda kutip, atau konversi dengan `int()`.

### f. Analogi Kehidupan Siswa SMK

> **Operator itu seperti mesin kasir di kantin sekolah.**
>
> Kamu memasukkan harga-harga jajan (input / variabel). Mesin kasir melakukan penjumlahan, perkalian, bahkan menghitung kembalian (operator). Hasilnya dicetak di struk (output).
>
> Urutan pencet tombol penting: kalau kamu mau hitung "harga 2 nasi goreng ditambah es teh", kamu harus kalikan dulu harga nasi goreng dengan 2, baru ditambah harga es teh. Kalau salah urutan, totalnya keliru. Itulah kenapa ada tanda kurung — untuk bilang ke mesin kasir: "hitung ini dulu!"
>
> Modulo `%` itu seperti menghitung sisa kembalian koin: "Aku punya 10 ribu, beli gorengan seharga 3 ribu per buah. Berapa sisa uang setelah beli sebanyak mungkin?" → `10000 % 3000` = `1000`.

### g. 3 Tantangan Koding Bertingkat

**⭐ Mudah — Total Belanja Kantin**

Simulasikan beli 3 jajan dengan harga berbeda. Hitung total dan cetak.

```python
# Simulasi input (harga jajan)
jajan_1 = 8000
jajan_2 = 5000
jajan_3 = 3000

total = jajan_1 + jajan_2 + jajan_3
print(f"Total belanja: Rp {total}")
```

Output yang diharapkan:

```
Total belanja: Rp 16000
```

**⭐⭐ Sedang — Rata-rata Nilai Ujian**

Hitung rata-rata dari 5 nilai ujian, bulatkan ke 1 desimal, cetak dengan format rapi.

```python
# Simulasi input (5 nilai ujian)
mtk = 78
indo = 85
ing = 90
ipa = 72
ips = 88

jumlah = mtk + indo + ing + ipa + ips
rata_rata = round(jumlah / 5, 1)

print("=== RAPOR MINI ===")
print(f"Matematika : {mtk}")
print(f"B. Indonesia: {indo}")
print(f"B. Inggris  : {ing}")
print(f"IPA         : {ipa}")
print(f"IPS         : {ips}")
print(f"Rata-rata   : {rata_rata}")
```

Output yang diharapkan:

```
=== RAPOR MINI ===
Matematika : 78
B. Indonesia: 85
B. Inggris  : 90
IPA         : 72
IPS         : 88
Rata-rata   : 82.6
```

**⭐⭐⭐ Agak Sulit — Konversi Detik**

Konversi total detik menjadi jam, menit, dan detik menggunakan `//` dan `%`.

```python
# Simulasi input
total_detik = 3665

jam = total_detik // 3600
sisa = total_detik % 3600
menit = sisa // 60
detik = sisa % 60

print(f"{total_detik} detik = {jam} jam {menit} menit {detik} detik")
```

Output yang diharapkan:

```
3665 detik = 1 jam 1 menit 5 detik
```

### h. 3 Jenis Soal Kuis

1. **Hitung hasil ekspresi** — Diberikan ekspresi aritmatika, siswa menghitung hasilnya dengan memperhatikan precedence.
   - Contoh: `print(10 + 3 * 2)` → siswa menjawab `16` (bukan `26`).
2. **Pilih operator yang tepat** — Diberikan deskripsi masalah, siswa memilih operator yang paling sesuai.
   - Contoh: "Untuk mengecek apakah angka genap atau ganjil, gunakan operator ..." → jawaban `%`.
3. **Lengkapi kode rumpang** — Kode program dengan bagian kosong, siswa mengisi operator atau ekspresi yang benar.
   - Contoh: `kembalian = uang_bayar ___ total_harga` → siswa mengisi `-`.

### i. Estimasi Durasi Belajar Mandiri di Web

| Kegiatan | Durasi |
|----------|--------|
| Membaca materi + mencoba contoh | 30 menit |
| Mengerjakan tantangan koding | 25 menit |
| Mengerjakan kuis | 10 menit |
| **Total** | **± 65 menit** |

---

## Bab 4 — Percabangan (`if` / `elif` / `else`)

### a. Capaian Belajar

1. **Menjelaskan** konsep percabangan sebagai mekanisme pengambilan keputusan dalam program.
2. **Membuat** program dengan `if`, `if-else`, dan `if-elif-else` untuk menangani minimal 3 kondisi berbeda.
3. **Menggunakan** operator logika `and`, `or`, `not` untuk menggabungkan beberapa kondisi dalam satu ekspresi.
4. **Memperbaiki** kesalahan indentasi dan kesalahan logika (urutan kondisi terbalik, operator salah) pada blok percabangan.

### b. Prasyarat

- Memahami operator perbandingan (`==`, `!=`, `>`, `<`, `>=`, `<=`) dan hasilnya berupa `bool` (Bab 3).
- Mampu membuat variabel, menggunakan operator aritmatika, dan mencetak output dengan f-string (Bab 1–3).
- Mampu membaca pesan error (Bab 1).

### c. Urutan Subtopik

1. **Konsep percabangan** — Program yang bisa "memilih" jalur berdasarkan kondisi. Diagram alur sederhana: kondisi → benar (jalur A) / salah (jalur B).
2. **Struktur `if` sederhana** — Satu kondisi, satu aksi. Pentingnya tanda titik dua `:` dan indentasi 4 spasi. Blok kode yang masuk ke dalam `if`.
3. **Struktur `if-else`** — Dua jalur: jika benar lakukan A, selain itu lakukan B. Kapan pakai `if` saja vs `if-else`.
4. **Struktur `if-elif-else`** — Tiga jalur atau lebih. Pengecekan dari atas ke bawah — begitu satu kondisi cocok, sisanya dilewati. Pentingnya urutan kondisi.
5. **Operator logika dan percabangan bersarang** — `and` (kedua kondisi harus benar), `or` (salah satu cukup), `not` (kebalikan). Nested `if` sederhana (maksimal 2 level). Kapan pakai `and`/`or` vs nested.

### d. Konsep yang BOLEH Dipakai vs. BELUM BOLEH Dipakai

**✅ BOLEH dipakai di Bab 4:**

- Semua yang sudah dipelajari di Bab 1–3
- `if`, `elif`, `else`
- Operator logika: `and`, `or`, `not`
- Indentasi 4 spasi untuk blok kode
- Nested `if` (maksimal 2 level kedalaman)
- Semua operator perbandingan
- Chained comparison: `60 <= nilai < 75`

**❌ BELUM BOLEH dipakai di Bab 4:**

- Perulangan (`for`, `while`)
- List, tuple, dictionary
- Fungsi buatan sendiri (`def`)
- `match-case` (Python 3.10+)
- Ternary expression (`x if cond else y`) — boleh disebut tapi tidak diwajibkan
- List comprehension
- `try` / `except`

### e. 3 Miskonsepsi Umum Pemula

1. **Lupa titik dua `:` di akhir baris `if`** — Siswa menulis `if nilai >= 75` tanpa `:`. Python langsung mengeluh dengan `SyntaxError`. Titik dua ini adalah tanda bahwa baris berikutnya adalah blok kode yang bergantung pada kondisi di atasnya.
2. **Indentasi tidak konsisten** — Siswa mencampur tab dan spasi, atau lupa memberi indentasi pada baris di bawah `if`. Python sangat ketat soal indentasi — ini bukan sekadar estetika, tapi sintaks wajib. Muncul `IndentationError`.
3. **Pakai `=` alih-alih `==` untuk membandingkan** — Siswa menulis `if nilai = 100:` (penugasan) padahal maksudnya `if nilai == 100:` (perbandingan). Ini terasa natural bagi pemula karena di matematika `=` memang berarti "sama dengan".

### f. Analogi Kehidupan Siswa SMK

> **Percabangan itu seperti aturan jadwal piket kelas.**
>
> Wali kelas membuat aturan:
> - "**Kalau** hari ini Senin, yang piket kelompok A."
> - "**Kalau** hari ini Selasa, yang piket kelompok B."
> - "**Kalau** hari ini Rabu, yang piket kelompok C."
> - "**Selain itu**, semua beres-beres bersama."
>
> Kamu cek hari ini apa, cocokkan dengan aturan dari atas ke bawah. Begitu ketemu yang cocok, kerjakan tugasnya dan abaikan aturan sisanya. Persis seperti `if-elif-elif-else`: Python mengecek kondisi satu per satu dari atas. Begitu ada yang `True`, blok kodenya dijalankan dan sisanya dilewati.
>
> `and` itu seperti: "Piket **kalau** hari Senin **dan** kamu kelompok A."
> `or` itu seperti: "Boleh pulang cepat **kalau** sudah selesai piket **atau** sudah jam 4."

### g. 3 Tantangan Koding Bertingkat

**⭐ Mudah — Cek Kelulusan**

Cek apakah siswa lulus berdasarkan nilai. Jika nilai >= 75, cetak "LULUS". Selain itu, cetak "TIDAK LULUS".

```python
# Simulasi input
nilai = 80

if nilai >= 75:
    print(f"Nilai: {nilai} — LULUS")
else:
    print(f"Nilai: {nilai} — TIDAK LULUS")
```

Output yang diharapkan (jika `nilai = 80`):

```
Nilai: 80 — LULUS
```

Output yang diharapkan (jika `nilai = 60`):

```
Nilai: 60 — TIDAK LULUS
```

**⭐⭐ Sedang — Sistem Grading**

Buat sistem grading dengan 5 tingkatan: A (≥ 90), B (≥ 80), C (≥ 70), D (≥ 60), E (< 60). Cetak grade beserta keterangan.

```python
# Simulasi input
nilai = 73

if nilai >= 90:
    grade = "A"
    keterangan = "Sangat Baik"
elif nilai >= 80:
    grade = "B"
    keterangan = "Baik"
elif nilai >= 70:
    grade = "C"
    keterangan = "Cukup"
elif nilai >= 60:
    grade = "D"
    keterangan = "Kurang"
else:
    grade = "E"
    keterangan = "Sangat Kurang"

print(f"Nilai: {nilai}")
print(f"Grade: {grade} ({keterangan})")
```

Output yang diharapkan (jika `nilai = 73`):

```
Nilai: 73
Grade: C (Cukup)
```

**⭐⭐⭐ Agak Sulit — Kalkulator Tarif Parkir**

Hitung tarif parkir berdasarkan jenis kendaraan dan lama parkir.
Aturan:
- Motor: Rp 2.000 untuk 1 jam pertama, + Rp 1.000 per jam berikutnya.
- Mobil: Rp 5.000 untuk 1 jam pertama, + Rp 2.000 per jam berikutnya.

```python
# Simulasi input
jenis = "motor"
lama_jam = 3

if jenis == "motor":
    if lama_jam <= 1:
        tarif = 2000
    else:
        tarif = 2000 + (lama_jam - 1) * 1000
elif jenis == "mobil":
    if lama_jam <= 1:
        tarif = 5000
    else:
        tarif = 5000 + (lama_jam - 1) * 2000
else:
    tarif = 0
    print("Jenis kendaraan tidak dikenal!")

print(f"Jenis    : {jenis}")
print(f"Lama     : {lama_jam} jam")
print(f"Tarif    : Rp {tarif}")
```

Output yang diharapkan (jika `jenis = "motor"`, `lama_jam = 3`):

```
Jenis    : motor
Lama     : 3 jam
Tarif    : Rp 4000
```

### h. 3 Jenis Soal Kuis

1. **Telusuri alur (trace)** — Diberikan kode `if-elif-else` dan nilai variabel tertentu, siswa menentukan jalur mana yang dieksekusi dan apa outputnya.
   - Contoh: `nilai = 73` → masuk ke blok `elif nilai >= 70:` → grade C.
2. **Tulis kondisi dari deskripsi** — Diberikan aturan dalam bahasa Indonesia, siswa menuliskan ekspresi boolean Python-nya.
   - Contoh: "Siswa lulus jika nilai >= 75 **dan** kehadiran >= 80%" → `if nilai >= 75 and kehadiran >= 80:`.
3. **Perbaiki logika yang salah** — Kode berjalan tanpa error tapi hasilnya selalu salah karena urutan `elif` terbalik atau kondisi keliru.
   - Contoh: Grading yang selalu mencetak "D" karena kondisi `>= 60` ditaruh paling atas (sebelum `>= 70`, `>= 80`, `>= 90`).

### i. Estimasi Durasi Belajar Mandiri di Web

| Kegiatan | Durasi |
|----------|--------|
| Membaca materi + mencoba contoh | 30 menit |
| Mengerjakan tantangan koding | 30 menit |
| Mengerjakan kuis | 15 menit |
| **Total** | **± 75 menit** |

---

## Bab 5 — Perulangan (`for` & `while`)

### a. Capaian Belajar

1. **Menjelaskan** perbedaan `for` dan `while` serta kapan menggunakan masing-masing.
2. **Membuat** program perulangan dengan `for ... in range(...)` untuk iterasi sejumlah tertentu.
3. **Membuat** program perulangan dengan `while` berdasarkan kondisi, termasuk penggunaan variabel counter.
4. **Memperbaiki** *infinite loop* dan kesalahan *off-by-one* pada batas perulangan.

### b. Prasyarat

- Memahami percabangan `if/elif/else` dan aturan indentasi blok kode (Bab 4).
- Memahami operator perbandingan dan assignment gabungan `+=`, `-=` (Bab 3).
- Mampu membuat variabel, menggunakan operator aritmatika, dan mencetak output (Bab 1–3).

### c. Urutan Subtopik

1. **Konsep perulangan** — Mengapa perlu mengulang instruksi? Perbandingan menulis 10 baris `print()` vs menggunakan 1 loop. Efisiensi dan skalabilitas.
2. **`for` dengan `range()`** — `range(n)` menghasilkan 0 sampai n-1. `range(a, b)` menghasilkan a sampai b-1. `range(a, b, step)` dengan langkah tertentu. Variabel iterasi (misal `i`) dan cara memakainya di dalam loop.
3. **`while` dengan kondisi** — Pola dasar: inisialisasi counter → kondisi → badan loop → update counter. Perbedaan dengan `for`: `while` dipakai ketika jumlah iterasi belum pasti.
4. **`break` dan `continue`** — `break`: hentikan loop sepenuhnya. `continue`: lewati iterasi saat ini, lanjut ke iterasi berikutnya. Contoh penggunaan masing-masing.
5. **Perulangan bersarang (nested loop)** — Loop di dalam loop (maksimal 2 level). Contoh: mencetak pola bintang, mencetak tabel perkalian. Cara membaca alur eksekusi loop bersarang.

### d. Konsep yang BOLEH Dipakai vs. BELUM BOLEH Dipakai

**✅ BOLEH dipakai di Bab 5:**

- Semua yang sudah dipelajari di Bab 1–4
- `for variabel in range(...):`
- `while kondisi:`
- `break`, `continue`
- Nested loop (maksimal 2 level kedalaman)
- Akumulator: `total += nilai`
- Counter: `i += 1`
- Iterasi string sederhana: `for huruf in "kata":`

**❌ BELUM BOLEH dipakai di Bab 5:**

- List, tuple, dictionary sebagai objek iterasi (boleh disebut singkat, tapi fokus pakai `range()`)
- Fungsi buatan sendiri (`def`)
- List comprehension
- `enumerate()`, `zip()`
- Modul eksternal (`import`)
- Rekursi
- `try` / `except`
- `else` pada loop (`for...else`, `while...else`)

### e. 3 Miskonsepsi Umum Pemula

1. **Lupa update counter di `while`** — Siswa menulis `while i < 10:` dan `print(i)` tapi tidak pernah menambahkan `i += 1` di akhir badan loop. Akibatnya `i` selamanya kurang dari 10 dan terjadi *infinite loop* — program hang, browser tidak responsif. Ini kesalahan paling berbahaya di bab ini.
2. **Off-by-one pada `range()`** — Siswa mengira `range(1, 5)` menghasilkan angka 1, 2, 3, 4, **5**. Padahal batas akhir `range()` bersifat *exclusive* (tidak termasuk), jadi hasilnya 1, 2, 3, 4. Untuk mendapat 1–5, harus tulis `range(1, 6)`.
3. **Indentasi salah di dalam loop** — Dua jenis kesalahan: (a) menaruh `print()` di luar blok loop sehingga hanya tercetak sekali di akhir, atau (b) menaruh inisialisasi akumulator `total = 0` di dalam loop sehingga nilainya ter-reset setiap iterasi.

### f. Analogi Kehidupan Siswa SMK

> **Perulangan itu seperti rutinitas harian siswa sekolah.**
>
> **`for`** = "Dari hari Senin **sampai** Jumat, setiap hari: bangun pagi → berangkat sekolah → belajar → pulang."
> Kamu tahu pasti kapan mulai (Senin) dan kapan selesai (Jumat) — totalnya 5 kali. Ini seperti `for hari in range(1, 6):`.
>
> **`while`** = "**Selama** belum paham materi, baca ulang catatannya."
> Kamu tidak tahu berapa kali harus mengulang — bisa 2 kali, bisa 10 kali, tergantung kapan kamu akhirnya paham (kondisinya `False`). Kalau kamu tidak pernah mengecek ulang apakah sudah paham, kamu akan baca catatan selamanya — itulah *infinite loop*!
>
> **`break`** = "Bel istirahat berbunyi di tengah pelajaran — langsung berhenti, keluar kelas."
> **`continue`** = "Soal nomor 3 terlalu sulit — lewati dulu, lanjut ke nomor 4."

### g. 3 Tantangan Koding Bertingkat

**⭐ Mudah — Tabel Perkalian**

Cetak tabel perkalian (1–10) dari bilangan yang ditentukan.

```python
# Simulasi input
bilangan = 7

print(f"=== Tabel Perkalian {bilangan} ===")
for i in range(1, 11):
    hasil = bilangan * i
    print(f"{bilangan} x {i} = {hasil}")
```

Output yang diharapkan (jika `bilangan = 7`):

```
=== Tabel Perkalian 7 ===
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
```

**⭐⭐ Sedang — Hitung Total Belanja dengan Tanda**

Hitung total dari 5 harga jajan yang di-hardcode. Untuk setiap item, jika harganya lebih dari 10.000, beri tanda `[MAHAL]`.

```python
# Simulasi input (5 harga jajan)
harga_1 = 8000
harga_2 = 15000
harga_3 = 5000
harga_4 = 12000
harga_5 = 3000

total = 0
nomor = 0

for harga in [harga_1, harga_2, harga_3, harga_4, harga_5]:
    nomor += 1
    total += harga
    if harga > 10000:
        print(f"Item {nomor}: Rp {harga} [MAHAL]")
    else:
        print(f"Item {nomor}: Rp {harga}")

print(f"Total: Rp {total}")
```

Output yang diharapkan:

```
Item 1: Rp 8000
Item 2: Rp 15000 [MAHAL]
Item 3: Rp 5000
Item 4: Rp 12000 [MAHAL]
Item 5: Rp 3000
Total: Rp 43000
```

> Catatan: tantangan ini menggunakan list sederhana sebagai container harga. Guru boleh menjelaskan bahwa `[...]` adalah cara menyimpan beberapa nilai sekaligus, tanpa membahas list secara mendalam.

**⭐⭐⭐ Agak Sulit — Game Tebak Angka (Simulasi)**

Simulasikan game tebak angka. Angka rahasia sudah ditentukan, dan 5 tebakan di-hardcode. Gunakan `while` dan `break`.

```python
# Angka rahasia
rahasia = 42

# Simulasi 5 tebakan berturut-turut
tebakan_semua = [30, 50, 40, 42, 35]

percobaan = 0
menang = False

while percobaan < len(tebakan_semua):
    tebak = tebakan_semua[percobaan]
    percobaan += 1
    print(f"Tebakan ke-{percobaan}: {tebak}", end=" → ")

    if tebak == rahasia:
        print("BENAR! Kamu menang!")
        menang = True
        break
    elif tebak < rahasia:
        print("Terlalu kecil!")
    else:
        print("Terlalu besar!")

if not menang:
    print(f"Gagal! Angka rahasia adalah {rahasia}.")

print(f"Jumlah percobaan: {percobaan}")
```

Output yang diharapkan:

```
Tebakan ke-1: 30 → Terlalu kecil!
Tebakan ke-2: 50 → Terlalu besar!
Tebakan ke-3: 40 → Terlalu kecil!
Tebakan ke-4: 42 → BENAR! Kamu menang!
Jumlah percobaan: 4
```

> Catatan: tantangan ini menggunakan list dan `len()` untuk simulasi. Guru bisa menjelaskan bahwa ini cara menyimpan beberapa tebakan sekaligus agar bisa diproses satu per satu oleh loop.

### h. 3 Jenis Soal Kuis

1. **Hitung jumlah iterasi** — Diberikan kode loop, siswa menghitung berapa kali badan loop dieksekusi.
   - Contoh: `for i in range(2, 10, 3):` → iterasi untuk `i` = 2, 5, 8 → 3 kali.
2. **Prediksi output akhir** — Diberikan loop dengan akumulator atau `break`, siswa menuliskan output program.
   - Contoh: `total = 0` lalu `for i in range(1, 6): total += i` lalu `print(total)` → siswa menjawab `15`.
3. **Konversi antara `for` dan `while`** — Diberikan kode `for`, siswa menulis ulang menggunakan `while`, atau sebaliknya.
   - Contoh: Ubah `for i in range(5): print(i)` menjadi versi `while` yang menghasilkan output sama.

### i. Estimasi Durasi Belajar Mandiri di Web

| Kegiatan | Durasi |
|----------|--------|
| Membaca materi + mencoba contoh | 35 menit |
| Mengerjakan tantangan koding | 35 menit |
| Mengerjakan kuis | 15 menit |
| **Total** | **± 85 menit** |

---

## Ringkasan Total Durasi

| Bab | Topik | Durasi (menit) |
|-----|-------|:--------------:|
| 1 | `print()`, komentar, membaca error | 50 |
| 2 | Variabel & tipe data | 60 |
| 3 | Input (simulasi) & operator | 65 |
| 4 | Percabangan (`if`/`elif`/`else`) | 75 |
| 5 | Perulangan (`for` & `while`) | 85 |
| | **Total** | **± 335 menit (5,5 jam)** |

---

## Peta Prasyarat Antar-Bab

```
Bab 1: print(), komentar, error
  │
  ▼
Bab 2: Variabel & tipe data
  │
  ▼
Bab 3: Input (simulasi) & operator
  │
  ├──────────┐
  ▼          ▼
Bab 4      Bab 5
Percabangan  Perulangan
  │          ▲
  └──────────┘
  (Bab 5 juga butuh Bab 4)
```

Setiap bab membangun di atas bab sebelumnya. Bab 4 dan Bab 5 sama-sama membutuhkan Bab 3, dan Bab 5 juga membutuhkan pemahaman Bab 4 (karena di dalam loop sering ada percabangan).
