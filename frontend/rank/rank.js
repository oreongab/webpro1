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

const chipCategoryMap = {
  'Cafés & Restaurants': 'cafes', 'Temple': 'temples', 'Natural': 'natural', 'Sports': 'sport',
  'Art': 'art', 'Museums': 'museums', 'Markets': 'markets', 'Beaches': 'beaches',
  'Parks & Gardens': 'parks', 'Historical Attractions': 'historical', 'Mall': 'malls', 'Other': 'other'
};

const setupChipActive = () => {
  const chipBar = document.querySelector(".chip-bar");
  if (!chipBar) return;

  chipBar.addEventListener("click", async (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    const isActive = chip.classList.contains("active");
    const allChips = chipBar.querySelectorAll(".chip");
    allChips.forEach(c => c.classList.remove("active"));
    
    const rankSearchInput = document.getElementById('rankSearchInput');
    if (rankSearchInput) rankSearchInput.value = '';
    
    if (isActive) {
      window.combinedFilter?.setChipFilter(null);
      await (window.combinedFilter ? window.combinedFilter.applyCombinedFilters() : fetchRankPlaces());
    } else {
      chip.classList.add("active");
      
      const endpoint = chipCategoryMap[chip.textContent.trim()];
      if (endpoint && window.combinedFilter) {
        window.combinedFilter.setChipFilter(endpoint);
        await window.combinedFilter.applyCombinedFilters();
      } else {
        await fetchRankPlaces();
      }
    }
  });
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
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">ไม่พบสถานที่</p>';
    return;
  }

  grid.style.display = "grid";

  places.forEach((p, idx) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.place_id;
    node.style.cursor = 'pointer';
    
    node.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn')) return;
      if (node.dataset.id) window.location.href = `../place/place-detail.html?id=${node.dataset.id}`;
    });

    node.querySelector(".card-rank-number").textContent = idx + 1;
    node.querySelector(".card-rank-badge").style.display = 'flex';

    const img = node.querySelector(".card-image");
    const defaultImg = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    
    if (img) {
      img.src = p.image_path ? `../../img_place/${p.image_path.split(/[\/\\]/).pop()}` : defaultImg;
      img.alt = p.place_name || "";
      img.onerror = function() { this.onerror = null; this.src = defaultImg; };
    }

    node.querySelector(".card-open-days").textContent = p.place_province || "";
    node.querySelector(".card-open-hours").textContent = p.opening_hours || "";

    const score = parseFloat(p.place_score) || 0;
    node.querySelector(".card-stars").textContent = buildStars(score);
    node.querySelector(".card-rating").textContent = score.toFixed(1);
    node.querySelector(".card-title").textContent = p.place_name || "";

    grid.appendChild(node);
  });
  
  setTimeout(() => window.favoriteHandler?.loadFavoriteStates?.(), 50);
};

window.renderPlaceCards = renderPlaceCards;
const fetchRankPlaces = async () => {
  try {
    const res = await fetch('http://localhost:3000/places/place?page=rank');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const result = await res.json();
    const data = result.success ? result.data : [];
    
    if (!data || data.length === 0) {
      renderPlaceCards([]);
      return;
    }
    
    const sorted = data.sort((a, b) => (parseFloat(b.place_score) || 0) - (parseFloat(a.place_score) || 0));
    renderPlaceCards(sorted);
    
  } catch (error) {
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่า backend server ทำงานอยู่</p>';
      grid.style.display = 'block';
    }
  }
};
const setupSearch = () => {
  const rankSearchInput = document.getElementById('rankSearchInput');
  const rankSearchSuggestions = document.getElementById('rankSearchSuggestions');
  if (!rankSearchInput) return;
  
  const searchInput = rankSearchInput;
  const suggestionsDiv = rankSearchSuggestions;
  
  let searchTimeout;
  let allPlaces = [];
  
  (async () => {
    try {
      const res = await fetch('http://localhost:3000/places/place');
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
      fetchRankPlaces();
      return;
    }
    
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    window.clearCategorySelections?.();
    
    searchTimeout = setTimeout(() => searchPlaces(query), 300);
  });
  
  document.addEventListener('click', (e) => {
    if (suggestionsDiv && !searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.style.display = 'none';
    }
  });
};

const searchPlaces = async (query) => {
  try {
    const params = new URLSearchParams({ query, page: 'rank' });
    const res = await fetch(`http://localhost:3000/places/search?${params}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const result = await res.json();
    const data = result.success ? result.data : [];
    renderPlaceCards(Array.isArray(data) ? data : []);
    
  } catch (error) {
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">เกิดข้อผิดพลาดในการค้นหา</p>';
      grid.style.display = 'block';
    }
  }
};
const setupAuthButtons = () => {
  updateUsernameDisplay();
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
    } else {
      btn.classList.toggle("is-active");
      const icon = btn.querySelector(".material-icons");
      if (icon) icon.textContent = btn.classList.contains("is-active") ? "favorite" : "favorite_border";
    }
  });
};
document.addEventListener("DOMContentLoaded", () => {
  window.combinedFilter?.setCurrentPage('rank');
  
  setupMobileMenu();
  setupChipActive();
  
  window.CategoryFilter?.init('rank', [], renderPlaceCards);
  
  setupSearch();
  setupAuthButtons();
  setupFavoriteToggle();
  
  if (typeof setupOpeningDaysFilter === 'function') setupOpeningDaysFilter('rank');
  
  fetchRankPlaces();
});
