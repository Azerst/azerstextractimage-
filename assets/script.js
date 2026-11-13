'use strict';

/* =========================================================
   DATA — 3 THÁNG
========================================================= */
const BP104 = [
  'BP_Prize_104.png','BP_Task_FP_104.png','BP_104.png','BP_Window_PP_104.png',
  'BP_Premium_icon_104.png','BP_Icon_free_104.png','subtype36_104.jpg',
  'subtype1_104.jpg','subtype2_104.jpg','subtype3_104.jpg','subtype7_104.jpg',
  'BP_Premium_title_104.png','BP_GRANDPrize01_104.jpg','BP_GRANDPrize02_104.jpg',
  'BP_GRANDPrize03_104.jpg','BP_GRANDPrize04_104.jpg','BP_GRANDPrize05_104.jpg',
  'BP_GRANDPrize06_104.jpg'
];

const BP105 = [
  'BP_Prize_105.png','BP_Task_FP_105.png','BP_105.png','BP_Window_PP_105.png',
  'BP_Premium_icon_105.png','BP_Icon_free_105.png','subtype36_105.jpg',
  'subtype1_105.jpg','subtype2_105.jpg','subtype3_105.jpg','subtype7_105.jpg',
  'BP_Premium_title_105.png','BP_GRANDPrize01_105.jpg','BP_GRANDPrize02_105.jpg',
  'BP_GRANDPrize03_105.jpg','BP_GRANDPrize04_105.jpg','BP_GRANDPrize05_105.jpg',
  'BP_GRANDPrize06_105.jpg','BP_GRANDPrize07_105.jpg'
];

const BP106 = [
  'BP_Prize_106.png','BP_Task_FP_106.png','BP_106.png','BP_Window_PP_106.png',
  'BP_Premium_icon_106.png','BP_Icon_free_106.png','subtype36_106.jpg',
  'subtype1_106.jpg','subtype2_106.jpg','subtype3_106.jpg','subtype7_106.jpg',
  'BP_Premium_title_106.png','BP_GRANDPrize01_106.jpg','BP_GRANDPrize02_106.jpg',
  'BP_GRANDPrize03_106.jpg','BP_GRANDPrize04_106.jpg','BP_GRANDPrize05_106.jpg',
  'BP_GRANDPrize06_106.jpg','BP_GRANDPrize07_106.jpg'
];

/* =========================================================
   BUILD URLs
========================================================= */
function buildUrl(bp, file) {
  const isDir = /^subtype7_|^BP_Premium_title_|^BP_GRANDPrize/.test(file);
  const domain = isDir
    ? 'https://dl.dir.freefiremobile.com'
    : 'https://dl-tata.freefireind.in';
  return `${domain}/common/OB56/CSH/${bp}/${file}`;
}

/* =========================================================
   FILENAME → Azerst.ext
========================================================= */
function getAzerstFilename(origName) {
  const m = /\.(png|jpg|jpeg|webp|gif)$/i.exec(origName || '');
  const ext = m ? m[1].toLowerCase() : 'png';
  return `Azerst.${ext}`;
}

/* =========================================================
   TOAST
========================================================= */
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(message, type = 'info') {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className = 'toast toast-' + type;
  void toastEl.offsetWidth;
  toastEl.classList.add('is-show');
  toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
}

/* =========================================================
   VERIFY IMAGE
========================================================= */
function verifyImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    let done = false;
    const finish = ok => { if (done) return; done = true; resolve(ok); };
    img.onload  = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
    setTimeout(() => finish(false), 8000);
  });
}

/* =========================================================
   RENDER GRID
========================================================= */
function renderGrid(gridEl, bp, files) {
  if (!gridEl) return;
  gridEl.innerHTML = files.map(file => {
    const url = buildUrl(bp, file);
    return `
      <article class="item">
        <div class="item-media" data-url="${url}" data-filename="${file}" role="button" tabindex="0" aria-label="Xem ảnh">
          <img src="${url}" alt="AZERST" loading="lazy" />
          <div class="pending">Đang cập nhật</div>
        </div>
        <div class="item-actions">
          <button type="button" class="btn-action btn-view" data-url="${url}" data-filename="${file}" aria-label="Xem ảnh">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>Xem
          </button>
          <button type="button" class="btn-action btn-dl" data-url="${url}" data-filename="${file}" aria-label="Tải ảnh">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12M6 11l6 6 6-6M5 21h14"/>
            </svg>Tải
          </button>
        </div>
      </article>
    `;
  }).join('');
  attachImageHandlers(gridEl);
}

function attachImageHandlers(container) {
  container.querySelectorAll('.item-media img').forEach(img => {
    const media = img.closest('.item-media');
    if (!media) return;
    const fail = () => media.classList.add('is-error');
    if (img.complete) {
      if (img.naturalWidth === 0) fail();
    } else {
      img.addEventListener('error', fail, { once: true });
    }
  });
}

renderGrid(document.getElementById('grid-t1'), 'BP104', BP104);
renderGrid(document.getElementById('grid-t2'), 'BP105', BP105);
renderGrid(document.getElementById('grid-t3'), 'BP106', BP106);

document.addEventListener('error', e => {
  if (e.target && e.target.tagName === 'IMG') {
    const media = e.target.closest('.item-media');
    if (media) media.classList.add('is-error');
  }
}, true);

/* =========================================================
   TABS — 3 THÁNG
========================================================= */
(function initTabs(){
  const tabs = document.querySelectorAll('.tab');
  const panels = {
    t1: document.getElementById('panel-t1'),
    t2: document.getElementById('panel-t2'),
    t3: document.getElementById('panel-t3')
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.tab;
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      Object.entries(panels).forEach(([k, el]) => {
        if (!el) return;
        el.classList.toggle('is-active', k === key);
      });
    });
  });
})();

/* =========================================================
   HELPERS
========================================================= */
function findMediaByUrl(url) {
  return [...document.querySelectorAll('.item-media')].find(m => m.dataset.url === url);
}

/* =========================================================
   DOWNLOAD
========================================================= */
async function downloadFile(url, origFilename, btn) {
  const media = findMediaByUrl(url);
  if (media && media.classList.contains('is-error')) {
    showToast('Ảnh chưa cập nhật, vui lòng thử lại sau', 'warning');
    return;
  }

  if (btn) btn.classList.add('is-loading');
  const saveName = getAzerstFilename(origFilename);

  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = saveName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    showToast('Đã tải xuống: ' + saveName, 'success');
    if (btn) btn.classList.remove('is-loading');
    return;
  } catch (err) {
    /* fallback */
  }

  const exists = await verifyImage(url);
  if (btn) btn.classList.remove('is-loading');

  if (!exists) {
    if (media) media.classList.add('is-error');
    if (currentUrl === url && modalMedia) modalMedia.classList.add('is-error');
    showToast('Ảnh chưa cập nhật, vui lòng thử lại sau', 'warning');
    return;
  }

  showToast('Không thể tải ảnh. Vui lòng thử lại sau', 'error');
}

/* =========================================================
   MODAL
========================================================= */
const modal      = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalImg   = document.getElementById('modalImg');
const modalDl    = document.getElementById('modalDl');

let currentUrl = '';
let currentFilename = '';

async function loadImageSafely(url, imgEl, mediaEl) {
  if (imgEl.dataset.blobUrl) {
    try { URL.revokeObjectURL(imgEl.dataset.blobUrl); } catch (e) {}
    delete imgEl.dataset.blobUrl;
  }

  mediaEl.classList.remove('is-error');
  imgEl.onerror = () => mediaEl.classList.add('is-error');

  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
    if (res.ok) {
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      imgEl.dataset.blobUrl = objectUrl;
      imgEl.src = objectUrl;
      imgEl.alt = 'AZERST';
      return;
    }
    mediaEl.classList.add('is-error');
    return;
  } catch (err) {
    /* fallback */
  }

  imgEl.src = url;
  imgEl.alt = 'AZERST';
}

async function openModal(url, filename) {
  currentUrl = url;
  currentFilename = filename;
  modalMedia.classList.remove('is-error');

  if (!history.state || !history.state.azerModal) {
    try { history.pushState({ azerModal: true }, '', '#azer-image'); } catch (e) {}
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const media = findMediaByUrl(url);
  if (media && media.classList.contains('is-error')) {
    modalMedia.classList.add('is-error');
    return;
  }

  await loadImageSafely(url, modalImg, modalMedia);
}

function closeModal() {
  const wasOpen = modal.classList.contains('is-open');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  setTimeout(() => {
    if (modalImg.dataset.blobUrl) {
      try { URL.revokeObjectURL(modalImg.dataset.blobUrl); } catch (e) {}
      delete modalImg.dataset.blobUrl;
    }
    modalImg.src = '';
    modalMedia.classList.remove('is-error');
  }, 350);

  if (wasOpen && history.state && history.state.azerModal) {
    try { history.back(); } catch (e) {}
  }
}

window.addEventListener('popstate', () => {
  if (modal.classList.contains('is-open')) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (modalImg.dataset.blobUrl) {
        try { URL.revokeObjectURL(modalImg.dataset.blobUrl); } catch (e) {}
        delete modalImg.dataset.blobUrl;
      }
      modalImg.src = '';
      modalMedia.classList.remove('is-error');
    }, 350);
  }
});

/* =========================================================
   EVENTS
========================================================= */
document.addEventListener('click', e => {
  const trigger = e.target.closest('.btn-view, .item-media');
  if (!trigger) return;
  e.preventDefault();
  e.stopPropagation();
  openModal(trigger.dataset.url, trigger.dataset.filename);
});

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-dl');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  downloadFile(btn.dataset.url, btn.dataset.filename, btn);
});

modalClose.addEventListener('click', closeModal);

modalDl.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  if (modalMedia.classList.contains('is-error')) {
    showToast('Ảnh chưa cập nhật, vui lòng thử lại sau', 'warning');
    return;
  }
  downloadFile(currentUrl, currentFilename, modalDl);
});

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const media = e.target.closest('.item-media');
  if (!media) return;
  e.preventDefault();
  openModal(media.dataset.url, media.dataset.filename);
});
