const getLoggedInUser = () => {
  const userStr = localStorage.getItem("loggedInUser");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem("loggedInUser");
    return null;
  }
};

const updateUsernameDisplay = () => {
  const user = getLoggedInUser();
  const name = user?.user_name || user?.first_name || "Guest";
  const usernameElements = document.querySelectorAll(".mobile-menu .username, .mobile-head .username");
  
  usernameElements.forEach(el => {
    el.textContent = name;
  });
};

const setupMobileMenu = () => {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!navToggle || !mobileMenu) return;

  navToggle.addEventListener("click", () => mobileMenu.classList.add("open"));
  
  const mobileMenuClose = document.querySelector(".mobile-menu-close");
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", () => mobileMenu.classList.remove("open"));
  }

  window.navigation?.updateAvatarDisplay?.();
  updateUsernameDisplay();
};

const setupChipActive = () => {
  const chipBar = document.querySelector(".chip-bar");
  if (!chipBar) return;

  chipBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    
    const allChips = chipBar.querySelectorAll(".chip");
    allChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
  });
};

const buildStars = (rating) => {
  if (rating == null) return "";
  const full = Math.round(rating);
  return Array(5).fill().map((_, i) => i < full ? "★" : "☆").join("");
};

const parseCategories = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  return str.split(',').map(c => c.trim()).filter(c => c.length > 0);
};
const showEmptyMessage = (msg) => {
  const grid = document.getElementById('placeGrid');
  if (grid) {
    grid.innerHTML = `<p style="text-align:center; padding:2rem; color:#666;">${msg}</p>`;
    grid.style.display = 'block';
  }
};

const fetchFavoritePlaces = async () => {
  const userId = window.favoriteHandler?.getCurrentUserId();
  
  if (!userId) {
    showEmptyMessage('กรุณาล็อกอินเพื่อดูรายการโปรด');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/favorites/${userId}`);
    const result = await res.json();
    const data = result.success ? result.data : [];

    if (data && Array.isArray(data) && data.length > 0) {
      const places = data.map(item => ({
        id: item.place_id,
        title: item.place_name,
        rating: item.place_score,
        imageUrl: item.image_path ? `../../img_place/${item.image_path.split(/[\/\\]/).pop()}` : null,
        openDays: '',
        openHours: item.opening_hours || '',
        province: item.place_eng_province || item.place_province || '',
        categories: parseCategories(item.categories)
      }));

      window.allFavoritePlaces = places;
      
      if (window.CategoryFilter) {
        window.CategoryFilter.updatePlaces(places);
        window.CategoryFilter.init('favorite', places, (filtered) => renderPlaceCards(filtered, true));
      }
      
      renderPlaceCards(places);
    } else {
      showEmptyMessage('ไม่มีรายการโปรด');
    }
  } catch (error) {
    showEmptyMessage('ไม่สามารถโหลดข้อมูลได้');
  }
};
const renderPlaceCards = (places, isFiltered = false) => {
  const placeGrid = document.getElementById("placeGrid");
  const placeCardTemplate = document.getElementById("placeCardTemplate");
  if (!placeGrid || !placeCardTemplate) return;
  
  const grid = placeGrid;
  const tpl = placeCardTemplate;

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    showEmptyMessage(isFiltered ? 'ไม่พบสถานที่ที่ตรงกับเงื่อนไข' : 'ไม่มีรายการโปรด');
    return;
  }

  grid.style.display = "grid";

  const defaultImg = "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";

  places.forEach((p, idx) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.id ?? idx + 1;
    node.style.cursor = 'pointer';
    
    node.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn')) return;
      if (node.dataset.id) window.location.href = `../place/place-detail.html?id=${node.dataset.id}`;
    });

    node.querySelector(".card-rank-badge").style.display = "none";

    const img = node.querySelector(".card-image");
    if (img) {
      img.src = p.imageUrl || defaultImg;
      img.alt = p.title || "";
      img.onerror = function() { this.onerror = null; this.src = defaultImg; };
    }

    node.querySelector(".card-open-days").textContent = p.openDays || "";
    node.querySelector(".card-open-hours").textContent = p.openHours || "";

    const rating = typeof p.rating === 'number' ? p.rating : parseFloat(p.rating) || 0;
    node.querySelector(".card-stars").textContent = buildStars(rating);
    node.querySelector(".card-rating").textContent = rating.toFixed(1);
    node.querySelector(".card-title").textContent = p.title || "";

    const favBtn = node.querySelector('.card-fav-btn');
    if (favBtn) {
      favBtn.classList.add('is-active');
      favBtn.querySelector('.material-icons').textContent = 'favorite';
    }

    grid.appendChild(node);
  });
};
const setupFavoriteToggle = () => {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    const card = btn.closest('.place-card');
    const placeId = card?.dataset.id;
    if (!placeId) return;

    if (window.favoriteHandler) {
      await window.favoriteHandler.toggleFavorite(placeId, btn);
      
      if (!btn.classList.contains('is-active')) {
        card.remove();
        
        if (window.allFavoritePlaces) {
          window.allFavoritePlaces = window.allFavoritePlaces.filter(p => p.id != placeId);
          window.CategoryFilter?.updatePlaces(window.allFavoritePlaces);
        }
        
        const grid = document.getElementById('placeGrid');
        if (!grid?.querySelectorAll('.place-card').length) {
          showEmptyMessage('ไม่มีรายการโปรด');
        }
      }
    }
  });
};

const setupCategoryButton = () => {
  const categoryBtn = document.getElementById("categoryBtn");
  
  if (categoryBtn) {
    categoryBtn.addEventListener("click", () => {
      window.CategoryFilter?.openOverlay();
    });
  }
};

const setupAuthButtons = () => {
  updateUsernameDisplay();
  
  const mobileAuthButtons = document.querySelectorAll(".mobile-auth");
  mobileAuthButtons.forEach(btn => btn.remove());
};
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupChipActive();
  setupFavoriteToggle();
  setupCategoryButton();
  setupAuthButtons();
  fetchFavoritePlaces();
});