/* =========================================================
   THEME INIT — chạy đồng bộ trong <head>
   Đặt data-theme ngay từ đầu để tránh nháy trắng
========================================================= */
(function () {
  'use strict';
  try {
    var saved = null;
    try { saved = localStorage.getItem('azer-theme'); } catch (e) {}

    var prefersDark = false;
    try {
      prefersDark = window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {}

    var initial =
      (saved === 'dark' || saved === 'light')
        ? saved
        : (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initial);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
