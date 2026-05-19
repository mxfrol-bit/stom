/* ============================================================
   Стоматология Боровиковой — main.js (полная версия)
   ============================================================ */
(function () {
  'use strict';

  /* ---- Мобильное меню ---- */
  var burger = document.querySelector('.nav-burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
    };
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---- Карусель (До/После, услуги) ---- */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel__track');
    var prev = root.querySelector('.carousel__btn--prev');
    var next = root.querySelector('.carousel__btn--next');
    if (!track) return;
    var step = function () {
      var first = track.children[0];
      if (!first) return 300;
      var gap = parseFloat(getComputedStyle(track).columnGap || 16) || 16;
      return first.getBoundingClientRect().width + gap;
    };
    var update = function () {
      if (!prev || !next) return;
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---- Слайдер отзывов ---- */
  document.querySelectorAll('[data-reviews]').forEach(function (root) {
    var trk = root.querySelector('.rev-track');
    var slides = root.querySelectorAll('.rev-slide');
    var navEl = root.querySelector('.rev-nav');
    if (!trk || !slides.length) return;
    var i = 0, n = slides.length, timer, dots = [];
    if (navEl) {
      for (var k = 0; k < n; k++) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Отзыв ' + (k + 1));
        (function (idx) { b.addEventListener('click', function () { go(idx); reset(); }); })(k);
        navEl.appendChild(b); dots.push(b);
      }
    }
    function go(x) {
      i = (x + n) % n;
      trk.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, di) { d.classList.toggle('active', di === i); });
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6000); }
    go(0); reset();
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', reset);
  });

  /* ---- Маска телефона ---- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('focus', function () { if (!input.value) input.value = '+7 '; });
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      if (!d) { input.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      var o = '+7';
      if (d.length > 1) o += ' (' + d.slice(1, 4);
      if (d.length >= 4) o += ') ' + d.slice(4, 7);
      if (d.length >= 7) o += '-' + d.slice(7, 9);
      if (d.length >= 9) o += '-' + d.slice(9, 11);
      input.value = o;
    });
  });

  /* ---- Формы: POST на endpoint, иначе mailto ---- */
  document.querySelectorAll('form[data-cta]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (f.querySelector('[name=name]') || {}).value || '';
      var phone = (f.querySelector('[name=phone]') || {}).value || '';
      var time = (f.querySelector('[name=time]') || {}).value || '';
      var subject = f.getAttribute('data-subject') || 'Заявка с сайта';
      var endpoint = f.getAttribute('data-endpoint') || '';
      function done() {
        var box = f.closest('.sticky-form');
        if (box) { box.classList.add('sent'); }
        else { alert('Спасибо! Перезвоним в течение 15 минут.'); f.reset(); }
      }
      if (!endpoint || endpoint.indexOf('REPLACE_') === 0) {
        window.location.href = 'mailto:info@bor-dent.ru?subject=' +
          encodeURIComponent(subject) + '&body=' +
          encodeURIComponent('Имя: ' + name + '\nТелефон: ' + phone +
            (time ? '\nУдобное время: ' + time : ''));
        return;
      }
      var fd = new FormData(f);
      fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { if (r.ok) done(); else throw 0; })
        .catch(function () { alert('Не удалось отправить. Позвоните: +7 (831) 235-00-07'); });
    });
  });

})();
