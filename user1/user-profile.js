/* user-profile.js
   **CHANGED/ADDED:** render username/email dynamically
   - Preferred method: backend injects window.__USER__ object.
   - Fallback: fetch('/api/me') — ปรับ endpoint ตามหลังบ้านได้
*/

(function () {
  // ---------- Utility: Touch feedback ----------
  function attachTouchListeners() {
    document.querySelectorAll('.log-out-btn-link, .delete-account-btn-link, .fav-item, .edit-btn, .setting-item')
      .forEach(btn => {
        btn.addEventListener('touchstart', function () { this.classList.add('active-touch'); }, { passive: true });
        btn.addEventListener('touchend', function () { this.classList.remove('active-touch'); }, { passive: true });
        btn.addEventListener('touchcancel', function () { this.classList.remove('active-touch'); }, { passive: true });
      });
  }

  // ---------- Render user into DOM (CHANGED PART) ----------
  // This function updates #username and #email — this is the only part changed to make names dynamic.
  function renderUserFromObject(u) {
    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    if (!usernameEl || !emailEl) return;

    // Prefer displayName > username > name
    const display = u.displayName || u.username || u.name || 'User';
    usernameEl.textContent = display;
    emailEl.textContent = u.email || '';

    // keep dataset for later usage if needed
    usernameEl.dataset.username = u.username || u.displayName || '';
    emailEl.dataset.email = u.email || '';
  }

  // Try to load current user:
  // 1) If backend injected window.__USER__ (preferred for SSR),
  // 2) Else fetch from API /api/me (adjust endpoint if needed).
  async function tryLoadCurrentUser() {
    // 1) backend-injected object (recommended)
    if (window.__USER__ && typeof window.__USER__ === 'object') {
      try {
        renderUserFromObject(window.__USER__);
        return;
      } catch (err) {
        console.warn('render window.__USER__ failed:', err);
      }
    }

    // 2) client-side fetch fallback
    try {
      // **ADJUST** this endpoint to match your backend's user-info endpoint
      const resp = await fetch('/api/me', { credentials: 'include', headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('fetch /api/me failed or unauthenticated');
      const user = await resp.json();
      renderUserFromObject(user);
      return;
    } catch (err) {
      // fallback UI if no user available
      console.info('No injected user and fetch /api/me failed / unauthenticated.', err);
      const usernameEl = document.getElementById('username');
      const emailEl = document.getElementById('email');
      if (usernameEl && (!usernameEl.textContent || usernameEl.textContent === 'Username1')) usernameEl.textContent = 'Guest';
      if (emailEl && (!emailEl.textContent || emailEl.textContent === 'Username1@email.com')) emailEl.textContent = '';
    }
  }

  // ---------- Favorites placeholder logic (kept from original) ----------
  function renderFavoritesTemplateCheck() {
    const favList = document.querySelector('.fav-list');
    const favoritesSection = document.querySelector('.favorites-section');
    if (!favList || !favoritesSection) return;

    const favItems = favList.querySelectorAll('.fav-item');
    if (favItems.length === 1 && favItems[0].dataset.name === 'Placeholder Name') {
      favoritesSection.style.display = 'none';
      return;
    }
    // If later you want to fetch favorites, fetch and replace innerHTML here.
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    attachTouchListeners();
    tryLoadCurrentUser();           // <-- CHANGED: will populate #username/#email
    renderFavoritesTemplateCheck();

    // back button handler
    document.querySelector('.header .back-btn')?.addEventListener('click', ()=> window.history.back());
    document.querySelector('.desktop-header .back-btn')?.addEventListener('click', ()=> window.history.back());
  });
})();