const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const PORT = Number(process.env.PORT || 8787);
const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'dev-only-change-me';
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_SNAP_HOST = MIDTRANS_IS_PRODUCTION ? 'app.midtrans.com' : 'app.sandbox.midtrans.com';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-change-me';
const requestLog = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 120;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.jsonl');
const CATALOG_FILE = path.join(__dirname, 'catalog.json');
const getCatalog = () => JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
const readOrders = () => JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
const writeOrders = orders => fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
const writeAnalytics = event => fs.appendFileSync(ANALYTICS_FILE, `${JSON.stringify(event)}\n`, 'utf8');
const send = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(body)); };
const readBody = req => new Promise((resolve, reject) => { let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); }); req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Payload JSON tidak valid')); } }); req.on('error', reject); });

const validateOrder = payload => {
  const catalog = getCatalog();
  if (!Array.isArray(payload.items) || payload.items.length < 1) throw new Error('Order harus memiliki minimal satu item');
  const items = payload.items.map(item => {
    if (!item || typeof item.name !== 'string' || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99 || !Number.isFinite(item.price)) throw new Error('Item order tidak valid');
    const baseName = item.name.split(' · ')[0];
    if (!catalog[baseName] || !catalog[baseName].active || catalog[baseName].stock < item.qty) throw new Error(`Produk tidak tersedia atau stok tidak cukup: ${baseName}`);
    const expectedBase = catalog[baseName].price;
    const extra = Number(item.price) - expectedBase;
    if (extra < 0 || extra > 50000) throw new Error('Harga item tidak valid');
    return { name: item.name, qty: item.qty, unitPrice: Number(item.price), subtotal: Number(item.price) * item.qty };
  });
  const fulfillment = payload.fulfillment || { method: 'pickup' };
  if (!['pickup', 'delivery'].includes(fulfillment.method)) throw new Error('Metode pemenuhan tidak valid');
  if (typeof fulfillment.name !== 'string' || fulfillment.name.trim().length < 2) throw new Error('Nama pelanggan wajib diisi');
  if (typeof fulfillment.phone !== 'string' || !/[0-9+ ()-]{8,20}/.test(fulfillment.phone)) throw new Error('Nomor WhatsApp tidak valid');
  if (fulfillment.method === 'delivery' && (typeof fulfillment.address !== 'string' || fulfillment.address.trim().length < 10)) throw new Error('Alamat pengantaran wajib diisi');
  const deliveryFee = fulfillment.method === 'delivery' ? 8000 : 0;
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, subtotal, deliveryFee, total: subtotal + deliveryFee, fulfillment: { method: fulfillment.method, name: fulfillment.name.trim(), phone: fulfillment.phone.trim(), address: String(fulfillment.address || '').trim(), note: String(fulfillment.note || '').trim() } };
};
const midtransRequest = (order, callback) => {
  if (!MIDTRANS_SERVER_KEY) return callback(new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi'));
  const body = JSON.stringify(order);
  const request = https.request({ hostname: MIDTRANS_SNAP_HOST, path: '/snap/v1/transactions', method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, response => {
    let data = ''; response.on('data', chunk => { data += chunk; }); response.on('end', () => { try { const parsed = JSON.parse(data); response.statusCode >= 200 && response.statusCode < 300 ? callback(null, parsed) : callback(new Error(parsed.error_messages?.join(', ') || parsed.status_message || 'Midtrans menolak transaksi')); } catch { callback(new Error('Respons Midtrans tidak valid')); } });
  });
  request.on('error', callback); request.write(body); request.end();
};

const server = http.createServer(async (req, res) => {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = requestLog.get(ip) || { started: now, count: 0 };
  if (now - bucket.started > RATE_WINDOW_MS) { bucket.started = now; bucket.count = 0; }
  bucket.count += 1; requestLog.set(ip, bucket);
  if (bucket.count > RATE_LIMIT) return send(res, 429, { error: 'Terlalu banyak request, coba lagi sebentar.' });
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key' }); return res.end(); }
  if (req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true });
  if (req.method === 'GET' && req.url === '/api/catalog') return send(res, 200, { catalog: getCatalog() });
  if (req.method === 'POST' && req.url === '/api/analytics') {
    try { const payload = await readBody(req), allowed = ['menu_viewed', 'item_added', 'cart_viewed', 'checkout_started', 'checkout_failed', 'payment_started', 'payment_pending', 'payment_failed', 'payment_succeeded', 'order_completed', 'delivery_selected', 'pickup_selected']; if (!allowed.includes(payload.event)) return send(res, 400, { error: 'Event tidak valid' }); writeAnalytics({ event: payload.event, sessionId: typeof payload.sessionId === 'string' ? payload.sessionId.slice(0, 80) : 'anonymous', at: new Date().toISOString() }); return send(res, 204, {}); } catch (error) { return send(res, 400, { error: error.message }); }
  }
  if (req.url.startsWith('/api/admin/')) {
    if (req.headers['x-admin-token'] !== ADMIN_TOKEN) return send(res, 401, { error: 'Unauthorized' });
    if (req.method === 'GET' && req.url === '/api/admin/orders') return send(res, 200, { orders: readOrders() });
    if (req.method === 'GET' && req.url === '/api/admin/analytics') {
      if (!fs.existsSync(ANALYTICS_FILE)) return send(res, 200, { counts: {}, total: 0 });
      const events = fs.readFileSync(ANALYTICS_FILE, 'utf8').split('\n').filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
      const counts = events.reduce((acc, event) => { acc[event.event] = (acc[event.event] || 0) + 1; return acc; }, {});
      return send(res, 200, { counts, total: events.length });
    }
    const statusMatch = req.url.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
    if (req.method === 'PATCH' && statusMatch) {
      try { const payload = await readBody(req); const allowed = ['baru', 'diproses', 'siap_diambil', 'dikirim', 'selesai', 'dibatalkan']; if (!allowed.includes(payload.status)) return send(res, 400, { error: 'Status tidak valid' }); const orders = readOrders(), order = orders.find(item => item.id === decodeURIComponent(statusMatch[1])); if (!order) return send(res, 404, { error: 'Order tidak ditemukan' }); order.fulfillmentStatus = payload.status; order.statusUpdatedAt = new Date().toISOString(); writeOrders(orders); return send(res, 200, { order }); } catch (error) { return send(res, 400, { error: error.message }); }
    }
    return send(res, 404, { error: 'Admin route not found' });
  }
  const orderMatch = req.method === 'GET' && req.url.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const order = readOrders().find(item => item.id === decodeURIComponent(orderMatch[1]));
    return order ? send(res, 200, { order }) : send(res, 404, { error: 'Order tidak ditemukan' });
  }
  if (req.method === 'POST' && req.url === '/api/payments/snap-token') {
    try {
      const payload = await readBody(req), order = readOrders().find(item => item.id === payload.orderId);
      if (!order) return send(res, 404, { error: 'Order tidak ditemukan' });
      const itemDetails = order.items.map(item => ({ id: item.name.slice(0, 50), price: item.unitPrice, quantity: item.qty, name: item.name.slice(0, 50) }));
      if (order.deliveryFee) itemDetails.push({ id: 'delivery', price: order.deliveryFee, quantity: 1, name: 'Ongkos antar' });
      midtransRequest({ transaction_details: { order_id: order.id, gross_amount: order.total }, item_details: itemDetails }, (error, result) => error ? send(res, 502, { error: error.message }) : send(res, 200, { token: result.token, redirect_url: result.redirect_url, clientKey: process.env.MIDTRANS_CLIENT_KEY || null, isProduction: MIDTRANS_IS_PRODUCTION }));
      return;
    } catch (error) { return send(res, 400, { error: error.message || 'Pembayaran gagal dibuat' }); }
  }
  if (req.method === 'POST' && req.url === '/api/payment/webhook') {
    try {
      const raw = await new Promise((resolve, reject) => { let body = ''; req.on('data', chunk => { body += chunk; }); req.on('end', () => resolve(body)); req.on('error', reject); });
      const signature = String(req.headers['x-payment-signature'] || '');
      const expected = crypto.createHmac('sha256', PAYMENT_WEBHOOK_SECRET).update(raw).digest('hex');
      if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return send(res, 401, { error: 'Signature webhook tidak valid' });
      const event = JSON.parse(raw);
      if (!event.orderId || !['dibayar', 'gagal', 'kedaluwarsa'].includes(event.status)) return send(res, 400, { error: 'Event pembayaran tidak valid' });
      const orders = readOrders(), order = orders.find(item => item.id === event.orderId);
      if (!order) return send(res, 404, { error: 'Order tidak ditemukan' });
      if (order.paymentStatus !== event.status) { order.paymentStatus = event.status; order.paymentReference = event.transactionId || null; order.paymentUpdatedAt = new Date().toISOString(); writeOrders(orders); }
      return send(res, 200, { received: true, orderId: order.id, paymentStatus: order.paymentStatus });
    } catch (error) { return send(res, 400, { error: error.message || 'Webhook tidak valid' }); }
  }
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    const requestedPath = decodeURIComponent(req.url.split('?')[0]);
    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
    const filePath = path.resolve(__dirname, relativePath);
    if (filePath.startsWith(path.resolve(__dirname) + path.sep) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
      return fs.createReadStream(filePath).pipe(res);
    }
    return send(res, 404, { error: 'File not found' });
  }
  if (req.method !== 'POST' || req.url !== '/api/orders') return send(res, 404, { error: 'Not found' });
  try {
    const key = req.headers['idempotency-key'];
    if (!key || String(key).length < 8) return send(res, 400, { error: 'Idempotency-Key wajib diisi' });
    const orders = readOrders();
    const existing = orders.find(order => order.idempotencyKey === key);
    if (existing) return send(res, 200, { order: existing, reused: true });
    const validated = validateOrder(await readBody(req));
    const order = { id: `KT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`, idempotencyKey: String(key), ...validated, paymentStatus: 'menunggu_pembayaran', fulfillmentStatus: 'baru', createdAt: new Date().toISOString() };
    orders.push(order); writeOrders(orders);
    return send(res, 201, { order });
  } catch (error) { return send(res, 400, { error: error.message || 'Order gagal dibuat' }); }
});

server.listen(PORT, () => console.log(`Kivé Tea API listening on http://localhost:${PORT}`));
