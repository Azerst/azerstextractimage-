/* =========================================================
   THEME TOGGLE — tách riêng để độc lập với script.js
========================================================= */
(function () {
  'use strict';

  function init() {
    var html = document.documentElement;
    var btn  = document.getElementById('themeToggle');

    /* Đảm bảo data-theme luôn có giá trị */
    if (!html.getAttribute('data-theme')) {
      html.setAttribute('data-theme', 'light');
    }

    if (!btn) return;

    /* Gắn handler */
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var cur  = html.getAttribute('data-theme') || 'light';
      var next = (cur === 'dark') ? 'light' : 'dark';

      html.setAttribute('data-theme', next);

      try { localStorage.setItem('azer-theme', next); } catch (err) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
