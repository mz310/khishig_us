/* Хишиг ус — period math + revenue chart for the admin prototype. */
(function () {
  const K = window.KHISHIG;
  const D = K.data;
  const idx = (ms) => Math.round((ms - D.START) / D.DAY);
  const ROMAN = ['I', 'II', 'III', 'IV'];
  const WD_SHORT = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

  // A period is [start, end) in day indices plus its sub-buckets.
  function range(gran, ref) {
    const t = D.dateOf(ref);
    const y = t.getUTCFullYear();
    const m = t.getUTCMonth();
    let start, end, label;
    const buckets = [];
    if (gran === 'week') {
      start = ref - ((t.getUTCDay() + 6) % 7);
      end = start + 7;
      label = D.md(start) + ' – ' + D.md(end - 1);
      for (let i = 0; i < 7; i++) buckets.push({ start: start + i, end: start + i + 1, label: WD_SHORT[i], title: D.longDay(start + i), show: true });
    } else if (gran === 'month') {
      start = idx(Date.UTC(y, m, 1));
      end = idx(Date.UTC(y, m + 1, 1));
      label = y + ' оны ' + (m + 1) + '-р сар';
      for (let d = start; d < end; d++) {
        const day = d - start + 1;
        buckets.push({ start: d, end: d + 1, label: String(day), title: D.longDay(d), show: day === 1 || day % 5 === 0 });
      }
    } else if (gran === 'quarter') {
      const q = Math.floor(m / 3);
      start = idx(Date.UTC(y, q * 3, 1));
      end = idx(Date.UTC(y, q * 3 + 3, 1));
      label = y + ' оны ' + ROMAN[q] + ' улирал';
      let i = 0;
      for (let d = start; d < end; d += 7, i++) {
        const e = Math.min(end, d + 7);
        buckets.push({ start: d, end: e, label: D.md(d), title: D.md(d) + ' – ' + D.md(e - 1), show: i % 2 === 0 });
      }
    } else {
      start = idx(Date.UTC(y, 0, 1));
      end = idx(Date.UTC(y + 1, 0, 1));
      label = y + ' он';
      for (let mm = 0; mm < 12; mm++) {
        const s = idx(Date.UTC(y, mm, 1));
        buckets.push({ start: s, end: idx(Date.UTC(y, mm + 1, 1)), label: String(mm + 1), title: y + ' оны ' + (mm + 1) + '-р сар', show: true });
      }
    }
    return { gran, start, end, label, buckets, current: start <= D.LAST && D.LAST < end };
  }

  function shift(gran, ref, dir) {
    const t = D.dateOf(ref);
    if (gran === 'week') return ref + dir * 7;
    const months = gran === 'month' ? 1 : gran === 'quarter' ? 3 : 12;
    return idx(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + dir * months, 1));
  }
  const canPrev = (gran, ref) => range(gran, shift(gran, ref, -1)).end > 0;
  const canNext = (gran, ref) => range(gran, shift(gran, ref, 1)).start <= D.LAST;

  // Payments are sorted by day; find the slice for [a, b).
  function lower(day) {
    let lo = 0, hi = D.payments.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (D.payments[mid].day < day) lo = mid + 1; else hi = mid; }
    return lo;
  }
  function paymentsIn(a, b) { return D.payments.slice(lower(a), lower(b)); }

  function sums(a, b) {
    const s = { cash: 0, transfer: 0, total: 0, repaid: 0, count: 0 };
    paymentsIn(a, b).forEach((p) => {
      const v = D.amount(p);
      s[p.method] += v;
      s.total += v;
      s.count++;
      if (p.kind === 'debt') s.repaid += v;
    });
    return s;
  }

  function orderStats(a, b) {
    const s = { orders: 0, bottles: 0, newDebt: 0 };
    D.orders.forEach((o) => {
      if (o.day < a || o.day >= b || o.status === 'cancelled') return;
      s.orders++;
      if (o.status === 'delivered') {
        s.bottles += o.qty + o.free;
        if (o.pay === 'debt') s.newDebt += D.orderTotal(o);
      }
    });
    return s;
  }

  const PREV = {
    week: ['өмнөх 7 хоногийн мөн үеэс', 'өмнөх 7 хоногоос'],
    month: ['өмнөх сарын мөн үеэс', 'өмнөх сараас'],
    quarter: ['өмнөх улирлын мөн үеэс', 'өмнөх улирлаас'],
    year: ['өмнөх жилийн мөн үеэс', 'өмнөх жилээс']
  };

  // Everything a report view needs for one period.
  function report(gran, ref) {
    const p = range(gran, ref);
    const upto = p.current ? D.LAST + 1 : p.end;
    const now = sums(p.start, upto);
    const prevP = range(gran, shift(gran, ref, -1));
    const prevEnd = p.current ? Math.min(prevP.end, prevP.start + (upto - p.start)) : prevP.end;
    const before = prevP.end > 0 ? sums(Math.max(0, prevP.start), prevEnd) : null;
    let delta = null;
    if (before && before.total > 0) delta = { pct: Math.round(((now.total - before.total) / before.total) * 100), text: PREV[gran][p.current ? 0 : 1] };
    p.buckets.forEach((bk) => {
      const future = bk.start > D.LAST;
      const s = future ? { cash: 0, transfer: 0, total: 0 } : sums(bk.start, Math.min(bk.end, D.LAST + 1));
      Object.assign(bk, { cash: s.cash, transfer: s.transfer, total: s.total, future: future, today: bk.start <= D.LAST && D.LAST < bk.end });
    });
    const prev = before ? { orders: orderStats(Math.max(0, prevP.start), prevEnd), repaid: before.repaid } : null;
    return { period: p, now, delta, prev, orders: orderStats(p.start, upto), payments: paymentsIn(p.start, upto) };
  }

  function compact(n) {
    if (n >= 1e6) return (Math.round(n / 1e5) / 10).toLocaleString('en-US') + ' сая';
    if (n >= 1e3) return Math.round(n / 1e3).toLocaleString('en-US') + ' мян';
    return String(n);
  }

  function niceMax(max, ticks) {
    const raw = max / ticks;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((x) => x * pow).find((x) => x >= raw) || 10 * pow;
    return { step, top: step * Math.ceil(max / step) };
  }

  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  function topRounded(x, y, w, h, rad) {
    const r = Math.max(0, Math.min(rad, w / 2, h));
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }

  // Stacked columns (Данс at the base, Бэлэн on top), one per bucket.
  function chart(root, buckets, opts) {
    opts = opts || {};
    const animate = opts.animate !== false;
    root.classList.add('viz');
    root.innerHTML = '';
    const W = Math.max(240, root.clientWidth);
    const H = opts.height || 200;
    const padL = 46, padR = 6, padT = 12, padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const base = padT + plotH;
    const max = Math.max(1, ...buckets.map((b) => b.total));
    const sc = niceMax(max, 4);
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': opts.label || 'Орлогын график' }, root);

    for (let v = 0; v <= sc.top + 1e-9; v += sc.step) {
      const y = base - (v / sc.top) * plotH;
      el('line', { x1: padL, x2: W - padR, y1: y, y2: y, class: v === 0 ? 'axis' : 'grid' }, svg);
      const tx = el('text', { x: padL - 8, y: y + 4, class: 'tick', 'text-anchor': 'end' }, svg);
      tx.textContent = v === 0 ? '0' : compact(v);
    }

    const n = buckets.length;
    const band = plotW / n;
    const bw = Math.max(2, Math.min(24, band - 2));
    const cols = [];
    buckets.forEach((b, i) => {
      const x = padL + i * band + (band - bw) / 2;
      const g = el('g', { class: 'col' + (b.today ? ' is-today' : ''), style: 'transition-delay:' + (animate ? Math.min(i * 14, 400) : 0) + 'ms,0ms;transform-origin:0 ' + base + 'px' }, svg);
      const ht = (b.transfer / sc.top) * plotH;
      const hc = (b.cash / sc.top) * plotH;
      const gap = ht > 0 && hc > 0 ? 2 : 0;
      if (ht > 0) {
        if (hc > 0) el('rect', { x: x, y: base - ht, width: bw, height: ht, class: 's-transfer' }, g);
        else el('path', { d: topRounded(x, base - ht, bw, ht, 4), class: 's-transfer' }, g);
      }
      if (hc > 0) el('path', { d: topRounded(x, base - ht - gap - hc, bw, hc, 4), class: 's-cash' }, g);
      cols.push({ g, x: x + bw / 2, top: base - ht - gap - hc });
      if (b.show) {
        const t = el('text', { x: padL + i * band + band / 2, y: H - 8, class: 'xlab' + (b.today ? ' now' : ''), 'text-anchor': 'middle' }, svg);
        t.textContent = b.label;
      }
    });

    const tip = document.createElement('div');
    tip.className = 'tt';
    tip.hidden = true;
    root.appendChild(tip);

    function row(cls, value, name) {
      const r = document.createElement('div');
      r.className = 'tt-r';
      const key = document.createElement('i');
      key.className = cls;
      const b = document.createElement('b');
      b.textContent = value;
      const s = document.createElement('span');
      s.textContent = name;
      r.append(key, b, s);
      return r;
    }
    function show(i) {
      const b = buckets[i];
      svg.classList.add('hovering');
      cols.forEach((c, j) => c.g.classList.toggle('hl', j === i));
      tip.replaceChildren();
      const h = document.createElement('div');
      h.className = 'tt-h';
      h.textContent = b.title;
      tip.appendChild(h);
      if (b.future) {
        const f = document.createElement('div');
        f.className = 'tt-t';
        f.textContent = 'Хараахан болоогүй';
        tip.appendChild(f);
      } else {
        tip.appendChild(row('k-transfer', K.fmt(b.transfer), 'Данс'));
        tip.appendChild(row('k-cash', K.fmt(b.cash), 'Бэлэн'));
        const t = document.createElement('div');
        t.className = 'tt-t';
        t.textContent = 'Нийт ' + K.fmt(b.total);
        tip.appendChild(t);
      }
      tip.hidden = false;
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      const left = Math.max(0, Math.min(W - tw, cols[i].x - tw / 2));
      const top = Math.max(0, Math.min(cols[i].top, base) - th - 10);
      tip.style.transform = 'translate(' + left + 'px,' + top + 'px)';
    }
    function hide() {
      svg.classList.remove('hovering');
      cols.forEach((c) => c.g.classList.remove('hl'));
      tip.hidden = true;
    }

    buckets.forEach((b, i) => {
      const hit = el('rect', { x: padL + i * band, y: padT, width: band, height: plotH + padB, class: 'hit', tabindex: '0',
        'aria-label': b.title + ': ' + (b.future ? 'хараахан болоогүй' : 'нийт ' + K.fmt(b.total)) }, svg);
      hit.addEventListener('pointerenter', () => show(i));
      hit.addEventListener('pointerdown', () => show(i));
      hit.addEventListener('focus', () => show(i));
      hit.addEventListener('blur', hide);
    });
    svg.addEventListener('pointerleave', hide);

    if (animate) {
      requestAnimationFrame(() => requestAnimationFrame(() => cols.forEach((c) => c.g.classList.add('in'))));
    } else {
      cols.forEach((c) => c.g.classList.add('in'));
    }
  }

  function table(buckets) {
    const t = document.createElement('table');
    t.className = 'vtable';
    const head = document.createElement('tr');
    ['Хугацаа', 'Данс', 'Бэлэн', 'Нийт'].forEach((h) => { const th = document.createElement('th'); th.textContent = h; head.appendChild(th); });
    const thead = document.createElement('thead');
    thead.appendChild(head);
    t.appendChild(thead);
    const tb = document.createElement('tbody');
    buckets.filter((b) => !b.future).forEach((b) => {
      const tr = document.createElement('tr');
      [b.title, K.fmt(b.transfer), K.fmt(b.cash), K.fmt(b.total)].forEach((v) => { const td = document.createElement('td'); td.textContent = v; tr.appendChild(td); });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    return t;
  }

  K.report = { range, shift, canPrev, canNext, report, compact, chart, table };
})();
