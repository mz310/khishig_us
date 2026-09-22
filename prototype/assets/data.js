/* Хишиг ус — deterministic sample data for the admin prototype.
   Everything here is invented; it only exists so the reports have something to show. */
(function () {
  const K = window.KHISHIG;
  const DAY = 86400000;
  const START = Date.UTC(2025, 0, 1);
  const TODAY = Date.UTC(2026, 8, 22);
  const LAST = Math.round((TODAY - START) / DAY);

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const r = mulberry32(20260922);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];

  const FIRST = ['Батбаяр', 'Сарангэрэл', 'Оюунчимэг', 'Ган-Эрдэнэ', 'Нарангэрэл', 'Ууганбаяр', 'Энхтуяа', 'Мөнхбат',
    'Болормаа', 'Тэмүүлэн', 'Анужин', 'Баярмаа', 'Дөлгөөн', 'Эрдэнэчимэг', 'Цэцэгмаа', 'Отгонбаяр', 'Номин',
    'Жаргалсайхан', 'Хулан', 'Батжаргал', 'Сүхбаатар', 'Мөнхзул', 'Ариунаа', 'Төмөрбаатар', 'Нандин', 'Энхжаргал',
    'Гантулга', 'Солонго', 'Пүрэвсүрэн', 'Даваасүрэн', 'Уянга', 'Билгүүн', 'Цогзолмаа', 'Эрдэнэбат', 'Золзаяа',
    'Халиун', 'Батцэцэг', 'Лхагвасүрэн', 'Мягмарсүрэн', 'Алтанцэцэг'];
  const INIT = 'БГДЭНОСТУЦЧЖЛМ';
  const PREFIX = ['88', '99', '95', '94', '80', '86', '91', '96', '89', '98'];

  const customers = [];
  for (let i = 0; i < 150; i++) {
    const apt = r() < 0.55;
    customers.push({
      id: i + 1,
      name: FIRST[i % FIRST.length] + ' ' + INIT[Math.floor(r() * INIT.length)] + '.',
      phone: pick(PREFIX) + String(Math.floor(r() * 1e6)).padStart(6, '0'),
      bag: 1 + Math.floor(r() * 10),
      place: apt ? (1 + Math.floor(r() * 40)) + '-р байр, ' + (1 + Math.floor(r() * 90)) + ' тоот'
                 : (1 + Math.floor(r() * 30)) + '-р гудамж, ' + (1 + Math.floor(r() * 40)) + '-р хашаа',
      gmail: r() < 0.62,
      weight: 0.15 + Math.pow(r(), 2.4) * 3,
      created: i < 55 ? 0 : Math.floor(r() * (LAST - 12))
    });
  }
  for (let i = 144; i < 150; i++) customers[i].created = LAST - 2 - (i - 144) * 3;
  Object.assign(customers[0], { name: 'Батбаяр Г.', phone: '99112233', bag: 3, place: '7-р байр, 21 тоот', gmail: true, created: 0, weight: 1.6 });
  Object.assign(customers[1], { name: 'Сарангэрэл Д.', phone: '95127788', bag: 5, place: '12-р байр, 34 тоот', gmail: true, created: 0, weight: 1.4 });

  const QTY = [1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 6, 6];
  const orders = [];
  const payments = [];
  let oid = 1;
  let pid = 1;

  for (let d = 0; d <= LAST; d++) {
    const date = new Date(START + d * DAY);
    const doy = Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY);
    const trend = 0.75 + 0.5 * (d / LAST);
    const season = 1 + 0.3 * Math.sin((2 * Math.PI * (doy - 110)) / 365);
    const wd = date.getUTCDay();
    const weekend = wd === 0 || wd === 6 ? 1.12 : 1;
    let n = Math.round(14 * trend * season * weekend * (0.8 + 0.4 * r()));
    if (d === LAST) n = Math.round(n * 0.5);

    const pool = customers.filter((c) => c.created <= d);
    const total = pool.reduce((a, c) => a + c.weight, 0);
    for (let k = 0; k < n; k++) {
      let x = r() * total;
      let c = pool[0];
      for (const p of pool) { x -= p.weight; if (x <= 0) { c = p; break; } }
      const qty = pick(QTY);
      let status = 'delivered';
      let pay = null;
      if (r() < 0.03) status = 'cancelled';
      else if (d === LAST) status = r() < 0.45 ? 'delivered' : r() < 0.5 ? 'out' : 'new';
      if (status === 'delivered') { const y = r(); pay = y < 0.47 ? 'cash' : y < 0.9 ? 'transfer' : 'debt'; }
      const o = { id: oid++, cust: c.id, day: d, qty: qty, free: Math.floor(qty / 3), status: status, pay: pay };
      orders.push(o);
      if (pay === 'cash' || pay === 'transfer') {
        payments.push({ id: pid++, cust: c.id, order: o.id, day: d, units: qty, n: 1, method: pay, kind: 'order' });
      } else if (pay === 'debt' && r() < 0.9) {
        const pd = d + 2 + Math.floor(r() * 16);
        if (pd <= LAST) payments.push({ id: pid++, cust: c.id, order: o.id, day: pd, units: qty, n: 1, method: r() < 0.55 ? 'cash' : 'transfer', kind: 'debt' });
      }
    }
  }
  payments.sort((a, b) => a.day - b.day || a.id - b.id);

  const amount = (p) => p.units * K.price + p.n * K.fee;
  const orderTotal = (o) => o.qty * K.price + K.fee;

  // Per-customer rollups.
  const byId = new Map(customers.map((c) => [c.id, Object.assign(c, { orders: 0, bottles: 0, gifts: 0, delivered: 0, paid: 0, last: -1 })]));
  orders.forEach((o) => {
    const c = byId.get(o.cust);
    if (o.status !== 'cancelled') { c.orders++; c.last = Math.max(c.last, o.day); }
    if (o.status === 'delivered') { c.bottles += o.qty + o.free; c.gifts += o.free; c.delivered += orderTotal(o); }
  });
  payments.forEach((p) => { byId.get(p.cust).paid += amount(p); });
  customers.forEach((c) => { c.debt = Math.max(0, c.delivered - c.paid); });

  const WD = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  const dateOf = (d) => new Date(START + d * DAY);
  const md = (d) => { const t = dateOf(d); return (t.getUTCMonth() + 1) + '/' + t.getUTCDate(); };
  const longDay = (d) => {
    if (d === LAST) return 'Өнөөдөр';
    if (d === LAST - 1) return 'Өчигдөр';
    const t = dateOf(d);
    return (t.getUTCMonth() + 1) + '-р сарын ' + t.getUTCDate() + ', ' + WD[t.getUTCDay()];
  };
  const ago = (d) => {
    const x = LAST - d;
    if (x <= 0) return 'өнөөдөр';
    if (x === 1) return 'өчигдөр';
    if (x < 30) return x + ' хоногийн өмнө';
    if (x < 365) return Math.floor(x / 30) + ' сарын өмнө';
    return Math.floor(x / 365) + ' жилийн өмнө';
  };
  // Stable pseudo time of day for display only.
  const timeOf = (id) => String(9 + ((id * 7) % 8)).padStart(2, '0') + ':' + String((id * 13) % 60).padStart(2, '0');

  K.data = {
    DAY, START, TODAY, LAST, customers, orders, payments, byId,
    amount, orderTotal, dateOf, md, longDay, ago, timeOf, WD,
    initials: (name) => name.split(' ').map((s) => s.charAt(0)).join('').slice(0, 2)
  };
})();
