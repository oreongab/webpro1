let filters = {
  everyday: false,
  opennow: false,
  weekday: false,
  hours24: false,
  selectedDays: [],
  types: [],
  provinces: [],
  chipCategory: null,
  page: 'home'
};

const setOpeningFilters = (everyday, opennow, weekday, hours24, days) => {
  filters.everyday = everyday;
  filters.opennow = opennow;
  filters.weekday = weekday;
  filters.hours24 = hours24;
  filters.selectedDays = days;
};

const setCategoryFilters = (types, provinces) => {
  filters.types = types;
  filters.provinces = provinces;
};

const setChipFilter = (category) => {
  filters.chipCategory = category;
};

const setCurrentPage = (page) => {
  filters.page = page;
};

const clearAllFilters = () => {
  const page = filters.page;
  filters = {
    everyday: false,
    opennow: false,
    weekday: false,
    hours24: false,
    selectedDays: [],
    types: [],
    provinces: [],
    chipCategory: null,
    page: page
  };
};

async function applyCombinedFilters() {
  try {
    let data = [];

    const chipToDbCategory = {
      cafes: 'Cafe & Restaurants',
      temples: 'Temple',
      natural: 'Natural',
      sport: 'Sports',
      art: 'Art',
      museums: 'Museums',
      markets: 'Markets',
      beaches: 'Beaches',
      parks: 'Parks & Garden',
      historical: 'History',
      malls: 'Mall',
      other: 'Other'
    };

    const chipDbName = filters.chipCategory ? chipToDbCategory[filters.chipCategory] : null;
    const effectiveTypes = [...(filters.types || [])];
    if (chipDbName && !effectiveTypes.includes(chipDbName)) {
      effectiveTypes.push(chipDbName);
    }
    
    if (effectiveTypes.length > 0 || filters.provinces.length > 0) {
      const params = new URLSearchParams();
      params.append('page', filters.page);
      effectiveTypes.forEach(t => params.append('types', t));
      filters.provinces.forEach(p => params.append('provinces', p));
      
      const res = await fetch(`http://localhost:3000/categories?${params}`);
      const result = await res.json();
      data = result.success ? result.data : [];
    } else if (filters.chipCategory) {
      const url = `http://localhost:3000/places/category/${filters.chipCategory}?page=${filters.page}`;
      const res = await fetch(url);
      const result = await res.json();
      data = result.success ? result.data : [];
    } else {
      const res = await fetch(`http://localhost:3000/places/place?page=${filters.page}`);
      const result = await res.json();
      data = result.success ? result.data : [];
    }
    
    const hasOpeningFilter =
      filters.everyday ||
      filters.opennow ||
      filters.weekday ||
      filters.hours24 ||
      filters.selectedDays.length > 0;
    
    if (hasOpeningFilter && typeof checkOpeningHours === 'function') {
      data = data.filter(place => checkOpeningHours(place.opening_hours, filters));
    }
    
    if (data.length === 0) {
      const grid = document.getElementById('placeGrid');
      if (grid) {
        grid.innerHTML = '<p style="text-align:center;padding:2rem;color:#666;">ไม่พบสถานที่</p>';
        grid.style.display = 'block';
      }
      return;
    }
    
    let places = data;
    if (filters.page !== 'rank') {
      places = data.map((item, idx) => {
        let img = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
        
        if (item.image_path) {
          const file = item.image_path.split(/[/\\]/).pop();
          img = `../../img_place/${file}`;
        }

        return {
          id: item.place_id,
          place_id: item.place_id,
          rank: idx + 1,
          title: item.place_name,
          imageUrl: img,
          openDays: item.place_province || '',
          openHours: item.opening_hours || '',
          rating: item.place_score || 0
        };
      });
    }

    const render = typeof window.renderPlaceCards === 'function' ? window.renderPlaceCards : (typeof renderPlaceCards === 'function' ? renderPlaceCards : null);
    if (render) render(places);
    
    setTimeout(() => {
      if (window.favoriteHandler?.loadFavoriteStates) {
        window.favoriteHandler.loadFavoriteStates();
      }
    }, 50);
    
  } catch (error) {
    console.error('Filter error:', error);
    alert('เกิดข้อผิดพลาด: ' + error.message);
  }
}

window.combinedFilter = {
  setOpeningFilters,
  setCategoryFilters,
  setChipFilter,
  setCurrentPage,
  clearAllFilters,
  applyCombinedFilters,
  getCurrentFilters: () => ({ ...filters })
};
