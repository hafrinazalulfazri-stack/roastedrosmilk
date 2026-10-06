# Design Notes — Kivé Tea

## Arah visual

Kivé Tea memakai arah visual editorial yang hangat, segar, dan mudah dipindai. Halaman dimulai dari pesan utama, dilanjutkan pilihan menu, keranjang, cerita brand, lalu pembayaran.

## Struktur halaman

1. **Header** — logo, anchor navigation, dan CTA “Pesan sekarang”.
2. **Hero** — satu headline kuat, deskripsi singkat, CTA, rating, dan foto produk.
3. **Marquee** — penguat positioning dengan ritme horizontal.
4. **Menu** — tiga kartu produk dengan label, foto, harga, dan tombol tambah.
5. **Keranjang** — ringkasan item, total, export struk, dan lanjut pembayaran.
6. **Cerita kami** — konteks brand dan alasan produk dibuat.
7. **Kontak & pembayaran** — data pelanggan, fulfillment, QRIS/Midtrans, dan WhatsApp.
8. **Footer** — identitas singkat dan kanal sosial.

## Sistem visual

- **Warna:** cream sebagai kanvas, hijau gelap untuk teks/aksi utama, hijau muda untuk highlight, dan abu hijau untuk teks sekunder.
- **Tipografi:** `Playfair Display` untuk headline dan nama produk; `DM Sans` untuk UI, label, dan isi.
- **Bentuk:** kartu memakai radius 12–14px; tombol memakai radius 10px; elemen dekoratif boleh organik.
- **Spacing:** section desktop memakai padding horizontal sekitar 10vw; mobile 8vw. Jarak antar blok mengikuti kelipatan 8px.
- **Motion:** hover menggunakan kenaikan kecil 2–6px, shadow lembut, dan durasi 200–350ms. Scroll anchor memakai smooth scroll.

## Prinsip UX

- CTA utama selalu terlihat jelas dan memakai kontras tinggi.
- Informasi produk dipadatkan dalam urutan: label → gambar → nama/deskripsi → harga → aksi.
- Fokus keyboard diberi outline yang terlihat.
- Layout berubah menjadi satu kolom pada layar kecil tanpa mengubah urutan alur pemesanan.
- State kosong, disabled, dan toast tetap mempertahankan bahasa visual yang sama.
