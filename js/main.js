/**
 * ============================================================
 *  АВТОПРО — main.js
 *  Рендер контента из js/config.js + интерактив лендинга.
 *  Нулевые зависимости. Порядок подключения: config.js -> main.js.
 * ============================================================
 */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var cfg = window.LANDING_CONFIG || {};

  /* ---------- УТИЛИТЫ ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function getPath(path) {
    // алиас: в разметке используется "contact.*", в конфиге — "contacts.*"
    if (path.indexOf('contact.') === 0) path = 'contacts' + path.slice(7);
    return path.split('.').reduce(function (obj, key) {
      return (obj == null) ? undefined : obj[key];
    }, cfg);
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- ИКОНКИ (inline SVG, stroke = currentColor) ---------- */
  var ICONS = {
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    disc: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
    drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    paint: '<path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
  };
  /* ---------- ИКОНКИ, часть 2 ---------- */
  ICONS.clipboard = '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>';
  ICONS.clock = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
  ICONS.car = '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M5 12h14"/>';
  ICONS.check = '<polyline points="20 6 9 17 4 12"/>';
  ICONS.phone = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>';
  ICONS.pin = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>';
  ICONS.mail = '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>';
  ICONS.telegram = '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>';
  ICONS.whatsapp = '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.3A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 9.5c.6 2.4 3.1 4.9 5.5 5.5l1.2-1.2-1.9-1-1 1c-1-.5-1.9-1.4-2.4-2.4l1-1-1-1.9z"/>';
  ICONS.vk = '<path d="M3 8c1 6 5 9 10 9h2v-3c1.5 0 3 1.5 4 3h3c-.5-2-2-3.5-3-4 1-.5 2.5-2 3-5h-3c-.5 2-1.5 3.5-3 4V7h-3v4c-2-.5-3.5-2-4-4H3z"/>';
  ICONS.youtube = '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>';

  function icon(name) {
    var body = ICONS[name];
    if (!body) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  /* ---------- ПОДСТАНОВКА КОНТЕНТА ИЗ CONFIG ---------- */
  function applyConfig() {
    // data-cfg="path" -> textContent
    $$('[data-cfg]').forEach(function (el) {
      var val = getPath(el.getAttribute('data-cfg'));
      if (val != null) el.textContent = val;
    });
    // data-cfg-html="path" -> innerHTML (заголовки с <span class="accent">)
    $$('[data-cfg-html]').forEach(function (el) {
      var val = getPath(el.getAttribute('data-cfg-html'));
      if (val != null) el.innerHTML = val;
    });
    // data-cfg-src="path" -> src изображения
    $$('[data-cfg-src]').forEach(function (el) {
      var val = getPath(el.getAttribute('data-cfg-src'));
      if (val) el.src = val;
    });
    // data-cfg-tel="contacts.phone" -> текст телефона + tel:-ссылка
    $$('[data-cfg-tel]').forEach(function (el) {
      var phone = getPath(el.getAttribute('data-cfg-tel'));
      if (phone) el.textContent = phone;
      var href = getPath('contacts.phoneHref');
      if (href) el.href = 'tel:' + href;
    });
    // data-cfg-tel-btn -> только tel:-ссылка (текст кнопки не меняем)
    $$('[data-cfg-tel-btn]').forEach(function (el) {
      var href = getPath('contacts.phoneHref');
      if (href) el.href = 'tel:' + href;
    });
    // data-cfg-href="contacts.whatsapp" -> href
    $$('[data-cfg-href]').forEach(function (el) {
      var val = getPath(el.getAttribute('data-cfg-href'));
      if (val) el.href = val;
    });
  }
  /* ---------- РЕНДЕР БЛОКОВ ---------- */
  function renderCards(el, items) {
    el.innerHTML = (items || []).map(function (it) {
      return '<article class="card reveal">' +
        (it.icon ? '<span class="card__icon">' + icon(it.icon) + '</span>' : '') +
        '<h3 class="card__title">' + esc(it.title) + '</h3>' +
        '<p class="card__text">' + esc(it.text) + '</p>' +
        (it.price ? '<span class="card__price">' + esc(it.price) + '</span>' : '') +
        '</article>';
    }).join('');
  }

  function renderStats(el) {
    el.innerHTML = (cfg.stats || []).map(function (s) {
      return '<li class="stat">' +
        '<strong class="stat__num" data-count="' + s.value + '" data-suffix="' + esc(s.suffix || '') + '">0' + esc(s.suffix || '') + '</strong>' +
        '<span class="stat__label">' + esc(s.label) + '</span>' +
        '</li>';
    }).join('');
  }

  function renderHeroPoints(el) {
    el.innerHTML = ((cfg.hero && cfg.hero.points) || []).map(function (p) {
      return '<li class="hero__point">' + icon('check') + '<span>' + esc(p) + '</span></li>';
    }).join('');
  }

  function renderProcess(el) {
    el.innerHTML = ((cfg.process && cfg.process.items) || []).map(function (s, i) {
      return '<li class="step reveal">' +
        '<span class="step__num">0' + (i + 1) + '</span>' +
        '<h3 class="step__title">' + esc(s.title) + '</h3>' +
        '<p class="step__text">' + esc(s.text) + '</p>' +
        '</li>';
    }).join('');
  }

  function renderGallery(el) {
    el.innerHTML = ((cfg.gallery && cfg.gallery.items) || []).map(function (g) {
      return '<figure class="gallery__item reveal">' +
        '<img class="gallery__img" src="' + esc(g.image) + '" alt="' + esc(g.caption) + '" loading="lazy">' +
        (g.tag ? '<span class="gallery__tag">' + esc(g.tag) + '</span>' : '') +
        '<figcaption class="gallery__cap">' + esc(g.caption) + '</figcaption>' +
        '</figure>';
    }).join('');
  }

  function renderPricing(el) {
    el.innerHTML = ((cfg.pricing && cfg.pricing.items) || []).map(function (p) {
      return '<li class="price-item">' +
        '<span class="price-item__name">' + esc(p.name) +
        (p.note ? '<span class="price-item__note">' + esc(p.note) + '</span>' : '') +
        '</span>' +
        '<span class="price-item__dots" aria-hidden="true"></span>' +
        '<span class="price-item__price">' + esc(p.price) + '</span>' +
        '</li>';
    }).join('');
  }

  function renderReviews(el) {
    el.innerHTML = ((cfg.reviews && cfg.reviews.items) || []).map(function (r) {
      var stars = new Array((r.rating || 5) + 1).join('\u2605');
      return '<article class="card card--review reveal">' +
        '<div class="card__stars">' + stars + '</div>' +
        '<p class="card__text">\u00AB' + esc(r.text) + '\u00BB</p>' +
        '<footer class="card__meta">' +
        '<strong class="card__name">' + esc(r.name) + '</strong>' +
        '<span class="card__car">' + esc(r.car) + '</span>' +
        '</footer>' +
        '</article>';
    }).join('');
  }
  function renderFaq(el) {
    el.innerHTML = ((cfg.faq && cfg.faq.items) || []).map(function (f, i) {
      return '<div class="acc__item">' +
        '<button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-panel-' + i + '">' +
        '<span>' + esc(f.q) + '</span>' +
        '<span class="acc__icon" aria-hidden="true">+</span>' +
        '</button>' +
        '<div class="acc__panel" id="acc-panel-' + i + '">' +
        '<div class="acc__panel-in"><p>' + esc(f.a) + '</p></div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  function renderContacts(el) {
    var c = cfg.contacts || {};
    var items = [
      { ic: 'phone', label: 'Телефон', value: c.phone, href: c.phoneHref ? 'tel:' + c.phoneHref : '' },
      { ic: 'pin', label: 'Адрес', value: c.address, href: c.map || '' },
      { ic: 'clock', label: 'Режим работы', value: c.hours, href: '' },
      { ic: 'mail', label: 'E-mail', value: c.email, href: c.email ? 'mailto:' + c.email : '' }
    ];
    el.innerHTML = items.filter(function (i) { return i.value; }).map(function (i) {
      var val = i.href
        ? '<a class="contact__value" href="' + esc(i.href) + '">' + esc(i.value) + '</a>'
        : '<span class="contact__value">' + esc(i.value) + '</span>';
      return '<li class="contact reveal">' +
        '<span class="contact__icon">' + icon(i.ic) + '</span>' +
        '<div><span class="contact__label">' + i.label + '</span>' + val + '</div>' +
        '</li>';
    }).join('');
  }

  function renderSocials(el) {
    el.innerHTML = (cfg.socials || []).map(function (s) {
      return '<a class="social" href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '" title="' + esc(s.label) + '">' +
        icon(s.icon) + '</a>';
    }).join('');
  }

  function renderFooterServices(el) {
    el.innerHTML = ((cfg.services && cfg.services.items) || []).map(function (s) {
      return '<li><a href="#services">' + esc(s.title) + '</a></li>';
    }).join('');
  }

  function renderFooterContacts(el) {
    var c = cfg.contacts || {};
    var out = [];
    if (c.phone) out.push('<li><a href="tel:' + esc(c.phoneHref || '') + '">' + esc(c.phone) + '</a></li>');
    if (c.address) out.push('<li>' + esc(c.address) + '</li>');
    if (c.hours) out.push('<li>' + esc(c.hours) + '</li>');
    if (c.email) out.push('<li><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li>');
    el.innerHTML = out.join('');
  }

  function renderServiceOptions(el) {
    var titles = ((cfg.services && cfg.services.items) || []).map(function (s) { return s.title; });
    el.innerHTML = '<option value="">\u2014 \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0441\u043B\u0443\u0433\u0443 \u2014</option>' +
      titles.map(function (t) {
        return '<option value="' + esc(t) + '">' + esc(t) + '</option>';
      }).join('') +
      '<option value="\u0414\u0440\u0443\u0433\u043E\u0435">\u0414\u0440\u0443\u0433\u043E\u0435 / \u043D\u0435 \u0437\u043D\u0430\u044E</option>';
  }
  /* ---------- UI: HEADER / BURGER / FAB ---------- */
  function initHeader() {
    var header = $('#header');
    var burger = $('#burger');
    var fab = $('#fab');

    var onScroll = function () {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
      if (fab) fab.classList.toggle('is-visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger) {
      var setNav = function (open) {
        document.body.classList.toggle('nav-open', open);
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? '\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E' : '\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E');
      };
      burger.addEventListener('click', function () {
        setNav(!document.body.classList.contains('nav-open'));
      });
      $$('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () { setNav(false); });
      });
      // клик по затемнению вне меню
      document.addEventListener('click', function (e) {
        if (!document.body.classList.contains('nav-open')) return;
        if (e.target.closest('#nav') || e.target.closest('#burger')) return;
        setNav(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
          setNav(false);
          burger.focus();
        }
      });
      // при переходе на десктопную ширину меню не должно оставаться открытым
      window.addEventListener('resize', function () {
        if (window.innerWidth > 960 && document.body.classList.contains('nav-open')) setNav(false);
      });
    }
  }

  /* ---------- UI: REVEAL-АНИМАЦИИ ПРИ СКРОЛЛЕ ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    // стаггер: задержка по порядку среди reveal-элементов одного родителя
    els.forEach(function (el) {
      var i = 0;
      var sib = el.previousElementSibling;
      while (sib) {
        if (sib.classList && sib.classList.contains('reveal')) i++;
        sib = sib.previousElementSibling;
      }
      el.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- UI: АНИМИРОВАННЫЕ СЧЁТЧИКИ ---------- */
  function fmtNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function initCounters() {
    var nums = $$('.stat__num');
    if (!nums.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = fmtNum(target) + suffix; return; }
      var dur = 1600;
      var start = null;
      var step = function (ts) {
        if (start == null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmtNum(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- UI: СВЕЧЕНИЕ КАРТОЧЕК ПОД КУРСОРОМ ---------- */
  function initCardGlow() {
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- UI: АККОРДЕОН FAQ ---------- */
  function initAccordion() {
    $$('.acc__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.parentNode;
        var isOpen = item.classList.contains('is-open');
        $$('.acc__item.is-open').forEach(function (other) {
          other.classList.remove('is-open');
          var b = other.querySelector('.acc__btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
  /* ---------- UI: ЛАЙТБОКС ГАЛЕРЕИ ---------- */
  function initLightbox() {
    var gallery = $('.gallery');
    if (!gallery) return;

    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox__close" type="button" aria-label="\u0417\u0430\u043A\u0440\u044B\u0442\u044C">&times;</button>' +
      '<img alt="">' +
      '<div class="lightbox__caption"></div>';
    document.body.appendChild(lb);

    var img = lb.querySelector('img');
    var cap = lb.querySelector('.lightbox__caption');

    var close = function () {
      if (!lb.classList.contains('is-open')) return;
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    gallery.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('.gallery__item') : null;
      if (!item) return;
      var src = item.querySelector('.gallery__img');
      var title = item.querySelector('.gallery__cap');
      if (!src) return;
      img.src = src.currentSrc || src.src;
      img.alt = src.alt || '';
      cap.textContent = title ? title.textContent : '';
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || (e.target.closest && e.target.closest('.lightbox__close'))) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- UI: ФОРМА ЗАЯВКИ ---------- */
  function initForm() {
    var form = $('#lead-form');
    if (!form) return;
    var phone = form.querySelector('input[name="phone"]');
    var name = form.querySelector('input[name="name"]');
    var agree = form.querySelector('input[name="agree"]');
    var failBox = form.querySelector('.form__fail');

    // маска телефона: +7 (999) 999-99-99
    if (phone) {
      phone.addEventListener('input', function () {
        var d = phone.value.replace(/\D/g, '');
        if (d && d[0] === '8') d = '7' + d.slice(1);
        if (d && d[0] !== '7') d = '7' + d;
        d = d.slice(0, 11);
        // разделители добавляем только когда за ними есть цифры —
        // иначе Backspace «упирается» в автоматически дописанные ") " и "-"
        var out = '';
        if (d.length > 1) {
          out = '+7 (' + d.slice(1, 4);
          if (d.length > 4) out += ') ' + d.slice(4, 7);
          if (d.length > 7) out += '-' + d.slice(7, 9);
          if (d.length > 9) out += '-' + d.slice(9, 11);
        }
        phone.value = out;
        var field = phone.closest('.field');
        if (field) field.classList.remove('has-error');
      });
    }
    if (name) {
      name.addEventListener('input', function () {
        var field = name.closest('.field');
        if (field) field.classList.remove('has-error');
      });
    }
    if (agree) {
      agree.addEventListener('change', function () {
        if (agree.checked) form.classList.remove('agree-error');
      });
    }
    var again = form.querySelector('.form__again');
    if (again) {
      again.addEventListener('click', function () {
        form.classList.remove('is-success');
        var okBox = form.querySelector('.form__success');
        if (okBox) okBox.hidden = true;
        if (name) name.focus();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      if (name && name.value.trim().length < 2) {
        name.closest('.field').classList.add('has-error');
        ok = false;
      }
      if (phone && phone.value.replace(/\D/g, '').length !== 11) {
        phone.closest('.field').classList.add('has-error');
        ok = false;
      }
      if (agree && !agree.checked) {
        form.classList.add('agree-error');
        ok = false;
      }
      if (!ok) {
        var firstBad = form.querySelector('.has-error input') || (form.classList.contains('agree-error') ? agree : null);
        if (firstBad) firstBad.focus();
        return;
      }
      if (failBox) failBox.hidden = true;

      var btn = form.querySelector('button[type="submit"]');
      btn.classList.add('is-loading');
      btn.disabled = true;

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      var done = function () {
        btn.classList.remove('is-loading');
        btn.disabled = false;
        var okBox = form.querySelector('.form__success');
        if (okBox) okBox.hidden = false;
        form.classList.add('is-success');
        form.reset();
      };
      var fail = function () {
        btn.classList.remove('is-loading');
        btn.disabled = false;
        if (failBox) failBox.hidden = false;
      };

      var endpoint = cfg.formEndpoint;
      if (data.website) {
        // заполнена ловушка — это бот: делаем вид, что всё отправлено
        setTimeout(done, 900);
      } else if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (res.ok) done(); else fail();
        }).catch(fail);
      } else {
        // РЕЖИМ ЗАГЛУШКИ: данные никуда не отправляются
        setTimeout(done, 900);
      }
    });
  }

  /* ---------- ЗАПУСК ---------- */
  function renderAll() {
    applyConfig();
    var map = {
      heroPoints: renderHeroPoints,
      stats: renderStats,
      advantages: function (el) { renderCards(el, (cfg.advantages && cfg.advantages.items) || []); },
      services: function (el) { renderCards(el, (cfg.services && cfg.services.items) || []); },
      process: renderProcess,
      gallery: renderGallery,
      pricing: renderPricing,
      pricingNote: function (el) {
        if (cfg.pricing && cfg.pricing.note) el.innerHTML = cfg.pricing.note;
      },
      reviews: renderReviews,
      faq: renderFaq,
      contacts: renderContacts,
      socials: renderSocials,
      socialsFooter: renderSocials,
      footerServices: renderFooterServices,
      footerContacts: renderFooterContacts,
      serviceOptions: renderServiceOptions
    };
    $$('[data-render]').forEach(function (el) {
      var fn = map[el.getAttribute('data-render')];
      if (fn) fn(el);
    });
  }

  function init() {
    // акцентный цвет из конфига -> CSS-переменная (перекраска шаблона одной строкой)
    if (cfg.brand && cfg.brand.accentColor) {
      document.documentElement.style.setProperty('--accent', cfg.brand.accentColor);
    }
    renderAll();
    initHeader();
    initReveal();
    initCounters();
    initCardGlow();
    initAccordion();
    initLightbox();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();