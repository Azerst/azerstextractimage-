/* =========================================================
   THEME INIT — chạy trước khi body render
   Tránh nháy trắng khi trang đang tải
========================================================= */
(function () {
  try {
    var saved = localStorage.getItem('azer-theme');
    var prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    var initial = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initial);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
