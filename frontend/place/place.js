async function fetchPlaceDetail(placeId) {
  try {
    const response = await fetch(`http://localhost:3000/places/${placeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();

    if (result.success && result.data && result.data.place_id) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching place detail:', error);
    return null;
  }
}

function getFileName(path) {
  return String(path || '').split(/[/\\]/).pop();
}

function getDefaultImageUrl() {
  return 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
}

function buildStars(rating) {
  if (!rating) return '';
  const ratingNum = typeof rating === 'number' ? rating : parseFloat(rating);
  const fullStars = Math.round(ratingNum);
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '<span class="material-icons star-icon filled">star</span>';
    } else {
      html += '<span class="material-icons star-icon">star_border</span>';
    }
  }
  return html;
}

function displayPlaceDetail(place) {
  const placeDetailImage = document.getElementById('detail-image');
  const placeDetailTitle = document.getElementById('detail-title');
  const placeDetailOpening = document.getElementById('detail-opening');
  const placeDetailAddress = document.getElementById('detail-address');
  const placeDetailProvince = document.getElementById('detail-province');
  const placeDetailRatingLabel = document.getElementById('detail-rating-label');
  const placeDetailStars = document.getElementById('detail-stars');
  const placeDetailRatingScore = document.getElementById('detail-rating-score');
  const placeDetailPrice = document.getElementById('detail-price');
  const placeDetailCategory = document.getElementById('detail-category');
  const placeDetailEvent = document.getElementById('detail-event');
  const placeDetailContent = document.querySelector('.place-detail-content');
  
  if (placeDetailImage) {
    let imagePath = getDefaultImageUrl();

    if (place.images && Array.isArray(place.images) && place.images.length > 0) {
      const firstImage = place.images[0];
      const fileName = getFileName(firstImage);
      imagePath = `../../img_place/${fileName}`;
    }
    
    placeDetailImage.src = imagePath;
    placeDetailImage.alt = place.place_name || '';
    placeDetailImage.onerror = function() {
      this.onerror = null;
      this.src = getDefaultImageUrl();
    };
  }

  if (placeDetailTitle) {
    placeDetailTitle.textContent = place.place_name || 'ไม่ระบุชื่อ';
  }

  if (placeDetailOpening) {
    placeDetailOpening.textContent = place.opening_hours || 'ไม่ระบุเวลา';
  }
  
  if (placeDetailAddress) {
    placeDetailAddress.textContent = place.place_address || '';
  }
  if (placeDetailProvince) {
    placeDetailProvince.textContent = place.place_province || '';
  }

  const rating = place.place_score ? parseFloat(place.place_score) : 0;
  
  if (rating > 0) {
    if (placeDetailRatingLabel) placeDetailRatingLabel.textContent = 'Review';
    if (placeDetailStars) placeDetailStars.innerHTML = buildStars(rating);
    if (placeDetailRatingScore) placeDetailRatingScore.textContent = rating.toFixed(1);
  } else {
    if (placeDetailRatingLabel) placeDetailRatingLabel.textContent = 'ไม่มีรีวิว';
    if (placeDetailStars) placeDetailStars.innerHTML = '';
    if (placeDetailRatingScore) placeDetailRatingScore.textContent = '';
  }

  if (placeDetailPrice) {
    const price = place.starting_price ? parseFloat(place.starting_price) : 0;
    placeDetailPrice.textContent = price > 0 ? `${price} บาท` : 'ฟรี';
  }

  if (placeDetailCategory) {
    placeDetailCategory.textContent = place.categories || 'ไม่ระบุหมวด';
  }

  if (placeDetailEvent) {
    placeDetailEvent.textContent = place.place_event || 'ไม่มีอีเวนท์';
  }

  if (placeDetailContent) {
    placeDetailContent.style.display = 'block';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const backBtn = document.querySelector('.back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('id');

  if (placeId) {
    const placeData = await fetchPlaceDetail(placeId);
    if (placeData) {
      displayPlaceDetail(placeData);
    } else {
      alert('ไม่พบข้อมูลสถานที่');
      window.history.back();
    }
  } else {
    alert('ไม่มี ID สถานที่');
    window.history.back();
  }

  const placeDetailFavBtn = document.querySelector(".place-detail-fav");
  if (placeDetailFavBtn && placeId) {
    if (window.favoriteHandler) {
      const isFav = await window.favoriteHandler.checkIsFavorite(placeId);
      if (isFav) {
        placeDetailFavBtn.classList.add('is-active');
        const favIcon = placeDetailFavBtn.querySelector('.material-icons');
        if (favIcon) favIcon.textContent = 'favorite';
      }
    }

    placeDetailFavBtn.addEventListener("click", async () => {
      if (window.favoriteHandler) {
        await window.favoriteHandler.toggleFavorite(placeId, placeDetailFavBtn);
      } else {
        placeDetailFavBtn.classList.toggle("is-active");
        const favIcon = placeDetailFavBtn.querySelector(".material-icons");
        if (favIcon) {
          favIcon.textContent = placeDetailFavBtn.classList.contains("is-active")
            ? "favorite"
            : "favorite_border";
        }
      }
    });
  }
});