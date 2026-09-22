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

  // 18.9 l jug silhouette (viewBox 0 0 260 420)
  const JUG = 'M108 48H152V68C152 74 230 76 230 120V350Q230 386 194 386H66Q30 386 30 350V120C30 76 108 74 108 68Z';

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
      '<clipPath id="jc"><path d="' + JUG + '"/></clipPath>' +
      '<clipPath id="lc"><rect x="40" y="196" width="180" height="138" rx="10"/></clipPath>' +
      '<linearGradient id="jg" x1="0" x2="1"><stop offset="0" stop-color="#CFE7FA" stop-opacity=".55"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".2"/><stop offset="1" stop-color="#9FD0F2" stop-opacity=".55"/></linearGradient>' +
      '<radialGradient id="glow" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#8FD37A" stop-opacity=".95"/><stop offset="1" stop-color="#8FD37A" stop-opacity="0"/></radialGradient>' +
    '</defs></svg>');

  // Real refraction only where it is supported and cheap enough (desktop Chromium).
  if (/Chrome\//.test(navigator.userAgent) && matchMedia('(hover: hover)').matches) {
    document.documentElement.classList.add('refract');
  }

  // The label as printed on the real bottle: logo, wordmark, splash band, contact bar.
  function label() {
    return '<g clip-path="url(#lc)">' +
      '<rect x="40" y="196" width="180" height="138" fill="#FFFFFF"/>' +
      '<ellipse cx="130" cy="336" rx="130" ry="58" fill="url(#glow)"/>' +
      '<g transform="translate(40 0)"><path d="' + wave(286, 8, 60, 180, 334) + '" fill="#5FB3DE" opacity=".8"/><path d="' + wave(293, 6, 60, 180, 334) + '" fill="#2F7FC1" opacity=".85"/></g>' +
      '<rect x="40" y="308" width="180" height="26" fill="#2B2A5C"/>' +
      '<path transform="translate(86 315) scale(.5)" d="M6.6 3.5h2.8l1.5 4.3-2 1.4a11 11 0 0 0 5.9 5.9l1.4-2 4.3 1.5v2.8a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<text x="136" y="325" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:700;font-size:11px;fill:#fff;letter-spacing:.6px">8802 7971</text>' +
      '<image href="assets/logo.svg" x="99" y="202" width="62" height="24"/>' +
      '<text x="130" y="250" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:800;font-size:24px;fill:#2B2A5C;letter-spacing:2.5px">ХИШИГ</text>' +
      '<text x="130" y="263" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:700;font-size:7.5px;fill:#3E8E2A;letter-spacing:1.7px">БАЙГАЛИЙН ЦЭВЭР УС</text>' +
    '</g>';
  }

  function bottle(kind) {
    const fill = kind === 'fill';
    return '<svg viewBox="0 0 260 420" style="width:100%;height:100%;overflow:visible" aria-hidden="true">' +
      (fill ? '' : '<ellipse cx="130" cy="408" rx="92" ry="8" fill="rgba(0,0,0,.28)"/>') +
      '<path d="M160 60C198 58 206 92 186 118" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="8" stroke-linecap="round"/>' +
      '<g clip-path="url(#jc)">' +
        '<rect width="260" height="420" fill="url(#jg)"/>' +
        (fill ? '<g class="fillup">' : '<g>') +
          '<g class="run-mid"><path d="' + wave(152, 9, 65, 520, 420) + '" fill="#5FB3DE" opacity=".95"/></g>' +
          '<g class="run"><path d="' + wave(160, 7, 65, 520, 420) + '" fill="#2F7FC1" opacity=".95"/></g>' +
        '</g>' +
        (fill ? '' :
          '<circle class="bub" cx="74" cy="380" r="4" fill="rgba(255,255,255,.7)"/>' +
          '<circle class="bub b2" cx="150" cy="386" r="3" fill="rgba(255,255,255,.6)"/>' +
          '<circle class="bub b3" cx="196" cy="376" r="5" fill="rgba(255,255,255,.5)"/>' +
          '<circle class="bub b4" cx="112" cy="390" r="2.5" fill="rgba(255,255,255,.7)"/>') +
        '<path d="M30 352H230V350Q230 386 194 386H66Q30 386 30 350Z" fill="#2A6FAE" opacity=".9"/>' +
      '</g>' +
      '<path d="M32 140Q130 152 228 140" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>' +
      '<path d="M32 344Q130 356 228 344" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2"/>' +
      label() +
      '<path d="M54 100C46 160 46 270 56 340" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M206 96C214 130 214 180 208 200" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="' + JUG + '" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.4"/>' +
      '<rect x="103" y="44" width="54" height="10" rx="4" fill="#2A6FAE"/>' +
      '<rect x="100" y="16" width="60" height="36" rx="9" fill="#2F7FC1"/>' +
      '<rect x="96" y="12" width="68" height="12" rx="6" fill="#2A6FAE"/>' +
      '<path d="M110 26V48M122 26V48M134 26V48M146 26V48" stroke="rgba(255,255,255,.3)" stroke-width="2"/>' +
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
