# Product Requirements Document (PRD)

## 1. Informasi Produk

- **Nama produk:** Kivé Tea — Steep Your Day
- **Jenis produk:** Website katalog dan pemesanan minuman langsung ke toko
- **Platform:** Web responsif (mobile dan desktop), static frontend
- **Bahasa:** Bahasa Indonesia
- **Status dokumen:** Baseline untuk versi aplikasi saat ini

## 2. Ringkasan Produk

Kivé Tea adalah website pemesanan minuman susu panggang dan minuman creamy. Pengunjung dapat mengenal brand, melihat menu, menambahkan produk ke keranjang, memilih pembayaran QRIS, mengunduh struk PDF, lalu mengonfirmasi pembayaran dan pesanan melalui WhatsApp.

## 3. Tujuan Produk

1. Menampilkan identitas dan cerita brand Kivé Tea secara menarik.
2. Membantu pelanggan memilih produk dengan cepat.
3. Menyediakan alur pemesanan sederhana tanpa akun.
4. Mengurangi friksi pembayaran melalui QRIS dan konfirmasi WhatsApp.
5. Memberikan bukti pesanan yang dapat disimpan pelanggan dalam format PDF.

## 4. Sasaran Pengguna

### Pengguna utama

Pelanggan minuman usia remaja hingga dewasa yang mengakses website melalui ponsel, ingin melihat menu, menghitung total, membayar dengan QRIS, dan melakukan pemesanan untuk ambil sendiri atau diantar.

### Pengguna internal

Pemilik atau operator Kivé Tea yang menerima detail pesanan dan konfirmasi pembayaran melalui WhatsApp.

## 5. Ruang Lingkup Versi Saat Ini

### Termasuk

- Landing page brand dengan navigasi Beranda, Menu, Keranjang, Cerita Kami, dan Kontak.
- Daftar tiga menu: Tea, Matcha, dan Cendol.
- Penambahan produk ke keranjang.
- Perubahan jumlah dan penghapusan item.
- Perhitungan subtotal dan total otomatis dalam Rupiah.
- Pemilihan pembayaran QRIS.
- Tampilan gambar QR pembayaran.
- Pembuatan dan pengunduhan struk PDF.
- Tombol konfirmasi pembayaran melalui WhatsApp.
- Tampilan responsif dan menu navigasi mobile.

### Tidak termasuk

- Login, akun pelanggan, dan riwayat pesanan.
- Backend, database, stok, dan dashboard admin.
- Validasi pembayaran QRIS secara otomatis.
- Integrasi payment gateway atau status order real-time.
- Pilihan ukuran, tingkat gula/es, topping, jadwal pengantaran, ongkos kirim, dan alamat pelanggan.

## 6. Alur Pengguna Utama

1. Pengguna membuka halaman Beranda.
2. Pengguna memilih **Lihat menu** atau membuka bagian Menu.
3. Pengguna menekan tombol `+` pada produk.
4. Produk muncul di Keranjang dan jumlah total diperbarui.
5. Pengguna menaikkan, menurunkan, atau menghapus jumlah item.
6. Pengguna membuka bagian Kontak dan memilih metode pembayaran QRIS.
7. Sistem menampilkan QR pembayaran dan total transaksi.
8. Pengguna melakukan pembayaran menggunakan aplikasi bank/e-wallet.
9. Pengguna menekan **Sudah bayar, lanjut WhatsApp**.
10. Sistem membuka WhatsApp dengan pesan berisi detail pesanan dan total.
11. Pengguna dapat mengunduh **Export struk PDF** dari Keranjang.

## 7. Kebutuhan Fungsional

### FR-01 — Navigasi

- Sistem harus menyediakan navigasi anchor ke Beranda, Menu, Keranjang, Cerita Kami, dan Kontak.
- Navigasi mobile harus dapat dibuka dan ditutup melalui tombol menu.
- Jumlah item keranjang harus tampil di header.

### FR-02 — Katalog menu

- Sistem harus menampilkan nama, deskripsi, harga, label produk, nomor kartu, dan gambar untuk setiap menu.
- Produk minimum yang tersedia: Tea (Rp22.000), Matcha (Rp24.000), dan Cendol (Rp25.000).
- Setiap produk harus memiliki tombol tambah ke keranjang.

### FR-03 — Keranjang

- Menambahkan produk yang sama harus menaikkan kuantitas, bukan membuat baris baru.
- Pengguna harus dapat menaikkan kuantitas, menurunkan kuantitas, dan menghapus item.
- Sistem harus menghitung total item dan total pembayaran secara otomatis.
- Keranjang kosong harus menampilkan instruksi untuk menambahkan minuman.
- Tombol ekspor struk harus nonaktif ketika keranjang kosong.

### FR-04 — Struk PDF

- Sistem harus menghasilkan file PDF yang memuat nama toko, tanggal/waktu, metode pembayaran QRIS, daftar item, kuantitas, harga, dan total.
- Nama file harus memiliki identitas toko dan timestamp.

### FR-05 — Pembayaran QRIS

- Pengguna harus dapat memilih QRIS pada form pembayaran.
- Sistem harus menampilkan gambar QRIS dan total transaksi.
- Sistem harus menampilkan instruksi untuk memindai QR.
- Sistem harus menyediakan tombol untuk melanjutkan konfirmasi ke WhatsApp.

### FR-06 — Konfirmasi WhatsApp

- Pesan WhatsApp harus memuat daftar pesanan dan total pembayaran.
- URL WhatsApp harus menyesuaikan perangkat mobile atau desktop.
- Konfirmasi pembayaran harus dibuka di tab/jendela baru.

### FR-07 — Informasi brand dan kontak

- Sistem harus menampilkan cerita proses susu panggang, slogan, jam operasional 09.00–21.00 WIB, dan tautan Instagram/TikTok.
- Sistem harus menyediakan tautan kontak WhatsApp toko.

## 8. Kebutuhan Nonfungsional

- **Responsif:** dapat digunakan pada lebar layar ponsel, tablet, dan desktop.
- **Performa:** aset lokal harus dimuat tanpa blocking yang tidak perlu; gambar eksternal hero perlu memiliki fallback atau optimasi.
- **Aksesibilitas:** tombol memiliki label yang jelas, gambar memiliki alt text, status toast menggunakan `aria-live`, dan navigasi dapat digunakan dengan keyboard.
- **Lokalisasi:** format harga menggunakan Rupiah Indonesia dan waktu menggunakan WIB.
- **Keamanan:** tautan eksternal dibuka dengan `noopener,noreferrer`; jangan menaruh kunci rahasia di frontend.
- **Ketersediaan:** website tetap menampilkan katalog walau layanan WhatsApp atau QRIS sedang tidak tersedia.

## 9. Data dan Integrasi

### Data produk

| Field | Tipe | Contoh |
|---|---|---|
| name | string | Tea |
| price | number | 22000 |
| description | string | Teh roasted, susu creamy, foam lembut |
| image | asset URL | tea.webp |
| label | string | Best seller |

### Integrasi eksternal

- Google Fonts untuk tipografi.
- jsPDF untuk pembuatan struk PDF di browser.
- WhatsApp (`wa.me` atau `web.whatsapp.com`) untuk konfirmasi pesanan.
- Asset QRIS lokal untuk pembayaran.
- Instagram dan TikTok sebagai kanal sosial.

## 10. Kriteria Penerimaan

- Pengguna dapat menambahkan minimal satu produk dan melihat total yang benar.
- Kuantitas dapat diubah tanpa reload halaman.
- Menghapus item mengurangi jumlah dan total; keranjang kosong mengembalikan state awal.
- QRIS menampilkan QR dan total sesuai isi keranjang.
- Pesan WhatsApp berisi item dan total yang sama dengan keranjang.
- PDF berhasil terunduh dan memuat detail transaksi.
- Tidak ada error JavaScript saat membuka halaman, menambah item, mengubah kuantitas, membayar, atau mengunduh struk.
- Alur utama dapat digunakan pada viewport mobile dan desktop.

## 11. Metrik Keberhasilan

- Rasio pengunjung yang membuka bagian Menu.
- Rasio pengunjung yang menambahkan produk ke keranjang.
- Rasio keranjang yang mencapai langkah QRIS.
- Rasio konfirmasi WhatsApp setelah QRIS ditampilkan.
- Nilai pesanan rata-rata.
- Waktu dari pembukaan halaman sampai klik konfirmasi WhatsApp.

## 12. Risiko dan Ketergantungan

- Pembayaran belum diverifikasi otomatis; operator perlu memeriksa pembayaran secara manual.
- Keranjang tersimpan hanya di memori browser dan hilang saat halaman dimuat ulang.
- Nomor WhatsApp, gambar QRIS, harga, dan katalog harus diperbarui manual di source code.
- Ketergantungan pada CDN jsPDF dan Google Fonts dapat memengaruhi pengalaman ketika koneksi buruk.
- Informasi “ambil sendiri atau kami antar” belum didukung form alamat maupun perhitungan ongkos kirim.

## 13. Roadmap Pengembangan

Estimasi berikut adalah perkiraan kalender untuk satu tim kecil (1 frontend, 1 backend, QA paruh waktu). Estimasi mencakup implementasi dan validasi dasar, bukan waktu tunggu persetujuan akun vendor atau proses publikasi.

| Fase | Prioritas | Inisiatif | Estimasi | Dependensi |
|---|---|---|---|---|
| 1 | P0 | Persistensi keranjang di browser | 1–2 hari | Tidak ada |
| 2 | P0 | Kustomisasi produk dan pilihan ambil/antar | 3–5 hari | Fase 1; skema produk ditetapkan |
| 3 | P0 | Backend dan database pesanan | 1–2 minggu | Fase 2; hosting dan database tersedia |
| 4 | P1 | Payment gateway, webhook, dan status pembayaran | 1–2 minggu | Fase 3; akun payment gateway dan kredensial |
| 5 | P1 | Dashboard admin untuk katalog dan pesanan | 1–2 minggu | Fase 3; autentikasi admin |
| 6 | P2 | Analytics funnel yang menjaga privasi | 2–4 hari | Definisi event dan kebijakan retensi data |

Urutan pengerjaan menempatkan persistensi dan kebutuhan checkout lebih awal. Backend menjadi sumber data pesanan sebelum integrasi pembayaran maupun dashboard admin, sehingga keduanya dapat memakai status order yang sama.

### Fase 1 — Persistensi keranjang

**Hasil:** keranjang tetap tersedia setelah halaman dimuat ulang pada perangkat dan browser yang sama.

**Kebutuhan:**

- Simpan item, kuantitas, dan pilihan varian yang telah dibuat di local storage.
- Pulihkan keranjang saat aplikasi dibuka kembali.
- Validasi data tersimpan; jika format rusak atau produk tidak lagi tersedia, tampilkan state aman dan jangan membuat total yang salah.
- Sediakan aksi untuk menghapus item dan mengosongkan keranjang.

**Acceptance criteria:**

- Setelah menambah produk lalu reload, item, kuantitas, dan total yang valid tetap tampil.
- Perubahan kuantitas dan penghapusan tersimpan setelah reload berikutnya.
- Data local storage yang tidak valid tidak menyebabkan halaman gagal dimuat.
- Keranjang tidak dibagikan antar perangkat atau browser.

### Fase 2 — Kustomisasi dan pemenuhan pesanan

**Hasil:** pelanggan dapat menentukan konfigurasi minuman serta memilih pengambilan atau pengantaran.

**Kebutuhan:**

- Sediakan pilihan ukuran, tingkat gula, tingkat es, dan topping sesuai ketersediaan per produk.
- Tampilkan tambahan harga tiap opsi dan hitung harga item serta total secara transparan.
- Item dengan konfigurasi berbeda harus dapat dibedakan di keranjang.
- Sediakan pilihan ambil sendiri atau antar.
- Jika memilih antar, minta nama, nomor kontak, dan alamat lengkap; tampilkan biaya antar atau jelaskan bahwa biaya dikonfirmasi operator sebelum order dibuat.
- Jika memilih ambil sendiri, tampilkan lokasi dan instruksi/jam pengambilan.

**Acceptance criteria:**

- Setiap opsi wajib dipilih atau memiliki nilai default yang jelas sebelum checkout.
- Ringkasan keranjang menampilkan varian dan opsi tambahan yang dipilih.
- Harga per item dan total berubah sesuai konfigurasi.
- Form pengantaran memvalidasi kolom wajib; form pengambilan tidak meminta alamat antar.
- Ringkasan checkout memuat metode pemenuhan dan detail yang diperlukan operator.

### Fase 3 — Backend dan penyimpanan order

**Hasil:** checkout menghasilkan pesanan dengan ID unik yang dapat diakses pelanggan dan operator.

**Kebutuhan:**

- Sediakan API untuk membaca katalog dan membuat order.
- Simpan snapshot nama produk, harga, opsi, kuantitas, biaya, total, data kontak/pemenuhan, waktu dibuat, dan status.
- Hitung ulang harga di server; jangan mempercayai total dari browser.
- Status awal order adalah `menunggu_pembayaran`.
- Cegah order duplikat akibat pengiriman ulang request checkout menggunakan idempotency key.
- Kirim nomor/tautan order untuk dipakai pada langkah pembayaran dan konfirmasi.

**Acceptance criteria:**

- Order valid tersimpan dan memperoleh ID unik.
- Perubahan harga katalog setelah order dibuat tidak mengubah snapshot order lama.
- Total server sesuai dengan item dan opsi yang tersimpan.
- Request dengan payload tidak valid ditolak dengan pesan yang dapat ditindaklanjuti.
- Pengiriman ulang request checkout yang sama tidak membuat pesanan ganda.

### Fase 4 — Payment gateway dan status pembayaran

**Hasil:** pelanggan membayar melalui payment gateway dan status transaksi diperbarui berdasarkan notifikasi server.

**Kebutuhan:**

- Buat transaksi gateway yang terkait dengan ID order dan nominal yang dihitung server.
- Tampilkan instruksi pembayaran dan batas waktu pembayaran.
- Verifikasi signature webhook di backend dan proses event secara idempotent.
- Perbarui status menjadi `dibayar`, `gagal`, atau `kedaluwarsa` sesuai status resmi gateway.
- Jangan menandai order lunas dari redirect browser atau input pelanggan.
- Simpan referensi transaksi dan waktu perubahan status.

**Acceptance criteria:**

- Transaksi yang dibuat menggunakan nominal dan order ID yang benar.
- Webhook sah memperbarui status order; signature tidak valid ditolak.
- Event webhook duplikat tidak membuat perubahan atau catatan pembayaran ganda.
- Redirect pelanggan saja tidak mengubah status menjadi dibayar.
- Status pembayaran dapat dilihat pelanggan dan operator.

### Fase 5 — Dashboard admin

**Hasil:** operator dapat mengelola katalog dan memproses pesanan melalui halaman yang terlindungi.

**Kebutuhan:**

- Autentikasi dan otorisasi khusus admin.
- Kelola nama, deskripsi, harga, gambar, opsi, status aktif, dan stok produk.
- Lihat daftar order dengan pencarian/filter status dan waktu.
- Lihat rincian order dan riwayat status.
- Ubah status pemenuhan, misalnya `diproses`, `siap_diambil`, `dikirim`, dan `selesai`.
- Catat waktu dan admin pada setiap perubahan status.

**Acceptance criteria:**

- Pengguna tanpa sesi admin tidak dapat membuka atau mengubah data melalui UI maupun API.
- Admin dapat mengubah produk dan perubahan muncul di katalog pelanggan.
- Admin dapat menemukan order berdasarkan ID dan status.
- Perubahan status tersimpan dengan cap waktu dan identitas admin.
- Status pembayaran dari gateway tidak dapat ditimpa menjadi `dibayar` melalui kontrol pemenuhan biasa.

### Fase 6 — Analytics funnel privasi-sadar

**Hasil:** tim dapat mengukur funnel pemesanan tanpa mengumpulkan data pribadi yang tidak dibutuhkan.

**Event minimum:** `menu_viewed`, `item_added`, `cart_viewed`, `checkout_started`, `payment_started`, `payment_succeeded`, dan `order_completed`.

**Kebutuhan:**

- Gunakan ID sesi acak/pseudonim; jangan kirim nama, nomor telepon, alamat, isi pesan WhatsApp, atau data pembayaran ke analytics.
- Tetapkan tujuan, retensi, dan akses data sebelum aktivasi.
- Hormati pilihan consent bila diwajibkan oleh kebijakan produk atau yurisdiksi yang berlaku.
- Pastikan analytics tidak menghalangi checkout jika vendor analytics gagal.

**Acceptance criteria:**

- Funnel dapat dihitung dari event yang memiliki nama dan timestamp konsisten.
- Tidak ada PII pada payload analytics.
- Checkout tetap berfungsi saat endpoint analytics gagal atau diblokir.
- Event pembayaran sukses hanya dicatat setelah status terverifikasi backend.

## 14. Asumsi dan Keputusan yang Perlu Ditetapkan

- Pilihan vendor hosting, database, dan payment gateway ditentukan sebelum Fase 3 dan 4.
- Pemilik produk menetapkan harga setiap ukuran/topping, batas stok, wilayah layanan, tarif antar, lokasi pengambilan, serta kebijakan pembatalan/refund.
- Dashboard admin memerlukan minimal satu peran operator; kebutuhan peran tambahan ditetapkan sebelum Fase 5.
- Kebijakan privasi, masa retensi order, serta dasar penggunaan analytics dikonfirmasi sebelum peluncuran Fase 6.

## 15. Status Implementasi Saat Ini

Dokumen ini telah diselaraskan dengan repository pada 5 Oktober 2026.

| Fase | Status | Implementasi saat ini | Catatan |
|---|---|---|---|
| 1 | Selesai untuk development | `localStorage`, pemulihan keranjang, kosongkan keranjang | Hanya berlaku pada browser/perangkat yang sama |
| 2 | Sebagian selesai | Ukuran, gula, es, topping, harga varian | Pilihan ambil/antar, alamat, dan ongkos kirim belum tersedia |
| 3 | Fondasi selesai | API order, validasi server, file JSON, ID unik, idempotency | Belum memakai database production |
| 4 | Sandbox siap | Midtrans Snap token, webhook HMAC, status pembayaran | Belum melalui uji end-to-end dan konfigurasi notification URL production |
| 5 | Fondasi selesai | `admin.html`, daftar order, ubah status pemenuhan, token admin | Belum ada login/session, manajemen katalog, stok, filter, atau audit log lengkap |
| 6 | Fondasi selesai | Event analytics anonim ke `data/analytics.jsonl` | Belum ada dashboard agregasi, consent UI, retensi, atau vendor analytics |

### Artefak aplikasi

- `server.js`: static server, API order, Midtrans Snap, webhook, admin, dan analytics.
- `admin.html`: dashboard operasional development.
- `data/orders.json`: penyimpanan order lokal development.
- `data/analytics.jsonl`: penyimpanan event analytics lokal development.

### Kesiapan deployment

Status produk saat ini adalah **development/staging**, belum production-ready. Sebelum rilis production wajib dilakukan:

1. Rotasi semua credential Midtrans yang pernah terekspos dan menyimpan key baru hanya sebagai environment variable.
2. Mengganti `data/orders.json` dengan database terkelola dan menyiapkan backup.
3. Menggunakan HTTPS, domain, secret management, rate limiting, dan logging terpusat.
4. Mengganti `ADMIN_TOKEN` dengan autentikasi akun, session aman, dan otorisasi berbasis peran.
5. Mengonfigurasi Notification URL Midtrans serta menguji signature webhook di Sandbox.
6. Menjalankan pengujian end-to-end untuk checkout, pembayaran, webhook, dashboard, dan pemulihan kegagalan.
7. Menetapkan kebijakan refund, pembatalan, privasi, retensi data, dan persetujuan analytics.

Risiko lama pada bagian sebelumnya harus dibaca bersama status ini: keranjang sekarang sudah persisten, dan pembayaran sudah memiliki fondasi Midtrans Sandbox, tetapi keduanya belum cukup sebagai bukti kesiapan production.

### Perubahan implementasi 6 Oktober 2026

- Checkout kini meminta nama, nomor WhatsApp, pilihan pickup/delivery, alamat untuk delivery, dan catatan opsional.
- Validasi fulfillment dilakukan di browser dan server; ongkos delivery development saat ini flat Rp8.000.
- Dashboard admin kini mendukung pencarian order, filter status, dan menampilkan detail pelanggan serta fulfillment.
- Halaman `status.html` memungkinkan pelanggan membaca status order menggunakan ID.
- API memiliki rate limit sederhana, dan static response mengirim beberapa header keamanan.
- Checkout menampilkan state memproses dan menghindari klik ganda.
- `catalog.json` menjadi sumber harga dan stok dasar yang divalidasi oleh server.
- Analytics menambahkan event pickup/delivery dan menyediakan agregasi sederhana melalui endpoint admin.
- `.env.example` dan `.gitignore` tersedia untuk setup lokal.

Implementasi katalog masih belum menyediakan editor admin, dan pilihan varian frontend masih perlu validasi harga per opsi yang lebih ketat di server sebelum digunakan untuk transaksi production. Database, login admin, deployment HTTPS, backup, monitoring, uji end-to-end, kebijakan refund, serta pengaturan consent/retensi analytics tetap menjadi pekerjaan lanjutan.



## 16. Pembaruan UI dan UX ? 6 Oktober 2026

### Sudah diterapkan

- Struktur halaman menggunakan alur **Menu ? Keranjang ? Pembayaran** dengan indikator progress.
- Kartu menu memiliki gambar produk, label, harga, tombol tambah, hover state, dan animasi ringan.
- Produk dapat dikustomisasi berdasarkan ukuran, gula, es, dan topping.
- Keranjang menampilkan thumbnail produk, jumlah item, subtotal, ongkos antar, dan total akhir.
- Keranjang tersimpan di `localStorage` dan dapat dipulihkan setelah refresh.
- Form checkout memiliki validasi nama, WhatsApp, metode fulfillment, alamat delivery, catatan, dan metode pembayaran.
- Checkout memiliki loading state untuk mencegah klik ganda.
- Pengosongan keranjang meminta konfirmasi pengguna.
- Gambar menu memakai lazy loading; dukungan `prefers-reduced-motion` tersedia.
- Metadata dasar SEO, Open Graph, theme color, dan favicon telah ditambahkan.
- Fokus keyboard, hover state, responsive layout, dan visual form telah diperbaiki.

### Acceptance criteria UI

- Tidak ada horizontal scroll pada lebar viewport 320px sampai desktop lebar.
- Semua tombol utama dapat diakses dengan keyboard dan memiliki focus state yang terlihat.
- Total keranjang memperbarui subtotal, ongkos antar, dan total secara konsisten.
- Submit checkout dinonaktifkan selama request berlangsung.
- Informasi error tidak menghilangkan data input yang sudah diisi pengguna.
- Animasi dapat dikurangi melalui preferensi sistem pengguna.

### Pekerjaan sebelum production

- Menjalankan uji visual dan end-to-end pada Android, iPhone, tablet, dan desktop.
- Mengganti penyimpanan file JSON dengan database terkelola serta backup otomatis.
- Menyelesaikan autentikasi admin berbasis akun dan role.
- Memvalidasi harga, stok, varian, ongkos kirim, dan total transaksi sepenuhnya di server.
- Menyelesaikan konfigurasi Midtrans production, webhook, refund, dan penanganan status pembayaran.
- Menambahkan kebijakan privasi, syarat pemesanan, kebijakan refund, sitemap, dan robots.txt.
- Menyiapkan monitoring, logging terpusat, alerting, rollback, dan prosedur pemulihan insiden.
