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

  menu.addEventListener("click", (e) => {
    const link = e.target.closest(".mobile-link");
    if (link) {
      menu.classList.remove("open");
    }
  });
}

// ========== avatar click ==========
function setupAvatarClick() {
  const avatarBtns = document.querySelectorAll(".avatar-btn");
  avatarBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Profile button clicked");
    });
  });
}

// ========== active state nav ==========
function setupNavActive() {
  const categoryOverlay = document.getElementById("categoryOverlay");

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // เปิด category panel เมื่อคลิก "Category" link
      if (link.textContent.trim() === "Category" && categoryOverlay) {
        categoryOverlay.classList.add("open");
      }
    });
  });

  const mobileLinks = document.querySelectorAll(".mobile-link");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      mobileLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // เปิด category panel เมื่อคลิก "Category" link ใน mobile menu
      if (link.textContent.trim() === "Category" && categoryOverlay) {
        categoryOverlay.classList.add("open");
      }
    });
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

    node.dataset.id = p.id ?? index + 1;

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
}

// เปิดให้หลังบ้านใช้
window.renderPlaceCards = renderPlaceCards;

// ========== toggle หัวใจ ==========
function setupFavoriteToggle() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    btn.classList.toggle("is-fav");
    const icon = btn.querySelector(".material-icons");
    if (icon) {
      icon.textContent = btn.classList.contains("is-fav")
        ? "favorite"
        : "favorite_border";
    }
  });
}

// ========== Opening Days Panel (ปุ่ม tune icon) ==========
function setupOpeningDaysPanel() {
  const categoryBtn = document.getElementById('categoryBtn');
  const openingDaysPanel = document.getElementById('openingDaysPanel');
  
  if (categoryBtn && openingDaysPanel) {
    categoryBtn.addEventListener('click', () => {
      const isHidden = openingDaysPanel.getAttribute('aria-hidden') === 'true';
      openingDaysPanel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
    });
  }

  // ปิดเมื่อคลิก Clear หรือ Apply
  const clearBtn = openingDaysPanel?.querySelector('.filter-clear');
  const applyBtn = openingDaysPanel?.querySelector('.filter-apply');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // ล้าง checkbox ทั้งหมด
      openingDaysPanel.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      // ล้าง active จาก day chips
      openingDaysPanel.querySelectorAll('.day-chip').forEach(chip => chip.classList.remove('active'));
    });
  }
  
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      openingDaysPanel?.setAttribute('aria-hidden', 'true');
      // TODO: ใช้ filter กับข้อมูล
      console.log('Apply opening days filter');
    });
  }

  // Day chips toggle
  const dayChips = openingDaysPanel?.querySelectorAll('.day-chip');
  dayChips?.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
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
    // สร้าง query string
    const params = new URLSearchParams();
    
    if (selectedTypes.length > 0) {
      selectedTypes.forEach(type => params.append('types', type));
    }
    
    if (selectedProvinces.length > 0) {
      selectedProvinces.forEach(province => params.append('provinces', province));
    }

    const url = `http://localhost:3000/categories?${params.toString()}`;
    console.log('Fetching:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Filtered data:', data);

    if (data.length === 0) {
      const grid = document.getElementById('placeGrid');
      if (grid) {
        grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่พบสถานที่ที่ตรงกับเงื่อนไข</p>';
      }
      return;
    }

    // แปลงข้อมูลและแสดงผล
    const places = data.map((item, index) => {
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

    renderPlaceCards(places);

  } catch (error) {
    console.error('Error applying filters:', error);
    alert('เกิดข้อผิดพลาดในการกรองข้อมูล');
  }
}

// ล้าง filter ทั้งหมด
function clearFilters() {
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
  
  // แสดงข้อมูลทั้งหมด
  window.fetchPlaces();

  console.log('Filters cleared');
}

// ========== กัน error ฟังก์ชันเดิม ==========
function setupAuthButtons() {
  // ไม่มีปุ่ม sign in / sign up แล้ว
}

// ========== ดึงข้อมูลสถานที่จาก backend ==========
async function fetchPlaces() {
  console.log('Fetching places from backend...');
  try {
    const response = await fetch('http://localhost:3000/places');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Data received:', data);
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

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupAvatarClick();
  setupNavActive();
  if (typeof setupChipActive === 'function') {
    setupChipActive(); // จาก chip-filter.js
  }
  setupOpeningDaysPanel(); // Opening days filter (tune icon button)
  setupCategoryPanel(); // Category filter panel (nav link)
  setupFavoriteToggle();
  setupAuthButtons();
  fetchPlaces();            // ดึงข้อมูลสถานที่
});