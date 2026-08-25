/* ============================================================
   GLAMS BY TRICIA — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf     = window.requestAnimationFrame.bind(window);

  /* Reloads replay the intro from the top rather than dropping the visitor
     mid-page with the curtain still down. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.querySelectorAll('.yr').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ==========================================================
     SPLIT TEXT
     Each [data-split] headline becomes per-line masks of
     per-character spans. The visible text is duplicated into
     aria-label so screen readers still read a normal string.
     ========================================================== */
  function splitChars(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);

    var lines = (el.dataset.split || text).split('|');
    if (!el.dataset.split) lines = [text];

    el.textContent = '';
    var n = 0;
    lines.forEach(function (line) {
      var ln = document.createElement('span');
      ln.className = 'ln';
      ln.setAttribute('aria-hidden', 'true');
      line.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        s.style.setProperty('--i', n++);
        ln.appendChild(s);
      });
      el.appendChild(ln);
    });
  }

  function splitWords(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    var frag = document.createDocumentFragment();
    text.split(' ').forEach(function (word, i) {
      var wd = document.createElement('span');
      wd.className = 'wd';
      wd.setAttribute('aria-hidden', 'true');
      wd.style.setProperty('--i', i);
      var inner = document.createElement('span');
      inner.textContent = word;
      wd.appendChild(inner);
      frag.appendChild(wd);
      frag.appendChild(document.createTextNode(' '));
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  if (!reduced) {
    document.querySelectorAll('.split').forEach(splitChars);
    document.querySelectorAll('.wsplit').forEach(splitWords);
  }

  /* ==========================================================
     PRELOADER
     ========================================================== */
  var loader  = document.getElementById('loader');
  var started = reduced || !loader;

  function dismissLoader() {
    if (!loader || loader.classList.contains('is-done')) return;
    loader.classList.add('is-done');
    started = true;
    requestScroll();
    setTimeout(function () { if (loader) loader.remove(); }, 900);
  }
  window.addEventListener('load', function () {
    setTimeout(dismissLoader, reduced ? 0 : 1400);
  });
  setTimeout(dismissLoader, 4000); // safety net if an asset stalls

  /* ==========================================================
     REVEAL SWEEP
     A viewport sweep rather than IntersectionObserver: an anchor
     jump or a restored scroll position can carry an element past
     the viewport without IO ever seeing it intersect, which would
     leave it hidden for good. CSS animations (not transitions) do
     the work, because a transition with no previous value to
     interpolate from simply never fires.
     ========================================================== */
  var pending = Array.prototype.slice.call(
    document.querySelectorAll('.reveal, .mask, .zoom, .split, .wsplit, .shimmer, .rule')
  );
  pending.forEach(function (el) {
    if (el.dataset.d) el.style.setProperty('--d', el.dataset.d);
    if (el.dataset.base) el.style.setProperty('--base', el.dataset.base + 'ms');
  });

  function sweepReveals() {
    if (!started || !pending.length) return;
    var limit = window.innerHeight;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top > limit) return true;
      el.classList.add('is-in');
      return false;
    });
  }
  if (reduced) {
    pending.forEach(function (el) { el.classList.add('is-in'); });
    pending = [];
  }

  /* ==========================================================
     SCROLL: nav, progress, fab, parallax, showcase
     ========================================================== */
  var nav      = document.getElementById('nav');
  var fab      = document.getElementById('fab');
  var progress = document.getElementById('progress');
  var layers   = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking  = false;

  if (!reduced) layers.forEach(function (el) { el.style.willChange = 'transform'; });

  function parallax() {
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      var shift = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
      var extra = el.dataset.scale ? ' scale(' + el.dataset.scale + ')' : '';
      el.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0)' + extra;
    });
  }

  /* sticky showcase — the pinned image follows whichever item is centred */
  var showItems = Array.prototype.slice.call(document.querySelectorAll('[data-show]'));
  var showImgs  = Array.prototype.slice.call(document.querySelectorAll('[data-show-img]'));
  var showLive  = -1;

  function syncShowcase() {
    if (!showItems.length) return;
    var mid = window.innerHeight * 0.5, best = 0, bestDist = Infinity;
    showItems.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best === showLive) return;
    showLive = best;
    showImgs.forEach(function (img, i) { img.classList.toggle('is-live', i === best); });
  }

  function onScroll() {
    var y   = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (fab) fab.classList.toggle('is-in', y > 400);
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    sweepReveals();
    syncShowcase();
    if (!reduced) parallax();
    ticking = false;
  }
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    raf(onScroll);
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });

  /* ==========================================================
     MOBILE MENU
     ========================================================== */
  var burger = document.getElementById('burger');
  var menu   = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ==========================================================
     PAGE TRANSITION
     Internal links pull a gold curtain up before navigating.
     ========================================================== */
  var curtain = document.getElementById('curtain');

  if (curtain && !reduced) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || a.target === '_blank') return;
      if (a.origin !== window.location.origin) return;
      if (a.pathname === window.location.pathname) return;

      e.preventDefault();
      curtain.classList.add('is-out');
      setTimeout(function () { window.location.href = a.href; }, 620);
    });
  }

  /* ==========================================================
     MAGNETIC BUTTONS
     ========================================================== */
  if (fine && !reduced) {
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.28;
        var y = (e.clientY - r.top - r.height / 2) * 0.36;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ==========================================================
     CURSOR
     ========================================================== */
  var cursor = document.getElementById('cursor');
  if (cursor && fine && !reduced) {
    var dot  = cursor.querySelector('.cursor__dot');
    var ring = cursor.querySelector('.cursor__ring');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px) translate(-50%,-50%)';
      raf(loop);
    })();

    document.querySelectorAll('a, button, .look, .shot, .pills li, .value').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hot'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hot'); });
    });
  }

  /* ==========================================================
     FAQ
     ========================================================== */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    var item = btn.closest('.faq__item');
    var body = item.querySelector('.faq__a');
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      body.style.height = open ? body.scrollHeight + 'px' : '0px';
    });
    window.addEventListener('resize', function () {
      if (item.classList.contains('is-open')) body.style.height = body.scrollHeight + 'px';
    }, { passive: true });
  });

  /* ==========================================================
     SPARKLES — a few drifting gold motes in flagged sections
     ========================================================== */
  if (!reduced) {
    document.querySelectorAll('[data-sparkle]').forEach(function (host) {
      var count = parseInt(host.dataset.sparkle, 10) || 5;
      for (var i = 0; i < count; i++) {
        var s = document.createElement('span');
        s.className = 'spark';
        s.setAttribute('aria-hidden', 'true');
        s.style.left = (8 + Math.random() * 84) + '%';
        s.style.top  = (8 + Math.random() * 80) + '%';
        s.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
        s.style.animationDuration = (4 + Math.random() * 4).toFixed(2) + 's';
        host.appendChild(s);
      }
    });
  }

  onScroll();
})();
