(function () {
  'use strict';

  var isInIframe = false;
  try { isInIframe = window.top !== window.self; } catch (e) { isInIframe = true; }
  if (isInIframe) {
    try { window.top.location = window.self.location.href; } catch (e) {}
    document.body.innerHTML =
      '<div style="min-height:100vh;display:grid;place-items:center;background:#070a14;color:#ff5a46;font-family:system-ui,sans-serif;text-align:center;padding:24px;">' +
      '<div><h1 style="font-size:56px;font-weight:900;margin-bottom:16px;">&#9940;</h1>' +
      '<p style="font-size:13px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Forbidden</p></div></div>';
    return;
  }

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

  const CFG_KEY     = 'azerst_config';
  const SESSION_KEY = 'azerst_admin_session';
  const LOCK_KEY    = 'azerst_admin_lock';
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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

  const DEFAULT_CFG = {
    domainFile: 'https://dl-tata.freefireind.in',
    domainDir:  'https://dl.dir.freefiremobile.com',
    path:       'common/OB56/CSH'
  };

  var state = { cfg: null, activeBp: 'BP104' };
  var dom = {};
  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

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

  function cloneDefault() {
    return {
      domainFile: DEFAULT_CFG.domainFile,
      domainDir:  DEFAULT_CFG.domainDir,
      path:       DEFAULT_CFG.path,
      files: {
        BP104: DEFAULT_FILES.BP104.slice(),
        BP105: DEFAULT_FILES.BP105.slice(),
        BP106: DEFAULT_FILES.BP106.slice()
      },
      overrides: {}
    };
  }

  function buildDefaultUrl(bp, file) {
    if (!file) return '';
    var cfg = state.cfg;
    var isDir = /^subtype7_|^BP_Premium_title_|^BP_GRANDPrize/.test(file);
    var domain = isDir ? cfg.domainDir : cfg.domainFile;
    return domain + '/' + cfg.path + '/' + bp + '/' + file;
  }

  function buildEffectiveUrl(bp, file) {
    var key = bp + '/' + file;
    return (state.cfg.overrides && state.cfg.overrides[key]) || buildDefaultUrl(bp, file);
  }

  function loadCfgFromStorage() {
    try {
      var raw = localStorage.getItem(CFG_KEY);
      if (!raw) return cloneDefault();
      var d = JSON.parse(raw);
      if (!d || typeof d !== 'object') return cloneDefault();
      var cfg = cloneDefault();
      if (typeof d.domainFile === 'string') cfg.domainFile = d.domainFile;
      if (typeof d.domainDir  === 'string') cfg.domainDir  = d.domainDir;
      if (typeof d.path       === 'string') cfg.path       = d.path;
      if (d.files && typeof d.files === 'object') {
        BP_KEYS.forEach(function (bp) {
          if (Array.isArray(d.files[bp])) {
            cfg.files[bp] = d.files[bp].filter(function (x) { return typeof x === 'string'; });
          }
        });
      }
      if (d.overrides && typeof d.overrides === 'object') {
        cfg.overrides = {};
        Object.keys(d.overrides).forEach(function (k) {
          if (typeof d.overrides[k] === 'string') cfg.overrides[k] = d.overrides[k];
        });
      }
      return cfg;
    } catch (e) { return cloneDefault(); }
  }

  function saveCfgToStorage(cfg) {
    try {
      localStorage.setItem(CFG_KEY, JSON.stringify({
        domainFile: cfg.domainFile,
        domainDir:  cfg.domainDir,
        path:       cfg.path,
        files:      cfg.files,
        overrides:  cfg.overrides,
        updatedAt:  Date.now()
      }));
      return true;
    } catch (e) { toast('Không lưu được', 'error'); return false; }
  }

  function checkCreds(user, pass) {
    var a = String(user || ''), b = String(pass || '');
    if (a.length !== ACC_PLAIN.length || b.length !== PASS_PLAIN.length) return false;
    var diff = 0, i;
    for (i = 0; i < ACC_PLAIN.length; i++)  diff |= a.charCodeAt(i) ^ ACC_PLAIN.charCodeAt(i);
    for (i = 0; i < PASS_PLAIN.length; i++) diff |= b.charCodeAt(i) ^ PASS_PLAIN.charCodeAt(i);
    return diff === 0;
  }

  function getLockData() {
    try {
      var raw = localStorage.getItem(LOCK_KEY);
      if (!raw) return { attempts: 0, until: 0 };
      var d = JSON.parse(raw);
      return { attempts: Number(d.attempts) || 0, until: Number(d.until) || 0 };
    } catch (e) { return { attempts: 0, until: 0 }; }
  }
  function saveLockData(d) { try { localStorage.setItem(LOCK_KEY, JSON.stringify(d)); } catch (e) {} }
  function resetLockData() { try { localStorage.removeItem(LOCK_KEY); } catch (e) {} }

  function getLockRemaining() {
    var d = getLockData();
    if (!d.until) return 0;
    var r = Math.ceil((d.until - Date.now()) / 1000);
    if (r <= 0) { saveLockData({ attempts: 0, until: 0 }); return 0; }
    return r;
  }

  function recordFailedAttempt() {
    var d = getLockData();
    var attempts = d.attempts + 1;
    if (attempts >= 5) {
      saveLockData({ attempts: 0, until: Date.now() + 60000 });
      return { locked: true, attempts: 0 };
    }
    saveLockData({ attempts: attempts, until: 0 });
    return { locked: false, attempts: attempts };
  }

  function showLoginError(msg) {
    if (!dom.loginError) return;
    dom.loginError.textContent = msg;
    dom.loginError.hidden = false;
    dom.loginError.style.animation = 'none';
    void dom.loginError.offsetWidth;
    dom.loginError.style.animation = '';
  }
  function clearLoginError() { if (dom.loginError) dom.loginError.hidden = true; }

  function handleLogin(e) {
    e.preventDefault();
    var remaining = getLockRemaining();
    if (remaining > 0) { showLoginError('Đã khóa. Vui lòng thử lại sau ' + remaining + 's.'); return; }
    var user = dom.loginUser.value.trim();
    var pass = dom.loginPass.value;
    if (!user || !pass) { showLoginError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.'); return; }
    if (checkCreds(user, pass)) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (err) {}
      resetLockData();
      clearLoginError();
      showAdmin();
      toast('Đăng nhập thành công', 'success');
    } else {
      var result = recordFailedAttempt();
      if (result.locked) showLoginError('Sai quá 5 lần. Đã khóa 60 giây.');
      else showLoginError('Sai tài khoản hoặc mật khẩu (' + result.attempts + '/5).');
    }
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (err) {}
    stopIdleMonitor();
    dom.adminScreen.hidden = true;
    dom.loginScreen.hidden = false;
    dom.loginForm.reset();
    clearLoginError();
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    toast('Đã đăng xuất', 'info');
  }

  var lastActivityAt = Date.now();
  var idleTimer = null;
  function touchActivity() { lastActivityAt = Date.now(); }
  ['mousemove','keydown','click','touchstart','scroll'].forEach(function (evt) {
    document.addEventListener(evt, touchActivity, { passive: true });
  });
  function startIdleMonitor() {
    stopIdleMonitor();
    lastActivityAt = Date.now();
    idleTimer = setInterval(function () {
      if (!dom.adminScreen || dom.adminScreen.hidden) return;
      if (Date.now() - lastActivityAt > SESSION_TIMEOUT_MS) {
        logout();
        toast('Phiên hết hạn do không hoạt động', 'warning');
      }
    }, 30000);
  }
  function stopIdleMonitor() { if (idleTimer) { clearInterval(idleTimer); idleTimer = null; } }

  function renderSettings() {
    dom.cfgDomainFile.value = state.cfg.domainFile;
    dom.cfgDomainDir.value  = state.cfg.domainDir;
    dom.cfgPath.value       = state.cfg.path;
  }

  function renderTabs() {
    dom.tabs.forEach(function (tab) {
      var active = tab.dataset.bp === state.activeBp;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function renderImageGrid() {
    var bp = state.activeBp;
    var files = state.cfg.files[bp] || [];
    var grid = dom.imageGrid;
    dom.imageCount.textContent = files.length + ' ảnh';
    if (!files.length) {
      grid.innerHTML = '<div class="empty-state">Chưa có ảnh. Bấm "+ Thêm ảnh" để tạo.</div>';
      return;
    }
    grid.innerHTML = files.map(function (file, index) {
      var isNew = !file;
      var effectiveUrl = isNew ? '' : buildEffectiveUrl(bp, file);
      var overrideUrl = isNew ? '' : (state.cfg.overrides[bp + '/' + file] || '');
      return (
        '<div class="image-card" data-index="' + index + '">' +
          '<button type="button" class="image-remove" title="Xóa">×</button>' +
          '<div class="image-preview">' +
            (effectiveUrl ? '<img src="' + escapeHtml(effectiveUrl) + '" alt="" loading="lazy">' : '') +
            '<div class="preview-error">' + (isNew ? 'Nhập tên file' : 'Lỗi tải ảnh') + '</div>' +
          '</div>' +
          '<div class="image-info">' +
            (isNew
              ? '<input class="image-filename-input" type="text" placeholder="Tên file..." autofocus>'
              : '<div class="image-filename" title="' + escapeHtml(file) + '">' + escapeHtml(file) + '</div>') +
            '<input class="image-url" type="url" value="' + escapeHtml(overrideUrl) + '" placeholder="' + (isNew ? 'URL tùy chỉnh...' : 'Trống = mặc định') + '" ' + (isNew ? 'disabled' : '') + '>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    var newInput = grid.querySelector('.image-filename-input');
    if (newInput) setTimeout(function () { newInput.focus(); }, 30);
  }

  function updatePreviewCard(card, bp, file) {
    var img = card.querySelector('img');
    var preview = card.querySelector('.image-preview');
    var url = buildEffectiveUrl(bp, file);
    if (!url) return;
    if (!img) {
      img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      preview.insertBefore(img, preview.firstChild);
    }
    preview.classList.remove('is-error');
    img.src = url;
  }

  function onGridInput(e) {
    var target = e.target;
    var card = target.closest('.image-card');
    if (!card) return;
    var i = Number(card.dataset.index);
    var bp = state.activeBp;
    var file = state.cfg.files[bp][i];
    if (!file) return;
    if (target.classList.contains('image-url')) {
      var key = bp + '/' + file;
      var url = target.value.trim();
      if (url) state.cfg.overrides[key] = url;
      else delete state.cfg.overrides[key];
      updatePreviewCard(card, bp, file);
    }
  }

  function onGridChange(e) {
    var target = e.target;
    var card = target.closest('.image-card');
    if (!card) return;
    var i = Number(card.dataset.index);
    var bp = state.activeBp;
    if (target.classList.contains('image-filename-input')) {
      var newFile = target.value.trim();
      if (!newFile) { state.cfg.files[bp].splice(i, 1); renderImageGrid(); return; }
      state.cfg.files[bp][i] = newFile;
      renderImageGrid();
    }
  }

  function onGridClick(e) {
    var target = e.target;
    var card = target.closest('.image-card');
    if (!card) return;
    var i = Number(card.dataset.index);
    var bp = state.activeBp;
    if (target.classList.contains('image-remove')) {
      var file = state.cfg.files[bp][i];
      if (!confirm('Xóa ảnh "' + (file || '?') + '"?')) return;
      state.cfg.files[bp].splice(i, 1);
      if (file) delete state.cfg.overrides[bp + '/' + file];
      renderImageGrid();
    }
  }

  function onGridError(e) {
    if (e.target && e.target.tagName === 'IMG') {
      var preview = e.target.closest('.image-preview');
      if (preview) preview.classList.add('is-error');
    }
  }

  function handleAddImage() {
    state.cfg.files[state.activeBp].push('');
    renderImageGrid();
  }

  function handleSave() {
    BP_KEYS.forEach(function (bp) {
      state.cfg.files[bp] = state.cfg.files[bp]
        .map(function (f) { return (f || '').trim(); })
        .filter(Boolean);
    });
    if (saveCfgToStorage(state.cfg)) {
      renderImageGrid();
      toast('Đã lưu cấu hình', 'success');
      setStatus('Đã lưu lúc ' + new Date().toLocaleTimeString(), 'ok');
    }
  }

  function handleReset() {
    if (!confirm('Reset toàn bộ cấu hình về mặc định?')) return;
    try { localStorage.removeItem(CFG_KEY); } catch (e) {}
    state.cfg = cloneDefault();
    state.activeBp = 'BP104';
    renderSettings();
    renderTabs();
    renderImageGrid();
    toast('Đã reset', 'warning');
    setStatus('Đã reset về mặc định');
  }

  function handleExport() {
    var cfg = {
      domainFile: state.cfg.domainFile, domainDir: state.cfg.domainDir,
      path: state.cfg.path, files: state.cfg.files,
      overrides: state.cfg.overrides, updatedAt: Date.now()
    };
    var blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'azerst-config-' + Date.now() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    toast('Đã export', 'success');
  }

  function handleImport(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var d = JSON.parse(e.target.result);
        if (!d || typeof d !== 'object') throw new Error('Invalid');
        var cfg = cloneDefault();
        if (typeof d.domainFile === 'string') cfg.domainFile = d.domainFile;
        if (typeof d.domainDir  === 'string') cfg.domainDir  = d.domainDir;
        if (typeof d.path       === 'string') cfg.path       = d.path;
        if (d.files && typeof d.files === 'object') {
          BP_KEYS.forEach(function (bp) {
            if (Array.isArray(d.files[bp])) {
              cfg.files[bp] = d.files[bp].filter(function (x) { return typeof x === 'string' && x.trim(); });
            }
          });
        }
        if (d.overrides && typeof d.overrides === 'object') {
          Object.keys(d.overrides).forEach(function (k) {
            if (typeof d.overrides[k] === 'string') cfg.overrides[k] = d.overrides[k];
          });
        }
        state.cfg = cfg;
        renderSettings(); renderTabs(); renderImageGrid();
        toast('Đã import', 'success');
        setStatus('Đã import lúc ' + new Date().toLocaleTimeString(), 'ok');
      } catch (err) { toast('File JSON không hợp lệ', 'error'); }
    };
    reader.readAsText(file);
  }

  function onSettingsChange() {
    state.cfg.domainFile = dom.cfgDomainFile.value.trim() || DEFAULT_CFG.domainFile;
    state.cfg.domainDir  = dom.cfgDomainDir.value.trim()  || DEFAULT_CFG.domainDir;
    state.cfg.path       = dom.cfgPath.value.trim()       || DEFAULT_CFG.path;
    var cards = dom.imageGrid.querySelectorAll('.image-card');
    cards.forEach(function (card) {
      var i = Number(card.dataset.index);
      var file = state.cfg.files[state.activeBp][i];
      if (!file) return;
      var key = state.activeBp + '/' + file;
      if (state.cfg.overrides[key]) return;
      updatePreviewCard(card, state.activeBp, file);
    });
  }

  function showAdmin() {
    dom.loginScreen.hidden = true;
    dom.adminScreen.hidden = false;
    state.cfg = loadCfgFromStorage();
    state.activeBp = 'BP104';
    renderSettings();
    renderTabs();
    renderImageGrid();
    setStatus('Đã nạp cấu hình');
    startIdleMonitor();
  }

  function showLogin() {
    dom.adminScreen.hidden = true;
    dom.loginScreen.hidden = false;
    stopIdleMonitor();
    var r = getLockRemaining();
    if (r > 0) showLoginError('Đã khóa. Vui lòng thử lại sau ' + r + 's.');
    dom.loginUser.focus();
  }

  function cacheDom() {
    dom = {
      loginScreen: $('loginScreen'), adminScreen: $('adminScreen'),
      loginForm: $('loginForm'), loginUser: $('loginUser'),
      loginPass: $('loginPass'), loginBtn: $('loginBtn'),
      loginError: $('loginError'), togglePw: $('togglePw'),
      logoutBtn: $('logoutBtn'),
      cfgDomainFile: $('cfgDomainFile'), cfgDomainDir: $('cfgDomainDir'),
      cfgPath: $('cfgPath'),
      tabs: Array.prototype.slice.call(document.querySelectorAll('.tab[data-bp]')),
      imageGrid: $('imageGrid'), imageCount: $('imageCount'),
      addImageBtn: $('addImageBtn'),
      saveBtn: $('saveBtn'), resetBtn: $('resetBtn'), exportBtn: $('exportBtn'),
      importInput: $('importInput'),
      status: $('status'), toast: $('toast')
    };
  }

  function bindEvents() {
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.loginForm.addEventListener('input', clearLoginError);
    dom.togglePw.addEventListener('click', function () {
      var isPw = dom.loginPass.type === 'password';
      dom.loginPass.type = isPw ? 'text' : 'password';
    });
    dom.logoutBtn.addEventListener('click', logout);
    dom.tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.activeBp = tab.dataset.bp;
        renderTabs(); renderImageGrid();
      });
    });
    dom.addImageBtn.addEventListener('click', handleAddImage);
    dom.imageGrid.addEventListener('input',  onGridInput);
    dom.imageGrid.addEventListener('change', onGridChange);
    dom.imageGrid.addEventListener('click',  onGridClick);
    dom.imageGrid.addEventListener('error',  onGridError, true);
    var s = debounce(onSettingsChange, 300);
    dom.cfgDomainFile.addEventListener('input', s);
    dom.cfgDomainDir.addEventListener('input',  s);
    dom.cfgPath.addEventListener('input',       s);
    dom.saveBtn.addEventListener('click', handleSave);
    dom.resetBtn.addEventListener('click', handleReset);
    dom.exportBtn.addEventListener('click', handleExport);
    dom.importInput.addEventListener('change', function (e) {
      handleImport(e.target.files && e.target.files[0]);
      e.target.value = '';
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !dom.adminScreen.hidden) {
        e.preventDefault(); handleSave();
      }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      var isLoggedIn = sessionStorage
