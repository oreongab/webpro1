

let rankingPlaces = [
    {
        rank: 1,
        id: 1,
        name: 'กิ่วแม่ปาน',
        image_url: 'https://static.thairath.co.th/media/Dtbezn3nNUxytg04aveWoepodnwuliOMyHRAfwOCZ3tpDh.jpg',
        location: 'กิ่วแม่ปาน',
        rating: 5.0,
        reviews: 2543,
        category: 'Natural'
    },
    {
        rank: 2,
        id: 2,
        name: 'เกาะราชา',
        image_url: 'https://www.ananda.co.th/blog/thegenc/wp-content/uploads/2024/03/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-2024-05-23T123623.816.png',
        location: 'เกาะนางยวน',
        rating: 4.9,
        reviews: 2134,
        category: 'Beaches'
    },
    {
        rank: 3,
        id: 3,
        name: 'ภูชี้ฟ้า',
        image_url: 'https://www.ananda.co.th/blog/thegenc/wp-content/uploads/2024/03/934-x-550-px-26.png',
        location: 'วัดอรุณราชวราราม',
        rating: 4.9,
        reviews: 1987,
        category: 'Natural'
    },
    {
        rank: 4,
        id: 4,
        name: 'น้ำตกทีลอซู',
        image_url: 'https://www.ananda.co.th/blog/thegenc/wp-content/uploads/2024/03/934-x-550-px-27.png',
        location: 'ประชาคาเฟ่',
        rating: 4.8,
        reviews: 1756,
        category: 'Natural'
    },
    {
        rank: 5,
        id: 5,
        name: 'ภูลมโล',
        image_url: 'https://www.ananda.co.th/blog/thegenc/wp-content/uploads/2024/03/%E0%B8%94%E0%B8%B5%E0%B9%84%E0%B8%8B%E0%B8%99%E0%B9%8C%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%B1%E0%B8%87%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD-2024-05-23T130104.313.png',
        location: 'ถลางน้ำตก',
        rating: 4.8,
        reviews: 1632,
        category: 'Natural'
    }
];

let currentFilter = 'all';



function loadRankings() {
    const rankContainer = document.getElementById('rankContainer');
    
    if (!rankContainer) return;

    
    rankContainer.innerHTML = '<div class="loading">กำลังโหลดอันดับ...</div>';
    
    
    setTimeout(() => {
        displayRankings();
    }, 500);
}



function displayRankings() {
    const rankContainer = document.getElementById('rankContainer');
    
    
    let filteredPlaces = rankingPlaces;
    
    if (currentFilter !== 'all') {
        filteredPlaces = rankingPlaces.filter(place => 
            place.category === currentFilter
        );
    }
    
    
    let html = '<div class="rank-list">';
    
    filteredPlaces.forEach(place => {
        const medalClass = place.rank <= 3 ? `medal-${place.rank}` : '';
        const medalEmoji = place.rank === 1 ? '🥇' : place.rank === 2 ? '🥈' : place.rank === 3 ? '🥉' : '';
        
        html += `
            <div class="rank-item ${medalClass}" onclick="goToPlace(${place.id})">
                <div class="rank-number">
                    ${medalEmoji || place.rank}
                </div>
                <div class="rank-image">
                    <img src="${place.image_url}" alt="${place.name}">
                </div>
                <div class="rank-info">
                    <h3 class="rank-name">${place.name}</h3>
                    <div class="rank-location">📍 ${place.location}</div>
                    <div class="rank-rating">
                        <div class="stars">
                            ${generateStars(place.rating)}
                        </div>
                        <span class="rating-num">${place.rating.toFixed(1)}</span>
                        <span class="review-count">(${formatNumber(place.reviews)} รีวิว)</span>
                    </div>
                </div>
                <div class="rank-arrow">›</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    rankContainer.className = '';
    rankContainer.innerHTML = html;
}



function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<span class="star">★</span>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        } else {
            starsHTML += '<span class="star empty">★</span>';
        }
    }
    
    return starsHTML;
}



function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function filterRankings(category) {
    currentFilter = category;
    
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
   
    displayRankings();
}



function goToHome() {
    window.location.href = 'deskmain.html';
}

function goToPlace(placeId) {
    window.location.href = `place.html?id=${placeId}`;
}

document.addEventListener('DOMContentLoaded', function() {
    loadRankings();
    
  
    const rankLink = document.querySelector('a[href="#rank"]');
    if (rankLink) {
        rankLink.classList.add('active');
    }
});