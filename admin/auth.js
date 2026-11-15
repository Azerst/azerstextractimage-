(function () {
  'use strict';

  /* ============ THÔNG TIN ĐĂNG NHẬP ============ */
  var ADMIN_USER = 'BCXYZVANBAC???@@!!~~1267034589';
  var ADMIN_PASS = 'IFy41Q8WA1u4PiwILHlxtoFJzQQGDSOEmPONIVVHEeqRlZPHs1';

  /* ============ SESSION & DATA ============ */
  var SESSION_KEY = 'azer_admin_session';
  var TS_KEY = 'azer_admin_ts';
  var SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 giờ

  var STORAGE_KEY = 'azer_bp_links';

  var DEFAULT_LINKS = {
    BP104: ['BP_Prize_104.png','BP_Task_FP_104.png','BP_104.png','BP_Window_PP_104.png','BP_Premium_icon_104.png','BP_Icon_free_104.png','subtype36_104.jpg','subtype1_104.jpg','subtype2_104.jpg','subtype3_104.jpg','subtype7_104.jpg','BP_Premium_title_104.png','BP_GRANDPrize01_104.jpg','BP_GRANDPrize02_104.jpg','BP_GRANDPrize03_104.jpg','BP_GRANDPrize04_104.jpg','BP_GRANDPrize05_104.jpg','BP_GRANDPrize06_104.jpg'],
    BP105: ['BP_Prize_105.png','BP_Task_FP_105.png','BP_105.png','BP_Window_PP_105.png','BP_Premium_icon_105.png','BP_Icon_free_105.png','subtype36_105.jpg','subtype1_105.jpg','subtype2_105.jpg','subtype3_105.jpg','subtype7_105.jpg','BP_Premium_title_105.png','BP_GRANDPrize01_105.jpg','BP_GRANDPrize02_105.jpg','BP_GRANDPrize03_105.jpg','BP_GRANDPrize04_105.jpg','BP_GRANDPrize05_105.jpg','BP_GRANDPrize06_105.jpg','BP_GRANDPrize07_105.jpg'],
    BP106: ['BP_Prize_106.png','BP_Task_FP_106.png','BP_106.png','BP_Window_PP_106.png','BP_Premium_icon_106.png','BP_Icon_free_106.png','subtype36_106.jpg','subtype1_106.jpg','subtype2_106.jpg','subtype3_106.jpg','subtype7_106.jpg','BP_Premium_title_106.png','BP_GRANDPrize01_106.jpg','BP_GRANDPrize02_106.jpg','BP_GRANDPrize03_106.jpg','BP_GRANDPrize04_106.jpg','BP_GRANDPrize05_106.jpg','BP_GRANDPrize06_106.jpg','BP_GRANDPrize07_106.jpg']
  };

  function getLinks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_LINKS));
      var obj = JSON.parse(raw);
      return {
        BP104: Array.isArray(obj.BP104) ? obj.BP104 : DEFAULT_LINKS.BP104,
        BP105: Array.isArray(obj.BP105) ? obj.BP105 : DEFAULT_LINKS.BP105,
        BP106: Array.isArray(obj.BP106) ? obj.BP106 : DEFAULT_LINKS.BP106
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_LINKS));
    }
  }

  function setLinks(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  }

  function isLoggedIn() {
    var session = localStorage.getItem(SESSION_KEY);
    var ts = parseInt(localStorage.getItem(TS_KEY) || '0', 10);
    if (!session || !ts) return false;
    if (Date.now() - ts > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TS_KEY);
      return false;
    }
    return true;
  }

  function setSession() {
    localStorage.setItem(SESSION_KEY, '1');
    localStorage.setItem(TS_KEY, Date.now().toString());
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TS_KEY);
  }

  function isLoginPage() { return document.getElementById('loginForm') !== null; }
  function isDashPage()  { return document.getElementById('editorArea') !== null; }

  function toast(msg, type) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'dash-toast is-show ' + (type || '');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = 'dash-toast ' + (type || ''); }, 2600);
  }

  function setStatus(msg, type) {
    var el = document.getElementById('statusBar');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'dash-status ' + (type || '');
    clearTimeout(el._t);
    if (msg) {
      el._t = setTimeout(function () { el.textContent = ''; el.className = 'dash-status'; }, 3500);
    }
  }

  /* ============ ĐĂNG NHẬP ============ */
  function initLogin() {
    if (isLoggedIn()) {
      window.location.replace('./dashboard.html');
      return;
    }

    var form = document.getElementById('loginForm');
    var inputUser = document.getElementById('loginUser');
    var inputPass = document.getElementById('loginPass');
    var errorEl = document.getElementById('loginError');
    var btn = document.getElementById('loginBtn');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var user = (inputUser.value || '').trim();
      var pass = (inputPass.value || '').trim();

      if (!user || !pass) {
        errorEl.textContent = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu';
        errorEl.classList.add('is-show');
        return;
      }

      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        errorEl.classList.remove('is-show');
        btn.disabled = true;
        btn.textContent = 'ĐANG ĐĂNG NHẬP...';
        setSession();
        setTimeout(function () {
          window.location.replace('./dashboard.html');
        }, 400);
      } else {
        errorEl.textContent = 'Đăng nhập thất bại — sai tài khoản hoặc mật khẩu';
        errorEl.classList.add('is-show');
        inputPass.value = '';
        inputPass.focus();
        setTimeout(function () { errorEl.classList.remove('is-show'); }, 3500);
      }
    });
  }

  /* ============ DASHBOARD ============ */
  var currentData = null;
  var currentMonth = 'BP104';

  function initDash() {
    if (!isLoggedIn()) {
      window.location.replace('./index.html');
      return;
    }

    currentData = getLinks();

    document.getElementById('logoutBtn').addEventListener('click', function () {
      clearSession();
      window.location.replace('./index.html');
    });

    var tabs = document.querySelectorAll('.dash-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        currentMonth = tab.dataset.month;
        renderEditor();
      });
    });

    document.getElementById('saveAllBtn').addEventListener('click', function () {
      if (setLinks(currentData)) {
        setStatus('✅ Đã lưu thay đổi — tải lại trang chủ để xem', 'ok');
        toast('Đã lưu tất cả thay đổi', 'success');
      } else {
        setStatus('❌ Lỗi khi lưu', 'err');
        toast('Lỗi khi lưu', 'error');
      }
    });

    document.getElementById('exportBtn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'azer_bp_links.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('Đã xuất file JSON', 'success');
    });

    var importFile = document.getElementById('importFile');
    document.getElementById('importBtn').addEventListener('click', function () {
      importFile.value = '';
      importFile.click();
    });

    importFile.addEventListener('change', function () {
      var file = importFile.files && importFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          currentData = {
            BP104: Array.isArray(parsed.BP104) ? parsed.BP104 : currentData.BP104,
            BP105: Array.isArray(parsed.BP105) ? parsed.BP105 : currentData.BP105,
            BP106: Array.isArray(parsed.BP106) ? parsed.BP106 : currentData.BP106
          };
          setLinks(currentData);
          renderEditor();
          toast('Nhập JSON thành công', 'success');
        } catch (e) {
          toast('File JSON không hợp lệ', 'error');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('resetBtn').addEventListener('click', function () {
      if (!confirm('Reset toàn bộ link về mặc định?')) return;
      currentData = JSON.parse(JSON.stringify(DEFAULT_LINKS));
      setLinks(currentData);
      renderEditor();
      toast('Đã reset về mặc định', 'warn');
    });

    renderEditor();
  }

  function renderEditor() {
    var area = document.getElementById('editorArea');
    if (!area) return;

    var month = currentMonth;
    var files = currentData[month] || [];
    var label = month === 'BP104' ? 'THÁNG 1' : month === 'BP105' ? 'THÁNG 2' : 'THÁNG 3';

    var html = '<h2>DANH SÁCH FILE — ' + label + ' (' + files.length + ')</h2>';
    html += '<div class="link-list">';

    if (files.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:rgba(255,255,255,.4);">Chưa có file nào — bấm "+ THÊM FILE" bên dưới</div>';
    } else {
      files.forEach(function (file, idx) {
        html += '<div class="link-row">' +
          '<span class="link-idx">' + (idx + 1) + '</span>' +
          '<input type="text" class="link-input" data-idx="' + idx + '" value="' + escapeAttr(file) + '" placeholder="Tên file (VD: BP_Prize_104.png)" spellcheck="false" />' +
          '<button type="button" class="link-del" data-idx="' + idx + '" title="Xóa">✕</button>' +
        '</div>';
      });
    }

    html += '</div>';
    html += '<button type="button" class="add-btn" id="addFileBtn">+ THÊM FILE</button>';
    area.innerHTML = html;

    area.querySelectorAll('.link-input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var idx = parseInt(inp.dataset.idx, 10);
        currentData[month][idx] = inp.value;
      });
    });

    area.querySelectorAll('.link-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.idx, 10);
        if (!confirm('Xóa file "' + currentData[month][idx] + '"?')) return;
        currentData[month].splice(idx, 1);
        renderEditor();
        toast('Đã xóa file', 'warn');
      });
    });

    document.getElementById('addFileBtn').addEventListener('click', function () {
      currentData[month].push('NEW_FILE_' + month + '.png');
      renderEditor();
      var inputs = area.querySelectorAll('.link-input');
      var last = inputs[inputs.length - 1];
      if (last) { last.focus(); last.select(); }
    });
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (isLoginPage()) initLogin();
      else if (isDashPage()) initDash();
    });
  } else {
    if (isLoginPage()) initLogin();
    else if (isDashPage()) initDash();
  }

})();
