/* =========================================================
   AZERST ADMIN — Control Panel
========================================================= */
(function () {
  'use strict';

  /* ============ CREDENTIALS (XOR key = 137) ============ */
  const KEY = 137;
  const ACC_ENC = [
    203,202,209,208,211,223,200,199,203,200,202,
    182,182,182,201,201,168,168,247,247,
    184,187,191,190,185,186,189,188,177,176
  ];
  const PASS_ENC = [
    192,207,240,189,184,216,177,222,200,184,
    252,189,217,224,254,192,197,193,229,241,
    253,230,207,195,243,216,216,206,205,218,
    198,204,228,217,198,199,192,223,223,193,
    204,236,248,219,229,211,217,193,250,184
  ];

  const ACC_PLAIN  = String.fromCharCode.apply(null, ACC_ENC.map(function (c)  { return c ^ KEY; }));
  const PASS_PLAIN = String.fromCharCode.apply(null, PASS_ENC.map(function (c) { return c ^ KEY; }));

  /* ============ STORAGE KEYS ============ */
  const CFG_KEY     = 'azerst_config';
  const SESSION_KEY = 'azerst_admin_session';

  /* ============ DEFAULTS ============ */
  const DEFAULT_FILES = {
    BP104: [
      'BP_Prize_104.png','BP_Task_FP_104.png','BP_104.png','BP_Window_PP_104.png',
      'BP_Premium_icon_104.png','BP_Icon_free_104.png','subtype36_104.jpg',
      'subtype1_104.jpg','subtype2_104.jpg','subtype3_104.jpg','subtype7_104.jpg',
      'BP_Premium_title_104.png','BP_GRANDPrize01_104.jpg','BP_GRANDPrize02_104.jpg',
      'BP_GRANDPrize03_104.jpg','BP_GRANDPrize04_104.jpg','BP_GRANDPrize05_104.jpg',
      'BP_GRANDPrize06_104.jpg'
    ],
    BP105: [
      'BP_Prize_105.png','BP_Task_FP_105.png','BP_105.png','BP_Window_PP_105.png',
      'BP_Premium_icon_105.png','BP_Icon_free_105.png','subtype36_105.jpg',
      'subtype1_105.jpg','subtype2_105.jpg','subtype3_105.jpg','subtype7_105.jpg',
      'BP_Premium_title_105.png','BP_GRANDPrize01_105.jpg','BP_GRANDPrize02_105.jpg',
      'BP_GRANDPrize03_105.jpg','BP_GRANDPrize04_105.jpg','BP_GRANDPrize05_105.jpg',
      'BP_GRANDPrize06_105.jpg','BP_GRANDPrize07_105.jpg'
    ],
    BP106: [
      'BP_Prize_106.png','BP_Task_FP_106.png','BP_106.png','BP_Window_PP_106.png',
      'BP_Premium_icon_106.png','BP_Icon_free_106.png','subtype36_106.jpg',
      'subtype1_106.jpg','subtype2_106.jpg','subtype3_106.jpg','subtype7_106.jpg',
      'BP_Premium_title_106.png','BP_GRANDPrize01_106.jpg','BP_GRANDPrize02_106.jpg',
      'BP_GRANDPrize03_106.jpg','BP_GRANDPrize04_106.jpg','BP_GRANDPrize05_106.jpg',
      'BP_GRANDPrize06_106.jpg','BP_GRANDPrize07_106.jpg'
    ]
  };
  const BP_KEYS = ['BP104', 'BP105', 'BP106'];

  /* ============ STATE ============ */
  var state = {
    fileEdits: {},
    activeBp: 'BP104',
    attempts: 0,
    lockedUntil: 0
  };

  /* ============ DOM ============ */
  var dom = {};
  function $(id) { return document.getElementById(id); }

  /* ============ TOAST / STATUS ============ */
  var toastTimer = null;
  function toast(msg, type) {
    var el = dom.toast;
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = msg;
    el.className = 'toast is-show ' + (type || 'info');
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 2800);
  }

  function setStatus(msg, type) {
    var el = dom.status;
    if (!el) return;
    el.textContent = msg;
    el.className = 'status ' + (type || '');
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  /* ============ AUTH ============ */
  function checkCreds(user, pass) {
    var a = String(user || '');
    var b = String(pass || '');
    if (a.length !== ACC_PLAIN.length || b.length !== PASS_PLAIN.length) return false;
    var diff = 0, i;
    for (i = 0; i < ACC_PLAIN.length; i++)  diff |= a.charCodeAt(i) ^ ACC_PLAIN.charCodeAt(i);
    for (i = 0; i < PASS_PLAIN.length; i++) diff |= b.charCodeAt(i) ^ PASS_PLAIN.charCodeAt(i);
    return diff === 0;
  }

  function lockRemaining() {
    return Math.max(0, Math.ceil((state.lockedUntil - Date.now()) / 1000));
  }

  function showLoginError(msg) {
    if (!dom.loginError) return;
    dom.loginError.textContent = msg;
    dom.loginError.hidden = false;
    dom.loginError.style.animation = 'none';
    void dom.loginError.offsetWidth;
    dom.loginError.style.animation = '';
  }

  function clearLoginError() {
    if (dom.loginError) dom.loginError.hidden = true;
  }

  function handleLogin(e) {
    e.preventDefault();
    var locked = lockRemaining();
    if (locked > 0) {
      showLoginError('Đã khóa. Vui lòng thử lại sau ' + locked + 's.');
      return;
    }
    var user = dom.loginUser.value.trim();
    var pass = dom.loginPass.value;
    if (!user || !pass) {
      showLoginError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }
    if (checkCreds(user, pass)) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (err) {}
      state.attempts = 0;
      showAdmin();
      toast('Đăng nhập thành công', 'success');
    } else {
      state.attempts++;
      if (state.attempts >= 5) {
        state.lockedUntil = Date.now() + 30000;
        state.attempts = 0;
        showLoginError('Sai quá 5 lần. Đã khóa 30 giây.');
      } else {
        showLoginError('Sai tài khoản hoặc mật khẩu (' + state.attempts + '/5).');
      }
    }
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (err) {}
    dom.adminScreen.hidden = true;
    dom.loginScreen.hidden = false;
    dom.loginForm.reset();
    clearLoginError();
    toast('Đã đăng xuất', 'info');
  }

  /* ============ CONFIG IO ============ */
  function loadConfig() {
    try {
      var raw = localStorage.getItem(CFG_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveConfig(cfg) {
    try {
      localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      return true;
    } catch (e) {
      toast('Không lưu được cấu hình (localStorage đầy?)', 'error');
      return false;
    }
  }

  /* ============ FORM <-> STATE ============ */
  function fillFormFromConfig() {
    var cfg = loadConfig() || {};
    dom.cfgDomainFile.value = cfg.domainFile || 'https://dl-tata.freefireind.in';
    dom.cfgDomainDir.value  = cfg.domainDir  || 'https://dl.dir.freefiremobile.com';
    dom.cfgPath.value       = cfg.path       || 'common/OB56/CSH';

    BP_KEYS.forEach(function (bp) {
      var arr = (cfg.files && Array.isArray(cfg.files[bp])) ? cfg.files[bp] : DEFAULT_FILES[bp];
      state.fileEdits[bp] = arr.slice();
    });

    state.activeBp = 'BP104';
    setActiveTab('BP104');
    renderFileEditor();

    var ov = cfg.overrides || {};
    dom.cfgOverrides.value = Object.keys(ov)
      .map(function (k) { return k + '=' + ov[k]; })
      .join('\n');

    var stamp = cfg.updatedAt
      ? ' (cập nhật: ' + new Date(cfg.updatedAt).toLocaleString() + ')'
      : ' (mặc định)';
    setStatus('Đã nạp cấu hình' + stamp);
  }

  function setActiveTab(bp) {
    state.activeBp = bp;
    dom.fileTabs.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.bp === bp);
    });
  }

  function renderFileEditor() {
    var arr = state.fileEdits[state.activeBp] || [];
    dom.fileListEditor.value = arr.join('\n');
    dom.fileCount.textContent = arr.length + ' file';
  }

  function syncEditorToState() {
    var lines = dom.fileListEditor.value.split('\n')
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
    state.fileEdits[state.activeBp] = lines;
    dom.fileCount.textContent = lines.length + ' file';
  }

  function onTabClick(bp) {
    syncEditorToState();
    setActiveTab(bp);
    renderFileEditor();
  }

  /* ============ SAVE / RESET ============ */
  function collectConfigFromForm() {
    syncEditorToState();
    var overrides = {};
    dom.cfgOverrides.value.split('\n').forEach(function (line) {
      var t = line.trim();
      if (!t || t.charAt(0) === '#') return;
      var i = t.indexOf('=');
      if (i === -1) return;
      var k = t.slice(0, i).trim();
      var v = t.slice(i + 1).trim();
      if (k && v) overrides[k] = v;
    });
    return {
      domainFile: dom.cfgDomainFile.value.trim() || undefined,
      domainDir : dom.cfgDomainDir.value.trim()  || undefined,
      path      : dom.cfgPath.value.trim()       || undefined,
      files     : JSON.parse(JSON.stringify(state.fileEdits)),
      overrides : Object.keys(overrides).length ? overrides : undefined,
      updatedAt : Date.now()
    };
  }

  function handleSave() {
    var cfg = collectConfigFromForm();
    if (saveConfig(cfg)) {
      toast('Đã lưu cấu hình', 'success');
      setStatus('✔ Đã lưu lúc ' + new Date().toLocaleTimeString(), 'ok');
    }
  }

  function handleReset() {
    if (!confirm('Reset toàn bộ cấu hình về mặc định? Thao tác này không thể hoàn tác.')) return;
    try { localStorage.removeItem(CFG_KEY); } catch (e) {}
    fillFormFromConfig();
    toast('Đã reset về mặc định', 'warning');
    setStatus('Đã reset về mặc định');
  }

  /* ============ IMPORT / EXPORT ============ */
  function handleExport() {
    var cfg = collectConfigFromForm();
    var blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url;
    a.download = 'azerst-config-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    toast('Đã export cấu hình', 'success');
  }

  function handleImport(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var cfg = JSON.parse(e.target.result);
        if (!cfg || typeof cfg !== 'object') throw new Error('Invalid');
        if (!saveConfig(cfg)) return;
        fillFormFromConfig();
        toast('Đã import cấu hình', 'success');
        setStatus('✔ Đã import cấu hình', 'ok');
      } catch (err) {
        toast('File JSON không hợp lệ', 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ============ SCREENS ============ */
  function showAdmin() {
    dom.loginScreen.hidden = true;
    dom.adminScreen.hidden = false;
    fillFormFromConfig();
  }

  function showLogin() {
    dom.adminScreen.hidden = true;
    dom.loginScreen.hidden = false;
    dom.loginUser.focus();
  }

  /* ============ INIT ============ */
  function cacheDom() {
    dom = {
      loginScreen: $('loginScreen'),
      adminScreen: $('adminScreen'),
      loginForm:   $('loginForm'),
      loginUser:   $('loginUser'),
      loginPass:   $('loginPass'),
      loginBtn:    $('loginBtn'),
      loginError:  $('loginError'),
      togglePw:    $('togglePw'),
      logoutBtn:   $('logoutBtn'),
      cfgDomainFile: $('cfgDomainFile'),
      cfgDomainDir:  $('cfgDomainDir'),
      cfgPath:       $('cfgPath'),
      fileTabs:      Array.prototype.slice.call(document.querySelectorAll('.file-tab')),
      fileListEditor: $('fileListEditor'),
      fileCount:      $('fileCount'),
      cfgOverrides:   $('cfgOverrides'),
      saveBtn:        $('saveBtn'),
      resetBtn:       $('resetBtn'),
      exportBtn:      $('exportBtn'),
      importInput:    $('importInput'),
      status:         $('status'),
      toast:          $('toast')
    };
  }

  function bindEvents() {
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.loginForm.addEventListener('input', clearLoginError);

    dom.togglePw.addEventListener('click', function () {
      var isPw = dom.loginPass.type === 'password';
      dom.loginPass.type = isPw ? 'text' : 'password';
      dom.togglePw.setAttribute('aria-label', isPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });

    dom.logoutBtn.addEventListener('click', logout);

    dom.fileTabs.forEach(function (btn) {
      btn.addEventListener('click', function () { onTabClick(btn.dataset.bp); });
    });

    dom.fileListEditor.addEventListener('input', debounce(function () {
      var lines = dom.fileListEditor.value.split('\n')
        .map(function (l) { return l.trim(); })
        .filter(Boolean);
      dom.fileCount.textContent = lines.length + ' file';
    }, 150));

    dom.saveBtn.addEventListener('click', handleSave);
    dom.resetBtn.addEventListener('click', handleReset);
    dom.exportBtn.addEventListener('click', handleExport);

    dom.importInput.addEventListener('change', function (e) {
      handleImport(e.target.files && e.target.files[0]);
      e.target.value = '';
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'
          && !dom.adminScreen.hidden) {
        e.preventDefault();
        handleSave();
      }
    });
  }

  function init() {
    cacheDom();
    bindEvents();
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      showAdmin();
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
