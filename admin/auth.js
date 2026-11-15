window.AZERST_AUTH = (function () {
  'use strict';

  var KEY = 137;
  var ACC_ENC = [203,202,209,208,211,223,200,199,203,200,202,182,182,182,201,201,168,168,247,247,184,187,191,190,185,186,189,188,177,176];
  var PASS_ENC = [192,207,240,189,184,216,177,222,200,184,252,189,217,224,254,192,197,193,229,241,253,230,207,195,243,216,216,206,205,218,198,204,228,217,198,199,192,223,223,193,204,236,248,219,229,211,217,193,250,184];

  var ACC_PLAIN = String.fromCharCode.apply(null, ACC_ENC.map(function (c) { return c ^ KEY; }));
  var PASS_PLAIN = String.fromCharCode.apply(null, PASS_ENC.map(function (c) { return c ^ KEY; }));

  var SESSION_KEY = 'azerst_admin_session';
  var LOCK_KEY = 'azerst_admin_lock';

  function checkCreds(user, pass) {
    var a = String(user || '');
    var b = String(pass || '');
    if (a.length !== ACC_PLAIN.length || b.length !== PASS_PLAIN.length) return false;
    var diff = 0, i;
    for (i = 0; i < ACC_PLAIN.length; i++) diff |= a.charCodeAt(i) ^ ACC_PLAIN.charCodeAt(i);
    for (i = 0; i < PASS_PLAIN.length; i++) diff |= b.charCodeAt(i) ^ PASS_PLAIN.charCodeAt(i);
    return diff === 0;
  }

  function isLoggedIn() {
    try {
      var v = sessionStorage.getItem(SESSION_KEY);
      return !!v && v.indexOf('ok_') === 0;
    } catch (e) { return false; }
  }

  function login(user, pass) {
    if (!checkCreds(user, pass)) return { ok: false, reason: 'invalid' };
    try {
      sessionStorage.setItem(SESSION_KEY, 'ok_' + Date.now());
      localStorage.removeItem(LOCK_KEY);
    } catch (e) { return { ok: false, reason: 'storage' }; }
    return { ok: true };
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function getLockData() {
    try {
      var raw = localStorage.getItem(LOCK_KEY);
      if (!raw) return { attempts: 0, until: 0 };
      var d = JSON.parse(raw);
      return { attempts: Number(d.attempts) || 0, until: Number(d.until) || 0 };
    } catch (e) { return { attempts: 0, until: 0 }; }
  }

  function saveLockData(d) {
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(d)); } catch (e) {}
  }

  function lockRemaining() {
    var d = getLockData();
    if (!d.until) return 0;
    var r = Math.ceil((d.until - Date.now()) / 1000);
    if (r <= 0) { saveLockData({ attempts: 0, until: 0 }); return 0; }
    return r;
  }

  function recordFail() {
    var d = getLockData();
    var a = d.attempts + 1;
    if (a >= 5) {
      saveLockData({ attempts: 0, until: Date.now() + 60000 });
      return { locked: true, attempts: 0 };
    }
    saveLockData({ attempts: a, until: 0 });
    return { locked: false, attempts: a };
  }

  return {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    lockRemaining: lockRemaining,
    recordFail: recordFail,
    checkCreds: checkCreds
  };
})();
