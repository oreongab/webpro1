(function () {
  // ===== 1) touch feedback (เบาๆ) =====
  function touchFx() {
    document.querySelectorAll('.setting-item, .edit-btn, .view-all, .icon-btn')
      .forEach((el) => {
        el.addEventListener('touchstart', function () {
          this.classList.add('active-touch');
        }, { passive: true });

        const clear = function () { this.classList.remove('active-touch'); };
        el.addEventListener('touchend', clear, { passive: true });
        el.addEventListener('touchcancel', clear, { passive: true });
      });
  }

  // ===== 2) top buttons =====
  function setupTopButtons() {
    const backBtn = document.getElementById('btnBack');
    const homeBtn = document.getElementById('btnHome');

    backBtn?.addEventListener('click', () => history.back());
    homeBtn?.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }

  // ===== 3) avatar helper =====
  function setAvatar(url) {
    const box = document.getElementById('userAvatarContainer');
    const img = document.getElementById('profileAvatarImg');
    if (!box || !img) return;

    if (!url || !url.trim()) {
      box.classList.remove('has-image');
      img.src = '';
    } else {
      box.classList.add('has-image');
      img.src = url;
    }
  }

  // ===== 4) render user info =====
  function renderUser(u) {
    const nameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    if (!nameEl || !emailEl) return;

    const name = u.displayName || u.username || u.name || 'Guest';
    nameEl.textContent = name;
    emailEl.textContent = u.email || '';

    if (u.avatarUrl) setAvatar(u.avatarUrl);
    else setAvatar('');
  }

  // ===== 5) try load current user =====
  async function loadMe() {
    if (window.__USER__ && typeof window.__USER__ === 'object') {
      try { renderUser(window.__USER__); return; } catch (e) {}
    }

    try {
      const res = await fetch('/api/me', {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('no /api/me');
      const u = await res.json();
      renderUser(u);
    } catch (e) {
      renderUser({ name: 'Guest', email: '', avatarUrl: '' });
    }
  }

  // =====================================================
  // Favorites: โชว์ 3 ใบก่อน / กด View all ค่อยโชว์ทั้งหมด
  // =====================================================
  let favAll = [];
  let showAll = false;
  const showMax = 3;

  function renderStars(rate) {
    if (rate == null) return '';
    const full = Math.round(rate);
    let s = '';
    for (let i = 0; i < 5; i++) s += i < full ? '★' : '☆';
    return s;
  }

  function renderFavCards(listData) {
    const tpl = document.getElementById('favoritePlaceTemplate');
    const list = document.getElementById('favoriteList');
    if (!tpl || !list) return;

    list.innerHTML = '';

    listData.forEach((p, idx) => {
      const node = tpl.content.firstElementChild.cloneNode(true);

      node.dataset.id = p.id ?? idx + 1;

      const rankEl = node.querySelector('.card-rank-number');
      if (rankEl) rankEl.textContent = p.rank ?? idx + 1;

      const imgEl = node.querySelector('.card-image');
      if (imgEl) {
        imgEl.src = p.imageUrl || '';
        imgEl.alt = p.title || '';
      }

      const dayEl = node.querySelector('.card-open-days');
      const hourEl = node.querySelector('.card-open-hours');
      if (dayEl) dayEl.textContent = p.openDays || '';
      if (hourEl) hourEl.textContent = p.openHours || '';

      const starEl = node.querySelector('.card-stars');
      const rateEl = node.querySelector('.card-rating');
      if (starEl) starEl.textContent = renderStars(p.rating);
      if (rateEl && p.rating != null) rateEl.textContent = p.rating.toFixed(1);

      const titleEl = node.querySelector('.card-title');
      if (titleEl) titleEl.textContent = p.title || '';

      // กดหัวใจ: ลบออกจากหน้า (เหมือนเดิม) — ถ้าจะให้ call backend ค่อยเพิ่ม
      const favBtn = node.querySelector('.card-fav-btn');
      favBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        node.remove();
      });

      list.appendChild(node);
    });
  }

  function updateViewAll() {
    const viewBtn = document.getElementById('viewAllBtn');
    if (!viewBtn) return;

    if (!showAll && favAll.length > showMax) {
      viewBtn.style.display = 'inline-flex';
    } else {
      viewBtn.style.display = 'none';
    }
  }

  function renderFavoritePlaces(places) {
    const section = document.querySelector('.favorites-section');
    if (!section) return;

    favAll = Array.isArray(places) ? places : [];
    showAll = false;

    if (favAll.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';

    const showList = favAll.slice(0, showMax);
    renderFavCards(showList);
    updateViewAll();
  }

  function setupViewAll() {
    const viewBtn = document.getElementById('viewAllBtn');
    if (!viewBtn) return;

    viewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAll = true;
      renderFavCards(favAll);
      updateViewAll();
    });
  }

  // ให้หลังบ้านเรียกใช้
  window.renderFavoritePlaces = renderFavoritePlaces;

  // ===== init =====
  document.addEventListener('DOMContentLoaded', function () {
    // เปลี่ยนรูปโปรไฟล์
    const avatarBox = document.getElementById('userAvatarContainer');
    const avatarImg = document.getElementById('profileAvatarImg');
    const fileInput = document.getElementById('avatarInput');

    if (avatarBox && avatarImg && fileInput) {
      avatarBox.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const f = fileInput.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        avatarImg.src = url;
        avatarBox.classList.add('has-image');
      });
    }

    setupTopButtons();
    setupViewAll();
    touchFx();
    loadMe();
  });
})();