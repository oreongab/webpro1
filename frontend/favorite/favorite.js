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

// ========== chips ==========
function setupChipActive() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
}

// ========== ดาว ==========
function buildStars(rating) {
  if (rating == null) return "";
  const full = Math.round(rating);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += i < full ? "★" : "☆";
  }
  return html;
}

// ========== Parse Categories from String ==========
function parseCategories(categoriesString) {
  console.log('parseCategories input:', categoriesString, 'type:', typeof categoriesString);
  
  if (!categoriesString) {
    console.log('  → Empty/null, returning []');
    return [];
  }
  
  // ถ้าเป็น array อยู่แล้ว
  if (Array.isArray(categoriesString)) {
    console.log('  → Already array:', categoriesString);
    return categoriesString;
  }
  
  // แปลง string เป็น array
  const result = categoriesString
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0);
  
  console.log('  → Parsed to array:', result);
  return result;
}

// ========== Fetch Favorite Places ==========
async function fetchFavoritePlaces() {
  const userId = window.favoriteHandler?.getCurrentUserId();
  
  console.log('=== Fetching Favorites ===');
  console.log('User ID:', userId);
  
  if (!userId) {
    console.warn('ไม่มี user login');
    showEmptyMessage('กรุณาล็อกอินเพื่อดูรายการโปรด');
    return;
  }

  try {
    const url = `http://localhost:3000/favorites/${userId}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('=== API Response ===');
    console.log('Success:', result.success);
    console.log('Data count:', result.data?.length);
    console.log('Full response:', result);
    
    const data = result.success ? result.data : [];

    if (data && Array.isArray(data) && data.length > 0) {
      console.log('=== Processing Places ===');
      console.log('Raw data sample:', data[0]);
      
      const places = data.map((item, index) => {
        console.log(`\n--- Place ${index + 1} ---`);
        console.log('  ID:', item.place_id);
        console.log('  Name:', item.place_name);
        console.log('  Raw categories:', item.categories);
        console.log('  Categories type:', typeof item.categories);
        
        // Parse categories properly
        const categoriesArray = parseCategories(item.categories);
        console.log('  Parsed categories:', categoriesArray);
        
        const place = {
          id: item.place_id,
          title: item.place_name,
          rating: item.place_score,
          imageUrl: item.image_path ? `../../img_place/${item.image_path.split(/[\/\\]/).pop()}` : null,
          openDays: '',
          openHours: item.opening_hours || '',
          province: item.place_eng_province || item.place_province || '',
          categories: categoriesArray
        };
        
        console.log('  Final place object:', place);
        return place;
      });

      console.log('\n=== Final Mapped Places Summary ===');
      console.log('Total places:', places.length);
      console.log('All places:', places);
      
      // เก็บข้อมูลทั้งหมดไว้สำหรับ filter
      window.allFavoritePlaces = places; // เก็บไว้ที่ global
      
      // Initialize CategoryFilter with actual data
      if (window.CategoryFilter) {
        console.log('\n=== Initializing CategoryFilter ===');
        console.log('Sending places count:', places.length);
        window.CategoryFilter.updatePlaces(places);
        window.CategoryFilter.init('favorite', places, (filteredPlaces) => {
          console.log('\n=== Category Filter Callback ===');
          console.log('Received filtered places:', filteredPlaces?.length);
          console.log('Filtered places:', filteredPlaces);
          renderPlaceCards(filteredPlaces, true);
        });
      } else {
        console.warn('⚠️ CategoryFilter not available!');
      }
      
      // Render all places initially
      renderPlaceCards(places);
    } else {
      console.warn('No data or empty array');
      showEmptyMessage('ไม่มีรายการโปรด');
    }
  } catch (error) {
    console.error('❌ Fetch favorites error:', error);
    showEmptyMessage('ไม่สามารถโหลดข้อมูลได้');
  }
}

// แสดงข้อความว่าง
function showEmptyMessage(message) {
  const grid = document.getElementById('placeGrid');
  if (grid) {
    grid.innerHTML = `<p style="text-align:center; padding:2rem; color:#666;">${message}</p>`;
    grid.style.display = 'block';
  }
}

// ========== renderPlaceCards (ให้หลังบ้านเรียกใช้) ==========
function renderPlaceCards(places, isFiltered = false) {
  console.log('\n=== renderPlaceCards ===');
  console.log('Places:', places);
  console.log('Count:', places?.length);
  console.log('Is filtered:', isFiltered);
  
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");

  if (!grid || !tpl) {
    console.error('❌ Grid or template not found!');
    return;
  }

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    console.warn('⚠️ No places to render');
    const message = isFiltered ? 'ไม่พบสถานที่ที่ตรงกับเงื่อนไข' : 'ไม่มีรายการโปรด';
    showEmptyMessage(message);
    return;
  }

  grid.style.display = "grid";
  console.log('✓ Rendering', places.length, 'cards...');

  places.forEach((p, index) => {
    console.log(`Rendering card ${index + 1}:`, p.title);
    
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.id ?? index + 1;

    // คลิกการ์ดไปหน้า detail
    node.style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
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

    // ตั้งปุ่มหัวใจเป็น active
    const favBtn = node.querySelector('.card-fav-btn');
    if (favBtn) {
      favBtn.classList.add('is-active');
      const icon = favBtn.querySelector('.material-icons');
      if (icon) icon.textContent = 'favorite';
    }

    grid.appendChild(node);
  });
  
  console.log('✓ Finished rendering', places.length, 'cards');
}

// ========== toggle หัวใจ ==========
function setupFavoriteToggle() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    const card = btn.closest('.place-card');
    const placeId = card?.dataset.id;
    
    if (!placeId) {
      console.warn('No place_id found');
      return;
    }

    // ใช้ favorite handler
    if (window.favoriteHandler) {
      await window.favoriteHandler.toggleFavorite(placeId, btn);
      
      // ถ้าลบออกจาก favorites ให้ลบ card ออกจากหน้า
      if (!btn.classList.contains('is-active')) {
        card.remove();
        
        // อัพเดท allFavoritePlaces
        if (window.allFavoritePlaces) {
          window.allFavoritePlaces = window.allFavoritePlaces.filter(p => p.id != placeId);
          if (window.CategoryFilter) {
            window.CategoryFilter.updatePlaces(window.allFavoritePlaces);
          }
        }
        
        // ถ้าไม่เหลือ card แล้วแสดงข้อความ
        const grid = document.getElementById('placeGrid');
        const remainingCards = grid?.querySelectorAll('.place-card');
        if (!remainingCards || remainingCards.length === 0) {
          showEmptyMessage('ไม่มีรายการโปรด');
        }
      }
    }
  });
}

// ========== ปุ่ม Category (filter) ==========
function setupCategoryButton() {
  const btn = document.getElementById("categoryBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    console.log("Category button clicked");
    if (window.CategoryFilter) {
      window.CategoryFilter.openOverlay();
    }
  });
}

// ========== เช็ค Login Status และแสดงข้อมูล User ==========
function setupAuthButtons() {
  const userStr = localStorage.getItem('loggedInUser');
  const usernameDisplay = document.querySelector('.mobile-menu-header .username');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('User logged in:', user);
      
      if (usernameDisplay) {
        usernameDisplay.textContent = user.user_name || user.first_name || 'User';
      }
    } catch (e) {
      console.error('Parse user error:', e);
      localStorage.removeItem('loggedInUser');
    }
  } else {
    console.log('No user logged in');
    if (usernameDisplay) {
      usernameDisplay.textContent = 'Guest';
    }
  }
  
  const authButtons = document.querySelectorAll(".mobile-auth");
  authButtons.forEach((btn) => {
    btn.remove();
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log('=== Page Loaded ===');
  setupMobileMenu();
  setupChipActive();
  setupFavoriteToggle();
  setupCategoryButton();
  setupAuthButtons();
  
  // โหลดรายการ favorite
  fetchFavoritePlaces();
});