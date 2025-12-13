const getCurrentUserId = () => {
  const userStr = localStorage.getItem('loggedInUser');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr).user_id;
  } catch (e) {
    console.error('Parse user error:', e);
    return null;
  }
};

const addToFavorites = async (placeId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    alert('กรุณาล็อกอินก่อน');
    return false;
  }

  try {
    const res = await fetch('http://localhost:3000/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, place_id: placeId })
    });

    const result = await res.json();
    return result.success || result.message === 'Place already in favorites';
  } catch (error) {
    console.error('Add favorite error:', error);
    return false;
  }
};

const removeFromFavorites = async (placeId) => {
  const userId = getCurrentUserId();
  if (!userId) {
    alert('กรุณาล็อกอินก่อน');
    return false;
  }

  try {
    const res = await fetch(`http://localhost:3000/favorites/${userId}/${placeId}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    return result.success;
  } catch (error) {
    console.error('Remove favorite error:', error);
    return false;
  }
};

const checkIsFavorite = async (placeId) => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const res = await fetch(`http://localhost:3000/favorites/${userId}`);
    const result = await res.json();
    return result.success && result.data.some(fav => fav.place_id == placeId);
  } catch (error) {
    console.error('Check favorite error:', error);
    return false;
  }
};

const toggleFavorite = async (placeId, heartButton) => {
  const isActive = heartButton.classList.contains('is-active');
  const icon = heartButton.querySelector('.material-icons');
  
  const success = isActive ? await removeFromFavorites(placeId) : await addToFavorites(placeId);
  
  if (success) {
    heartButton.classList.toggle('is-active');
    if (icon) icon.textContent = isActive ? 'favorite_border' : 'favorite';
  }
};

const loadFavoriteStates = async () => {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const res = await fetch(`http://localhost:3000/favorites/${userId}`);
    const result = await res.json();
    
    if (result.success && result.data) {
      window.userFavorites = result.data.map(fav => fav.place_id);
      updateAllHeartButtons();
    } else {
      window.userFavorites = [];
    }
  } catch (error) {
    console.error('Load favorite error:', error);
    window.userFavorites = [];
  }
};

const updateAllHeartButtons = () => {
  const favs = Array.isArray(window.userFavorites) ? window.userFavorites : [];
  document.querySelectorAll('.place-card').forEach(card => {
    const placeId = card.dataset.id;
    const heartBtn = card.querySelector('.card-fav-btn');
    const icon = heartBtn?.querySelector('.material-icons');
    
    if (heartBtn && placeId) {
      const isFav = favs.some(id => parseInt(id, 10) === parseInt(placeId, 10));
      
      if (isFav) {
        heartBtn.classList.add('is-active');
        if (icon) icon.textContent = 'favorite';
      } else {
        heartBtn.classList.remove('is-active');
        if (icon) icon.textContent = 'favorite_border';
      }
    }
  });
};

window.favoriteHandler = {
  getCurrentUserId,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  toggleFavorite,
  loadFavoriteStates,
  updateAllHeartButtons
};
