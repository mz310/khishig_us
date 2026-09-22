/* Хишиг ус — shared prototype helpers */
(function () {
  const K = (window.KHISHIG = {});

  function readNum(key, fallback) {
    const q = new URLSearchParams(location.search).get(key);
    if (q !== null && q !== '' && !isNaN(+q)) return +q;
    try {
      const v = localStorage.getItem('khishig.' + key);
      if (v !== null && v !== '' && !isNaN(+v)) return +v;
    } catch (e) { /* storage unavailable */ }
    return fallback;
  }

  // Example values only — the owner sets real ones in admin settings.
  K.price = readNum('price', 3000);
  K.fee = readNum('fee', 0);
  K.fmt = (n) => Math.round(n).toLocaleString('en-US') + '₮';
  K.bonus = (q) => Math.floor(q / 3);

  // Wave path: baseline y, amplitude a, period p, drawn to width w, closed at height h.
  K.wave = function (y, a, p, w, h) {
    let d = 'M0 ' + y + ' Q' + p / 4 + ' ' + (y - a) + ' ' + p / 2 + ' ' + y;
    for (let x = p; x <= w; x += p / 2) d += ' T' + x + ' ' + y;
    return d + ' V' + h + ' H0 Z';
  };
  const wave = K.wave;

  const BOTTLE = 'M86 38H114V58C114 72 170 80 170 120V268Q170 292 146 292H54Q30 292 30 268V120C30 80 86 72 86 58Z';

  document.body.insertAdjacentHTML('afterbegin',
    '<svg width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs>' +
      '<filter id="goo" x="-20%" y="-60%" width="140%" height="220%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur"/>' +
        '<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo"/>' +
        '<feComposite in="SourceGraphic" in2="goo" operator="atop"/>' +
      '</filter>' +
      '<filter id="lg" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="2" seed="5" result="noise"/>' +
        '<feGaussianBlur in="noise" stdDeviation="1.5" result="soft"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="soft" scale="26" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '<clipPath id="bc"><path d="' + BOTTLE + '"/></clipPath>' +
    '</defs></svg>');

  // Real refraction only where it is supported and cheap enough (desktop Chromium).
  if (/Chrome\//.test(navigator.userAgent) && matchMedia('(hover: hover)').matches) {
    document.documentElement.classList.add('refract');
  }

  function bottle(kind) {
    if (kind === 'fill') {
      return '<svg viewBox="0 0 200 300" style="width:100%;height:100%;overflow:visible" aria-hidden="true">' +
        '<g clip-path="url(#bc)"><rect width="200" height="300" fill="#EAF4F9"/>' +
          '<g class="fillup">' +
            '<g class="run-mid"><path d="' + wave(116, 8, 50, 400, 300) + '" fill="#7CC6E8"/></g>' +
            '<g class="run"><path d="' + wave(124, 7, 50, 400, 300) + '" fill="#2B8AC2"/></g>' +
          '</g></g>' +
        '<path d="' + BOTTLE + '" fill="none" stroke="#0F3B57" stroke-width="5"/>' +
        '<rect x="80" y="30" width="40" height="9" rx="3" fill="#0F3B57"/>' +
        '<rect x="84" y="8" width="32" height="24" rx="5" fill="#1F7FB8"/>' +
      '</svg>';
    }
    return '<svg viewBox="0 0 200 300" style="width:100%;height:100%;overflow:visible" aria-hidden="true">' +
      '<ellipse cx="100" cy="297" rx="70" ry="7" fill="rgba(0,0,0,.25)"/>' +
      '<g clip-path="url(#bc)">' +
        '<rect width="200" height="300" fill="rgba(255,255,255,.08)"/>' +
        '<g class="run-mid"><path d="' + wave(120, 8, 50, 400, 300) + '" fill="#5FB3DE"/></g>' +
        '<g class="run"><path d="' + wave(128, 7, 50, 400, 300) + '" fill="#3E9BD0"/></g>' +
        '<circle class="bub" cx="64" cy="276" r="4" fill="rgba(255,255,255,.7)"/>' +
        '<circle class="bub b2" cx="120" cy="282" r="3" fill="rgba(255,255,255,.6)"/>' +
        '<circle class="bub b3" cx="148" cy="270" r="5" fill="rgba(255,255,255,.5)"/>' +
        '<circle class="bub b4" cx="92" cy="286" r="2.5" fill="rgba(255,255,255,.7)"/>' +
        '<rect x="42" y="150" width="7" height="110" rx="3.5" fill="rgba(255,255,255,.35)"/>' +
      '</g>' +
      '<path d="' + BOTTLE + '" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="2.6"/>' +
      '<path d="M32 150 Q100 160 168 150" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.6"/>' +
      '<path d="M32 246 Q100 256 168 246" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.6"/>' +
      '<rect x="48" y="170" width="104" height="54" rx="10" fill="rgba(255,255,255,.94)"/>' +
      '<text x="100" y="196" text-anchor="middle" style="font-family:Unbounded,sans-serif;font-weight:700;font-size:15px;fill:#0F3B57">ХИШИГ</text>' +
      '<text x="100" y="213" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:600;font-size:10px;fill:#1F7FB8;letter-spacing:1px">ЦЭВЭР УС · 5Л</text>' +
      '<path d="M120 42 C158 40 166 70 148 96" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="7" stroke-linecap="round"/>' +
      '<rect x="80" y="32" width="40" height="8" rx="3" fill="#2B8AC2"/>' +
      '<rect x="84" y="10" width="32" height="24" rx="5" fill="#2B8AC2"/>' +
      '<path d="M90 14V30M96 14V30M102 14V30M108 14V30" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>' +
    '</svg>';
  }

  // Water-fill buttons, bottles, prices.
  K.enhance = function (root) {
    root = root || document;
    root.querySelectorAll('.wbtn:not([data-w])').forEach((b) => {
      b.setAttribute('data-w', '1');
      b.insertAdjacentHTML('afterbegin',
        '<span class="fill" aria-hidden="true"><svg class="run" viewBox="0 0 200 12" preserveAspectRatio="none"><path d="' + wave(6, 6, 50, 200, 12) + '"/></svg></span>');
    });
    root.querySelectorAll('[data-bottle]:not([data-b])').forEach((el) => {
      el.setAttribute('data-b', '1');
      el.innerHTML = bottle(el.getAttribute('data-bottle'));
    });
    root.querySelectorAll('[data-price]').forEach((el) => { el.textContent = K.fmt(K.price); });
    root.querySelectorAll('[data-fee]').forEach((el) => { el.textContent = K.fee ? K.fmt(K.fee) : 'Үнэгүй'; });
  };

  K.toast = function (msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 1900);
  };

  // Liquid navigation: a droplet (lead + lagging trail, merged by the goo filter)
  // flows to the hovered/tapped item with running water inside.
  K.liquidNav = function (nav) {
    const lead = nav.querySelector('.blob.lead');
    const trail = nav.querySelector('.blob.trail');
    lead.insertAdjacentHTML('beforeend',
      '<svg class="run" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true"><path class="w1" d="' + wave(30, 8, 50, 200, 56) + '"/></svg>' +
      '<svg class="run-rev" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true"><path class="w2" d="' + wave(38, 6, 50, 200, 56) + '"/></svg>' +
      '<span class="shine"></span>');
    const items = Array.from(nav.querySelectorAll('[data-nav]'));
    const vertical = nav.classList.contains('vnav');
    let cur = Math.max(0, items.findIndex((i) => i.classList.contains('cur')));

    function place(i, instant) {
      const el = items[i];
      if (!el) return;
      [lead, trail].forEach((b) => {
        if (instant) b.style.transition = 'none';
        if (vertical) {
          b.style.top = el.offsetTop + 'px';
          b.style.height = el.offsetHeight + 'px';
        } else {
          b.style.left = el.offsetLeft + 'px';
          b.style.width = el.offsetWidth + 'px';
        }
      });
      if (instant) {
        void lead.offsetWidth;
        lead.style.transition = '';
        trail.style.transition = '';
      }
      items.forEach((it, j) => it.classList.toggle('on', j === i));
    }

    place(cur, true);
    if (document.fonts) document.fonts.ready.then(() => place(cur, true));
    const canHover = matchMedia('(hover: hover)').matches;

    items.forEach((it, i) => {
      if (canHover) it.addEventListener('mouseenter', () => place(i));
      it.addEventListener('focus', () => place(i));
      it.addEventListener('click', (e) => {
        const href = it.getAttribute('href') || '';
        if (href.length > 1 && href.charAt(0) === '#') { cur = i; place(i); return; }
        e.preventDefault();
        if (i === cur) return;
        place(i);
        if (!href || href === '#') {
          K.toast(it.getAttribute('data-soon') || 'Энэ дэлгэц загварт хараахан ороогүй');
          setTimeout(() => place(cur), 900);
          return;
        }
        cur = i;
        setTimeout(() => { location.href = href; }, 480);
      });
    });
    nav.addEventListener('mouseleave', () => place(cur));
    addEventListener('resize', () => place(cur, true));
  };

  // Segmented control with an elastic pill; returns a function to re-place it.
  K.seg = function (box) {
    const pill = box.querySelector('.pill');
    const place = (instant) => {
      const on = box.querySelector('.seg.on');
      if (!on) return;
      if (instant) pill.style.transition = 'none';
      pill.style.left = on.offsetLeft + 'px';
      pill.style.width = on.offsetWidth + 'px';
      if (instant) { void pill.offsetWidth; pill.style.transition = ''; }
    };
    place(true);
    if (document.fonts) document.fonts.ready.then(() => place(true));
    addEventListener('resize', () => place(true));
    return place;
  };

  K.bump = function (el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 260);
  };

  K.enhance();
  document.querySelectorAll('[data-liquid]').forEach(K.liquidNav);
})();
