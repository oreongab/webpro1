// user-profile.js
(function () {

  /* ---------------------------------------------
   * 1. Touch feedback (mobile active state)
   * ------------------------------------------- */
  function attachTouchListeners() {
    document
      .querySelectorAll(
        '.log-out-btn-link, .delete-account-btn-link, .fav-item, .edit-btn, .setting-item, .header .back-btn, .header .home-btn, .desktop-back-button .back-icon, .view-all'
      )
      .forEach((btn) => {
        btn.addEventListener(
          'touchstart',
          function () {
            this.classList.add('active-touch');
          },
          { passive: true }
        );
        const clear = function () {
          this.classList.remove('active-touch');
        };
        btn.addEventListener('touchend', clear, { passive: true });
        btn.addEventListener('touchcancel', clear, { passive: true });
      });
  }

  /* ---------------------------------------------
   * 2. Avatar helper – สลับ icon / รูปจริง
   * ------------------------------------------- */
  function setAvatar(url) {
    const container = document.getElementById('userAvatarContainer');
    const img = document.getElementById('profileAvatarImg');
    if (!container || !img) return;

    if (!url || !url.trim()) {
      container.classList.remove('has-image');
      img.src = '';
    } else {
      container.classList.add('has-image');
      img.src = url;
    }
  }

  /* ---------------------------------------------
   * 3. Render user info (ชื่อ + email + avatar)
   * ------------------------------------------- */
  function renderUserFromObject(u) {
    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    if (!usernameEl || !emailEl) return;

    const display = u.displayName || u.username || u.name || 'Guest';
    usernameEl.textContent = display;
    emailEl.textContent = u.email || '';

    usernameEl.dataset.username = u.username || u.displayName || '';
    emailEl.dataset.email = u.email || '';

    if (u.avatarUrl) {
      setAvatar(u.avatarUrl);
    } else {
      setAvatar('');
    }
  }

  /* ---------------------------------------------
   * 4. โหลด user จาก window.__USER__ หรือ /api/me
   * ------------------------------------------- */
  async function tryLoadCurrentUser() {
    // 1) หลังบ้าน inject window.__USER__ ไว้แล้ว
    if (window.__USER__ && typeof window.__USER__ === 'object') {
      try {
        renderUserFromObject(window.__USER__);
        return;
      } catch (err) {
        console.warn('render window.__USER__ failed:', err);
      }
    }

    // 2) ถ้ายังไม่มี ลองเรียก API ฝั่ง backend
    try {
      const resp = await fetch('/api/me', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!resp.ok) throw new Error('fetch /api/me failed');
      const user = await resp.json();
      renderUserFromObject(user);
    } catch (err) {
      console.info('No user info, fallback to Guest.', err);
      const usernameEl = document.getElementById('username');
      const emailEl = document.getElementById('email');
      if (usernameEl) usernameEl.textContent = 'Guest';
      if (emailEl) emailEl.textContent = '';
      setAvatar('');
    }
  }

  /* ---------------------------------------------
   * 5. ซ่อน Favorites ถ้ามีแต่ placeholder
   * ------------------------------------------- */
  function renderFavoritesTemplateCheck() {
    const favList = document.querySelector('.fav-list');
    const favoritesSection = document.querySelector('.favorites-section');
    if (!favList || !favoritesSection) return;

    const favItems = favList.querySelectorAll('.fav-item');
    if (favItems.length === 1 && favItems[0].dataset.name === 'Placeholder Name') {
      favoritesSection.style.display = 'none';
    }
  }

  /* ---------------------------------------------
   * 6. Init
   * ------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    attachTouchListeners();
    tryLoadCurrentUser();
    renderFavoritesTemplateCheck();

    // ปุ่ม back (mobile header)
    document
      .querySelector('.header .back-btn')
      ?.addEventListener('click', () => window.history.back());

    // ปุ่ม back (desktop)
    document
      .querySelector('.desktop-back-button .back-icon')
      ?.addEventListener('click', () => window.history.back());

    // ปุ่ม home (mobile header) → ปรับ URL ตามจริงได้
    const HOME_URL = '/';
    document
      .querySelector('.header .home-btn')
      ?.addEventListener('click', () => {
        window.location.href = HOME_URL;
      });
  });
})();