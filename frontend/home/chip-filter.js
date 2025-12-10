// แมปชื่อหมวดหมู่จาก chip กับ API endpoint (แบบเก่า - เขียนแยกทีละตัว)
const chipCategoryMap = {
  'Cafés & Restaurants': 'cafes',
  'Temple': 'temples',
  'Natural': 'natural',
  'Sports': 'sport',
  'Art': 'art',
  'Museums': 'museums',
  'Markets': 'markets',
  'Beaches': 'beaches',
  'Parks & Gardens': 'parks',
  'Historical Attractions': 'historical',
  'Mall': 'malls',
  'Other': 'other'
};

function setupChipActive() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", async (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    // Toggle: ถ้าคลิก chip ที่ active อยู่แล้ว ให้ deselect และแสดงทั้งหมด
    const isCurrentlyActive = chip.classList.contains("active");
    
    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    
    if (isCurrentlyActive) {
      // ถ้าเดิมเป็น active อยู่แล้ว ให้ล้าง chip filter
      if (window.combinedFilter) {
        window.combinedFilter.setChipFilter(null);
        await window.combinedFilter.applyCombinedFilters();
      } else {
        await window.fetchPlaces();
      }
    } else {
      // ถ้ายังไม่ active ให้เปิด active และกรอง
      chip.classList.add("active");
      
      // ล้าง category panel selection เพราะใช้ chip filter แทน
      if (window.clearCategorySelections) {
        window.clearCategorySelections();
      }
      
      const category = chip.textContent.trim();
      const endpoint = chipCategoryMap[category];
      
      if (endpoint) {
        // ใช้ Combined Filter System
        if (window.combinedFilter) {
          window.combinedFilter.setChipFilter(endpoint);
          window.combinedFilter.setCategoryFilters([], []); // ล้าง category overlay
          await window.combinedFilter.applyCombinedFilters();
        } else {
          await fetchPlacesByCategory(endpoint);
        }
      } else {
        await window.fetchPlaces();
      }
    }
  });
}

async function fetchPlacesByCategory(category) {
  try {
    console.log('Fetching category:', category);
    const url = `http://localhost:3000/places/category/${category}?page=home`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    const data = result.success ? result.data : [];
    console.log('Data received:', data.length, 'places');
    
    if (!data || data.length === 0) {
      const grid = document.getElementById("placeGrid");
      if (grid) {
        grid.innerHTML = `<p style="text-align:center; padding:2rem; color:#666;">ไม่พบสถานที่ในหมวดหมู่นี้</p>`;
        grid.style.display = 'block';
      }
      return;
    }
    
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
        openDays: '',
        openHours: item.opening_hours || '',
        rating: item.place_score || 0
      };
    });
    
    renderPlaceCards(places);
    
    // โหลดสถานะ favorite
    if (window.favoriteHandler && typeof window.favoriteHandler.loadFavoriteStates === 'function') {
      window.favoriteHandler.loadFavoriteStates();
    }
    
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    const grid = document.getElementById("placeGrid");
    if (grid) {
      grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่สามารถโหลดข้อมูลได้</p>';
      grid.style.display = 'block';
    }
  }
}

// Export function เพื่อให้ main file เรียกใช้
window.setupChipActive = setupChipActive;
