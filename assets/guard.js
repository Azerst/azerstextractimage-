/* =========================================================
   BẢO MẬT — chặn copy, chặn F12, reload khi mở DevTools
========================================================= */
(function () {
  'use strict';

  /* ---------- RELOAD ---------- */
  const RELOAD = () => {
    try {
      // Cache-busting để chắc chắn reload từ server
      const base = location.href.split('#')[0].split('?')[0];
      location.replace(base + '?_=' + Date.now());
    } catch (e) {
      location.reload();
    }
  };

  /* ---------- CHẶN COPY / PASTE / KÉO CHỌN ---------- */
  document.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });

  ['copy','cut','selectstart','dragstart'].forEach(evt => {
    document.addEventListener(evt, e => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
    }, { passive: false });
  });

  /* ---------- CHẶN PHÍM TẮT DEVTOOLS + RELOAD ---------- */
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();

    const isBlocked =
      e.key === 'F12' || e.keyCode === 123 ||
      (e.ctrlKey && e.shiftKey && ['i','j','c','e','m','k'].includes(k)) ||
      (e.metaKey && e.altKey   && ['i','j','c'].includes(k)) ||
      (e.ctrlKey && (k === 'u' || k === 's')) ||
      (e.metaKey && (k === 'u' || k === 's')) ||
      (e.ctrlKey && e.metaKey && ['c','v','a','x','u'].includes(k)) === false && false; // no-op

    // chỉ chặn đúng các phím mục tiêu
    if (
      e.key === 'F12' || e.keyCode === 123 ||
      (e.ctrlKey && e.shiftKey && ['i','j','c','e','m','k'].includes(k)) ||
      (e.metaKey && e.altKey   && ['i','j','c'].includes(k)) ||
      (e.ctrlKey && (k === 'u' || k === 's')) ||
      (e.metaKey && (k === 'u' || k === 's'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      RELOAD();
      return false;
    }

    // chặn Ctrl+C/X/A/U (copy/select/view-source)
    if ((e.ctrlKey || e.metaKey) && ['c','x','a','u'].includes(k)) {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
      // riêng Ctrl+U → reload
      if (k === 'u') RELOAD();
    }
  }, true);

  /* ---------- DETECT DEVTOOLS ĐANG MỞ → RELOAD ---------- */

  // 1) Kích thước cửa sổ (desktop)
  const isDesktop = window.matchMedia('(pointer:fine)').matches;
  if (isDesktop) {
    let lastState = false;
    setInterval(() => {
      const wDiff = window.outerWidth  - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      const open = (wDiff > 260 || hDiff > 260);
      if (open && !lastState) RELOAD();
      lastState = open;
    }, 800);
  }

  // 2) Debugger-timing
  setInterval(() => {
    const t0 = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const t1 = performance.now();
    if (t1 - t0 > 120) RELOAD();
  }, 2500);

  // 3) Console trick — nếu devtools mở console sẽ gọi toString
  try {
    const bait = /./;
    bait.toString = function () {
      RELOAD();
      return '';
    };
    setInterval(() => {
      // eslint-disable-next-line no-console
      console.log('%c', bait);
    }, 4000);
  } catch (e) {}

  /* ---------- CHẶN KÉO THẢ ẢNH ---------- */
  document.addEventListener('dragstart', e => {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  }, { passive: false });

})();
