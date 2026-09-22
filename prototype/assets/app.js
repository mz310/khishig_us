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
  // Label wraps the cylinder, so its top and bottom edges bow slightly.
  const LABEL = 'M40 202Q130 192 220 202V328Q130 338 40 328Z';

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
      '<clipPath id="lc"><path d="' + LABEL + '"/></clipPath>' +
      '<linearGradient id="jgBody" x1="0" x2="1"><stop offset="0" stop-color="#4E90CC" stop-opacity=".95"/><stop offset=".18" stop-color="#A6D2F2" stop-opacity=".9"/><stop offset=".42" stop-color="#EAF6FF" stop-opacity=".85"/><stop offset=".56" stop-color="#F8FCFF" stop-opacity=".8"/><stop offset=".74" stop-color="#B4DAF5" stop-opacity=".9"/><stop offset="1" stop-color="#3A78B8" stop-opacity=".95"/></linearGradient>' +
      '<linearGradient id="jgDepth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".3"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#08203D" stop-opacity=".4"/></linearGradient>' +
      '<linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5BB2EE"/><stop offset=".55" stop-color="#2F86D0"/><stop offset="1" stop-color="#174F8F"/></linearGradient>' +
      '<radialGradient id="wsurf" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#D2ECFC"/><stop offset="1" stop-color="#7EC1ED"/></radialGradient>' +
      '<linearGradient id="capg" x1="0" x2="1"><stop offset="0" stop-color="#1B5C9E"/><stop offset=".28" stop-color="#3A93DC"/><stop offset=".5" stop-color="#63B3EE"/><stop offset=".72" stop-color="#3A93DC"/><stop offset="1" stop-color="#17528F"/></linearGradient>' +
      '<linearGradient id="lblCurve" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".14" stop-color="#000" stop-opacity=".05"/><stop offset=".5" stop-color="#FFF" stop-opacity=".08"/><stop offset=".86" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>' +
      '<radialGradient id="glow" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#8FD37A" stop-opacity=".95"/><stop offset="1" stop-color="#8FD37A" stop-opacity="0"/></radialGradient>' +
      '<filter id="b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>' +
      '<filter id="b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
    '</defs></svg>');

  // Real refraction only where it is supported and cheap enough (desktop Chromium).
  if (/Chrome\//.test(navigator.userAgent) && matchMedia('(hover: hover)').matches) {
    document.documentElement.classList.add('refract');
  }

  // The label as printed on the real bottle: logo, wordmark, splash band, contact bar.
  function label() {
    return '<g clip-path="url(#lc)">' +
      '<path d="' + LABEL + '" fill="#FFFFFF"/>' +
      '<ellipse cx="130" cy="338" rx="130" ry="58" fill="url(#glow)"/>' +
      '<g transform="translate(40 0)"><path d="' + wave(286, 8, 60, 180, 340) + '" fill="#5FB3DE" opacity=".8"/><path d="' + wave(293, 6, 60, 180, 340) + '" fill="#2F7FC1" opacity=".85"/></g>' +
      '<path d="M40 308Q130 312 220 308V328Q130 338 40 328Z" fill="#2B2A5C"/>' +
      '<path transform="translate(86 315) scale(.5)" d="M6.6 3.5h2.8l1.5 4.3-2 1.4a11 11 0 0 0 5.9 5.9l1.4-2 4.3 1.5v2.8a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<text x="136" y="326" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:700;font-size:11px;fill:#fff;letter-spacing:.6px">8802 7971</text>' +
      '<image href="assets/logo.svg" x="99" y="204" width="62" height="24"/>' +
      '<text x="130" y="252" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:800;font-size:24px;fill:#2B2A5C;letter-spacing:2.5px">ХИШИГ</text>' +
      '<text x="130" y="265" text-anchor="middle" style="font-family:Onest,sans-serif;font-weight:700;font-size:7.5px;fill:#3E8E2A;letter-spacing:1.7px">БАЙГАЛИЙН ЦЭВЭР УС</text>' +
      '<path d="' + LABEL + '" fill="url(#lblCurve)"/>' +
    '</g>' +
    '<path d="' + LABEL + '" fill="none" stroke="rgba(10,30,60,.18)" stroke-width="1"/>';
  }

  // Polycarbonate 18.9 l jug: tinted body, water with a meniscus, wrapped label,
  // Fresnel edge darkening, specular streaks and a ribbed cap.
  function bottle(kind) {
    const fill = kind === 'fill';
    const shadow = kind === 'hero';
    return '<svg viewBox="0 0 260 420" style="width:100%;height:100%;overflow:visible" aria-hidden="true">' +
      (shadow ? '<ellipse cx="130" cy="406" rx="100" ry="11" fill="#06122A" opacity=".45" filter="url(#b8)"/>' : '') +
      '<path d="M158 62C202 60 214 98 190 126" fill="none" stroke="rgba(150,200,240,.6)" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M160 60C200 58 210 94 188 120" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round"/>' +
      '<g clip-path="url(#jc)">' +
        '<rect width="260" height="420" fill="url(#jgBody)"/>' +
        (fill ? '<g class="fillup">' : '<g>') +
          '<rect x="0" y="150" width="260" height="270" fill="url(#wg)" opacity=".95"/>' +
          '<g class="run-mid"><path d="' + wave(152, 7, 65, 520, 420) + '" fill="#62B5EC" opacity=".9"/></g>' +
          '<g class="run"><path d="' + wave(158, 5, 65, 520, 420) + '" fill="#3D93DA" opacity=".85"/></g>' +
          '<ellipse cx="130" cy="153" rx="99" ry="9" fill="url(#wsurf)" opacity=".85"/>' +
          '<path d="M44 151Q130 141 216 151" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.8"/>' +
          '<ellipse cx="108" cy="296" rx="42" ry="14" fill="#FFFFFF" opacity=".16" filter="url(#b8)"/>' +
          '<ellipse cx="172" cy="338" rx="30" ry="10" fill="#FFFFFF" opacity=".13" filter="url(#b8)"/>' +
        '</g>' +
        (fill ? '' :
          '<circle class="bub" cx="74" cy="380" r="3.5" fill="rgba(255,255,255,.7)"/>' +
          '<circle class="bub b2" cx="150" cy="386" r="2.5" fill="rgba(255,255,255,.6)"/>' +
          '<circle class="bub b3" cx="196" cy="376" r="4" fill="rgba(255,255,255,.5)"/>' +
          '<circle class="bub b4" cx="112" cy="390" r="2" fill="rgba(255,255,255,.7)"/>') +
        '<path d="M30 352H230V350Q230 386 194 386H66Q30 386 30 350Z" fill="url(#capg)" opacity=".92"/>' +
        '<path d="M32 354H228" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/>' +
        '<rect width="260" height="420" fill="url(#jgDepth)"/>' +
        '<path d="' + JUG + '" fill="none" stroke="#08203D" stroke-width="16" opacity=".38" filter="url(#b8)"/>' +
        '<path d="M30 137Q130 149 230 137" fill="none" stroke="rgba(0,20,50,.2)" stroke-width="3"/>' +
        '<path d="M30 141Q130 153 230 141" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>' +
        '<path d="M30 341Q130 353 230 341" fill="none" stroke="rgba(0,20,50,.2)" stroke-width="3"/>' +
        '<path d="M30 345Q130 357 230 345" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/>' +
      '</g>' +
      label() +
      '<ellipse cx="60" cy="230" rx="8" ry="118" fill="#FFFFFF" opacity=".5" filter="url(#b4)"/>' +
      '<path d="M60 108C52 170 52 282 62 332" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>' +
      '<ellipse cx="204" cy="200" rx="5" ry="72" fill="#FFFFFF" opacity=".22" filter="url(#b4)"/>' +
      '<path d="M114 74C152 70 206 82 224 116" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".55" filter="url(#b4)"/>' +
      '<path d="' + JUG + '" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.6"/>' +
      '<rect x="101" y="46" width="58" height="9" rx="4" fill="rgba(255,255,255,.6)"/>' +
      '<rect x="99" y="49" width="62" height="5" rx="2" fill="#2A6FAE"/>' +
      '<rect x="100" y="14" width="60" height="36" rx="8" fill="url(#capg)"/>' +
      '<path d="M108 20V46M118 20V46M128 20V46M138 20V46M148 20V46" stroke="rgba(0,10,40,.2)" stroke-width="3"/>' +
      '<path d="M111 20V46M121 20V46M131 20V46M141 20V46M151 20V46" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>' +
      '<rect x="97" y="10" width="66" height="12" rx="6" fill="#5AA5E6"/>' +
      '<rect x="102" y="11" width="56" height="4" rx="2" fill="rgba(255,255,255,.55)"/>' +
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
