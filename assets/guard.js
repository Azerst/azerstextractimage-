/* =========================================================
   GUARD — Bảo vệ web khỏi DevTools / Ctrl+U
   Khi phát hiện → hiện overlay đếm ngược 4s → reload
========================================================= */
(function () {
  'use strict';

  const RELOAD_DELAY = 4; // giây

  let triggered = false;
  let countdownTimer = null;
  let overlayEl = null;
  let countdownEl = null;

  function ensureRefs() {
    if (overlayEl) return;
    overlayEl   = document.getElementById('guardOverlay');
    countdownEl = document.getElementById('guardCountdown');
  }

  function reloadPage() {
    try {
      const base = location.href.split('#')[0].split('?')[0];
      location.replace(base + '?_=' + Date.now());
    } catch (e) {
      location.reload();
    }
  }

  function triggerGuard() {
    if (triggered) return;
    triggered = true;
    ensureRefs();

    if (overlayEl) {
      overlayEl.classList.add('is-show');
      overlayEl.setAttribute('aria-hidden', 'false');
    }

    let count = RELOAD_DELAY;
    if (countdownEl) countdownEl.textContent = count;

    countdownTimer = setInterval(() => {
      count--;
      if (countdownEl) countdownEl.textContent = count <= 0 ? 0 : count;
      if (count <= 0) {
        clearInterval(countdownTimer);
        reloadPage();
      }
    }, 1000);
  }

  /* ---------- 1) CHẶN PHÍM TẮT ---------- */
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    const inField = tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable);

    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard();
      return false;
    }

    // Ctrl+Shift+I / J / C / K / E / M
    if (e.ctrlKey && e.shiftKey && ['i','j','c','k','e','m'].includes(k)) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard();
      return false;
    }

    // Mac: Cmd+Option+I / J / C
    if (e.metaKey && e.altKey && ['i','j','c'].includes(k)) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard();
      return false;
    }

    // Ctrl+U / Ctrl+S / Cmd+U / Cmd+S
    if ((e.ctrlKey || e.metaKey) && (k === 'u' || k === 's')) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard();
      return false;
    }

    // Ctrl+C / X / A (ngoài input)
    if ((e.ctrlKey || e.metaKey) && ['c','x','a'].includes(k) && !inField) {
      e.preventDefault();
    }
  }, true);

  /* ---------- 2) CHẶN MENU CHUỘT PHẢI ---------- */
  document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

  /* ---------- 3) CHẶN COPY / CUT / DRAG ---------- */
  ['copy','cut','selectstart','dragstart'].forEach(evt => {
    document.addEventListener(evt, (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
    }, { passive: false });
  });

  /* ---------- 4) DETECT DEVTOOLS MỞ (DESKTOP) ---------- */
  const isDesktop = window.matchMedia('(pointer:fine)').matches;

  if (isDesktop) {
    // 4a) Window size delta
    setInterval(() => {
      if (triggered) return;
      const wDiff = window.outerWidth  - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      if (wDiff > 260 || hDiff > 260) triggerGuard();
    }, 1000);

    // 4b) Debugger timing
    setInterval(() => {
      if (triggered) return;
      const t0 = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const t1 = performance.now();
      if (t1 - t0 > 200) triggerGuard();
    }, 2500);

    // 4c) Console trap (dùng toString)
    try {
      const bait = /./;
      bait.toString = function () {
        if (!triggered) triggerGuard();
        return '';
      };
      setInterval(() => {
        if (triggered) return;
        // eslint-disable-next-line no-console
        console.log('%c', bait);
      }, 3000);
    } catch (e) { /* ignore */ }

    // 4d) Object getter trap (devtools inspect sẽ gọi)
    try {
      const trap = {};
      Object.defineProperty(trap, 'id', {
        get() {
          if (!triggered) triggerGuard();
          return '';
        }
      });
      setInterval(() => {
        if (triggered) return;
        // eslint-disable-next-line no-console
        console.log(trap);
      }, 4000);
    } catch (e) { /* ignore */ }
  }

  /* ---------- 5) DỌN DẸP KHI RELOAD ---------- */
  window.addEventListener('beforeunload', () => {
    if (countdownTimer) clearInterval(countdownTimer);
  });

})();
