const chipCategoryMap = {
  'Cafe & Restaurants': 'cafes',
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

    const isCurrentlyActive = chip.classList.contains("active");
    
    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    
    if (isCurrentlyActive) {
      if (window.combinedFilter) {
        window.combinedFilter.setChipFilter(null);
        await window.combinedFilter.applyCombinedFilters();
      } else {
        await window.fetchPlaces();
      }
    } else {
      chip.classList.add("active");
      
      const category = chip.textContent.trim();
      const endpoint = chipCategoryMap[category];
      
      if (endpoint) {
        if (window.combinedFilter) {
          window.combinedFilter.setChipFilter(endpoint);
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
    const url = `http://localhost:3000/places/category/${category}?page=home`;
    
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    const data = result.success ? result.data : [];
    
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

window.setupChipActive = setupChipActive;
