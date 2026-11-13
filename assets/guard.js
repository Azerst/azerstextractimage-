/* =========================================================
   GUARD — Bảo vệ web khỏi DevTools / Ctrl+U / Long-press
   Khi phát hiện → hiện overlay đếm ngược 4s → reload
========================================================= */
(function () {
  'use strict';

  const RELOAD_DELAY = 4;      // giây
  const LONG_PRESS_MS = 800;   // thời gian giữ màn hình để kích hoạt

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

    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard(); return false;
    }
    if (e.ctrlKey && e.shiftKey && ['i','j','c','k','e','m'].includes(k)) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard(); return false;
    }
    if (e.metaKey && e.altKey && ['i','j','c'].includes(k)) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && (k === 'u' || k === 's')) {
      e.preventDefault(); e.stopPropagation();
      triggerGuard(); return false;
    }
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

  /* ---------- 4) LONG-PRESS (GIỮ MÀN HÌNH) ----------
     - Chỉ giữ trên vùng nền (không phải button / link / img)
     - Kích hoạt sau 800ms giữ yên
     - Rung nhẹ (nếu hỗ trợ) để phản hồi
  ------------------------------------------------ */
  (function initLongPress() {
    let pressTimer = null;
    let startX = 0, startY = 0;
    let isPressing = false;

    const MOVE_TOLERANCE = 12; // px — di chuyển quá → huỷ
    const LONG_PRESS_MS_LOCAL = LONG_PRESS_MS;

    const isInteractive = (el) => {
      if (!el) return false;
      let node = el;
      while (node && node !== document.body) {
        const tag = (node.tagName || '').toLowerCase();
        if (
          tag === 'button' ||
          tag === 'a' ||
          tag === 'img' ||
          tag === 'svg' ||
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select'
        ) return true;
        if (node.isContentEditable) return true;
        if (node.classList && (
          node.classList.contains('modal') ||
          node.classList.contains('modal-inner') ||
          node.classList.contains('toast') ||
          node.classList.contains('tab')
        )) return true;
        node = node.parentElement;
      }
      return false;
    };

    const clear = () => {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
      isPressing = false;
    };

    const start = (x, y, target) => {
      if (isInteractive(target)) return;
      clear();
      isPressing = true;
      startX = x; startY = y;

      pressTimer = setTimeout(() => {
        if (!isPressing) return;
        isPressing = false;
        // Rung nhẹ (mobile)
        try { if (navigator.vibrate) navigator.vibrate([40, 30, 40]); } catch (e) {}
        triggerGuard();
      }, LONG_PRESS_MS_LOCAL);
    };

    const move = (x, y) => {
      if (!isPressing) return;
      const dx = Math.abs(x - startX);
      const dy = Math.abs(y - startY);
      if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) clear();
    };

    /* --- Touch --- */
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { clear(); return; }
      const t = e.touches[0];
      start(t.clientX, t.clientY, e.target);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) { clear(); return; }
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener('touchend',     clear, { passive: true });
    document.addEventListener('touchcancel',  clear, { passive: true });

    /* --- Mouse (desktop) --- */
    document.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      start(e.clientX, e.clientY, e.target);
    });

    document.addEventListener('mousemove', (e) => {
      move(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup',    clear);
    document.addEventListener('mouseleave', clear);
  })();

  /* ---------- 5) DETECT DEVTOOLS MỞ (DESKTOP) ---------- */
  const isDesktop = window.matchMedia('(pointer:fine)').matches;

  if (isDesktop) {
    setInterval(() => {
      if (triggered) return;
      const wDiff = window.outerWidth  - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      if (wDiff > 260 || hDiff > 260) triggerGuard();
    }, 1000);

    setInterval(() => {
      if (triggered) return;
      const t0 = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const t1 = performance.now();
      if (t1 - t0 > 200) triggerGuard();
    }, 2500);

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

  /* ---------- 6) DỌN DẸP KHI RELOAD ---------- */
  window.addEventListener('beforeunload', () => {
    if (countdownTimer) clearInterval(countdownTimer);
  });

})();
