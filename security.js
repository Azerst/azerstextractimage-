(function () {
  'use strict';
  window.__azerstSecurityLoaded = true;

  try {
    if (window.top !== window.self) {
      try { window.top.location = window.self.location.href; }
      catch (e) {
        document.documentElement.innerHTML =
          '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#ff5a46;font-family:system-ui,sans-serif;text-align:center;padding:24px;">' +
          '<div><h1 style="font-size:56px;font-weight:900;margin-bottom:16px;">&#9940;</h1>' +
          '<p style="font-size:14px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Forbidden</p></div></body>';
      }
      return;
    }
  } catch (e) { return; }

  setTimeout(function () {
    if (!window.__azerstGuardLoaded) {
      try { console.warn('[Security] guard.js not loaded'); } catch (e) {}
    }
  }, 1500);

  var showConsoleWarning = function () {
    try {
      console.clear();
      console.log('%cSTOP', 'color:#ff5a46;font-size:48px;font-weight:900;padding:16px 0;');
      console.log('%cDo not paste any code here.', 'color:#fff;font-size:14px;background:#b52a1c;padding:14px 22px;border-radius:10px;font-weight:600;');
    } catch (e) {}
  };
  showConsoleWarning();
  setInterval(showConsoleWarning, 20000);

  ['drop','dragover','dragenter'].forEach(function (evt) {
    document.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); }, true);
  });

  window.addEventListener('beforeprint', function (e) { e.preventDefault(); e.stopPropagation(); }, true);

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      var t = e.target;
      var tag = (t && t.tagName || '').toLowerCase();
      var inField = tag === 'input' || tag === 'textarea' || (t && t.isContentEditable);
      if (!inField) e.preventDefault();
    }
  }, true);

  document.addEventListener('mousedown', function (e) { if (e.button === 1) e.preventDefault(); }, true);

  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName !== 'IMG') e.preventDefault();
  }, true);
})();
