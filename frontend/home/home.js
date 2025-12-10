// ========== เมนูมือถือ (สามขีด) ==========
function setupMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".mobile-menu-close");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.add("open");
  });

  closeBtn?.addEventListener("click", () => {
    menu.classList.remove("open");
  });
}

// ========== ดาว ==========
function buildStars(place_score) {
  if (place_score == null) return "";
  const full = Math.round(place_score);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += i < full ? "★" : "☆";
  }
  return html;
}

// ========== renderPlaceCards (รอข้อมูลหลังบ้าน) ==========
function renderPlaceCards(places) {
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");

  if (!grid || !tpl) return;

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    grid.style.display = "none";
    return;
  }

  grid.style.display = "grid";

  places.forEach((p, index) => {
    const node = tpl.content.firstElementChild.cloneNode(true);

    // ใช้ place_id หรือ id
    const placeId = p.place_id || p.id || (index + 1);
    node.dataset.id = placeId;

    // คลิกการ์ดไปหน้า detail
    node.style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
      // ถ้าคลิกที่ปุ่มหัวใจให้ไม่ไปหน้า detail
      if (e.target.closest('.card-fav-btn')) return;
      
      const placeId = node.dataset.id;
      if (placeId) {
        window.location.href = `../place/place-detail.html?id=${placeId}`;
      }
    });

    // ซ่อน rank badge
    const rankBadge = node.querySelector(".card-rank-badge");
    if (rankBadge) rankBadge.style.display = "none";

    const imgEl = node.querySelector(".card-image");
    if (imgEl) {
      imgEl.src = p.imageUrl || "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
      imgEl.alt = p.title || "";
      // ถ้าโหลดรูปไม่สำเร็จให้แสดงรูป default
      imgEl.onerror = function() {
        this.onerror = null;
        this.src = "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
      };
    }

    const dayEl = node.querySelector(".card-open-days");
    const hourEl = node.querySelector(".card-open-hours");
    if (dayEl) dayEl.textContent = p.openDays || "";
    if (hourEl) hourEl.textContent = p.openHours || "";

    const starEl = node.querySelector(".card-stars");
    const rateEl = node.querySelector(".card-rating");
    if (starEl && p.rating != null) starEl.textContent = buildStars(p.rating);
    if (rateEl && p.rating != null) {
      const rating = typeof p.rating === 'number' ? p.rating : parseFloat(p.rating) || 0;
      rateEl.textContent = rating.toFixed(1);
    }

    const titleEl = node.querySelector(".card-title");
    if (titleEl) titleEl.textContent = p.title || "";

    grid.appendChild(node);
  });
  
  // โหลดสถานะ favorite หลังจาก render cards (ใช้ setTimeout เพื่อให้ DOM update เสร็จก่อน)
  setTimeout(() => {
    if (window.favoriteHandler) {
      console.log('[Home] Loading favorite states after render...');
      window.favoriteHandler.loadFavoriteStates();
    }
  }, 50);
}

// เปิดให้หลังบ้านใช้
window.renderPlaceCards = renderPlaceCards;

// ========== toggle หัวใจ ==========
function setupFavoriteToggle() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    // หา place_id จาก card
    const card = btn.closest('.place-card');
    const placeId = card?.dataset.id;
    
    if (!placeId) {
      console.warn('No place_id found');
      return;
    }

    // ใช้ favorite handler
    if (window.favoriteHandler) {
      await window.favoriteHandler.toggleFavorite(placeId, btn);
    } else {
      // fallback ถ้ายังไม่โหลด handler
      btn.classList.toggle("is-active");
      const icon = btn.querySelector(".material-icons");
      if (icon) {
        icon.textContent = btn.classList.contains("is-active")
          ? "favorite"
          : "favorite_border";
      }
    }
  });
}

// ========== Category Filter Panel ==========
let selectedTypes = [];
let selectedProvinces = [];

// ฟังก์ชันสำหรับล้าง category selections โดยไม่โหลดข้อมูลใหม่
function clearCategorySelections() {
  selectedTypes = [];
  selectedProvinces = [];
  
  document.querySelectorAll('.category-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  const searchInput = document.getElementById('provinceSearch');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.category-province-list li').forEach(item => {
    item.style.display = '';
  });
}

// Export เพื่อให้ chip-filter.js เรียกใช้ได้
window.clearCategorySelections = clearCategorySelections;

function setupCategoryPanel() {
  const categoryOverlay = document.getElementById('categoryOverlay');
  const categoryClose = document.querySelector('.category-close');
  const applyBtn = document.querySelector('.category-apply');
  const clearBtn = document.querySelector('.category-clear');

  // ปิด panel
  if (categoryClose) {
    categoryClose.addEventListener('click', () => {
      categoryOverlay?.classList.remove('open');
    });
  }

  // ปิดเมื่อคลิกที่ overlay
  if (categoryOverlay) {
    categoryOverlay.addEventListener('click', (e) => {
      if (e.target === categoryOverlay) {
        categoryOverlay.classList.remove('open');
      }
    });
  }

  // จัดการ checkbox สำหรับ Place Type
  const placeCheckboxes = document.querySelectorAll('.category-place-list input[type="checkbox"]');
  placeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        if (!selectedTypes.includes(value)) {
          selectedTypes.push(value);
        }
      } else {
        selectedTypes = selectedTypes.filter(type => type !== value);
      }
      console.log('Selected types:', selectedTypes);
    });
  });

  // จัดการ checkbox สำหรับ Province
  const provinceCheckboxes = document.querySelectorAll('.category-province-list input[type="checkbox"]');
  provinceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        if (!selectedProvinces.includes(value)) {
          selectedProvinces.push(value);
        }
      } else {
        selectedProvinces = selectedProvinces.filter(prov => prov !== value);
      }
      console.log('Selected provinces:', selectedProvinces);
    });
  });

  // ปุ่ม Apply
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      const categoryOverlay = document.getElementById('categoryOverlay');
      
      // ล้าง active chip ก่อน
      document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
      
      // ถ้าเลือกประเภทเดียว ให้ active chip ตามนั้น
      if (selectedTypes.length === 1) {
        const categoryToChipMap = {
          'Art': 'Art',
          'Beaches': 'Beaches',
          'Cafe & Restaurants': 'Cafés & Restaurants',
          'Historical Attractions': 'Historical Attractions',
          'Markets': 'Markets',
          'Museums': 'Museums',
          'Mall': 'Mall',
          'Natural': 'Natural',
          'Parks & Gardens': 'Parks & Gardens',
          'Temple': 'Temple',
          'Sports': 'Sports',
          'Other': 'Other'
        };
        
        const chipText = categoryToChipMap[selectedTypes[0]];
        if (chipText) {
          const chip = Array.from(document.querySelectorAll('.chip')).find(
            c => c.textContent.trim() === chipText
          );
          if (chip) chip.classList.add('active');
        }
      }
      
      await applyFilters();
      categoryOverlay?.classList.remove('open');
    });
  }

  // ปุ่ม Clear
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearFilters();
    });
  }

  // Province search
  setupProvinceSearch();
}

// ค้นหา province
function setupProvinceSearch() {
  const searchInput = document.getElementById('provinceSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const provinceItems = document.querySelectorAll('.category-province-list li');

    provinceItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// ใช้ filter
async function applyFilters() {
  console.log('Applying filters...');
  console.log('Types:', selectedTypes);
  console.log('Provinces:', selectedProvinces);

  try {
    // ใช้ Combined Filter System
    if (window.combinedFilter) {
      window.combinedFilter.setCategoryFilters(selectedTypes, selectedProvinces);
      window.combinedFilter.setChipFilter(null); // ล้าง chip filter
      
      // ล้าง chip bar active
      document.querySelectorAll('.chip-bar .chip').forEach(chip => {
        chip.classList.remove('active');
      });
      
      await window.combinedFilter.applyCombinedFilters();
    } else {
      console.error('Combined filter system not available');
    }

  } catch (error) {
    console.error('Error applying filters:', error);
  }
}

// ล้าง filter ทั้งหมด
async function clearFilters() {
  selectedTypes = [];
  selectedProvinces = [];

  // uncheck checkboxes ทั้งหมด
  document.querySelectorAll('.category-list input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // ล้าง search
  const searchInput = document.getElementById('provinceSearch');
  if (searchInput) searchInput.value = '';

  // แสดง province ทั้งหมด
  document.querySelectorAll('.category-province-list li').forEach(item => {
    item.style.display = '';
  });
  
  // ล้าง chip selection ด้วย
  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
  
  console.log('Filters cleared');
  
  // ใช้ Combined Filter System
  if (window.combinedFilter) {
    window.combinedFilter.setCategoryFilters([], []);
    await window.combinedFilter.applyCombinedFilters();
  } else {
    // Fallback
    window.fetchPlaces();
  }
}

// ========== เช็ค Login Status และแสดงข้อมูล User ==========
function setupAuthButtons() {
  const userStr = localStorage.getItem('loggedInUser');
  const usernameDisplay = document.querySelector('.mobile-menu-header .username');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('User logged in:', user);
      
      // แสดงชื่อ user ใน mobile menu
      if (usernameDisplay) {
        usernameDisplay.textContent = user.user_name || user.first_name || 'User';
      }
      
      // อาจเพิ่มการแสดงสถานะ login ในที่อื่นๆ ได้
    } catch (e) {
      console.error('Parse user error:', e);
      localStorage.removeItem('loggedInUser');
    }
  } else {
    console.log('No user logged in');
    
    // ถ้าไม่ได้ login ให้แสดง "Guest" หรือ "Login"
    if (usernameDisplay) {
      usernameDisplay.textContent = 'Guest';
    }
  }
}

// ========== ดึงข้อมูลสถานที่จาก backend ==========
async function fetchPlaces() {
  console.log('Fetching places from backend...');
  try {
    const response = await fetch('http://localhost:3000/places?page=home');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Result received:', result);
    const data = result.success ? result.data : [];
    console.log('Number of places:', data.length);
    
    if (!data || data.length === 0) {
      console.warn('No places found in database');
      // แสดงข้อมูลตัวอย่างถ้าไม่มีข้อมูล
      const samplePlaces = [
        {
          id: 1,
          rank: 1,
          title: 'Sample Place 1',
          imageUrl: '../../img_place/4-3_1.jpg',
          openDays: 'Mon-Sun',
          openHours: '09:00-18:00',
          rating: 4.5
        },
        {
          id: 2,
          rank: 2,
          title: 'Sample Place 2',
          imageUrl: '../../img_place/watpho_front.jpg',
          openDays: 'Mon-Fri',
          openHours: '10:00-20:00',
          rating: 4.0
        },
        {
          id: 3,
          rank: 3,
          title: 'Sample Place 3',
          imageUrl: '../../img_place/iconsiam.jpg',
          openDays: 'Everyday',
          openHours: '24 Hours',
          rating: 5.0
        }
      ];
      renderPlaceCards(samplePlaces);
      return;
    }
    
    const places = data.map((item, index) => {
      // ถ้า image_path มี path เต็มให้ตัดเอาแค่ชื่อไฟล์
      let imagePath = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
      if (item.image_path) {
        const fileName = item.image_path.includes('/') || item.image_path.includes('\\') 
          ? item.image_path.split(/[/\\]/).pop() 
          : item.image_path;
        imagePath = `../../img_place/${fileName}`;
      }
      
      return {
        id: item.place_id,
        rank: index + 1,
        title: item.place_name,
        imageUrl: imagePath,
        openDays: '',
        openHours: item.opening_hours || '',
        rating: item.place_score || 0
      };
    });
    
    console.log('Transformed places:', places);
    renderPlaceCards(places);
    
    // โหลดสถานะ favorite หลัง render
    if (window.favoriteHandler && typeof window.favoriteHandler.loadFavoriteStates === 'function') {
      window.favoriteHandler.loadFavoriteStates();
    }
    
  } catch (error) {
    console.error('Error fetching places:', error);
    console.error('Error details:', error.message);
    // แสดงข้อความ error ให้ user เห็น
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่า backend server ทำงานอยู่</p>';
      grid.style.display = 'block';
    }
  }
}

// Export ให้ chip-filter.js ใช้
window.fetchPlaces = fetchPlaces;

// ========== SEARCH ในหน้า Home ==========
function setupHomeSearch() {
  const searchInput = document.getElementById('searchInput');
  const suggestionsDiv = document.getElementById('searchSuggestions');
  
  if (!searchInput) return;
  
  let searchTimeout;
  let allPlaces = []; // เก็บข้อมูลสถานที่ทั้งหมดสำหรับ suggestions
  
  // โหลดข้อมูลสถานที่ทั้งหมดสำหรับ suggestions
  async function loadAllPlaces() {
    try {
      const response = await fetch('http://localhost:3000/places?page=home');
      if (response.ok) {
        const result = await response.json();
        allPlaces = result.success ? result.data : [];
        console.log('Loaded', allPlaces.length, 'places for suggestions');
      }
    } catch (error) {
      console.error('Error loading places for suggestions:', error);
    }
  }
  
  loadAllPlaces();
  
  // แสดง suggestions
  function showSuggestions(query) {
    if (!suggestionsDiv || !query || query.length < 1) {
      if (suggestionsDiv) suggestionsDiv.style.display = 'none';
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = allPlaces.filter(place => 
      place.place_name.toLowerCase().includes(lowerQuery) ||
      place.place_province.toLowerCase().includes(lowerQuery)
    ).slice(0, 8); // แสดงแค่ 8 รายการ
    
    if (filtered.length === 0) {
      suggestionsDiv.style.display = 'none';
      return;
    }
    
    suggestionsDiv.innerHTML = filtered.map(place => `
      <div class="search-suggestion-item" data-id="${place.place_id}">
        <div class="suggestion-name">${place.place_name}</div>
        <div class="suggestion-province">
          ${place.place_province}
          <span class="suggestion-score">★ ${parseFloat(place.place_score || 0).toFixed(1)}</span>
        </div>
      </div>
    `).join('');
    
    suggestionsDiv.style.display = 'block';
    
    // คลิก suggestion
    suggestionsDiv.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const placeId = item.dataset.id;
        window.location.href = `../place/place-detail.html?id=${placeId}`;
      });
    });
  }
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    const query = e.target.value.trim();
    
    console.log('Search input:', query);
    
    // แสดง suggestions
    showSuggestions(query);
    
    // ถ้าไม่มีคำค้นหา ให้โหลดข้อมูลปกติ
    if (query === '') {
      fetchPlaces();
      return;
    }
    
    // รอ 500ms หลังจากพิมพ์เสร็จ
    searchTimeout = setTimeout(() => {
      searchPlaces(query);
    }, 500);
  });
  
  // ปิด suggestions เมื่อคลิกข้างนอก
  document.addEventListener('click', (e) => {
    if (suggestionsDiv && !searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.style.display = 'none';
    }
  });
}

// ========== ค้นหาสถานที่ในหน้า Home ==========
async function searchPlaces(query) {
  try {
    console.log('Searching in home page for:', query);
    
    const params = new URLSearchParams({
      q: query,
      page: 'home'
    });
    
    const url = `http://localhost:3000/places/search?${params.toString()}`;
    console.log('Search URL:', url);
    
    const response = await fetch(url);
    const result = await response.json();
    const data = result.success ? result.data : [];
    
    console.log('Search results:', data);
    
    if (data && Array.isArray(data)) {
      const places = data.map((item, index) => {
        let imagePath = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
        if (item.image_path) {
          const fileName = item.image_path.includes('/') || item.image_path.includes('\\') 
            ? item.image_path.split(/[/\\]/).pop() 
            : item.image_path;
          imagePath = `../../img_place/${fileName}`;
        }
        
        return {
          place_id: item.place_id,
          id: item.place_id,
          rank: index + 1,
          title: item.place_name,
          imageUrl: imagePath,
          openDays: item.place_province || '',
          openHours: item.opening_hours || '',
          rating: item.place_score || 0
        };
      });
      
      renderPlaceCards(places);
      
      // โหลดสถานะ favorite
      if (window.favoriteHandler && typeof window.favoriteHandler.loadFavoriteStates === 'function') {
        window.favoriteHandler.loadFavoriteStates();
      }
    } else {
      renderPlaceCards([]);
    }
    
  } catch (error) {
    console.error('Search error:', error);
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถค้นหาได้ กรุณาลองใหม่อีกครั้ง</p>';
      grid.style.display = 'block';
    }
  }
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  // ตั้งค่า page สำหรับ combined filter
  if (window.combinedFilter) {
    window.combinedFilter.setCurrentPage('home');
  }
  
  setupMobileMenu();
  if (typeof setupChipActive === 'function') {
    setupChipActive(); // จาก chip-filter.js
  }
  setupCategoryPanel(); // Category filter panel (nav link)
  setupFavoriteToggle();
  setupAuthButtons();
  setupHomeSearch();     // เพิ่มฟังก์ชัน search
  
  // Setup opening filter
  if (typeof setupOpeningDaysFilter === 'function') {
    setupOpeningDaysFilter('home');
  }
  
  fetchPlaces();         // ดึงข้อมูลสถานที่ (จะเรียก loadFavoriteStates ภายใน)
});