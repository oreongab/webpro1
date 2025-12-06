// user-profile.js
(function () {
  /* ---------------------------------------------
   * Avatar helper – สลับ icon / รูปจริง
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
   * Render user info (ชื่อ + email + avatar)
   * ------------------------------------------- */
  function renderUserFromObject(u) {
    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    if (!usernameEl || !emailEl) return;

    const display = u.displayName || u.username || u.name || 'Guest';
    usernameEl.textContent = display;
    emailEl.textContent = u.email || '';

    if (u.avatarUrl) {
      setAvatar(u.avatarUrl);
    } else {
      setAvatar('');
    }
  }

  /* ---------------------------------------------
   * โหลด user จาก localStorage และ API
   * ------------------------------------------- */
  async function tryLoadCurrentUser() {
    // ดึง user_id จาก localStorage
    const userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
      console.warn('No user logged in');
      renderUserFromObject({
        displayName: 'Guest',
        username: 'guest',
        email: 'Not logged in'
      });
      return;
    }

    // เรียก API เพื่อดึงข้อมูล user
    try {
      const resp = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!resp.ok) throw new Error('Failed to fetch user data');
      const user = await resp.json();
      
      // ดึงรูป avatar จาก localStorage เท่านั้น
      const savedAvatar = localStorage.getItem('userAvatar') || '';
      
      // แสดงข้อมูล user
      renderUserFromObject({
        displayName: user.user_name,
        username: user.user_name,
        name: `${user.first_name} ${user.last_name}`,
        email: user.user_email,
        avatarUrl: savedAvatar
      });
    } catch (err) {
      console.error('Error loading user info:', err);
      renderUserFromObject({
        displayName: 'Guest',
        username: 'guest',
        email: 'Not logged in'
      });
      setAvatar('');
    }
  }

  /* ---------------------------------------------
   * แสดง Favorites (ถ้ามี)
   * ------------------------------------------- */
  function renderFavorites() {
    const favList = document.getElementById('favList');
    const favoritesSection = document.querySelector('.favorites-section');
    if (!favList || !favoritesSection) return;

    // ดึงข้อมูล favorites จาก localStorage (ตัวอย่าง)
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (favorites.length === 0) {
      favList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No favorites yet</p>';
      return;
    }

    // แสดง favorites
    favList.innerHTML = favorites.map(fav => `
      <a href="${fav.url || '#'}" class="fav-item">
        <div class="fav-image-placeholder">
          <img src="${fav.image || ''}" alt="${fav.name}" class="fav-img">
        </div>
        <div class="fav-details">
          <span class="fav-name">${fav.name}</span>
        </div>
      </a>
    `).join('');
  }

  /* ---------------------------------------------
   * Init
   * ------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    tryLoadCurrentUser();
    renderFavorites();

    // ปุ่ม back (mobile header)
    document.querySelector('.header .back-btn')?.addEventListener('click', () => {
      window.history.back();
    });

    // ปุ่ม back (desktop)
    document.querySelector('.desktop-back-button .back-icon')?.addEventListener('click', () => {
      window.history.back();
    });

    // ปุ่ม home (mobile header)
    document.querySelector('.header .home-btn')?.addEventListener('click', () => {
      window.location.href = '../deskmain.html';
    });

    // ปุ่ม Edit Profile
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = '../Edit/edit.html';
      });
    });

    // ปุ่ม Log Out
    document.querySelector('.log-out-btn-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUserName');
        window.location.href = '../login/login.html';
      }
    });

    // ปุ่ม Delete Account
    document.querySelector('.delete-account-btn-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to delete your account? .')) {
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
          // เรียก API ลบ account
          fetch(`http://localhost:3000/users/${userId}`, {
            method: 'DELETE'
          })
          .then(response => response.json())
          .then(data => {
            alert(data.message || 'Account deleted successfully');
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('currentUserName');
            window.location.href = '../login/login.html';
          })
          .catch(err => {
            console.error('Error deleting account:', err);
            alert('Failed to delete account');
          });
        }
      }
    });
  });
})();