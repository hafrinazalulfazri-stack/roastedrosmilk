const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => { const isOpen = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', isOpen); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
const toast = document.querySelector('.toast');
const CART_STORAGE_KEY = 'kive-tea-cart-v1';
const ANALYTICS_SESSION_KEY = 'kive-tea-analytics-session';
const analyticsSession = (() => { try { let id = localStorage.getItem(ANALYTICS_SESSION_KEY); if (!id) { id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; localStorage.setItem(ANALYTICS_SESSION_KEY, id); } return id; } catch { return 'anonymous'; } })();
const track = event => { fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, sessionId: analyticsSession }) }).catch(() => {}); };
const cart = {};
const productImages = { Tea: 'tea.webp', Matcha: 'matcha.jpg', Cendol: 'cendol.jpg' };
const customizeDialog = document.querySelector('#customize-dialog');
const customizeForm = document.querySelector('#customize-form');
const priceValue = value => Number(value || 0);
const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
    Object.values(saved).forEach(item => {
      if (item && typeof item.name === 'string' && Number.isFinite(Number(item.price)) && Number.isInteger(item.qty) && item.qty > 0) {
        cart[item.name] = { name: item.name, price: Number(item.price), qty: item.qty };
      }
    });
  } catch { localStorage.removeItem(CART_STORAGE_KEY); }
};
const saveCart = () => {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* storage may be unavailable */ }
};
const formatPrice = value => `Rp ${value.toLocaleString('id-ID')}`;
const renderCart = () => {
  const items = Object.values(cart), container = document.querySelector('#cart-items');
  const count = items.reduce((sum, item) => sum + item.qty, 0), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.querySelector('#cart-count').textContent = `(${count})`;
  document.querySelector('#nav-cart-count').textContent = count;
  const deliveryFee = document.querySelector('#fulfillment-method')?.value === 'delivery' ? 8000 : 0;
  document.querySelector('#cart-subtotal').textContent = formatPrice(total); document.querySelector('#cart-total').textContent = formatPrice(total + deliveryFee); const deliveryLine = document.querySelector('#delivery-line'); deliveryLine.hidden = !deliveryFee; document.querySelector('#delivery-total').textContent = formatPrice(deliveryFee);
  document.querySelector('#receipt-button').disabled = !items.length;
  document.querySelector('#clear-cart').disabled = !items.length;
  container.innerHTML = items.length ? items.map(item => `<div class="cart-row"><span class="cart-product"><img src="${productImages[item.name.split(" · ")[0]] || "tea.webp"}" alt="${item.name.split(" · ")[0]}"><span>${item.name}</span></span><span class="cart-qty"><button class="qty-button" data-action="minus" data-name="${item.name}">&#8722;</button>${item.qty}<button class="qty-button" data-action="plus" data-name="${item.name}">+</button></span><strong class="cart-price">${formatPrice(item.price * item.qty)}</strong><button class="cart-remove" data-action="remove" data-name="${item.name}">Hapus</button></div>`).join('') : '<p class="cart-empty">Belum ada minuman. Klik tombol + pada menu untuk menambahkan.</p>';
  saveCart();
};
const updateCustomizeTotal = () => {
  const base = priceValue(document.querySelector('#customize-base-price').value);
  const size = priceValue(document.querySelector('#customize-size option:checked')?.dataset.extra);
  const topping = priceValue(document.querySelector('#customize-topping option:checked')?.dataset.extra);
  document.querySelector('#customize-total').textContent = formatPrice(base + size + topping);
};
document.querySelectorAll('#customize-size, #customize-topping').forEach(select => select.addEventListener('change', updateCustomizeTotal));
document.querySelectorAll('.add-button').forEach(button => button.addEventListener('click', () => {
  const { drink: name, price } = button.dataset;
  document.querySelector('#customize-title').textContent = `Kustomisasi ${name}`;
  document.querySelector('#customize-drink').value = name;
  document.querySelector('#customize-base-price').value = price;
  updateCustomizeTotal();
  track('item_added');
  if (typeof customizeDialog.showModal === 'function') customizeDialog.showModal();
  else addCustomizedItem();
}));
const addCustomizedItem = () => {
  const name = document.querySelector('#customize-drink').value;
  const base = priceValue(document.querySelector('#customize-base-price').value);
  const size = document.querySelector('#customize-size');
  const topping = document.querySelector('#customize-topping');
  const sizeName = size.value, sugar = document.querySelector('#customize-sugar').value, ice = document.querySelector('#customize-ice').value, toppingName = topping.value;
  const price = base + priceValue(size.options[size.selectedIndex].dataset.extra) + priceValue(topping.options[topping.selectedIndex].dataset.extra);
  const variant = `${name} · ${sizeName}, ${sugar}, ${ice}, ${toppingName}`;
  cart[variant] ? cart[variant].qty++ : cart[variant] = { name: variant, price, qty: 1 };
  renderCart(); toast.textContent = `${name} ditambahkan ke keranjang`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200);
};
customizeForm?.addEventListener('submit', event => { event.preventDefault(); addCustomizedItem(); customizeDialog.close(); });
const createOrder = async () => {
  const items = Object.values(cart).map(item => ({ name: item.name, qty: item.qty, price: item.price }));
  const method = document.querySelector('#fulfillment-method').value;
  const fulfillment = { method, name: document.querySelector('#customer-name').value.trim(), phone: document.querySelector('#customer-phone').value.trim(), address: document.querySelector('#customer-address').value.trim(), note: document.querySelector('#customer-note').value.trim() };
  const key = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify({ items, fulfillment }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Order gagal dibuat');
  return data.order;
};
let activeOrderId = null;
document.querySelector('#fulfillment-method')?.addEventListener('change', event => { document.querySelector('#address-field').hidden = event.target.value !== 'delivery'; document.querySelector('#customer-address').required = event.target.value === 'delivery'; track(event.target.value === 'delivery' ? 'delivery_selected' : 'pickup_selected'); renderCart(); });
const openMidtransCheckout = async order => {
  const response = await fetch('/api/payments/snap-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id }) });
  const data = await response.json();
  if (!response.ok || !data.token || !data.clientKey) throw new Error(data.error || 'Midtrans belum dikonfigurasi');
  if (!window.snap) {
    await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = `${data.isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/snap.js`; script.setAttribute('data-client-key', data.clientKey); script.onload = resolve; script.onerror = () => reject(new Error('Snap.js gagal dimuat')); document.head.appendChild(script); });
  }
  window.snap.pay(data.token, { onSuccess: () => { track('payment_succeeded'); track('order_completed'); toast.textContent = 'Pembayaran berhasil diterima'; toast.classList.add('show'); }, onPending: () => { toast.textContent = 'Menunggu pembayaran Midtrans'; toast.classList.add('show'); }, onError: () => { toast.textContent = 'Pembayaran gagal'; toast.classList.add('show'); }, onClose: () => { toast.textContent = 'Checkout ditutup'; toast.classList.add('show'); } });
};
document.querySelector('#cart-items').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const item = cart[button.dataset.name]; if (button.dataset.action === 'plus') item.qty++; if (button.dataset.action === 'minus') item.qty--; if (button.dataset.action === 'remove' || item.qty < 1) delete cart[button.dataset.name]; renderCart(); });
document.querySelector('#clear-cart').addEventListener('click', () => { if (!Object.keys(cart).length || !window.confirm('Kosongkan semua item dari keranjang?')) return; Object.keys(cart).forEach(name => delete cart[name]); renderCart(); });
document.querySelector('#cart')?.addEventListener('mouseenter', () => track('cart_viewed'), { once: true });
loadCart();
renderCart();
track('menu_viewed');
document.querySelector('#receipt-button').addEventListener('click', () => {
  const { jsPDF } = window.jspdf || {}; if (!jsPDF) return;
  const doc = new jsPDF(), items = Object.values(cart), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  doc.setFillColor(224, 242, 255); doc.rect(0, 0, 210, 297, 'F'); doc.setFillColor(255, 255, 255); doc.roundedRect(14, 12, 182, 270, 5, 5, 'F'); doc.setFillColor(20, 112, 183); doc.roundedRect(14, 12, 182, 10, 5, 5, 'F');
  doc.setTextColor(20, 91, 150); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('KIVÉ TEA', 105, 36, { align: 'center' });
  doc.setTextColor(35, 35, 35); doc.setFontSize(18); doc.text('Bukti struk pembayaran', 105, 53, { align: 'center' });
  doc.setFillColor(224, 246, 232); doc.roundedRect(67, 59, 76, 10, 5, 5, 'F'); doc.setTextColor(31, 125, 73); doc.setFontSize(8); doc.text('TRANSAKSI QRIS', 105, 66, { align: 'center' });
  doc.setTextColor(90, 90, 90); doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.text('Toko Kive Tea', 105, 79, { align: 'center' });
  if (activeOrderId) { doc.setFontSize(9); doc.text(`Order ${activeOrderId}`, 105, 86, { align: 'center' }); }
  doc.setDrawColor(20, 112, 183); doc.setLineDashPattern([1, 2], 0); doc.line(25, 89, 185, 89); let y = 105;
  doc.setTextColor(65, 65, 65); doc.setFontSize(12); doc.text('Tanggal', 25, y); doc.text(new Date().toLocaleString('id-ID'), 185, y, { align: 'right' }); y += 17; doc.text('Metode pembayaran', 25, y); doc.text('QRIS', 185, y, { align: 'right' }); y += 17; doc.text('Lokasi', 25, y); doc.text('Toko Kive Tea', 185, y, { align: 'right' }); y += 18; doc.line(25, y, 185, y); y += 20;
  const fulfillmentMethod = document.querySelector('#fulfillment-method')?.value || 'pickup';
  doc.text('Metode pemenuhan', 25, y); doc.text(fulfillmentMethod === 'delivery' ? 'Antar' : 'Ambil sendiri', 185, y, { align: 'right' }); y += 14;
  if (activeOrderId) { doc.text('ID order', 25, y); doc.text(activeOrderId, 185, y, { align: 'right' }); y += 14; }
  doc.line(25, y, 185, y); y += 12;
  items.forEach(item => { doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(item.name, 25, y, { maxWidth: 125 }); doc.setFont('helvetica', 'normal'); doc.text(`${item.qty} x ${formatPrice(item.price)}`, 25, y + 6); doc.text(formatPrice(item.price * item.qty), 185, y + 3, { align: 'right' }); y += 18; });
  doc.setDrawColor(20, 112, 183); doc.line(25, y, 185, y); y += 16; doc.setTextColor(65, 65, 65); doc.setFontSize(10); doc.text('Total item', 25, y); doc.text(String(items.reduce((sum, item) => sum + item.qty, 0)), 185, y, { align: 'right' }); y += 18; doc.setFillColor(232, 246, 255); doc.roundedRect(22, y - 11, 166, 22, 3, 3, 'F'); doc.setTextColor(20, 91, 150); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text('TOTAL', 28, y + 3); doc.text(formatPrice(total), 182, y + 3, { align: 'right' }); doc.setTextColor(120, 140, 155); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('Terima kasih telah berbelanja di Kivé Tea', 105, y + 31, { align: 'center' });
  doc.save(`struk-kive-tea-${Date.now()}.pdf`);
});
const buildReceiptFile = () => {
  const { jsPDF } = window.jspdf || {}; if (!jsPDF) return null;
  const doc = new jsPDF(), items = Object.values(cart), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  doc.setFillColor(40, 33, 29); doc.rect(0, 0, 210, 297, 'F'); doc.setFillColor(232, 177, 143); doc.roundedRect(12, 12, 186, 273, 6, 6, 'F');
  doc.setFillColor(142, 79, 53); doc.roundedRect(20, 20, 170, 34, 4, 4, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('Kivé Tea', 28, 35); doc.setFontSize(10); doc.text('STRUK PEMBELIAN', 28, 46);
  doc.setTextColor(40, 33, 29); doc.setFontSize(11); doc.text('Detail pesanan', 22, 70); let y = 82; items.forEach(item => { doc.text(`${item.name} x${item.qty}`, 25, y); doc.text(formatPrice(item.price * item.qty), 185, y, { align: 'right' }); y += 10; }); doc.line(22, y, 188, y); doc.setFontSize(14); doc.text(`TOTAL: ${formatPrice(total)}`, 22, y + 14); doc.setFontSize(9); doc.text('Tunjukkan struk ini saat melakukan pembayaran.', 22, y + 28);
  return new File([doc.output('blob')], `struk-kive-tea-${Date.now()}.pdf`, { type: 'application/pdf' });
};
document.querySelector('#customer-phone')?.addEventListener('input', event => { event.target.setCustomValidity(/^[0-9+ ()-]{8,20}$/.test(event.target.value) ? '' : 'Masukkan nomor WhatsApp yang valid.'); });
document.querySelector('#payment-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  if (submitButton.disabled) return;
  const payment = new FormData(event.currentTarget).get('payment');
  if (!Object.keys(cart).length) { toast.textContent = 'Tambahkan minuman terlebih dahulu'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); return; }
  const items = Object.values(cart), subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0), deliveryFee = document.querySelector('#fulfillment-method').value === 'delivery' ? 8000 : 0, total = subtotal + deliveryFee, detail = items.map(item => `${item.name} x${item.qty}`).join(', ');
  if (payment === 'QRIS') {
    submitButton.disabled = true; submitButton.classList.add('is-loading'); submitButton.dataset.originalText = submitButton.innerHTML; submitButton.textContent = 'MEMPROSES...';
    track('checkout_started'); track('payment_started');
    createOrder().then(order => { activeOrderId = order.id; document.querySelector('#qris-detail').textContent = `Order ${order.id} · Total ${formatPrice(total)}.`; return openMidtransCheckout(order); }).catch(error => { toast.textContent = `${error.message}. Gunakan QRIS manual di bawah.`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }).finally(() => { submitButton.disabled = false; submitButton.classList.remove('is-loading'); submitButton.innerHTML = submitButton.dataset.originalText || 'TRANSAKSI'; });
    const panel = document.querySelector('#qris-panel');
    document.querySelector('#qris-image').src = 'qris-kive-tea.jpg';
    document.querySelector('#qris-detail').textContent = `Total ${formatPrice(total)} · Scan QR untuk membayar.`;
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }  const message = encodeURIComponent(`Halo Kivé Tea, saya ingin membayar berdasarkan struk. Pesanan: ${detail || '-'}; Total: ${formatPrice(total)}; Metode pembayaran: ${payment}.`);
  const whatsappUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? `https://wa.me/6281549625766?text=${message}`
    : `https://web.whatsapp.com/send?phone=6281549625766&text=${message}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});











document.querySelectorAll('input[name="payment"]').forEach(input => input.addEventListener('change', () => {
  const panel = document.querySelector('#qris-panel');
  if (input.value === 'QRIS' && input.checked) {
    const items = Object.values(cart), total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.querySelector('#qris-image').src = 'qris-kive-tea.jpg';
    document.querySelector('#qris-detail').textContent = `Total ${formatPrice(total)} · Scan QR untuk membayar.`;
    panel.hidden = false;
  } else if (input.checked) panel.hidden = true;
}));

document.querySelector('#qris-whatsapp')?.addEventListener('click', () => {
  const items = Object.values(cart), subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0), deliveryFee = document.querySelector('#fulfillment-method')?.value === 'delivery' ? 8000 : 0, total = subtotal + deliveryFee;
  const detail = items.map(item => `${item.name} x${item.qty}`).join(', ');
  const method = document.querySelector('#fulfillment-method')?.value || 'pickup';
  const name = document.querySelector('#customer-name')?.value || '-';
  const phone = document.querySelector('#customer-phone')?.value || '-';
  const address = document.querySelector('#customer-address')?.value || '-';
  const message = encodeURIComponent(`Halo Kivé Tea, saya sudah membayar via QRIS. Order: ${activeOrderId || '-'}; Nama: ${name}; WhatsApp: ${phone}; Metode: ${method}; Alamat: ${address}; Pesanan: ${detail || '-'}; Ongkos antar: ${formatPrice(deliveryFee)}; Total: ${formatPrice(total)}.`);
  const url = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? `https://wa.me/6281549625766?text=${message}` : `https://web.whatsapp.com/send?phone=6281549625766&text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});




