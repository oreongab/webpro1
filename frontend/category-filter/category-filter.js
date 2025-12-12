/**
 * Category Filter Module
 * Handles category overlay popup with Place Type and Province filtering
 * Supports both frontend filtering and backend API calls
 */

window.CategoryFilter = (function() {
  let selectedTypes = [];
  let selectedProvinces = [];
  let allPlaces = [];
  let currentPage = 'home'; // 'home', 'rank', or 'favorite'
  let onFilterCallback = null;

  function init(page, places, callback) {
    currentPage = page;
    allPlaces = places || [];
    onFilterCallback = callback;

    console.log('=== CategoryFilter.init ===');
    console.log('Page:', currentPage);
    console.log('Places count:', allPlaces.length);
    console.log('Sample place:', allPlaces[0]);

    // รอ DOM โหลดเสร็จก่อน setup
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupCategoryPanel();
      });
    } else {
      setupCategoryPanel();
    }
  }

  function setupCategoryPanel() {
    const overlay = document.getElementById('categoryOverlay');
    const closeBtn = overlay?.querySelector('.category-close');
    const applyBtn = overlay?.querySelector('.category-apply');
    const clearBtn = overlay?.querySelector('.category-clear');

    // Close overlay
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      });
    }

    // Click outside to close
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          overlay.setAttribute('aria-hidden', 'true');
        }
      });
    }

    // Apply filters
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        applyFilters();
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
      });
    }

    // Clear filters
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearFilters();
      });
    }

    // Place type checkboxes
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
          console.log('Selected types:', selectedTypes);
        });
      });
    }

    // Province checkboxes
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
          console.log('Selected provinces:', selectedProvinces);
        });
      });
    }

    // Province search
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

  function applyFilters() {
    console.log('=== Apply Filters ===');
    console.log('Current page:', currentPage);
    console.log('Selected types:', selectedTypes);
    console.log('Selected provinces:', selectedProvinces);
    
    // Check if combinedFilter exists and we're on home/rank page
    if (window.combinedFilter && (currentPage === 'home' || currentPage === 'rank')) {
      // Use combinedFilter system
      window.combinedFilter.setCategoryFilters(selectedTypes, selectedProvinces);
      window.combinedFilter.applyCombinedFilters();
    } else if (currentPage === 'favorite') {
      // Frontend filtering for favorites
      applyFrontendFilter();
    } else {
      // Fallback to backend API
      applyBackendFilter();
    }
  }

  function applyFrontendFilter() {
    console.log('=== Frontend Filter ===');
    console.log('All places:', allPlaces.length);
    console.log('Selected types:', selectedTypes);
    console.log('Selected provinces:', selectedProvinces);
    
    if (allPlaces.length === 0) {
      console.error('❌ No places in allPlaces array!');
      if (onFilterCallback) {
        onFilterCallback([]);
      }
      return;
    }
    
    let filtered = [...allPlaces];

    // ถ้าไม่มีการเลือก filter ใดๆ ให้แสดงทั้งหมด
    if (selectedTypes.length === 0 && selectedProvinces.length === 0) {
      console.log('No filters selected, showing all places');
      if (onFilterCallback) {
        onFilterCallback(filtered);
      }
      return;
    }

    // Filter by province
    if (selectedProvinces.length > 0) {
      console.log('Filtering by provinces...');
      filtered = filtered.filter(place => {
        const match = selectedProvinces.includes(place.province);
        if (match) {
          console.log('✓ Province match:', place.title, '-', place.province);
        }
        return match;
      });
      console.log('After province filter:', filtered.length, 'places');
    }

    // Filter by place type (categories)
    if (selectedTypes.length > 0) {
      console.log('Filtering by categories...');
      console.log('Selected types to match:', selectedTypes);
      
      filtered = filtered.filter(place => {
        console.log(`Checking place: "${place.title}"`);
        console.log(`  Categories:`, place.categories);
        console.log(`  Is array:`, Array.isArray(place.categories));
        
        if (!place.categories || !Array.isArray(place.categories) || place.categories.length === 0) {
          console.log(`  ❌ No valid categories for: ${place.title}`);
          return false;
        }
        
        // Check if any selected type matches any of the place's categories
        const hasMatch = selectedTypes.some(selectedType => {
          const found = place.categories.some(placeCategory => {
            // Case-insensitive comparison and trim whitespace
            const match = placeCategory.trim().toLowerCase() === selectedType.trim().toLowerCase();
            if (match) {
              console.log(`    ✓ Match found: "${selectedType}" === "${placeCategory}"`);
            }
            return match;
          });
          return found;
        });
        
        if (hasMatch) {
          console.log(`  ✅ Category match for: ${place.title}`);
        } else {
          console.log(`  ❌ No category match for: ${place.title}`);
        }
        
        return hasMatch;
      });
      
      console.log('After category filter:', filtered.length, 'places');
    }

    console.log('=== Filter Complete ===');
    console.log('Final filtered count:', filtered.length);
    
    // Call the callback with filtered results
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
      
      // Call the callback with backend results
      if (onFilterCallback) {
        onFilterCallback(data.data || data.places || data);
      }
    } catch (error) {
      console.error('Error applying backend filter:', error);
      alert('Failed to apply filters. Please try again.');
    }
  }

  function clearFilters() {
    console.log('=== Clearing Filters ===');
    selectedTypes = [];
    selectedProvinces = [];

    // Uncheck all checkboxes
    const allCheckboxes = document.querySelectorAll('.category-list input[type="checkbox"]');
    allCheckboxes.forEach(cb => cb.checked = false);

    // Clear search
    const searchInput = document.getElementById('provinceSearch');
    if (searchInput) {
      searchInput.value = '';
      const provinceList = document.querySelectorAll('.category-province-list li');
      provinceList.forEach(li => li.style.display = '');
    }

    // If using combinedFilter, clear and reapply
    if (window.combinedFilter && (currentPage === 'home' || currentPage === 'rank')) {
      window.combinedFilter.setCategoryFilters([], []);
      window.combinedFilter.applyCombinedFilters();
    } else if (currentPage === 'favorite') {
      // For favorites, show all places
      console.log('Showing all favorites:', allPlaces.length);
      if (onFilterCallback) {
        onFilterCallback(allPlaces);
      }
    } else {
      // Fallback to reload all
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
    console.log('=== CategoryFilter.updatePlaces ===');
    console.log('Received places:', places?.length);
    if (places && places.length > 0) {
      console.log('Sample place:', places[0]);
      console.log('Sample categories:', places[0]?.categories);
    }
    allPlaces = places || [];
    console.log('allPlaces updated to:', allPlaces.length);
  }

  // Public API
  return {
    init,
    openOverlay,
    updatePlaces,
    clearFilters
  };
})();