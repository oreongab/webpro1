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
  const detailImage = document.getElementById('detail-image');
  if (detailImage) {
    let imagePath = getDefaultImageUrl();

    if (place.images && Array.isArray(place.images) && place.images.length > 0) {
      const firstImage = place.images[0];
      const fileName = getFileName(firstImage);
      imagePath = `../../img_place/${fileName}`;
    }
    
    detailImage.src = imagePath;
    detailImage.alt = place.place_name || '';
    detailImage.onerror = function() {
      this.onerror = null;
      this.src = getDefaultImageUrl();
    };
  }

  const detailTitle = document.getElementById('detail-title');
  if (detailTitle) {
    detailTitle.textContent = place.place_name || 'ไม่ระบุชื่อ';
  }

  const detailOpening = document.getElementById('detail-opening');
  if (detailOpening) {
    detailOpening.textContent = place.opening_hours || 'ไม่ระบุเวลา';
  }

  const detailAddress = document.getElementById('detail-address');
  const detailProvince = document.getElementById('detail-province');
  
  if (detailAddress) {
    detailAddress.textContent = place.place_address || '';
  }
  if (detailProvince) {
    detailProvince.textContent = place.place_province || '';
  }

  const detailRatingLabel = document.getElementById('detail-rating-label');
  const detailStars = document.getElementById('detail-stars');
  const detailRatingScore = document.getElementById('detail-rating-score');

  const rating = place.place_score ? parseFloat(place.place_score) : 0;
  
  if (rating > 0) {
    if (detailRatingLabel) detailRatingLabel.textContent = 'Review';
    if (detailStars) detailStars.innerHTML = buildStars(rating);
    if (detailRatingScore) detailRatingScore.textContent = rating.toFixed(1);
  } else {
    if (detailRatingLabel) detailRatingLabel.textContent = 'ไม่มีรีวิว';
    if (detailStars) detailStars.innerHTML = '';
    if (detailRatingScore) detailRatingScore.textContent = '';
  }

  const detailPrice = document.getElementById('detail-price');
  if (detailPrice) {
    const price = place.starting_price ? parseFloat(place.starting_price) : 0;
    detailPrice.textContent = price > 0 ? `${price} บาท` : 'ฟรี';
  }

  const detailCategory = document.getElementById('detail-category');
  if (detailCategory) {
    detailCategory.textContent = place.categories || 'ไม่ระบุหมวด';
  }

  const detailEvent = document.getElementById('detail-event');
  if (detailEvent) {
    detailEvent.textContent = place.place_event || 'ไม่มีอีเวนท์';
  }

  const content = document.querySelector('.place-detail-content');
  if (content) {
    content.style.display = 'block';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
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

  const favBtn = document.querySelector(".place-detail-fav");
  if (favBtn && placeId) {
    if (window.favoriteHandler) {
      const isFav = await window.favoriteHandler.checkIsFavorite(placeId);
      if (isFav) {
        favBtn.classList.add('is-active');
        const icon = favBtn.querySelector('.material-icons');
        if (icon) icon.textContent = 'favorite';
      }
    }

    favBtn.addEventListener("click", async () => {
      if (window.favoriteHandler) {
        await window.favoriteHandler.toggleFavorite(placeId, favBtn);
      } else {
        favBtn.classList.toggle("is-active");
        const icon = favBtn.querySelector(".material-icons");
        if (icon) {
          icon.textContent = favBtn.classList.contains("is-active")
            ? "favorite"
            : "favorite_border";
        }
      }
    });
  }
});