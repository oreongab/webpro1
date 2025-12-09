// ========== Favorite Handler (ใช้ร่วมกันได้ทุกหน้า) ==========

// ดึง user_id จาก localStorage
function getCurrentUserId() {
  const userStr = localStorage.getItem('loggedInUser');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user.user_id;
  } catch (e) {
    console.error('Parse user error:', e);
    return null;
  }
}

// เพิ่ม favorite
async function addToFavorites(placeId) {
  const userId = getCurrentUserId();
  if (!userId) {
    alert('กรุณาล็อกอินก่อนเพิ่มในรายการโปรด');
    return false;
  }

  try {
    const response = await fetch('http://localhost:3000/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, place_id: placeId })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✓ Added to favorites:', placeId);
      return true;
    } else {
      console.warn('Add favorite failed:', result.message);
      if (result.message === 'Already in favorites') {
        return true; // ถือว่าสำเร็จเพราะมีอยู่แล้ว
      }
      return false;
    }
  } catch (error) {
    console.error('Add favorite error:', error);
    return false;
  }
}

// ลบ favorite
async function removeFromFavorites(placeId) {
  const userId = getCurrentUserId();
  if (!userId) {
    alert('กรุณาล็อกอินก่อน');
    return false;
  }

  try {
    const response = await fetch(`http://localhost:3000/favorites/${userId}/${placeId}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✓ Removed from favorites:', placeId);
      return true;
    } else {
      console.warn('Remove favorite failed:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Remove favorite error:', error);
    return false;
  }
}

// เช็คว่า place นี้อยู่ใน favorite หรือไม่
async function checkIsFavorite(placeId) {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const response = await fetch(`http://localhost:3000/favorites/${userId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data.some(fav => fav.place_id == placeId);
    }
    return false;
  } catch (error) {
    console.error('Check favorite error:', error);
    return false;
  }
}

// Toggle favorite (เพิ่ม/ลบ) - ใช้กับปุ่มหัวใจ
async function toggleFavorite(placeId, heartButton) {
  const isActive = heartButton.classList.contains('is-active');
  
  if (isActive) {
    // ลบออก
    const success = await removeFromFavorites(placeId);
    if (success) {
      heartButton.classList.remove('is-active');
      const icon = heartButton.querySelector('.material-icons');
      if (icon) icon.textContent = 'favorite_border';
    }
  } else {
    // เพิ่ม
    const success = await addToFavorites(placeId);
    if (success) {
      heartButton.classList.add('is-active');
      const icon = heartButton.querySelector('.material-icons');
      if (icon) icon.textContent = 'favorite';
    }
  }
}

// โหลดสถานะ favorite ทั้งหมดของ user (เรียกตอน page load)
async function loadFavoriteStates() {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const response = await fetch(`http://localhost:3000/favorites/${userId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // เก็บ place_id ทั้งหมดที่เป็น favorite
      window.userFavorites = result.data.map(fav => fav.place_id);
      
      // อัปเดต UI ปุ่มหัวใจทั้งหมดในหน้า
      updateAllHeartButtons();
    }
  } catch (error) {
    console.error('Load favorite states error:', error);
  }
}

// อัปเดตปุ่มหัวใจทั้งหมดในหน้า
function updateAllHeartButtons() {
  const cards = document.querySelectorAll('.place-card');
  
  cards.forEach(card => {
    const placeId = card.dataset.id;
    const heartBtn = card.querySelector('.card-fav-btn');
    
    if (heartBtn && placeId && window.userFavorites) {
      const isFavorite = window.userFavorites.includes(parseInt(placeId));
      const icon = heartBtn.querySelector('.material-icons');
      
      if (isFavorite) {
        heartBtn.classList.add('is-active');
        if (icon) icon.textContent = 'favorite';
      } else {
        heartBtn.classList.remove('is-active');
        if (icon) icon.textContent = 'favorite_border';
      }
    }
  });
}

// Export functions
window.favoriteHandler = {
  getCurrentUserId,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  toggleFavorite,
  loadFavoriteStates,
  updateAllHeartButtons
};
