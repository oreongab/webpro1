(function () {
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

  function showUserInfo(user) {
    const nameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    if (!nameEl || !emailEl) return;

    nameEl.textContent = user.displayName || user.username || 'Guest';
    emailEl.textContent = user.email || '';
    setAvatar(user.avatarUrl || '');
  }

  async function loadUser() {
    const userStr = localStorage.getItem('loggedInUser');
    
    if (!userStr) {
      showUserInfo({ displayName: 'Guest', email: 'Not logged in' });
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const userId = userData.user_id;
      
      const response = await fetch(`http://localhost:3000/users/${userId}`);
      const result = await response.json();
      const user = result.data || result;
      
      const avatar = localStorage.getItem(`userAvatar_${userId}`) || '';
      
      showUserInfo({
        displayName: user.user_name || userData.user_name,
        email: user.user_email || userData.user_email,
        avatarUrl: avatar
      });
    } catch (err) {
      console.error('Load user error:', err);
      showUserInfo({ displayName: 'Guest', email: 'Not logged in' });
    }
  }

  async function loadFavorites() {
    const favSection = document.querySelector('.favorites-section');
    const favList = document.getElementById('favoriteList');
    const viewAllBtn = document.getElementById('viewAllBtn');
    
    if (!favList) return;

    const userStr = localStorage.getItem('loggedInUser');
    if (!userStr) {
      if (favSection) favSection.style.display = 'none';
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const response = await fetch(`http://localhost:3000/favorites/${userData.user_id}`);
      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        if (favSection) favSection.style.display = 'none';
        return;
      }

      const favorites = result.data;

      if (favSection) favSection.style.display = 'block';

      if (viewAllBtn && favorites.length > 3) {
        viewAllBtn.style.display = 'flex';
        viewAllBtn.href = '../favorite/favorite.html';
      }

      const displayFavorites = favorites.slice(0, 3);
      
      favList.innerHTML = displayFavorites.map(place => {
        let imagePath = '../../img_place/default.jpg';
        if (place.image_path) {
          const fileName = String(place.image_path).split(/[/\\]/).pop();
          imagePath = `../../img_place/${fileName}`;
        }

        const rawScore = place.place_score ?? place.rating ?? place.place_rating ?? place.score ?? 0;
        const score = typeof rawScore === 'number' ? rawScore : parseFloat(rawScore) || 0;
        const fullStars = Math.round(score);
        const emptyStars = 5 - fullStars;
        const stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
        
        return `
          <article class="place-card" onclick="window.location.href='../place/place-detail.html?id=${place.place_id}'">
            <button class="card-fav-btn active" type="button" aria-label="Favorite">
              <span class="material-icons">favorite</span>
            </button>
            <img class="card-image" src="${imagePath}" alt="${place.place_name}" onerror="this.src='../../img_place/default.jpg'">
            <div class="card-bottom">
              <div class="card-stars">${stars}</div>
              <div class="card-rating">${score.toFixed(1)}</div>
              <div class="card-title">${place.place_name}</div>
            </div>
          </article>
        `;
      }).join('');
    } catch (error) {
      console.error('Load favorites error:', error);
      if (favSection) favSection.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadUser();
    loadFavorites();

    const btnBack = document.getElementById('btnBack');
    const btnHome = document.getElementById('btnHome');
    const editBtn = document.querySelector('.edit-btn');
    const logOutBtn = document.querySelector('.log-out-btn-link');
    const deleteAccountBtn = document.querySelector('.delete-account-btn-link');

    if (btnBack) {
      btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '../home/home.html';
        }
      });
    }

    if (btnHome) {
      btnHome.addEventListener('click', () => window.location.href = '../home/home.html');
    }

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        window.location.href = '../Edit/edit.html';
      });
    }

    if (logOutBtn) {
      logOutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.navigation?.handleLogout) {
          window.navigation.handleLogout();
        } else {
          if (confirm('Log out?')) {
            localStorage.removeItem('loggedInUser');
            window.location.href = '../login/login.html';
          }
        }
      });
    }

    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Delete account? This cannot be undone.')) {
          const userStr = localStorage.getItem('loggedInUser');
          if (userStr) {
            const userData = JSON.parse(userStr);
            
            fetch(`http://localhost:3000/users/${userData.user_id}`, { method: 'DELETE' })
              .then(res => res.json())
              .then(data => {
                alert(data.message || 'Account deleted');
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem(`userAvatar_${userData.user_id}`);
                window.location.href = '../login/login.html';
              })
              .catch(err => {
                console.error('Delete error:', err);
                alert('Failed to delete');
              });
          }
        }
      });
    }
  });
})();