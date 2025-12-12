// ========== Combined Filter System ==========
// ระบบกรองรวมที่ทำงานร่วมกันได้ระหว่าง Opening Hours, Category, และ Chip Bar

let currentFilters = {
  // Opening hours filters
  everyday: false,
  opennow: false,
  weekday: false,
  hours24: false,
  selectedDays: [],
  
  // Category filters (from category overlay)
  types: [],
  provinces: [],
  
  // Chip filter (from chip bar)
  chipCategory: null,
  
  // Current page
  page: 'home'
};

// ========== Set Filters ==========

function setOpeningFilters(everyday, opennow, weekday, hours24, selectedDays) {
  currentFilters.everyday = everyday;
  currentFilters.opennow = opennow;
  currentFilters.weekday = weekday;
  currentFilters.hours24 = hours24;
  currentFilters.selectedDays = selectedDays;
}

function setCategoryFilters(types, provinces) {
  currentFilters.types = types;
  currentFilters.provinces = provinces;
}

function setChipFilter(category) {
  currentFilters.chipCategory = category;
}

function setCurrentPage(page) {
  currentFilters.page = page;
}

function clearAllFilters() {
  currentFilters = {
    everyday: false,
    opennow: false,
    weekday: false,
    hours24: false,
    selectedDays: [],
    types: [],
    provinces: [],
    chipCategory: null,
    page: currentFilters.page
  };
}

// ========== Apply Combined Filters ==========

async function applyCombinedFilters() {
  try {
    console.log('=== Applying Combined Filters ===');
    console.log('Current filters:', currentFilters);
    
    // 1. ดึงข้อมูลตามลำดับความสำคัญ
    let data = [];
    
    // Priority 1: Chip filter (ถ้ามี)
    if (currentFilters.chipCategory) {
      console.log('Using chip filter:', currentFilters.chipCategory);
      const url = `http://localhost:3000/places/category/${currentFilters.chipCategory}?page=${currentFilters.page}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      data = result.success ? result.data : [];
    }
    // Priority 2: Category filter (types/provinces)
    else if (currentFilters.types.length > 0 || currentFilters.provinces.length > 0) {
      console.log('Using category filter');
      const params = new URLSearchParams();
      params.append('page', currentFilters.page);
      
      currentFilters.types.forEach(type => params.append('types', type));
      currentFilters.provinces.forEach(province => params.append('provinces', province));
      
      const url = `http://localhost:3000/categories?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      data = result.success ? result.data : [];
    }
    // Priority 3: All places
    else {
      console.log('Loading all places');
      const url = `http://localhost:3000/places/place?page=${currentFilters.page}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      data = result.success ? result.data : [];
    }
    
    console.log('Initial data:', data.length, 'places');
    
    // 2. กรอง opening hours (ถ้ามีการเลือก)
    const hasOpeningFilter = currentFilters.everyday || currentFilters.opennow || 
                            currentFilters.weekday || currentFilters.hours24 || 
                            currentFilters.selectedDays.length > 0;
    
    if (hasOpeningFilter && typeof checkOpeningHours === 'function') {
      console.log('Applying opening hours filter');
      data = data.filter(place => {
        return checkOpeningHours(place.opening_hours, {
          everyday: currentFilters.everyday,
          opennow: currentFilters.opennow,
          weekday: currentFilters.weekday,
          hours24: currentFilters.hours24,
          selectedDays: currentFilters.selectedDays
        });
      });
      console.log('After opening filter:', data.length, 'places');
    }
    
    // 3. แสดงผล
    if (data.length === 0) {
      const grid = document.getElementById('placeGrid');
      if (grid) {
        grid.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">ไม่พบสถานที่ที่ตรงกับเงื่อนไข</p>';
        grid.style.display = 'block';
      }
      return;
    }
    
    // แปลงข้อมูลตามหน้า
    let places;
    if (currentFilters.page === 'rank') {
      // หน้า rank ใช้ข้อมูลดิบ (raw data)
      places = data;
    } else {
      // หน้า home ต้องแปลงข้อมูล
      places = data.map((item, index) => {
        let imagePath = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
        
        if (item.image_path) {
          const fileName = item.image_path.includes('/') || item.image_path.includes('\\')
            ? item.image_path.split(/[/\\]/).pop()
            : item.image_path;
          imagePath = `../../img_place/${fileName}`;
        }

        return {
          id: item.place_id,
          place_id: item.place_id,
          rank: index + 1,
          title: item.place_name,
          imageUrl: imagePath,
          openDays: item.place_province || '',
          openHours: item.opening_hours || '',
          rating: item.place_score || 0
        };
      });
    }
    
    // Render
    if (typeof renderPlaceCards === 'function') {
      renderPlaceCards(places);
    } else if (window.renderPlaceCards) {
      window.renderPlaceCards(places);
    } else {
      console.error('renderPlaceCards function not found');
    }
    
    // Load favorites
    setTimeout(() => {
      if (window.favoriteHandler && typeof window.favoriteHandler.loadFavoriteStates === 'function') {
        window.favoriteHandler.loadFavoriteStates();
      }
    }, 50);
    
    console.log('Filtered places rendered:', places.length);
    
  } catch (error) {
    console.error('Error applying combined filters:', error);
    alert('เกิดข้อผิดพลาดในการกรองข้อมูล: ' + error.message);
  }
}

// ========== Export ==========

window.combinedFilter = {
  setOpeningFilters,
  setCategoryFilters,
  setChipFilter,
  setCurrentPage,
  clearAllFilters,
  applyCombinedFilters,
  getCurrentFilters: () => ({ ...currentFilters })
};
