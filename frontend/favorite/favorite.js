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
    console.log('Result:', result);
    const data = result.success ? result.data : [];
    console.log('Data length:', data?.length);

    if (data && Array.isArray(data)) {
      console.log('Raw data from API:', data);
      
      const places = data.map((item) => {
        console.log('Processing item:', item);
        return {
          id: item.place_id,
          title: item.place_name,
          rating: item.place_score,
          imageUrl: item.image_path ? `../../img_place/${item.image_path.split(/[\/\\]/).pop()}` : null,
          openDays: '',
          openHours: item.opening_hours || '',
          province: item.place_province || ''
        };
      });

      console.log('Mapped places:', places);
      console.log('Number of places to render:', places.length);
      renderPlaceCards(places);
    } else {
      console.warn('No data or success false');
      showEmptyMessage('ไม่มีรายการโปรด');
    }
  } catch (error) {
    console.error('Fetch favorites error:', error);
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
function renderPlaceCards(places) {
  console.log('=== renderPlaceCards called ===');
  console.log('Places to render:', places);
  console.log('Number of places:', places?.length);
  
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");

  console.log('Grid element found:', !!grid);
  console.log('Template element found:', !!tpl);

  if (!grid || !tpl) {
    console.error('Grid or template not found!');
    return;
  }

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    console.warn('No places to render');
    showEmptyMessage('ไม่มีรายการโปรด');
    return;
  }

  grid.style.display = "grid";
  console.log('Grid display set to grid, starting render...');

  places.forEach((p, index) => {
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

    // ตั้งปุ่ศหัวใจเป็น active (เพราะอยู่ในหน้า favorites แล้ว)
    const favBtn = node.querySelector('.card-fav-btn');
    if (favBtn) {
      favBtn.classList.add('is-active');
      const icon = favBtn.querySelector('.material-icons');
      if (icon) icon.textContent = 'favorite';
    }

    grid.appendChild(node);
  });
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
    console.log("Category button clicked (ไว้เปิด popup filter)");
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
      
      // แสดงชื่อ user ใน mobile menu
      if (usernameDisplay) {
        usernameDisplay.textContent = user.user_name || user.first_name || 'User';
      }
    } catch (e) {
      console.error('Parse user error:', e);
      localStorage.removeItem('loggedInUser');
    }
  } else {
    console.log('No user logged in');
    
    // ถ้าไม่ได้ login ให้แสดง "Guest"
    if (usernameDisplay) {
      usernameDisplay.textContent = 'Guest';
    }
  }
  
  // ลบ Sign in/Sign up buttons
  const authButtons = document.querySelectorAll(".mobile-auth");
  authButtons.forEach((btn) => {
    btn.remove();
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupChipActive();
  setupFavoriteToggle();
  setupCategoryButton();
  setupAuthButtons();
  
  // โหลดรายการ favorite
  fetchFavoritePlaces();
});