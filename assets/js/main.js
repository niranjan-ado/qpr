/* QPR India — progressive enhancement only.
   With this file absent the header renders as plain nested lists and every
   link, including every submenu link, is still reachable. */
(function () {
  'use strict';

  var masthead = document.querySelector('.masthead');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  var items = Array.prototype.slice.call(document.querySelectorAll('.nav__item--has-panel'));

  var DESKTOP = window.matchMedia('(min-width: 56.0625rem)');

  function panelOf(item) { return item.querySelector('.nav__panel'); }
  function topOf(item) { return item.querySelector('.nav__disclosure'); }

  function setPanel(item, open) {
    var panel = panelOf(item), top = topOf(item);
    if (!panel || !top) return;
    item.classList.toggle('is-open', open);
    top.setAttribute('aria-expanded', String(open));
    if (open) { panel.removeAttribute('hidden'); }
    else { panel.setAttribute('hidden', ''); }
  }

  function closeAll(except) {
    items.forEach(function (item) {
      if (item !== except) { item._pinned = false; setPanel(item, false); }
    });
  }

  items.forEach(function (item) {
    var top = topOf(item);
    if (!top) return;

    /* Hover previews the panel; a click pins it open. Without this, a mouse
       user hovering and then clicking would see the panel close under them. */
    top.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = item.classList.contains('is-open');
      if (isOpen && !item._pinned) { item._pinned = true; return; }
      closeAll(item);
      item._pinned = !isOpen;
      setPanel(item, !isOpen);
    });

    /* Hover is a convenience on pointer devices; it never replaces click. */
    var hoverTimer;
    item.addEventListener('mouseenter', function () {
      if (!DESKTOP.matches) return;
      clearTimeout(hoverTimer);
      closeAll(item);
      setPanel(item, true);
    });
    item.addEventListener('mouseleave', function () {
      if (!DESKTOP.matches) return;
      hoverTimer = setTimeout(function () {
        if (!item._pinned) setPanel(item, false);
      }, 140);
    });

    item.addEventListener('focusout', function (e) {
      if (!DESKTOP.matches) return;
      if (!item.contains(e.relatedTarget)) { item._pinned = false; setPanel(item, false); }
    });
  });

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    var label = toggle.querySelector('.nav-toggle__label');
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (!open) closeAll();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });
  }

  if (nav) {
    nav.addEventListener('click', function (e) {
      if (!e.target.closest('a')) return;
      if (!DESKTOP.matches) setNav(false); else closeAll();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openItem = items.filter(function (i) { return i.classList.contains('is-open'); })[0];
    if (openItem) { openItem._pinned = false; setPanel(openItem, false); topOf(openItem).focus(); return; }
    if (nav && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.masthead')) closeAll();
  });

  var onBreak = function () { closeAll(); setNav(false); };
  if (DESKTOP.addEventListener) DESKTOP.addEventListener('change', onBreak);
  else if (DESKTOP.addListener) DESKTOP.addListener(onBreak);

  /* ------------------------------------------------------------- theme ---
     Three states. 'system' is also what the CSS resolves on its own, so the
     site follows the device with this script absent. */
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    var root = document.documentElement;
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    var ORDER = ['system', 'light', 'dark'];
    var LABEL = {
      system: 'Colour theme: follows your device. Activate for light.',
      light:  'Colour theme: light. Activate for dark.',
      dark:   'Colour theme: dark. Activate to follow your device.'
    };

    var readPref = function () {
      try {
        var v = localStorage.getItem('qpr-theme');
        return ORDER.indexOf(v) > -1 ? v : 'system';
      } catch (err) { return 'system'; }
    };

    var paint = function (pref) {
      /* color-scheme is declared per theme in the stylesheet, so nothing is
         written to element styles here — the CSP forbids inline styles. */
      root.setAttribute('data-theme', pref);
      themeBtn.setAttribute('aria-label', LABEL[pref]);
      themeBtn.setAttribute('title', LABEL[pref]);
    };

    paint(readPref());

    themeBtn.addEventListener('click', function () {
      var next = ORDER[(ORDER.indexOf(readPref()) + 1) % ORDER.length];
      paint(next);
      try { localStorage.setItem('qpr-theme', next); } catch (err) {}
    });

    var onSystem = function () { if (readPref() === 'system') paint('system'); };
    if (systemDark.addEventListener) systemDark.addEventListener('change', onSystem);
    else if (systemDark.addListener) systemDark.addListener(onSystem);
  }

  if (masthead) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        masthead.classList.toggle('is-stuck', window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

/* ==========================================================================
   MEASUREMENT
   Events go through Cloudflare Zaraz, which forwards to GA4 (G-1ZKXKP6SXX)
   at the edge. Nothing is sent if Zaraz has not loaded or consent is absent,
   so the site works identically with tracking blocked.
   ========================================================================== */
(function () {
  'use strict';

  function track(name, data) {
    try {
      if (window.zaraz && typeof window.zaraz.track === 'function') {
        window.zaraz.track(name, data || {});
      }
    } catch (err) { /* measurement must never break the page */ }
  }
  window.qprTrack = track;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    if (href.indexOf('mailto:') === 0) {
      track('enquiry_email', {
        address: href.replace('mailto:', '').split('?')[0],
        subject: (href.split('subject=')[1] || '').split('&')[0],
        page: location.pathname
      });
    } else if (href.indexOf('tel:14416') === 0 || href.indexOf('tel:1800') === 0) {
      track('crisis_line_click', { number: href.replace('tel:', ''), page: location.pathname });
    } else if (a.dataset.course) {
      track('course_interest', { course: a.dataset.course, page: location.pathname });
    } else if (a.dataset.razorpay) {
      track('begin_checkout', { course: a.dataset.razorpay, currency: 'INR' });
    } else if (/^https?:/.test(href) && href.indexOf(location.host) === -1) {
      track('outbound_click', { url: href });
    }
  });

  /* Scroll depth, capped at one event per threshold per page. */
  var marks = [25, 50, 75, 100], hit = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight * 100;
    marks.forEach(function (m) {
      if (pct >= m && !hit[m]) { hit[m] = true; track('scroll_depth', { percent: m, page: location.pathname }); }
    });
  }, { passive: true });
})();
