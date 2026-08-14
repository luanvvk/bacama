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
    try { root.dispatchEvent(new CustomEvent('bamacam:lang', { detail: { lang: l } })); } catch (e) {}
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
  function methCta(sel) {
    var isEn = root.getAttribute('lang') === 'en';
    var label = document.getElementById('payLabel');
    if (label && sel) label.textContent = isEn ? (sel.dataset.ctaEn || sel.dataset.cta || 'Pay') : (sel.dataset.cta || 'Thanh toán');
    var go = document.getElementById('payGo');
    if (go && sel) go.href = sel.value === 'cod' ? 'checkout-done.html?cod=1' : 'checkout-pay.html?m=' + sel.value;
  }
  if (methForm) {
    methForm.addEventListener('change', function () {
      var sel = methForm.querySelector('input:checked');
      if (!sel) return;
      methCta(sel);
    });
    methCta(methForm.querySelector('input:checked'));
    /* when the language flips, refresh the CTA label too */
    addEventListener('bamacam:lang', function () { methCta(methForm.querySelector('input:checked')); });
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

  /* ============================================================
     MODALS + TOASTS + CONFIRM — injected once per page
     No page needs to ship its own toast host or auth modal HTML;
     they're built here when the DOM is ready, and every page
     gets them for free. Login / register buttons across the
     storefront open the same auth modal.
     ============================================================ */

  /* ---------- toast ---------- */
  if (!document.getElementById('toastStack')) {
    var st = document.createElement('div');
    st.id = 'toastStack'; st.className = 'toast-stack'; st.setAttribute('aria-live', 'polite');
    document.body.appendChild(st);
  }
  var icMap = { ok: '✓', warn: '!', crit: '⚠', info: 'i' };
  window.toast = function (msg, opts) {
    opts = opts || {};
    var stack = document.getElementById('toastStack'); if (!stack) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (opts.type || 'info');
    el.innerHTML = '<span class="ic">' + (icMap[opts.type] || icMap.info) + '</span>' +
                   '<div><div class="t"></div>' + (opts.desc ? '<div class="d"></div>' : '') + '</div>' +
                   '<button class="x" type="button" aria-label="Close">×</button>';
    el.querySelector('.t').textContent = msg;
    if (opts.desc) el.querySelector('.d').textContent = opts.desc;
    stack.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('in'); });
    var close = function () { el.classList.remove('in'); setTimeout(function(){ el.remove(); }, 240); };
    el.querySelector('.x').addEventListener('click', close);
    setTimeout(close, opts.stay ? 0 : (opts.dur || 4200));
    return el;
  };

  /* ---------- generic modal open/close + focus trap ---------- */
  window.openModal = function (idOrEl) {
    var m = (typeof idOrEl === 'string') ? document.getElementById(idOrEl) : idOrEl;
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add('open'); root.style.overflow = 'hidden';
    var f = m.querySelector('input, [href], button, select, textarea');
    if (f) f.focus({ preventScroll: true });
    var trap = function (e) {
      if (e.key !== 'Tab' || !m.classList.contains('open')) return;
      var fs = m.querySelectorAll('input, [href], button, select, textarea');
      if (!fs.length) return;
      var first = fs[0], last = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    var onKey = function (e) {
      if (e.key === 'Escape') closeModal(m);
      else trap(e);
    };
    m.addEventListener('keydown', onKey);
    m._close = function () {
      m.classList.remove('open'); root.style.overflow = '';
      m.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    m.querySelectorAll('[data-close]').forEach(function (b) {
      if (!b._wired) { b._wired = true; b.addEventListener('click', function(){ m._close(); }); }
    });
    m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('modal-scrim')) m._close(); });
  };
  window.closeModal = function (m) { if (typeof m === 'string') m = document.getElementById(m); if (m && m._close) m._close(); };

  /* ---------- confirm() returns a Promise — used by destructive actions ---------- */
  window.confirmDialog = function (opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var m = document.createElement('div');
      m.className = 'modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
      m.innerHTML =
        '<div class="modal-scrim"></div>' +
        '<div class="modal-panel sm"><div class="modal-bd confirm">' +
          '<div class="confirm-ic ' + (opts.danger ? 'crit' : '') + '">' +
            (opts.danger
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>') +
          '</div>' +
          '<h2></h2><p></p>' +
          '<div class="modal-ft">' +
            '<button class="btn ghost sm" type="button" data-cancel></button>' +
            '<button class="btn sm ' + (opts.danger ? '' : '') + '" type="button" data-ok></button>' +
          '</div>' +
        '</div></div>';
      m.querySelector('h2').textContent = opts.title || 'Xác nhận';
      m.querySelector('p').textContent = opts.body || '';
      m.querySelector('[data-cancel]').textContent = opts.cancelLabel || 'Huỷ';
      m.querySelector('[data-ok]').textContent = opts.okLabel || 'Đồng ý';
      if (opts.danger) m.querySelector('[data-ok]').style.background = 'var(--crit)';
      document.body.appendChild(m);
      var done = function (v) { closeModal(m); setTimeout(function(){ m.remove(); }, 240); resolve(v); };
      m.querySelector('[data-cancel]').addEventListener('click', function () { done(false); });
      m.querySelector('[data-ok]').addEventListener('click', function () { done(true); });
      openModal(m);
    });
  };

  /* ---------- auth modal — injected on every page, opened by [data-open-auth] ---------- */
  function buildAuthModal() {
    if (document.getElementById('authModal')) return;
    var m = document.createElement('div');
    m.id = 'authModal'; m.className = 'modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
    m.innerHTML =
      '<div class="modal-scrim"></div>' +
      '<div class="modal-panel">' +
        '<div class="modal-hd"><span class="lockup"><span class="mark" style="font-size:18px">Bacama<span class="dot">·</span></span></span>' +
          '<button class="close" type="button" data-close aria-label="Đóng / Close"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
        '</div>' +
        '<div class="modal-bd">' +
          '<div class="auth-tabs" role="tablist">' +
            '<button type="button" role="tab" aria-selected="true" data-auth-tab="login"><span data-vi>Đăng nhập</span><span data-en>Log in</span></button>' +
            '<button type="button" role="tab" aria-selected="false" data-auth-tab="register"><span data-vi>Tạo tài khoản</span><span data-en>Create account</span></button>' +
          '</div>' +

          '<form id="authLogin" class="auth-panel">' +
            '<div class="field"><label class="f" for="alog-email"><span data-vi>Email</span><span data-en>Email</span></label>' +
              '<input class="inp" id="alog-email" type="email" autocomplete="email" placeholder="ban@email.vn" /></div>' +
            '<div class="field"><label class="f" for="alog-pass"><span data-vi>Mật khẩu</span><span data-en>Password</span></label>' +
              '<input class="inp" id="alog-pass" type="password" autocomplete="current-password" placeholder="••••••••" /></div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:4px">' +
              '<label class="choice" style="border:0;padding:6px 0"><input type="checkbox" checked /><span style="font-size:13px;color:var(--ink-soft)"><span data-vi>Ghi nhớ</span><span data-en>Remember me</span></span></label>' +
              '<a href="#" style="font-size:12.5px;color:var(--accent);border-bottom:1px solid var(--accent)"><span data-vi>Quên mật khẩu?</span><span data-en>Forgot password?</span></a>' +
            '</div>' +
            '<button class="btn block lg" type="submit" style="margin-top:8px"><span data-vi>Vào quán</span><span data-en>Enter</span></button>' +
            '<div class="auth-divider"><span data-vi>hoặc</span><span data-en>or</span></div>' +
            '<div class="auth-soc">' +
              '<button type="button"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.9h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>Facebook</button>' +
              '<button type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span data-vi>Đổi mã Zalo</span><span data-en>Zalo OTP</span></button>' +
            '</div>' +
          '</form>' +

          '<form id="authRegister" class="auth-panel" hidden>' +
            '<div class="field"><label class="f" for="areg-name"><span data-vi>Họ và tên</span><span data-en>Full name</span></label>' +
              '<input class="inp" id="areg-name" autocomplete="name" placeholder="Nguyễn Thị A" /></div>' +
            '<div class="field"><label class="f" for="areg-email"><span data-vi>Email</span><span data-en>Email</span></label>' +
              '<input class="inp" id="areg-email" type="email" autocomplete="email" placeholder="ban@email.vn" /></div>' +
            '<div class="field-row">' +
              '<div class="field"><label class="f" for="areg-pass"><span data-vi>Mật khẩu</span><span data-en>Password</span></label>' +
                '<input class="inp" id="areg-pass" type="password" autocomplete="new-password" placeholder="••••••••" /></div>' +
              '<div class="field"><label class="f" for="areg-pass2"><span data-vi>Nhập lại</span><span data-en>Again</span></label>' +
                '<input class="inp" id="areg-pass2" type="password" autocomplete="new-password" placeholder="••••••••" /></div>' +
            '</div>' +
            '<label class="choice" style="margin-top:2px"><input type="checkbox" /><span style="font-size:12.5px;color:var(--ink-soft)"><span data-vi>Tôi đồng ý với điều khoản &amp; chính sách bảo mật</span><span data-en>I agree to the terms &amp; privacy policy</span></span></label>' +
            '<button class="btn block lg" type="submit" style="margin-top:8px"><span data-vi>Tạo tài khoản</span><span data-en>Create account</span></button>' +
          '</form>' +

          '<p class="auth-foot"><span data-vi>Bằng việc đăng nhập bạn đồng ý dùng cookie để giữ phiên đăng nhập. Chúng tôi không bao giờ dùng số thẻ của bạn cho gì khác ngoài thanh toán.</span><span data-en>By signing in you agree to a cookie keeping your session. We never use your card for anything other than payment.</span></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    var tabs = m.querySelectorAll('[data-auth-tab]');
    var panels = { login: m.querySelector('#authLogin'), register: m.querySelector('#authRegister') };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
        Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== t.dataset.authTab); });
      });
    });
    m.querySelectorAll('form').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        closeModal(m);
        toast(f === panels.login ? (root.getAttribute('lang')==='en' ? 'Welcome back' : 'Đăng nhập thành công')
                                  : (root.getAttribute('lang')==='en' ? 'Account created — check your inbox' : 'Đã tạo tài khoản — kiểm tra email'),
              { type: 'ok', desc: root.getAttribute('lang')==='en' ? 'Taking you to your dashboard…' : 'Đang mở trang của bạn…' });
      });
    });
  }
  buildAuthModal();

  /* open wire — only explicit [data-open-auth] triggers open the auth modal.
     The top-right "Đăng nhập" button toggles the .acct dropdown (via the
     existing data-acct handler above); a "Đăng nhập" row inside that
     dropdown is the element that carries data-open-auth and launches
     the modal. Nav links and other anchors are left untouched. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open-auth]');
    if (!a) return;
    e.preventDefault();
    openModal('authModal');
  });

  /* generic data-open-modal listener for any future modal */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-modal]');
    if (!t) return;
    e.preventDefault();
    openModal(t.dataset.openModal);
  });
})();
