
let favoritePlaces = [
    {
        id: 1,
        name: 'กิ่วแม่ปาน',
        image_url: 'https://static.thairath.co.th/media/Dtbezn3nNUxytg04aveWoepodnwuliOMyHRAfwOCZ3tpDh.jpg',
        opening_hours: 'วันอาทิตย์ - วันเสาร์<br>10:00 น. - 17:00 น.',
        location: 'กิ่วแม่ปาน',
        rating: 5.0,
        category: 'Natural'
    },
    {
        id: 3,
        name: 'ภูชี้ฟ้า',
        image_url: 'https://www.ananda.co.th/blog/thegenc/wp-content/uploads/2024/03/934-x-550-px-26.png',
        opening_hours: 'วันอาทิตย์ - วันเสาร์<br>06:00 น. - 18:00 น.',
        location: 'วัดอรุณราชวราราม',
        rating: 5.0,
        category: 'Natural'
    }
];

let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 8;



function loadFavorites() {
    const placeContainer = document.getElementById('placeContainer');
    
    if (!placeContainer) return;
    
    // แสดง loading
    placeContainer.innerHTML = '<div class="loading">กำลังโหลดรายการโปรด...</div>';
    
    // จำลองการโหลดข้อมูล
    setTimeout(() => {
        if (favoritePlaces.length === 0) {
            showEmptyState();
        } else {
            displayFavorites();
        }
    }, 500);
}



function displayFavorites() {
    const placeContainer = document.getElementById('placeContainer');
    
    // กรองตามหมวดหมู่
    let filteredPlaces = favoritePlaces;
    
    if (currentCategory !== 'all') {
        filteredPlaces = favoritePlaces.filter(place => 
            place.category === currentCategory
        );
    }
    
    // คำนวณ pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPlaces = filteredPlaces.slice(startIndex, endIndex);
    
    // สร้าง HTML
    let html = '<div class="place">';
    
    paginatedPlaces.forEach(place => {
        html += `
            <div id="place${place.id}" onclick="goToPlace(${place.id})">
                <img src="${place.image_url}" alt="${place.name}">
                <span class="material-icons favorite-icon" onclick="removeFavorite(event, ${place.id})">favorite</span>
                <div class="place-info">
                    <div class="time">${place.opening_hours}</div>
                    <div class="rating">
                        <div class="stars">
                            ${generateStars(place.rating)}
                            <span class="ratingnum">${place.rating.toFixed(1)}</span>
                        </div>
                        <div class="location">${place.location}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    placeContainer.className = '';
    placeContainer.innerHTML = html;
    
    // แสดง pagination
    displayPagination(filteredPlaces.length);
}



function generateStars(rating) {
    const fullStars = Math.floor(rating);
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<span>★</span>';
        } else {
            starsHTML += '<span style="color: #ddd;">★</span>';
        }
    }
    
    return starsHTML;
}



function showEmptyState() {
    const placeContainer = document.getElementById('placeContainer');
    
    placeContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">♡</div>
            <div class="empty-state-text">ยังไม่มีรายการโปรด</div>
            <button onclick="goToHome()">ค้นหาสถานที่</button>
        </div>
    `;
    
    // ซ่อน pagination
    document.getElementById('paginationContainer').style.display = 'none';
}



function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // อัพเดท active class
    const categoryButtons = document.querySelectorAll('#cateName button');
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    
    displayFavorites();
}


function scrollCategories(direction) {
    const container = document.getElementById('cateName');
    const scrollAmount = 200;
    
    if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
    } else {
        container.scrollLeft += scrollAmount;
    }
}



function removeFavorite(event, placeId) {
    event.stopPropagation();
    
    if (confirm('ต้องการลบออกจากรายการโปรดหรือไม่?')) {
       
        favoritePlaces = favoritePlaces.filter(place => place.id !== placeId);
       
        if (favoritePlaces.length === 0) {
            showEmptyState();
        } else {
            displayFavorites();
        }
        
        console.log('Removed favorite:', placeId);
    }
}



function displayPagination(totalItems) {
    const paginationContainer = document.getElementById('paginationContainer');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let html = '<span class="material-icons" onclick="goToPreviousPage()">chevron_left</span>';
    
    // แสดงเลขหน้า
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<a href="javascript:void(0)" class="pagenumber ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</a>`;
    }
    
    html += '<span class="material-icons" onclick="goToNextPage()">chevron_right</span>';
    
    paginationContainer.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayFavorites();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPreviousPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(favoritePlaces.length / itemsPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

function goToHome() {
    window.location.href = 'deskmain.html';
}

function goToPlace(placeId) {
    window.location.href = `place.html?id=${placeId}`;
}



document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
    
    
    const favLink = document.querySelector('a[href="#favorites"]');
    if (favLink) {
        favLink.classList.add('active');
    }
});