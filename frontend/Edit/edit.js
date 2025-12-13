function getLoggedInUser() {
  const userStr = localStorage.getItem('loggedInUser');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Parse user error:', e);
    return null;
  }
}

function getCurrentUserId() {
  return getLoggedInUser()?.user_id ?? null;
}

document.querySelectorAll('.back-icon').forEach(btn => {
  btn.addEventListener('click', () => {
    window.history.back();
  });
});

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('passwordInput');

if (togglePassword && passwordInput) {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    const eyeIcon = togglePassword.querySelector('.eye-icon');
    if (type === 'text') {
      eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  });
}

const avatarContainer = document.querySelector('.profile-avatar');
const avatarImg = document.getElementById('profileAvatar');
const avatarInput = document.getElementById('avatarInput');
const changePhotoTrigger = document.getElementById('changePhotoTrigger');

let selectedAvatarFile = null;

const openAvatarPicker = () => avatarInput?.click();

if (changePhotoTrigger) {
  changePhotoTrigger.addEventListener('click', openAvatarPicker);
}
if (avatarContainer) {
  avatarContainer.addEventListener('click', openAvatarPicker);
}

// เมื่อ user เลือกรูปจากเครื่อง
if (avatarInput) {
  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;

    selectedAvatarFile = file;

    const previewUrl = URL.createObjectURL(file);
    avatarImg.src = previewUrl;

    avatarContainer.classList.add('has-image');
  });
}

const form = document.querySelector('.edit-form');

if (form) {
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('Please login first');
      window.location.href = '../login/login.html';
      return;
    }
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const userName = document.getElementById('userName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();

    const updateData = { user_id: userId };
    
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (userName) updateData.user_name = userName;
    if (email) updateData.user_email = email;
    if (password) updateData.user_password = password;

    if (selectedAvatarFile) {
      const reader = new FileReader();
      reader.onloadend = async function() {
        localStorage.setItem(`userAvatar_${userId}`, reader.result);
        
        if (typeof window.navigation?.updateAvatarDisplay === 'function') {
          window.navigation.updateAvatarDisplay();
        }
        
        await saveProfile(updateData, userName);
      };
      reader.readAsDataURL(selectedAvatarFile);
    } else {
      await saveProfile(updateData, userName);
    }
  });
}

async function saveProfile(updateData, userName) {
  try {
    const response = await fetch('http://localhost:3000/users/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Profile updated successfully!');
      
      const user = getLoggedInUser();
      if (user) {
        try {
          if (updateData.user_name) user.user_name = updateData.user_name;
          if (updateData.first_name) user.first_name = updateData.first_name;
          if (updateData.last_name) user.last_name = updateData.last_name;
          if (updateData.user_email) user.user_email = updateData.user_email;
          localStorage.setItem('loggedInUser', JSON.stringify(user));
        } catch (e) {
          console.error('Update localStorage error:', e);
        }
      }
      
      window.location.href = '../user1/user-profile.html';
    } else {
      alert(data.message || 'Failed to update profile');
    }
    
  } catch (error) {
    console.error('Edit profile error:', error);
    alert('Cannot connect to server');
  }
}

async function loadCurrentUserData() {
  const userId = getCurrentUserId();
  
  if (!userId) {
    alert('Please login first');
    window.location.href = '../login/login.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/users/${userId}/edit`);
    
    if (!response.ok) throw new Error('Failed to fetch user data');
    
    const result = await response.json();
    
    const user = result.data || result;
    
    document.getElementById('firstName').value = user.first_name || '';
    document.getElementById('lastName').value = user.last_name || '';
    document.getElementById('userName').value = user.user_name || '';
    document.getElementById('email').value = user.user_email || '';
    
    const savedPassword = localStorage.getItem('currentUserPassword') || '';
    passwordInput.value = savedPassword;
    passwordInput.dataset.isPlaceholder = 'false';
    
    const savedAvatar = localStorage.getItem(`userAvatar_${userId}`) || user.avatar_url;
    if (savedAvatar) {
      avatarImg.src = savedAvatar;
      avatarContainer.classList.add('has-image');
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Failed to load user data');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUserData();
});

function addTouchFeedback(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('touchstart', () => {
      el.classList.add('active-touch');
    }, { passive: true });

    const clear = () => el.classList.remove('active-touch');
    el.addEventListener('touchend', clear, { passive: true });
    el.addEventListener('touchcancel', clear, { passive: true });
  });
}

addTouchFeedback('.back-icon');
addTouchFeedback('.profile-avatar');
addTouchFeedback('.change-photo');
addTouchFeedback('.change-inline');
addTouchFeedback('.save-button button');