window.CategoryFilter = (function() {
  let selectedTypes = [];
  let selectedProvinces = [];
  let allPlaces = [];
  let currentPage = 'home';
  let onFilterCallback = null;

  function init(page, places, callback) {
    currentPage = page;
    allPlaces = places || [];
    onFilterCallback = callback;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupCategoryPanel);
      return;
    }

    setupCategoryPanel();
  }

  function setupCategoryPanel() {
    const overlay = document.getElementById('categoryOverlay');
    const closeBtn = overlay?.querySelector('.category-close');
    const applyBtn = overlay?.querySelector('.category-apply');
    const clearBtn = overlay?.querySelector('.category-clear');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          overlay.setAttribute('aria-hidden', 'true');
        }
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        applyFilters();
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearFilters();
      });
    }

    const placeCheckboxes = overlay?.querySelectorAll('.category-place-list input[type="checkbox"]');
    if (placeCheckboxes) {
      placeCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (!selectedTypes.includes(e.target.value)) {
              selectedTypes.push(e.target.value);
            }
          } else {
            selectedTypes = selectedTypes.filter(t => t !== e.target.value);
          }
        });
      });
    }

    const provinceCheckboxes = overlay?.querySelectorAll('.category-province-list input[type="checkbox"]');
    if (provinceCheckboxes) {
      provinceCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (!selectedProvinces.includes(e.target.value)) {
              selectedProvinces.push(e.target.value);
            }
          } else {
            selectedProvinces = selectedProvinces.filter(p => p !== e.target.value);
          }
        });
      });
    }

    setupProvinceSearch();
  }

  function setupProvinceSearch() {
    const searchInput = document.getElementById('provinceSearch');
    const provinceList = document.querySelectorAll('.category-province-list li');

    if (searchInput && provinceList.length > 0) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        provinceList.forEach(li => {
          const text = li.textContent.toLowerCase();
          li.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }
  }

  function normalizeString(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getPlaceProvince(place) {
    return place?.province || place?.place_province || place?.placeProvince || '';
  }

  function getPlaceCategories(place) {
    const raw = place?.categories;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  function applyFilters() {
    if (window.combinedFilter && (currentPage === 'home' || currentPage === 'rank')) {
      window.combinedFilter.setCategoryFilters(selectedTypes, selectedProvinces);
      window.combinedFilter.applyCombinedFilters();
    } else if (currentPage === 'favorite') {
      applyFrontendFilter();
    } else {
      applyBackendFilter();
    }
  }

  function applyFrontendFilter() {
    if (allPlaces.length === 0) {
      if (onFilterCallback) {
        onFilterCallback([]);
      }
      return;
    }
    
    let filtered = [...allPlaces];

    if (selectedTypes.length === 0 && selectedProvinces.length === 0) {
      if (onFilterCallback) {
        onFilterCallback(filtered);
      }
      return;
    }

    if (selectedProvinces.length > 0) {
      const selected = selectedProvinces.map(normalizeString);
      filtered = filtered.filter(place => {
        const province = normalizeString(getPlaceProvince(place));
        return selected.includes(province);
      });
    }

    if (selectedTypes.length > 0) {
      const selected = selectedTypes.map(normalizeString);
      filtered = filtered.filter(place => {
        const categories = getPlaceCategories(place).map(normalizeString);
        if (categories.length === 0) return false;
        return selected.some(t => categories.includes(t));
      });
    }
    
    if (onFilterCallback) {
      onFilterCallback(filtered);
    }
  }

  async function applyBackendFilter() {
    try {
      const params = new URLSearchParams();
      
      if (selectedTypes.length > 0) {
        params.append('types', selectedTypes.join(','));
      }
      
      if (selectedProvinces.length > 0) {
        params.append('provinces', selectedProvinces.join(','));
      }
      
      params.append('page', currentPage);

      const response = await fetch(`http://localhost:3000/categories?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch filtered places');
      }

      const data = await response.json();
      
      if (onFilterCallback) {
        onFilterCallback(data.data || data.places || data);
      }
    } catch (error) {
      console.error('Error applying backend filter:', error);
      alert('Failed to apply filters. Please try again.');
    }
  }

  function clearFilters() {
    selectedTypes = [];
    selectedProvinces = [];

    const allCheckboxes = document.querySelectorAll('.category-list input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = false);

    const searchInput = document.getElementById('provinceSearch');
    if (searchInput) {
      searchInput.value = '';
      const provinceList = document.querySelectorAll('.category-province-list li');
      provinceList.forEach(li => li.style.display = '');
    }

    if (window.combinedFilter && (currentPage === 'home' || currentPage === 'rank')) {
      window.combinedFilter.setCategoryFilters([], []);
      window.combinedFilter.applyCombinedFilters();
    } else if (currentPage === 'favorite') {
      if (onFilterCallback) {
        onFilterCallback(allPlaces);
      }
    } else {
      applyBackendFilter();
    }
  }

  function openOverlay() {
    const overlay = document.getElementById('categoryOverlay');
    if (overlay) {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
    }
  }

  function updatePlaces(places) {
    allPlaces = places || [];
  }

  return {
    init,
    openOverlay,
    updatePlaces,
    clearFilters
  };
})();