(function () {
  'use strict';

  window.__azerstGuardLoaded = true;

  const RELOAD_DELAY = 4;
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
    } catch (e) { location.reload(); }
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

  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    const inField = tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable);

    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault(); e.stopPropagation(); triggerGuard(); return false;
    }
    if (e.ctrlKey && e.shiftKey && ['i','j','c','k','e','m'].includes(k)) {
      e.preventDefault(); e.stopPropagation(); triggerGuard(); return false;
    }
    if (e.metaKey && e.altKey && ['i','j','c'].includes(k)) {
      e.preventDefault(); e.stopPropagation(); triggerGuard(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && (k === 'u' || k === 's')) {
      e.preventDefault(); e.stopPropagation(); triggerGuard(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && ['c','x','a'].includes(k) && !inField) {
      e.preventDefault();
    }
  }, true);

  document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

  ['copy','cut','selectstart','dragstart'].forEach(evt => {
    document.addEventListener(evt, (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      e.preventDefault();
    }, { passive: false });
  });

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
        console.log('%c', bait);
      }, 3000);
    } catch (e) {}

    try {
      const trap = {};
      Object.defineProperty(trap, 'id', {
        get() { if (!triggered) triggerGuard(); return ''; }
      });
      setInterval(() => {
        if (triggered) return;
        console.log(trap);
      }, 4000);
    } catch (e) {}
  }

  window.addEventListener('beforeunload', () => {
    if (countdownTimer) clearInterval(countdownTimer);
  });
})();
