# Roasted Ros Milk

## Panduan update website online

Setiap kali ada perubahan pada file website, buka PowerShell di folder project ini lalu jalankan:

```powershell
git status
git add .
git commit -m "Jelaskan perubahan di sini"
git push origin main
```

Contoh:

```powershell
git add .
git commit -m "Update harga produk"
git push origin main
```

Setelah `git push` berhasil, GitHub Pages atau layanan hosting yang terhubung ke repository akan mengambil perubahan terbaru secara otomatis. Tunggu beberapa menit, lalu refresh website dengan `Ctrl + F5`.

## Menjalankan API order lokal

Fase backend menyediakan API Node tanpa dependensi eksternal. Jalankan dengan Node.js:

```powershell
node server.js
```

API tersedia di `http://localhost:8787`. Endpoint `POST /api/orders` membutuhkan header `Idempotency-Key` dan payload item order. Status order dapat dibaca melalui `GET /api/orders/:id`. Webhook pembayaran `POST /api/payment/webhook` harus mengirim header `X-Payment-Signature` berisi HMAC-SHA256 dari body menggunakan `PAYMENT_WEBHOOK_SECRET`. Contoh menjalankan dengan secret:

```powershell
$env:PAYMENT_WEBHOOK_SECRET = "ganti-dengan-secret-kuat"
node server.js
```

Endpoint `POST /api/payments/snap-token` menerima `{ "orderId": "KT-..." }` dan membuat transaksi Midtrans Snap menggunakan `MIDTRANS_SERVER_KEY`. Mode Sandbox memakai `app.sandbox.midtrans.com`; mode produksi hanya aktif jika `MIDTRANS_IS_PRODUCTION=true`. Tambahkan Snap.js dengan Client Key di frontend sebelum memanggil token tersebut untuk menampilkan checkout Midtrans.

Dashboard admin tersedia di `http://localhost:8787/admin.html`. Jalankan server dengan token admin melalui `$env:ADMIN_TOKEN = "token-kuat"`; masukkan token yang sama pada halaman admin. Endpoint admin menggunakan header `X-Admin-Token`. Ganti mekanisme ini dengan autentikasi berbasis akun sebelum produksi.

Salin `.env.example` sebagai referensi environment variable. Jangan commit file `.env` atau credential Midtrans ke repository. Halaman pelanggan untuk cek order tersedia di `http://localhost:8787/status.html`.

Katalog dasar sekarang terpusat di `catalog.json` dan menjadi sumber validasi harga/stok server. Delivery menggunakan ongkos flat development Rp8.000; ubah aturan ini sebelum produksi.

Data development disimpan di `data/orders.json`; untuk produksi, ganti penyimpanan ini dengan database terkelola dan tambahkan autentikasi, HTTPS, serta secret management. Implementasi ini belum terhubung ke vendor payment gateway tertentu; kredensial merchant dan format webhook vendor perlu ditambahkan pada deployment.

### Jika hanya ingin mengunggah file tertentu

```powershell
git add index.html styles.css
git commit -m "Update tampilan halaman utama"
git push origin main
```

### Jika muncul pesan perubahan belum tersimpan

Periksa dulu dengan:

```powershell
git status
```

Pastikan branch yang digunakan adalah `main` dan remote mengarah ke repository GitHub yang benar:

```powershell
git branch --show-current
git remote -v
```
