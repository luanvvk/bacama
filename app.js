/* ============================================================
   BACAMA — shared behaviour
   Degrades safely: <html class="no-js"> is cleared on load and
   the CSS hides the entrance overlay while that class is present,
   so a failed script can never leave the page locked.

   LANGUAGE: Vietnamese is the default. The header button flips
   the whole page to English — and when it does, the italic
   glosses hide, because the text they were whispering under is
   now speaking English itself.
   In production this becomes an /en/ route via next-intl so each
   locale has its own indexable URL; the toggle is prototype-only.
   ============================================================ */
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');

  /* ---------- locale ---------- */
  function setLang(l) {
    root.setAttribute('lang', l);
    try { localStorage.setItem('bacama.locale', l); } catch (e) {}
    document.querySelectorAll('[data-toggle-lang]').forEach(function (b) {
      b.setAttribute('aria-label', l === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt');
    });
  }
  var savedLang = null;
  try { savedLang = localStorage.getItem('bacama.locale'); } catch (e) {}
  setLang(savedLang === 'en' ? 'en' : 'vi');

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toggle-lang]');
    if (!t) return;
    e.preventDefault();
    setLang(root.getAttribute('lang') === 'vi' ? 'en' : 'vi');
  });

  /* ---------- entrance overlay ---------- */
  var enter = document.getElementById('enter');
  if (enter) {
    // Once per browser session, not once per half-day: close the tab
    // and it greets you again. Add ?enter to the URL to force it.
    var forced = /[?&]enter\b/.test(location.search);
    var seen = false;
    try { seen = sessionStorage.getItem('bacama.entered') === '1'; } catch (e) {}

    if (seen && !forced) {
      enter.hidden = true;
    } else {
      root.classList.add('enter-open');
      var btn = enter.querySelector('.enter-btn');
      if (btn) btn.focus({ preventScroll: true });

      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var conn = navigator.connection || {};
      var save = conn.saveData || /2g/.test(conn.effectiveType || '');
      var vid = enter.querySelector('video[data-src]');
      if (vid && !reduce && !save) {
        vid.src = vid.dataset.src;
        vid.play().catch(function () {}); // refusal is fine — the poster stays
      }

      var closeEnter = function () {
        enter.classList.add('gone');
        root.classList.remove('enter-open');
        try { sessionStorage.setItem('bacama.entered', '1'); } catch (e) {}
        setTimeout(function () {
          enter.hidden = true;
          if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
        }, 850);
      };
      enter.querySelectorAll('[data-enter]').forEach(function (b) {
        b.addEventListener('click', function (e) { e.preventDefault(); closeEnter(); });
      });
      enter.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeEnter(); return; }
        if (e.key !== 'Tab') return;
        var f = enter.querySelectorAll('button, [href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
  }

  /* ---------- header shadow ---------- */
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        hdr.classList.toggle('scrolled', (scrollY || 0) > 10);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- drawers (cart right, nav left) ---------- */
  var scrim = document.getElementById('scrim');
  var lastFocus = null;

  function openDrawer(id) {
    var d = document.getElementById(id);
    if (!d) return;
    lastFocus = document.activeElement;
    closeDrawers(true);
    d.classList.add('open');
    if (scrim) scrim.classList.add('open');
    root.style.overflow = 'hidden';
    var f = d.querySelector('button, [href], input');
    if (f) f.focus({ preventScroll: true });
  }
  function closeDrawers(silent) {
    document.querySelectorAll('.drawer.open').forEach(function (d) { d.classList.remove('open'); });
    if (scrim) scrim.classList.remove('open');
    root.style.overflow = '';
    if (!silent && lastFocus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; }
  }

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openDrawer(open.dataset.open); return; }
    if (e.target.closest('[data-close]') || e.target === scrim) { closeDrawers(); return; }

    // account menu
    var acct = document.querySelector('.acct');
    if (acct) {
      if (e.target.closest('[data-acct]')) acct.classList.toggle('open');
      else if (!e.target.closest('.acct-menu')) acct.classList.remove('open');
    }
    // contact widget
    var contact = document.querySelector('.contact');
    if (contact) {
      if (e.target.closest('[data-contact]')) contact.classList.toggle('open');
      else if (!e.target.closest('.contact-panel')) contact.classList.remove('open');
    }
  });

  addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.querySelector('.drawer.open')) { closeDrawers(); return; }
    document.querySelectorAll('.acct.open, .contact.open').forEach(function (n) {
      n.classList.remove('open');
    });
  });

  /* ---------- cart quantity + total (prototype maths) ---------- */
  function money(n) { return n.toLocaleString('vi-VN') + ' ₫'; }
  function recalc() {
    var sub = 0;
    document.querySelectorAll('.citem').forEach(function (row) {
      var unit = Number(row.dataset.price || 0);
      var q = Number(row.querySelector('.qty span').textContent) || 0;
      var line = unit * q;
      row.querySelector('.p').textContent = money(line);
      sub += line;
    });
    var subEl = document.getElementById('cartSub');
    var totEl = document.getElementById('cartTotal');
    var shipEl = document.getElementById('cartShip');
    var freeEl = document.getElementById('cartFree');
    if (!subEl) return;
    var FREE_AT = 500000, ship = sub >= FREE_AT || sub === 0 ? 0 : 32000;
    subEl.textContent = money(sub);
    if (shipEl) shipEl.textContent = ship === 0 ? 'Miễn phí' : money(ship);
    if (totEl) totEl.textContent = money(sub + ship);
    if (freeEl) {
      if (sub === 0 || sub >= FREE_AT) freeEl.hidden = true;
      else { freeEl.hidden = false; freeEl.querySelector('b').textContent = money(FREE_AT - sub); }
    }
    var count = document.querySelectorAll('.citem').length;
    document.querySelectorAll('[data-cart-count]').forEach(function (p) { p.textContent = count; });
  }

  document.addEventListener('click', function (e) {
    var step = e.target.closest('[data-step]');
    if (step) {
      var span = step.parentElement.querySelector('span');
      var v = Number(span.textContent) + Number(step.dataset.step);
      span.textContent = Math.max(1, v);
      recalc();
      return;
    }
    var rm = e.target.closest('[data-remove]');
    if (rm) { rm.closest('.citem').remove(); recalc(); }
  });
  recalc();

  /* ---------- mobile nav accordion ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-sub]');
    if (!t) return;
    e.preventDefault();
    var sub = document.getElementById(t.dataset.sub);
    if (sub) sub.hidden = !sub.hidden;
  });

  /* ---------- scroll reveal ---------- */
  var rv = document.querySelectorAll('.rv');
  if (rv.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.forEach(function (n) { io.observe(n); });
  } else {
    rv.forEach(function (n) { n.classList.add('in'); });
  }

  /* ---------- tabs ---------- */
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab]');
    if (!tab) return;
    var group = tab.closest('.tabs');
    group.querySelectorAll('[data-tab]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b === tab));
    });
    group.parentElement.querySelectorAll('[data-panel]').forEach(function (p) {
      p.hidden = p.dataset.panel !== tab.dataset.tab;
    });
  });

  /* ---------- checkout: method choice drives the CTA label ---------- */
  var methForm = document.getElementById('methForm');
  if (methForm) {
    methForm.addEventListener('change', function () {
      var sel = methForm.querySelector('input:checked');
      if (!sel) return;
      var label = document.getElementById('payLabel');
      if (label) label.textContent = sel.dataset.cta || 'Thanh toán';
      var go = document.getElementById('payGo');
      if (go) go.href = sel.value === 'cod' ? 'checkout-done.html?cod=1' : 'checkout-pay.html?m=' + sel.value;
    });
  }

  /* ---------- checkout: fake the webhook wait ---------- */
  var wait = document.getElementById('waiting');
  if (wait) {
    setTimeout(function () { location.href = 'checkout-done.html'; }, 6000);
  }

  /* ---------- discussion echo (learn page) ---------- */
  var chatForm = document.getElementById('chatForm');
  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = chatForm.querySelector('input');
      var v = input.value.trim();
      if (!v) return;
      var bd = document.getElementById('chatBody');
      var el = document.createElement('div');
      el.className = 'msg';
      el.innerHTML = '<div class="av">B</div><div><div class="who">Bạn' +
                     '<span class="when">vừa xong</span></div><div class="txt"></div></div>';
      el.querySelector('.txt').textContent = v;
      bd.appendChild(el);
      bd.scrollTop = bd.scrollHeight;
      input.value = '';
    });
  }
})();
