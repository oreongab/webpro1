// ดึงข้อมูลสถานที่จาก backend
async function fetchPlaceDetail(placeId) {
  try {
    const response = await fetch(`http://localhost:3000/places/${placeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching place detail:', error);
    return null;
  }
}

// สร้างดาว
function buildStars(rating) {
  if (!rating) return '';
  const fullStars = Math.round(rating);
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

// แสดงข้อมูลบนหน้า
function displayPlaceDetail(place) {
  // รูป
  const detailImage = document.getElementById('detail-image');
  if (detailImage && place.image_path) {
    const fileName = place.image_path.includes('/') || place.image_path.includes('\\')
      ? place.image_path.split(/[/\\]/).pop()
      : place.image_path;
    detailImage.src = `../../img_place/${fileName}`;
    detailImage.alt = place.place_name;
  }

  // ชื่อสถานที่
  const detailTitle = document.getElementById('detail-title');
  if (detailTitle) {
    detailTitle.textContent = place.place_name || 'ไม่ระบุชื่อ';
  }

  // เวลาเปิด
  const detailOpening = document.getElementById('detail-opening');
  if (detailOpening) {
    detailOpening.textContent = place.opening_hours || 'ไม่ระบุเวลา';
  }

  // ที่ตั้ง
  const detailAddress = document.getElementById('detail-address');
  const detailProvince = document.getElementById('detail-province');
  
  if (detailAddress) {
    detailAddress.textContent = place.place_address || '';
  }
  if (detailProvince) {
    detailProvince.textContent = place.place_province || '';
  }

  // คะแนน
  const detailRatingLabel = document.getElementById('detail-rating-label');
  const detailStars = document.getElementById('detail-stars');
  const detailRatingScore = document.getElementById('detail-rating-score');
  
  if (place.place_score) {
    if (detailRatingLabel) detailRatingLabel.textContent = 'Review';
    if (detailStars) detailStars.innerHTML = buildStars(place.place_score);
    if (detailRatingScore) detailRatingScore.textContent = place.place_score.toFixed(1);
  } else {
    if (detailRatingLabel) detailRatingLabel.textContent = 'ไม่มีรีวิว';
    if (detailStars) detailStars.innerHTML = '';
    if (detailRatingScore) detailRatingScore.textContent = '';
  }

  // ค่าเข้าชม
  const detailPrice = document.getElementById('detail-price');
  if (detailPrice) {
    detailPrice.textContent = place.starting_price || 'ฟรี';
  }

  // หมวด (ถ้ามี)
  const detailCategory = document.getElementById('detail-category');
  if (detailCategory) {
    detailCategory.textContent = place.category_name || 'ไม่ระบุหมวด';
  }

  // อีเวนท์
  const detailEvent = document.getElementById('detail-event');
  if (detailEvent) {
    detailEvent.textContent = place.place_event || 'ไม่มีอีเวนท์';
  }

  // แสดง content
  const content = document.querySelector('.place-detail-content');
  if (content) {
    content.style.display = 'block';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // ดึง place_id จาก URL parameter
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

  // ปุ่มหัวใจ (จะเห็นก็ต่อเมื่อมีข้อมูลและตัว content โผล่)
  const favBtn = document.querySelector(".place-detail-fav");
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      favBtn.classList.toggle("is-active");

      const icon = favBtn.querySelector(".material-icons");
      if (icon) {
        icon.textContent = favBtn.classList.contains("is-active")
          ? "favorite"
          : "favorite_border";
      }
    });
  }

  // ปุ่มย้อนกลับ
  const backBtn = document.querySelector(".place-detail-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
      // หรือถ้าอยาก fix ให้กลับหน้า home:
      // location.href = "../home/home.html";
    });
  }
});