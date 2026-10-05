const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => { const isOpen = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', isOpen); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
const toast = document.querySelector('.toast');
const cart = {};
const formatPrice = value => `Rp ${value.toLocaleString('id-ID')}`;
const renderCart = () => {
  const items = Object.values(cart), container = document.querySelector('#cart-items');
  const count = items.reduce((sum, item) => sum + item.qty, 0), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.querySelector('#cart-count').textContent = `(${count})`;
  document.querySelector('#nav-cart-count').textContent = count;
  document.querySelector('#cart-total').textContent = formatPrice(total);
  document.querySelector('#receipt-button').disabled = !items.length;
  container.innerHTML = items.length ? items.map(item => `<div class="cart-row"><span>${item.name}</span><span class="cart-qty"><button class="qty-button" data-action="minus" data-name="${item.name}">−</button>${item.qty}<button class="qty-button" data-action="plus" data-name="${item.name}">+</button></span><strong class="cart-price">${formatPrice(item.price * item.qty)}</strong><button class="cart-remove" data-action="remove" data-name="${item.name}">Hapus</button></div>`).join('') : '<p class="cart-empty">Belum ada minuman. Klik tombol + pada menu untuk menambahkan.</p>';
};
document.querySelectorAll('.add-button').forEach(button => button.addEventListener('click', () => { const { drink: name, price } = button.dataset; cart[name] ? cart[name].qty++ : cart[name] = { name, price: Number(price), qty: 1 }; renderCart(); toast.textContent = `${name} ditambahkan ke keranjang`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }));
document.querySelector('#cart-items').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const item = cart[button.dataset.name]; if (button.dataset.action === 'plus') item.qty++; if (button.dataset.action === 'minus') item.qty--; if (button.dataset.action === 'remove' || item.qty < 1) delete cart[button.dataset.name]; renderCart(); });
document.querySelector('#receipt-button').addEventListener('click', () => {
  const { jsPDF } = window.jspdf || {}; if (!jsPDF) return;
  const doc = new jsPDF(), items = Object.values(cart), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  doc.setFillColor(40, 33, 29); doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(232, 177, 143); doc.roundedRect(12, 12, 186, 273, 6, 6, 'F');
  doc.setFillColor(142, 79, 53); doc.roundedRect(20, 20, 170, 34, 4, 4, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text('RoastedRosMilk', 28, 35);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('STRUK PEMBELIAN  •  ROAST YOUR DAY', 28, 46);
  // Ilustrasi gelas minuman berwarna sebagai elemen visual struk.
  doc.setFillColor(174, 184, 155); doc.circle(169, 37, 11, 'F'); doc.setFillColor(255, 255, 255); doc.setFontSize(13); doc.text('RR', 162, 41);
  doc.setTextColor(40, 33, 29); doc.setFontSize(11); doc.text('Detail pesanan', 22, 70); let y = 80;
  items.forEach((item, index) => { const colors = [[255, 247, 237], [247, 231, 206], [244, 220, 193]]; doc.setFillColor(...colors[index % colors.length]); doc.roundedRect(20, y - 7, 170, 18, 3, 3, 'F'); doc.setFontSize(10); doc.text(`${item.name}  ×${item.qty}`, 27, y + 4); doc.setFont('helvetica', 'bold'); doc.text(formatPrice(item.price * item.qty), 183, y + 4, { align: 'right' }); doc.setFont('helvetica', 'normal'); y += 24; });
  doc.setDrawColor(142, 79, 53); doc.line(22, y, 188, y); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text('TOTAL PEMBAYARAN', 22, y + 16); doc.setTextColor(142, 79, 53); doc.text(formatPrice(total), 188, y + 16, { align: 'right' });
  doc.setTextColor(40, 33, 29); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('Tunjukkan struk ini saat melakukan pembayaran.', 22, y + 34); doc.text('Terima kasih sudah memilih RoastedRosMilk ♡', 22, y + 42);
  doc.save(`struk-roastedrosmilk-${Date.now()}.pdf`);
});
const buildReceiptFile = () => {
  const { jsPDF } = window.jspdf || {}; if (!jsPDF) return null;
  const doc = new jsPDF(), items = Object.values(cart), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  doc.setFillColor(40, 33, 29); doc.rect(0, 0, 210, 297, 'F'); doc.setFillColor(232, 177, 143); doc.roundedRect(12, 12, 186, 273, 6, 6, 'F');
  doc.setFillColor(142, 79, 53); doc.roundedRect(20, 20, 170, 34, 4, 4, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('RoastedRosMilk', 28, 35); doc.setFontSize(10); doc.text('STRUK PEMBELIAN', 28, 46);
  doc.setTextColor(40, 33, 29); doc.setFontSize(11); doc.text('Detail pesanan', 22, 70); let y = 82; items.forEach(item => { doc.text(`${item.name} x${item.qty}`, 25, y); doc.text(formatPrice(item.price * item.qty), 185, y, { align: 'right' }); y += 10; }); doc.line(22, y, 188, y); doc.setFontSize(14); doc.text(`TOTAL: ${formatPrice(total)}`, 22, y + 14); doc.setFontSize(9); doc.text('Tunjukkan struk ini saat melakukan pembayaran.', 22, y + 28);
  return new File([doc.output('blob')], `struk-roastedrosmilk-${Date.now()}.pdf`, { type: 'application/pdf' });
};
document.querySelector('#payment-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const payment = new FormData(event.currentTarget).get('payment');
  const items = Object.values(cart), total = items.reduce((sum, item) => sum + item.price * item.qty, 0), detail = items.map(item => `${item.name} x${item.qty}`).join(', ');
  const message = encodeURIComponent(`Halo RoastedRosMilk, saya ingin membayar berdasarkan struk. Pesanan: ${detail || '-'}; Total: ${formatPrice(total)}; Metode pembayaran: ${payment}.`);
  const whatsappUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? `https://wa.me/6281549625766?text=${message}`
    : `https://web.whatsapp.com/send?phone=6281549625766&text=${message}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

