// Стоматология Боровиковой — интерактив, анимации, инклюды шапки/подвала
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Supabase (публичные значения: ключ publishable, доступ ограничен RLS)
  var SUPABASE_URL = 'https://dabfifmdkadrjukrdgvp.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_gd8FyW2BWcgGOEok16rHWQ_y9yjtvQq';

  /* ============ Инклюды (общие шапка/подвал) ============ */
  function loadIncludes() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    return Promise.all(nodes.map(function (node) {
      var url = node.getAttribute('data-include');
      return fetch(url).then(function (r) { return r.text(); }).then(function (html) {
        var tpl = document.createElement('div');
        tpl.innerHTML = html.trim();
        var parent = node.parentNode;
        while (tpl.firstChild) { parent.insertBefore(tpl.firstChild, node); }
        parent.removeChild(node);
      }).catch(function () { /* молча игнорируем */ });
    }));
  }

  function boot() {
    initPreloader();
    initHeroParallax();
    initScrollFx();
    initReveal();
    initBeforeAfter();
    initCasesSlider();
    initReviewsGallery();
    initBurger();
    initCounters();
    initDoctorModals();
    initLightbox();
    initScrollUX();
    initPhoneMask();
    initConsultForm();
    setActiveNav();
    initHashScroll();
  }

  /* ---------- Якоря (надёжный переход к секции, в т.ч. с другой страницы) ---------- */
  function initHashScroll() {
    var header = document.querySelector('.header');
    function headerOffset() { return (header ? header.getBoundingClientRect().height : 0) + 14; }
    function scrollToHash(hash, smooth) {
      if (!hash || hash === '#') return false;
      var el;
      try { el = document.querySelector(hash); } catch (e) { return false; }
      if (!el) return false;
      var y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: smooth ? 'smooth' : 'auto' });
      return true;
    }
    // переход с другой страницы: index.html#about и т.п.
    if (location.hash) {
      var h = location.hash;
      if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
      setTimeout(function () { scrollToHash(h, false); }, 80);
      window.addEventListener('load', function () { setTimeout(function () { scrollToHash(h, false); }, 60); });
    }
    // клики по якорям на текущей странице — плавно и с учётом шапки
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var i = href.indexOf('#');
      if (i < 0) return;
      var path = href.slice(0, i);
      var hash = href.slice(i);
      if (hash.length < 2) return;
      var here = (location.pathname.split('/').pop() || 'index.html');
      var dest = path.split('/').pop();
      if (path === '' || dest === here) {
        if (scrollToHash(hash, true)) {
          e.preventDefault();
          if (history.pushState) { history.pushState(null, '', hash); }
        }
      }
    });
  }

  function start() { loadIncludes().then(boot); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }

  /* ---------- Прелоудер (скрываем по загрузке + страховочный таймаут) ---------- */
  function initPreloader() {
    var pre = document.querySelector('.preloader');
    if (!pre) return;
    var done = false;
    function hide() {
      if (done) return;
      done = true;
      pre.classList.add('is-done');
      setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 650);
    }
    // показываем минимум ~450 мс ради плавности, затем прячем по полной загрузке
    var minShown = reduce ? 0 : 450;
    var startedHide = function () { setTimeout(hide, minShown); };
    if (document.readyState === 'complete') { startedHide(); }
    else { window.addEventListener('load', startedHide); }
    // страховка: в любом случае убираем максимум через 2.3 с
    setTimeout(hide, 2300);
  }

  /* ---------- Параллакс инфо-карточек баннера ---------- */
  function initHeroParallax() {
    if (reduce) return;
    var hero = document.querySelector('.hero__visual');
    if (!hero) return;
    var cards = hero.querySelectorAll('.info-card');
    if (!cards.length) return;
    var raf = false, mx = 0, my = 0;
    function apply() {
      raf = false;
      cards.forEach(function (c, i) {
        var depth = (i + 1) * 4;
        c.style.setProperty('--px', (mx * depth).toFixed(1));
        c.style.setProperty('--py', (my * depth).toFixed(1));
      });
    }
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) { window.requestAnimationFrame(apply); raf = true; }
    });
    hero.addEventListener('mouseleave', function () {
      cards.forEach(function (c) { c.style.setProperty('--px', 0); c.style.setProperty('--py', 0); });
    });
  }

  /* ---------- Активный пункт меню по текущей странице ---------- */
  function setActiveNav() {
    var path = (location.pathname.split('/').pop() || 'index.html');
    if (!path) path = 'index.html';
    document.querySelectorAll('.nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#') !== -1) return; // якорные ссылки не подсвечиваем по странице
      if (/^(https?:|tel:|mailto:)/i.test(href)) return; // внешние ссылки (мессенджеры, карта) не подсвечиваем
      var file = href.split('/').pop() || 'index.html';
      a.classList.toggle('active', file === path);
    });
  }

  /* ---------- Скролл: вау-фон + прогресс-бар ---------- */
  function initScrollFx() {
    var progress = document.querySelector('.scroll-progress');
    var aboutSection = document.querySelector('.about');
    var aboutCopy = document.querySelector('.about__copy');
    var ticking = false;
    function onScroll() {
      var st = window.pageYOffset || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? st / max : 0;
      root.style.setProperty('--hue', (ratio * 140).toFixed(1));
      root.style.setProperty('--sy', (st * 0.12).toFixed(1));
      if (progress) progress.style.width = (ratio * 100).toFixed(2) + '%';
      /* Параллакс блока «О клинике»: плавно спускается при прокрутке */
      if (aboutCopy && aboutSection && !reduce && window.innerWidth > 900) {
        var r = aboutSection.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh - r.top) / (vh + r.height);
        p = p < 0 ? 0 : (p > 1 ? 1 : p);
        aboutCopy.style.top = (p * 150).toFixed(1) + 'px';
      } else if (aboutCopy) {
        aboutCopy.style.top = '';
      }
      ticking = false;
    }
    function requestScroll() {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }
    window.addEventListener('scroll', requestScroll, { passive: true });
    onScroll();
  }

  /* ---------- Появление секций при скролле ---------- */
  function initReveal() {
    function tag(selector, type) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', type || 'up');
      });
    }
    tag('.hero__copy > *', 'left');
    tag('.hero__visual', 'right');
    tag('.section-title', 'up');
    tag('.section-link', 'up');
    tag('.consult', 'right');
    tag('.about__copy', 'left');
    tag('.about__gallery', 'right');
    tag('.faq__item', 'up');
    tag('.contacts__info', 'left');
    tag('.contacts__map', 'right');
    tag('.page-hero__inner > *', 'up');
    tag('.footer__grid > *', 'up');

    ['.why__grid', '.services__grid', '.prices__grid', '.doctors__row', '.cases__track', '.hero__features']
      .forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          el.classList.add('stagger');
          if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'up');
        });
      });

    var reveals = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Интерактив «До / После» (прогрессивное улучшение) ---------- */
  function initBeforeAfter() {
    var pairs = Array.prototype.slice.call(document.querySelectorAll('.case-card__pair'));
    pairs.forEach(function (pair) {
      var imgs = pair.querySelectorAll('img');
      if (imgs.length < 2) return;
      var before = imgs[0], after = imgs[1];
      var ba = document.createElement('div');
      ba.className = 'ba';
      ba.style.setProperty('--pos', '50%');
      ba.innerHTML =
        '<img class="ba__img" src="' + after.getAttribute('src') + '" alt="' + (after.alt || 'После') + '" loading="lazy">' +
        '<div class="ba__before"><img class="ba__img" src="' + before.getAttribute('src') + '" alt="' + (before.alt || 'До') + '" loading="lazy"></div>' +
        '<span class="ba__label ba__label--before">До</span>' +
        '<span class="ba__label ba__label--after">После</span>' +
        '<span class="ba__handle" aria-hidden="true"><span class="ba__grip">‹›</span></span>' +
        '<input type="range" class="ba__range" min="0" max="100" value="50" step="0.1" aria-label="Сравнить фото: до и после">';
      pair.parentNode.replaceChild(ba, pair);
      var range = ba.querySelector('.ba__range');
      function update() { ba.style.setProperty('--pos', range.value + '%'); }
      range.addEventListener('input', update);
      update();
    });
  }

  /* ---------- Слайдер кейсов До/После ---------- */
  function initCasesSlider() {
    var track = document.querySelector('.cases__track');
    var dotsWrap = document.querySelector('.cases-block .dots');
    var prev = document.querySelector('.cases-block .arrow--left');
    var next = document.querySelector('.cases-block .arrow--right');
    if (!track) return;
    var cards = track.children.length;
    var index = 0, autoTimer = null;

    function perView() { return window.innerWidth <= 560 ? 1 : 2; }
    function pages() { return Math.max(1, cards - perView() + 1); }
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i < pages(); i++) {
        var s = document.createElement('span');
        (function (i) { s.addEventListener('click', function () { go(i); restart(); }); })(i);
        dotsWrap.appendChild(s);
      }
    }
    function render() {
      var first = track.children[index];
      var offset = first ? first.offsetLeft : 0;
      track.style.transform = 'translateX(-' + offset + 'px)';
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.classList.toggle('active', i === index); });
      }
    }
    function go(i) { var p = pages(); index = (i + p) % p; render(); }
    function restart() {
      if (autoTimer) clearInterval(autoTimer);
      if (reduce) return;
      autoTimer = setInterval(function () { go(index + 1); }, 4500);
    }
    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });
    var row = document.querySelector('.cases__row');
    if (row) {
      row.addEventListener('mouseenter', function () { if (autoTimer) clearInterval(autoTimer); });
      row.addEventListener('mouseleave', restart);
    }
    var touchX = null;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; if (autoTimer) clearInterval(autoTimer); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      touchX = null;
      restart();
    }, { passive: true });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (index > pages() - 1) index = pages() - 1; buildDots(); render(); }, 150);
    });
    buildDots(); render(); restart();
  }

  /* ---------- Галерея отзывов (скриншоты) ---------- */
  function initReviewsGallery() {
    var track = document.getElementById('reviews-track');
    if (!track) return;
    var row = track.closest('.reviews__row');
    var prev = row ? row.querySelector('.arrow--left') : null;
    var next = row ? row.querySelector('.arrow--right') : null;
    var section = track.closest('.reviews');
    var dotsWrap = section ? section.querySelector('.dots') : null;

    var total = parseInt(track.getAttribute('data-total'), 10) || 34;
    var frag = document.createDocumentFragment();
    for (var n = 1; n <= total; n++) {
      var num = (n < 10 ? '0' : '') + n;
      var fig = document.createElement('div');
      fig.className = 'review-shot';
      fig.setAttribute('role', 'button');
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('aria-label', 'Открыть отзыв пациента ' + n);
      var img = document.createElement('img');
      img.src = 'assets/img/review-' + num + '.jpg';
      img.alt = 'Отзыв пациента ' + n;
      img.loading = 'lazy';
      fig.appendChild(img);
      frag.appendChild(fig);
    }
    track.appendChild(frag);

    var index = 0, autoTimer = null;
    function perView() {
      var w = window.innerWidth;
      if (w <= 560) return 1;
      if (w <= 860) return 2;
      if (w <= 1180) return 3;
      return 4;
    }
    function pages() { return Math.max(1, Math.ceil(total / perView())); }
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i < pages(); i++) {
        var s = document.createElement('span');
        (function (i) { s.addEventListener('click', function () { go(i); restart(); }); })(i);
        dotsWrap.appendChild(s);
      }
    }
    function render() {
      var pv = perView();
      var childIdx = index * pv;
      if (childIdx > total - pv) childIdx = Math.max(0, total - pv);
      var first = track.children[childIdx];
      var offset = first ? first.offsetLeft : 0;
      track.style.transform = 'translateX(-' + offset + 'px)';
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.classList.toggle('active', i === index); });
      }
    }
    function go(i) { var p = pages(); index = (i + p) % p; render(); }
    function restart() {
      if (autoTimer) clearInterval(autoTimer);
      if (reduce) return;
      autoTimer = setInterval(function () { go(index + 1); }, 5000);
    }
    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });
    if (row) {
      row.addEventListener('mouseenter', function () { if (autoTimer) clearInterval(autoTimer); });
      row.addEventListener('mouseleave', restart);
    }
    var touchX = null;
    track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; if (autoTimer) clearInterval(autoTimer); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      touchX = null;
      restart();
    }, { passive: true });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (index > pages() - 1) index = pages() - 1; buildDots(); render(); }, 150);
    });
    buildDots(); render(); restart();
  }

  /* ---------- Бургер-меню ---------- */
  function initBurger() {
    var btn = document.getElementById('burger');
    var nav = document.getElementById('nav');
    if (!btn || !nav) return;
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    // Кнопка закрытия внутри выезжающего меню (на мобильных бургер скрыт под панелью)
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'nav__close';
    closeBtn.setAttribute('aria-label', 'Закрыть меню');
    nav.insertBefore(closeBtn, nav.firstChild);

    // Конверсионный «подвал» шторки: CTA + быстрые контакты (телефон + мессенджеры).
    // TODO: заменить telegram/max на реальные ссылки на чаты клиники.
    var CONTACTS = {
      phone: '+7 (831) 235-00-07',
      tel: 'tel:+78312350007',
      whatsapp: 'https://wa.me/78312350007',
      telegram: 'https://t.me/',
      max: 'https://max.ru/'
    };
    var ICON_MAX = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.9 3 3 6.36 3 10.55c0 2.39 1.3 4.5 3.4 5.88-.12.92-.55 2.16-1.36 3.18-.22.28.02.66.37.55 1.95-.56 3.36-1.27 4.24-1.85.6.1 1.22.14 1.85.14 5.1 0 9-3.36 9-7.9C20.5 6.36 17.1 3 12 3Zm-3.4 9.6L10.6 9l1.7 2.3L14.1 9l1.3 3.6h-1.4l-.6-1.8-1.2 1.6h-.4l-1.2-1.6-.6 1.8H8.6Z"/></svg>';
    var ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 0 1 2.38 5.73c0 4.48-3.65 8.12-8.13 8.12-1.53 0-3.03-.43-4.32-1.23l-.31-.18-3.21.84.86-3.12-.2-.32a8.07 8.07 0 0 1-1.24-4.31c0-4.48 3.64-8.12 8.13-8.12Zm-4.56 4.4c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.62.75.29 1.34.46 1.79.59.75.24 1.44.21 1.98.13.6-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37-.31-.16-1.85-.91-2.14-1.01-.29-.11-.5-.16-.71.16-.21.31-.81 1.01-.99 1.22-.18.21-.37.24-.68.08-.31-.16-1.31-.48-2.5-1.54-.92-.82-1.54-1.84-1.72-2.15-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.6Z"/></svg>';
    var ICON_TG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m21.94 4.6-3.1 14.62c-.23 1.03-.84 1.28-1.7.8l-4.7-3.46-2.27 2.18c-.25.25-.46.46-.94.46l.34-4.79 8.71-7.86c.38-.34-.08-.53-.59-.19L4.94 13.73.31 12.28C-.7 11.97-.72 11.27.52 10.78l18.11-6.98c.84-.31 1.58.2 1.31 1.5Z"/></svg>';
    var foot = document.createElement('div');
    foot.className = 'nav__foot';
    foot.innerHTML =
      '<a class="nav__cta" href="kontakty.html#consult">Записаться</a>' +
      '<div class="nav__contacts">' +
        '<a class="nav__tel" href="' + CONTACTS.tel + '">' + CONTACTS.phone + '</a>' +
        '<div class="nav__msgr">' +
          '<a class="nav__msgr-btn nav__msgr-btn--max" href="' + CONTACTS.max + '" target="_blank" rel="noopener" aria-label="MAX">' + ICON_MAX + '</a>' +
          '<a class="nav__msgr-btn nav__msgr-btn--wa" href="' + CONTACTS.whatsapp + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON_WA + '</a>' +
          '<a class="nav__msgr-btn nav__msgr-btn--tg" href="' + CONTACTS.telegram + '" target="_blank" rel="noopener" aria-label="Telegram">' + ICON_TG + '</a>' +
        '</div>' +
      '</div>';
    nav.appendChild(foot);

    function close() {
      btn.classList.remove('is-open');
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    closeBtn.addEventListener('click', close);
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    overlay.addEventListener('click', close);
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------- Анимированные счётчики ---------- */
  function initCounters() {
    var nodes = document.querySelectorAll('.counter strong[data-count], .stat strong[data-count]');
    if (!nodes.length) return;
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target.toLocaleString('ru-RU') + suffix; return; }
      var startT = null, dur = 1600;
      function step(ts) {
        if (!startT) startT = ts;
        var p = Math.min((ts - startT) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nodes.forEach(animate); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Модальные окна врачей ---------- */
  function initDoctorModals() {
    var modal = document.getElementById('doctor-modal');
    if (!modal) return;
    var photo = document.getElementById('modal-photo');
    var nameEl = document.getElementById('modal-name');
    var roleEl = document.getElementById('modal-role');
    var bioEl = document.getElementById('modal-bio');
    var lastFocus = null;

    var data = {
      borovikova: {
        name: 'Боровикова Наталья Александровна', role: 'Главный врач · стоматолог-терапевт',
        photo: 'assets/img/doctor-borovikova.jpg',
        bio: '<p>Основатель и главный врач клиники. Более 15 лет помогает пациентам сохранять здоровье и красоту улыбки, выстраивая лечение на доверии и внимании к деталям.</p>' +
          '<ul><li>Нижегородский медицинский колледж, 2011</li><li>Чувашский государственный университет им. И.Н. Ульянова, специализация по терапевтической стоматологии, 2017</li></ul>' +
          '<p>Направления: лечение кариеса и его осложнений, эндодонтия (лечение корневых каналов), эстетическая реставрация зубов, комплексная профилактика заболеваний полости рта.</p>'
      },
      terina: {
        name: 'Терина Татьяна Александровна', role: 'Стоматолог · хирург-имплантолог',
        photo: 'assets/img/doctor-terina.jpg',
        bio: '<p>Хирург-имплантолог с опытом более 10 лет. Проводит имплантацию по цифровому протоколу и бережно работает с мягкими тканями.</p>' +
          '<ul><li>ПИМУ (Приволжский исследовательский медицинский университет), 2015</li><li>Ординатура по хирургической стоматологии, 2017</li></ul>' +
          '<p>Направления: удаление зубов любой сложности, имплантация MIS и Dentium, костная пластика и синус-лифтинг, пластика дёсен и закрытие рецессий (тоннельный метод), подготовка к протезированию.</p>'
      },
      vasiliev: {
        name: 'Васильев Владислав Владимирович', role: 'Стоматолог-ортопед',
        photo: 'assets/img/doctor-vasiliev.jpg',
        bio: '<p>Ортопед с опытом более 12 лет. Восстанавливает форму, функцию и эстетику зубов с предсказуемым долговечным результатом. Прошёл более 20 курсов по эстетической реставрации, протоколам препарирования и окклюзии.</p>' +
          '<ul><li>Нижегородская государственная медицинская академия, 2014</li><li>Интернатура по стоматологии, 2015</li></ul>' +
          '<p>Направления: керамические виниры (от планирования до фиксации), коронки и мосты, протезирование на имплантах, диагностика и лечение ВНЧС, окклюзионная сплинт-терапия, тотальная реабилитация окклюзии, техника вертикального препарирования «Вертипреп».</p>'
      },
      hramushev: {
        name: 'Храмушев Григорий Николаевич', role: 'Стоматолог-ортопед',
        photo: '',
        bio: '<p>Врач-ортопед с опытом более 10 лет. Специализируется на эстетическом протезировании и сложных реабилитациях улыбки, восстанавливая форму, функцию и эстетику зубов с предсказуемым долговечным результатом.</p>' +
          '<ul><li>ПИМУ (Приволжский исследовательский медицинский университет), 2016</li><li>Ординатура по ортопедической стоматологии, 2018</li></ul>' +
          '<p>Направления: протезирование передних зубов, керамические коронки и виниры, протезирование на имплантах, тотальная реабилитация прикуса.</p>'
      },
      borisova: {
        name: 'Борисова Любовь Игоревна', role: 'Врач-ортодонт',
        photo: 'assets/img/doctor-borisova.jpg',
        bio: '<p>Врач-ортодонт. Исправляет прикус у детей и взрослых, подбирает комфортную систему лечения под каждый случай.</p>' +
          '<ul><li>Нижегородская государственная медицинская академия, 2019</li><li>Ординатура по ортодонтии</li></ul>' +
          '<p>Направления: брекет-системы (металл, керамика, сапфир), прозрачные элайнеры, коррекция прикуса.</p>'
      },
      vinokurova: {
        name: 'Винокурова Юлия Александровна', role: 'Гигиенист · пародонтолог',
        photo: 'assets/img/doctor-vinokurova.jpg',
        bio: '<p>Гигиенист-пародонтолог. Член независимой Ассоциации пародонтологов России (2023), вице-чемпион профессионального конкурса по гигиене и профилактике (2026). Работает по международному протоколу GBT.</p>' +
          '<ul><li>Нижегородский медицинский базовый колледж, 2013</li><li>НГСХА, 2016</li><li>Университет профессиональных стандартов (Москва), диплом с отличием, 2020</li></ul>' +
          '<p>Направления: профессиональная гигиена по протоколу GBT (KaVo Prophyflex 4, Air-Flow, кюреты Gracey), лечение и профилактика заболеваний пародонта, гигиена при имплантации и ортодонтическом лечении, работа с пациентами-аллергиками.</p>'
      },
      goryunova: {
        name: 'Горюнова Алина Константиновна', role: 'Стоматолог-терапевт',
        photo: 'assets/img/doctor-goryunova.jpg',
        bio: '<p>Врач-терапевт. Бережно лечит зубы и возвращает им естественный вид, уделяя внимание профилактике.</p>' +
          '<ul><li>Чувашский государственный университет, 2021</li><li>Ординатура, 2023</li></ul>' +
          '<p>Направления: лечение кариеса, художественная реставрация, профессиональная гигиена.</p>'
      }
    };

    function open(key) {
      var d = data[key];
      if (!d) return;
      nameEl.textContent = d.name;
      roleEl.textContent = d.role;
      bioEl.innerHTML = d.bio;
      var media = photo.parentNode;
      if (d.photo) {
        photo.src = d.photo; photo.alt = d.name;
        photo.style.display = '';
        media.classList.remove('modal__media--initials');
        media.removeAttribute('data-initials');
      } else {
        photo.removeAttribute('src');
        photo.style.display = 'none';
        var parts = (d.name || '').split(/\s+/);
        var ini = ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '');
        media.setAttribute('data-initials', ini.toUpperCase());
        media.classList.add('modal__media--initials');
      }
      modal.hidden = false;
      document.body.classList.add('modal-open');
      var closeBtn = modal.querySelector('.modal__close');
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll('.doctor-card[data-doc]').forEach(function (card) {
      card.addEventListener('click', function () { lastFocus = card; open(card.getAttribute('data-doc')); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lastFocus = card; open(card.getAttribute('data-doc')); }
      });
    });
    modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* ---------- Лайтбокс для фото ---------- */
  function initLightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;
    var img = document.getElementById('lightbox-img');
    var group = [], idx = 0;

    function show(i) {
      idx = (i + group.length) % group.length;
      var item = group[idx];
      img.src = item.src;
      img.alt = item.alt || '';
    }
    function open(list, i) {
      group = list;
      box.hidden = false;
      document.body.classList.add('modal-open');
      show(i);
    }
    function close() {
      box.hidden = true;
      document.body.classList.remove('modal-open');
      img.removeAttribute('src');
    }
    function bind(triggerSelector) {
      var nodes = Array.prototype.slice.call(document.querySelectorAll(triggerSelector));
      if (!nodes.length) return;
      var list = nodes.map(function (el) {
        var im = el.tagName === 'IMG' ? el : el.querySelector('img');
        return { src: (im && (im.getAttribute('data-full') || im.src)) || '', alt: im ? im.alt : '' };
      });
      nodes.forEach(function (el, i) {
        el.addEventListener('click', function () { open(list, i); });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(list, i); }
        });
      });
    }
    // отзывы строятся динамически — навешиваем после их вставки
    setTimeout(function () { bind('.reviews__track .review-shot'); }, 0);

    box.querySelector('[data-lb-close]').addEventListener('click', close);
    box.querySelector('[data-lb-prev]').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    box.querySelector('[data-lb-next]').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- Кнопка «наверх» + скролл-спай по якорям ---------- */
  function initScrollUX() {
    var top = document.getElementById('scroll-top');
    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
    function onScrollUX() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (top) top.classList.toggle('is-visible', y > 600);
    }
    window.addEventListener('scroll', onScrollUX, { passive: true });
    onScrollUX();
  }

  /* ---------- Маска телефона +7 (___) ___-__-__ ---------- */
  function initPhoneMask() {
    function format(value) {
      var d = value.replace(/\D/g, '');
      if (d.charAt(0) === '8') d = '7' + d.slice(1);
      if (d.charAt(0) !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var r = '+7';
      if (d.length > 1) r += ' (' + d.slice(1, 4);
      if (d.length >= 5) r += ') ' + d.slice(4, 7);
      if (d.length >= 8) r += '-' + d.slice(7, 9);
      if (d.length >= 10) r += '-' + d.slice(9, 11);
      return r;
    }
    document.querySelectorAll('input[type="tel"]').forEach(function (inp) {
      inp.setAttribute('inputmode', 'tel');
      inp.addEventListener('input', function () { inp.value = format(inp.value); });
      inp.addEventListener('focus', function () { if (!inp.value) inp.value = '+7 '; });
      inp.addEventListener('blur', function () { if (inp.value === '+7 ' || inp.value === '+7') inp.value = ''; });
    });
  }

  /* ---------- Форма консультации → Supabase ---------- */
  function initConsultForm() {
    var form = document.getElementById('consult-form');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.textContent : '';

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = false;
      status.className = 'form-status' + (kind ? ' form-status--' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get('name') || '').toString().trim();
      var phone = (fd.get('phone') || '').toString().trim();
      var preferred_time = (fd.get('preferred_time') || '').toString().trim();
      var consent = form.querySelector('input[name="consent"]');
      var digits = phone.replace(/\D/g, '');

      if (!name || digits.length < 11) {
        setStatus('Пожалуйста, укажите имя и корректный номер телефона.', 'error');
        return;
      }
      if (consent && !consent.checked) {
        setStatus('Подтвердите согласие на обработку персональных данных.', 'error');
        return;
      }
      if (btn) { btn.disabled = true; btn.textContent = 'Отправляем…'; }
      setStatus('', '');
      if (status) status.hidden = true;

      fetch(SUPABASE_URL + '/rest/v1/leads', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ name: name, phone: phone, preferred_time: preferred_time || null })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus('Спасибо! Заявка отправлена — мы свяжемся с вами.', 'ok');
        })
        .catch(function () {
          setStatus('Не удалось отправить. Позвоните нам: +7 (831) 235-00-07', 'error');
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  }
})();
