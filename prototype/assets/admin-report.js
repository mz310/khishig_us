/* Хишиг ус — controller shared by the phone "Гүйлгээ" page and the desktop admin report. */
(function () {
  const K = window.KHISHIG;
  const D = K.data;
  const R = K.report;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const METHOD = { cash: 'Бэлэн', transfer: 'Данс' };
  const ICON = {
    cash: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6.5" width="18" height="11" rx="2.5"/><circle cx="12" cy="12" r="2.6"/></svg>',
    transfer: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 9.5 12 4.5l8.5 5"/><path d="M5.5 10v7M10 10v7M14 10v7M18.5 10v7M3.5 19.5h17"/></svg>'
  };
  const UP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  const DOWN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
  const PALETTE = [['#E3EFF6', '#12314A'], ['#FBF1E0', '#6E4A0F'], ['#E2F1EA', '#1E5F45'], ['#ECEAF5', '#3E3A78'], ['#FAECE6', '#86341A']];

  K.avatarStyle = (id) => { const p = PALETTE[id % PALETTE.length]; return 'background:' + p[0] + ';color:' + p[1]; };

  // Small "vs previous period" line under a KPI; colour says good/bad, the arrow says direction.
  function tileDelta(id, now, prev, upIsGood) {
    const el = $(id);
    if (!el) return;
    if (!prev) { el.className = 'delta flat'; el.textContent = 'Харьцуулах өгөгдөл алга'; return; }
    const p = Math.round(((now - prev) / prev) * 100);
    el.className = 'delta ' + (p === 0 ? 'flat' : (p > 0) === upIsGood ? 'good' : 'bad');
    el.innerHTML = (p > 0 ? UP : p < 0 ? DOWN : '') + '<span></span>';
    el.lastChild.textContent = (p > 0 ? '+' : '') + p + '% өмнөх үеэс';
  }

  const refText = (p) => (p.kind === 'debt' ? 'Өр төлөлт · #' : 'Захиалга #') + p.order;

  K.mountReport = function (opts) {
    opts = Object.assign({ chartHeight: 200, pageSize: 30, table: false }, opts);
    const st = { gran: 'month', ref: D.LAST, filter: 'all', q: '', limit: opts.pageSize, rep: null, showTable: false };
    const placeGran = K.seg($('granSeg'));

    function renderReport(animate) {
      const rep = R.report(st.gran, st.ref);
      st.rep = rep;
      st.limit = opts.pageSize;
      $('plabel').textContent = rep.period.label + (rep.period.current ? ' · одоо' : '');
      $('prev').disabled = !R.canPrev(st.gran, st.ref);
      $('next').disabled = !R.canNext(st.gran, st.ref);
      $('hero').textContent = K.fmt(rep.now.total);
      const dl = $('delta');
      if (rep.delta) {
        const p = rep.delta.pct;
        dl.className = 'delta ' + (p > 0 ? 'up' : p < 0 ? 'down' : 'flat');
        dl.innerHTML = (p > 0 ? UP : p < 0 ? DOWN : '') + '<span></span>';
        dl.lastChild.textContent = (p > 0 ? '+' : '') + p + '% ' + rep.delta.text;
      } else {
        dl.className = 'delta flat';
        dl.textContent = 'Харьцуулах өмнөх өгөгдөл алга';
      }
      $('lgT').textContent = K.fmt(rep.now.transfer);
      $('lgC').textContent = K.fmt(rep.now.cash);
      R.chart($('chart'), rep.period.buckets, { height: opts.chartHeight, animate: animate, label: 'Орлого, ' + rep.period.label });
      if (st.showTable) { $('tbl').replaceChildren(R.table(rep.period.buckets)); }
      $('kOrders').textContent = rep.orders.orders.toLocaleString('en-US');
      $('kBottles').textContent = rep.orders.bottles.toLocaleString('en-US');
      $('kDebt').textContent = K.fmt(rep.orders.newDebt);
      $('kRepaid').textContent = K.fmt(rep.now.repaid);
      const pv = rep.prev;
      tileDelta('kOrdersD', rep.orders.orders, pv && pv.orders.orders, true);
      tileDelta('kBottlesD', rep.orders.bottles, pv && pv.orders.bottles, true);
      tileDelta('kDebtD', rep.orders.newDebt, pv && pv.orders.newDebt, false);
      tileDelta('kRepaidD', rep.now.repaid, pv && pv.repaid, true);
      renderTx();
      if (opts.onRender) opts.onRender(rep);
    }

    function filtered() {
      const q = st.q.trim().toLowerCase();
      return st.rep.payments.slice().reverse().filter((p) => {
        if (st.filter === 'debt' && p.kind !== 'debt') return false;
        if ((st.filter === 'cash' || st.filter === 'transfer') && p.method !== st.filter) return false;
        if (!q) return true;
        const c = D.byId.get(p.cust);
        return c.name.toLowerCase().includes(q) || c.phone.includes(q);
      });
    }

    function renderTx() {
      const list = filtered();
      const shown = list.slice(0, st.limit);
      $('txCount').textContent = list.length.toLocaleString('en-US') + ' гүйлгээ';
      if (opts.table) {
        $('txList').innerHTML = shown.map((p) => {
          const c = D.byId.get(p.cust);
          return '<tr><td style="white-space:nowrap">' + D.md(p.day) + ' · ' + D.timeOf(p.id) + '</td>' +
            '<td><a href="admin-customer.html?id=' + c.id + '" style="color:#14283A;font-weight:600">' + esc(c.name) + '</a></td>' +
            '<td class="muted">' + refText(p) + '</td>' +
            '<td><span class="tag pay-' + p.method + '">' + METHOD[p.method] + '</span></td>' +
            '<td class="num" style="font-weight:700">' + K.fmt(D.amount(p)) + '</td></tr>';
        }).join('') || '<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">Гүйлгээ олдсонгүй</td></tr>';
      } else {
        let html = '';
        let day = null;
        const daySum = {};
        list.forEach((p) => { daySum[p.day] = (daySum[p.day] || 0) + D.amount(p); });
        shown.forEach((p) => {
          if (p.day !== day) {
            if (day !== null) html += '</div>';
            day = p.day;
            html += '<div class="dayhead"><span>' + D.longDay(day) + '</span><b>' + K.fmt(daySum[day]) + '</b></div><div>';
          }
          const c = D.byId.get(p.cust);
          html += '<a class="txrow" href="admin-customer.html?id=' + c.id + '" style="color:inherit">' +
            '<div class="txicon ' + p.method + '">' + ICON[p.method] + '</div>' +
            '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14.5px">' + esc(c.name) + '</div>' +
            '<div class="muted" style="font-size:12.5px;margin-top:2px">' + refText(p) + ' · ' + D.timeOf(p.id) + '</div></div>' +
            '<div style="text-align:right"><div style="font-weight:700;font-variant-numeric:tabular-nums">+' + K.fmt(D.amount(p)) + '</div>' +
            '<div class="muted" style="font-size:12px;margin-top:2px">' + METHOD[p.method] + '</div></div></a>';
        });
        if (day !== null) html += '</div>';
        $('txList').innerHTML = html || '<div class="muted" style="text-align:center;padding:30px 0;font-size:14px">Гүйлгээ олдсонгүй</div>';
      }
      $('more').hidden = list.length <= st.limit;
    }

    document.querySelectorAll('#granSeg .seg').forEach((b) => b.addEventListener('click', () => {
      if (st.gran === b.dataset.g) return;
      st.gran = b.dataset.g;
      st.ref = D.LAST;
      document.querySelectorAll('#granSeg .seg').forEach((x) => x.classList.toggle('on', x === b));
      placeGran();
      renderReport(true);
    }));
    $('prev').addEventListener('click', () => { st.ref = R.shift(st.gran, st.ref, -1); renderReport(true); });
    $('next').addEventListener('click', () => {
      st.ref = Math.min(R.shift(st.gran, st.ref, 1), D.LAST);
      renderReport(true);
    });
    $('tblBtn').addEventListener('click', () => {
      st.showTable = !st.showTable;
      $('tblBtn').setAttribute('aria-expanded', String(st.showTable));
      $('tblBtn').textContent = st.showTable ? 'Хүснэгтийг хаах' : 'Хүснэгтээр харах';
      $('tbl').hidden = !st.showTable;
      if (st.showTable) $('tbl').replaceChildren(R.table(st.rep.period.buckets));
    });
    document.querySelectorAll('#chips .chip').forEach((b) => b.addEventListener('click', () => {
      st.filter = b.dataset.f;
      st.limit = opts.pageSize;
      document.querySelectorAll('#chips .chip').forEach((x) => x.classList.toggle('on', x === b));
      renderTx();
    }));
    let qt;
    $('q').addEventListener('input', (e) => {
      clearTimeout(qt);
      $('txList').classList.add('dim');
      qt = setTimeout(() => { st.q = e.target.value; st.limit = opts.pageSize; renderTx(); $('txList').classList.remove('dim'); }, 180);
    });
    $('more').addEventListener('click', () => { st.limit += opts.pageSize; renderTx(); });

    let rt;
    let lastW = $('chart').clientWidth;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if ($('chart').clientWidth === lastW) return;
        lastW = $('chart').clientWidth;
        R.chart($('chart'), st.rep.period.buckets, { height: opts.chartHeight, animate: false });
      }, 150);
    });

    renderReport(true);
    return st;
  };
})();
