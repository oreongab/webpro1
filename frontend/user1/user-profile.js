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
    // ดึง user object จาก localStorage
    const userStr = localStorage.getItem('loggedInUser');
    
    if (!userStr) {
      console.warn('No user logged in');
      renderUserFromObject({
        displayName: 'Guest',
        username: 'guest',
        email: 'Not logged in'
      });
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const userId = userData.user_id;
      
      // เรียก API เพื่อดึงข้อมูล user ล่าสุด
      const resp = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      
      if (!resp.ok) throw new Error('Failed to fetch user data');
      const result = await resp.json();
      const user = result.data || result;
      
      // ดึงรูบ avatar จาก localStorage ตาม user_id
      const savedAvatar = localStorage.getItem(`userAvatar_${userId}`) || '';
      
      // แสดงข้อมูล user
      renderUserFromObject({
        displayName: user.user_name || userData.user_name,
        username: user.user_name || userData.user_name,
        name: `${user.first_name || userData.first_name || ''} ${user.last_name || userData.last_name || ''}`.trim(),
        email: user.user_email || userData.user_email,
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
   * แสดง Favorites (ดึงจาก API)
   * ------------------------------------------- */
  async function renderFavorites() {
    const favList = document.getElementById('favList');
    const favoritesSection = document.querySelector('.favorites-section');
    if (!favList || !favoritesSection) return;

    // ดึง user ID จาก localStorage
    const userStr = localStorage.getItem('loggedInUser');
    if (!userStr) {
      favList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Please log in to see favorites</p>';
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const userId = userData.user_id;

      // เรียก API เพื่อดึง favorites
      const response = await fetch(`http://localhost:3000/favorites/${userId}`);
      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        favList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No favorites yet</p>';
        return;
      }

      // แสดง favorites (แสดงแค่ 3 รายการแรกในหน้า profile)
      const favorites = result.data.slice(0, 3);
      console.log('Rendering favorites:', favorites);
      
      favList.innerHTML = favorites.map(place => {
        // แปลง path จาก 'project/img_place/xxx.jpg' เป็น '../../img_place/xxx.jpg'
        let imagePath = '../../img_place/default.jpg';
        if (place.image_path) {
          imagePath = place.image_path.replace('project/', '../../');
        }
        
        const placeUrl = `../place/place-detail.html?id=${place.place_id}`;
        console.log('Creating link for place:', place.place_name, 'URL:', placeUrl);
        
        return `
          <a href="${placeUrl}" class="fav-item">
            <div class="fav-image-placeholder">
              <img src="${imagePath}" alt="${place.place_name}" class="fav-img" onerror="this.src='../../img_place/default.jpg'">
            </div>
            <div class="fav-details">
              <span class="fav-name">${place.place_name}</span>
            </div>
          </a>
        `;
      }).join('');
      
      console.log('Favorites rendered successfully');
    } catch (error) {
      console.error('Error loading favorites:', error);
      favList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Failed to load favorites</p>';
    }
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
      window.location.href = '../home/home.html';
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
      // ใช้ฟังก์ชัน logout จาก nav.js
      if (window.navigation?.handleLogout) {
        window.navigation.handleLogout();
      } else {
        // Fallback ถ้า nav.js ยังไม่โหลด
        if (confirm('Are you sure you want to log out?')) {
          localStorage.removeItem('loggedInUser');
          window.location.href = '../login/login.html';
        }
      }
    });

    // ปุ่ม Delete Account
    document.querySelector('.delete-account-btn-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        const userStr = localStorage.getItem('loggedInUser');
        if (userStr) {
          const userData = JSON.parse(userStr);
          const userId = userData.user_id;
          
          // เรียก API ลบ account
          fetch(`http://localhost:3000/users/${userId}`, {
            method: 'DELETE'
          })
          .then(response => response.json())
          .then(data => {
            alert(data.message || 'Account deleted successfully');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userAvatar');
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