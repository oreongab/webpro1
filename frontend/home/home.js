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
  const usernameElements = document.querySelectorAll(".mobile-menu .username, .mobile-menu-header .username");
  
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

const buildStars = (score) => {
  if (score == null) return "";
  const full = Math.round(score);
  return Array(5).fill().map((_, i) => i < full ? "★" : "☆").join("");
};
const renderPlaceCards = (places) => {
  const placeGrid = document.getElementById("placeGrid");
  const placeCardTemplate = document.getElementById("placeCardTemplate");
  if (!placeGrid || !placeCardTemplate) return;
  
  const grid = placeGrid;
  const tpl = placeCardTemplate;

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    grid.style.display = "none";
    return;
  }

  grid.style.display = "grid";
  const defaultImg = "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";

  places.forEach((p, idx) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.place_id || p.id || (idx + 1);
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

    grid.appendChild(node);
  });
  
  setTimeout(() => window.favoriteHandler?.loadFavoriteStates(), 50);
};

window.renderPlaceCards = renderPlaceCards;
const setupFavoriteToggle = () => {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    const card = btn.closest('.place-card');
    const placeId = card?.dataset.id;
    if (!placeId) return;

    if (window.favoriteHandler) {
      await window.favoriteHandler.toggleFavorite(placeId, btn);
    } else {
      btn.classList.toggle("is-active");
      const icon = btn.querySelector(".material-icons");
      if (icon) icon.textContent = btn.classList.contains("is-active") ? "favorite" : "favorite_border";
    }
  });
};

const clearCategorySelections = () => {
  const categoryCheckboxes = document.querySelectorAll('.category-list input[type="checkbox"]');
  const provinceSearch = document.getElementById('provinceSearch');
  const provinceListItems = document.querySelectorAll('.category-province-list li');
  
  categoryCheckboxes.forEach(cb => cb.checked = false);
  
  if (provinceSearch) provinceSearch.value = '';
  
  provinceListItems.forEach(item => item.style.display = '');
};

window.clearCategorySelections = clearCategorySelections;

const setupAuthButtons = () => {
  updateUsernameDisplay();
};
const fetchPlaces = async () => {
  try {
    const res = await fetch('http://localhost:3000/places/place?page=home');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const result = await res.json();
    const data = result.success ? result.data : [];
    
    if (!data || data.length === 0) {
      renderPlaceCards([]);
      return;
    }
    
    const places = data.map((item, idx) => ({
      id: item.place_id,
      rank: idx + 1,
      title: item.place_name,
      imageUrl: item.image_path ? `../../img_place/${item.image_path.split(/[\/\\]/).pop()}` : null,
      openDays: '',
      openHours: item.opening_hours || '',
      rating: item.place_score || 0
    }));
    
    renderPlaceCards(places);
    window.favoriteHandler?.loadFavoriteStates();
    
  } catch (error) {
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถโหลดข้อมูลได้</p>';
      grid.style.display = 'block';
    }
  }
};

window.fetchPlaces = fetchPlaces;
const setupHomeSearch = () => {
  const homeSearchInput = document.getElementById('searchInput');
  const searchSuggestionsDiv = document.getElementById('searchSuggestions');
  if (!homeSearchInput) return;
  
  const searchInput = homeSearchInput;
  const suggestionsDiv = searchSuggestionsDiv;
  
  let searchTimeout;
  let allPlaces = [];
  
  (async () => {
    try {
      const res = await fetch('http://localhost:3000/places/place?page=home');
      if (res.ok) {
        const result = await res.json();
        allPlaces = result.success ? result.data : [];
      }
    } catch (e) {}
  })();
  
  const showSuggestions = (query) => {
    if (!suggestionsDiv || !query || query.length < 1) {
      if (suggestionsDiv) suggestionsDiv.style.display = 'none';
      return;
    }
    
    const filtered = allPlaces.filter(p => 
      p.place_name.toLowerCase().includes(query.toLowerCase()) ||
      p.place_province.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
    
    if (filtered.length === 0) {
      suggestionsDiv.style.display = 'none';
      return;
    }
    
    suggestionsDiv.innerHTML = filtered.map(p => `
      <div class="search-suggestion-item" data-id="${p.place_id}">
        <div class="suggestion-name">${p.place_name}</div>
        <div class="suggestion-province">
          ${p.place_province}
          <span class="suggestion-score">★ ${parseFloat(p.place_score || 0).toFixed(1)}</span>
        </div>
      </div>
    `).join('');
    
    suggestionsDiv.style.display = 'block';
    suggestionsDiv.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        window.location.href = `../place/place-detail.html?id=${item.dataset.id}`;
      });
    });
  };
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    showSuggestions(query);
    
    if (query === '') {
      fetchPlaces();
      return;
    }
    
    searchTimeout = setTimeout(() => searchPlaces(query), 500);
  });
  
  document.addEventListener('click', (e) => {
    if (suggestionsDiv && !searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.style.display = 'none';
    }
  });
};

const searchPlaces = async (query) => {
  try {
    const params = new URLSearchParams({ query, page: 'home' });
    const res = await fetch(`http://localhost:3000/places/search?${params}`);
    const result = await res.json();
    const data = result.success ? result.data : [];
    
    if (data && Array.isArray(data)) {
      const places = data.map((item, idx) => ({
        place_id: item.place_id,
        id: item.place_id,
        rank: idx + 1,
        title: item.place_name,
        imageUrl: item.image_path ? `../../img_place/${item.image_path.split(/[\/\\]/).pop()}` : null,
        openDays: item.place_province || '',
        openHours: item.opening_hours || '',
        rating: item.place_score || 0
      }));
      
      renderPlaceCards(places);
      window.favoriteHandler?.loadFavoriteStates();
    } else {
      renderPlaceCards([]);
    }
    
  } catch (error) {
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถค้นหาได้</p>';
      grid.style.display = 'block';
    }
  }
};
document.addEventListener("DOMContentLoaded", () => {
  window.combinedFilter?.setCurrentPage('home');
  
  setupMobileMenu();
  if (typeof setupChipActive === 'function') setupChipActive();
  
  window.CategoryFilter?.init('home', [], renderPlaceCards);
  
  setupFavoriteToggle();
  setupAuthButtons();
  setupHomeSearch();
  
  if (typeof setupOpeningDaysFilter === 'function') setupOpeningDaysFilter('home');
  
  fetchPlaces();
});