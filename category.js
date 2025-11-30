
let selectedFilters = {
    placeTypes: [],
    provinces: []
};
let currentTab = 'placeType';

function createCategoryPopupHTML() {
    return `
    <div class="popup-overlay"></div>
    <div class="popup-container">
        <div class="popup-header">
            <button class="tab active">Place Type</button>
            <button class="tab">Province</button>
        </div>

        <div class="popup-content">
            <div class="filter-column" id="placeTypeColumn">
                <div class="checkbox-item">
                    <input type="checkbox" id="art">
                    <label for="art">Art</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="beaches">
                    <label for="beaches">Beaches</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="cafes">
                    <label for="cafes">Cafés & Restaurants</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="historical">
                    <label for="historical">Historical Attractions</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="markets">
                    <label for="markets">Markets</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="museums">
                    <label for="museums">Museums</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="mall">
                    <label for="mall">Mall</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="natural">
                    <label for="natural">Natural</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="parks">
                    <label for="parks">Parks & Gardens</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="temple">
                    <label for="temple">Temple</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="sports">
                    <label for="sports">Sports</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="other">
                    <label for="other">Other</label>
                </div>
            </div>

            <div class="filter-column" id="provinceColumn" style="display: none;">
                <div class="search-wrapper">
                    <input type="text" id="provinceSearch" class="search-box" placeholder="Search...">
                    <span class="material-icons">search</span>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="amnat">
                    <label for="amnat">Amnat Charoen</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="buriram">
                    <label for="buriram">Buriram</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="chiangmai">
                    <label for="chiangmai">Chiang Mai</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="kanchanaburi">
                    <label for="kanchanaburi">Kanchanaburi</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="lampang">
                    <label for="lampang">Lampang</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="maehongson">
                    <label for="maehongson">Mae Hong Son</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="nakhonpathom">
                    <label for="nakhonpathom">Nakhon Pathom</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="pathumthani">
                    <label for="pathumthani">Pathum Thani</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="phuket">
                    <label for="phuket">Phuket</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="ratchaburi">
                    <label for="ratchaburi">Ratchaburi</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="samutprakan">
                    <label for="samutprakan">Samut Prakan</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="saraburi">
                    <label for="saraburi">Sara Buri</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="bangkok">
                    <label for="bangkok">Bangkok</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="phrasi">
                    <label for="phrasi">Phra Nakhon Si Ayutthaya</label>
                </div>
            </div>
        </div>

        <div class="popup-footer">
            <button class="btn btn-clear">Clear</button>
            <button class="btn btn-apply">Apply</button>
        </div>
    </div>
    `;
}

function loadCategoryPopup() {
    const existing = document.querySelector('.popup-container');
    if (existing) {
        openCategoryPopup();
        return;
    }
    
    const html = createCategoryPopupHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    document.body.appendChild(tempDiv.querySelector('.popup-overlay'));
    document.body.appendChild(tempDiv.querySelector('.popup-container'));
    
    initPopupEvents();
    openCategoryPopup();
}

function openCategoryPopup() {
    const overlay = document.querySelector('.popup-overlay');
    const container = document.querySelector('.popup-container');
    if (overlay) overlay.classList.add('active');
    if (container) container.classList.add('active');
}

function closeCategoryPopup() {
    const overlay = document.querySelector('.popup-overlay');
    const container = document.querySelector('.popup-container');
    if (overlay) overlay.classList.remove('active');
    if (container) container.classList.remove('active');
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    const placeTypeCol = document.getElementById('placeTypeColumn');
    const provinceCol = document.getElementById('provinceColumn');
    
    currentTab = tabName;
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (tabName === 'placeType') {
        tabs[0].classList.add('active');
        placeTypeCol.style.display = 'block';
        provinceCol.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        placeTypeCol.style.display = 'none';
        provinceCol.style.display = 'block';
    }
}

function filterProvinces() {
    const searchInput = document.getElementById('provinceSearch');
    const filter = searchInput.value.toLowerCase();
    const checkboxItems = document.querySelectorAll('#provinceColumn .checkbox-item');
    
    checkboxItems.forEach(item => {
        const label = item.querySelector('label');
        const text = label.textContent.toLowerCase();
        item.style.display = text.includes(filter) ? 'flex' : 'none';
    });
}

function clearFilters() {
    document.querySelectorAll('.popup-container input[type="checkbox"]').forEach(cb => cb.checked = false);
    const searchInput = document.getElementById('provinceSearch');
    if (searchInput) {
        searchInput.value = '';
        filterProvinces();
    }
}

function applyFilters() {
    selectedFilters.placeTypes = [];
    selectedFilters.provinces = [];
    
    document.querySelectorAll('#placeTypeColumn input[type="checkbox"]:checked').forEach(cb => {
        selectedFilters.placeTypes.push(cb.id);
    });
    
    document.querySelectorAll('#provinceColumn input[type="checkbox"]:checked').forEach(cb => {
        selectedFilters.provinces.push(cb.id);
    });
    
    console.log('Selected Filters:', selectedFilters);
    closeCategoryPopup();
}

function initPopupEvents() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => switchTab(index === 0 ? 'placeType' : 'province'));
    });
    
    const clearBtn = document.querySelector('.btn-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    
    const applyBtn = document.querySelector('.btn-apply');
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) overlay.addEventListener('click', closeCategoryPopup);
    
    const searchInput = document.getElementById('provinceSearch');
    if (searchInput) searchInput.addEventListener('keyup', filterProvinces);
}

document.addEventListener('DOMContentLoaded', function() {
    const categoryLink = document.querySelector('#categoryLink');
    if (categoryLink) {
        categoryLink.addEventListener('click', function(e) {
            e.preventDefault();
            loadCategoryPopup();
        });
    }
});
