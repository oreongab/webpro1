// ========== Navigation Handler (ใช้ร่วมกันทุกหน้า) ==========

// กำหนด path ของแต่ละหน้า
const NAV_PATHS = {
  home: '../home/home.html',
  rank: '../rank/rank.html',
  category: '../home/home.html', // เปิด category overlay ในหน้า home
  favorites: '../favorite/favorite.html',
  profile: '../user1/user-profile.html',
  login: '../login/login.html',
  signup: '../signup/signup.html',
  place: '../place/place-detail.html'
};

// ฟังก์ชันสำหรับนำทาง
function navigateTo(page, options = {}) {
  let path = NAV_PATHS[page];
  
  if (!path) {
    console.warn(`Page "${page}" not found in navigation paths`);
    return;
  }
  
  // เพิ่ม query parameters ถ้ามี
  if (options.id) {
    path += `?id=${options.id}`;
  }
  
  // ถ้าเป็น category ให้เปิด overlay แทน
  if (page === 'category') {
    const categoryOverlay = document.getElementById('categoryOverlay');
    if (categoryOverlay) {
      categoryOverlay.classList.add('open');
      return;
    }
  }
  
  window.location.href = path;
}

// Setup navigation links ในหน้า
function setupNavigation() {
  // Desktop nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const text = link.textContent.trim().toLowerCase();
      let page = text;
      
      // แปลงข้อความเป็น key
      if (text === 'home' || text === 'หน้าแรก') page = 'home';
      else if (text === 'rank' || text === 'อันดับ') page = 'rank';
      else if (text === 'category' || text === 'หมวดหมู่') page = 'category';
      else if (text === 'favorites' || text === 'รายการโปรด') page = 'favorites';
      
      navigateTo(page);
    });
  });
  
  // Mobile menu links
  const mobileLinks = document.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const text = link.textContent.trim().toLowerCase();
      let page = text;
      
      // แปลงข้อความเป็น key
      if (text === 'home' || text === 'หน้าแรก') page = 'home';
      else if (text === 'rank' || text === 'อันดับ') page = 'rank';
      else if (text === 'category' || text === 'หมวดหมู่') page = 'category';
      else if (text === 'favorites' || text === 'รายการโปรด') page = 'favorites';
      
      // ปิด mobile menu
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
      }
      
      navigateTo(page);
    });
  });
  
  // Avatar buttons -> Profile
  const avatarBtns = document.querySelectorAll('.avatar-btn');
  avatarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // เช็คว่า login หรือยัง
      const userStr = localStorage.getItem('loggedInUser');
      if (userStr) {
        navigateTo('profile');
      } else {
        navigateTo('login');
      }
    });
  });
  
  // Back buttons
  const backBtns = document.querySelectorAll('.place-detail-back, .fav-back');
  backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // ลองใช้ history.back() ก่อน ถ้าไม่มี history ให้กลับ home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigateTo('home');
      }
    });
  });
}

// ตั้งค่า active state ให้ nav link ตามหน้าปัจจุบัน
function setActiveNavLink() {
  const currentPage = window.location.pathname;
  
  // หา nav link ที่ตรงกับหน้าปัจจุบัน
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      const text = link.textContent.trim().toLowerCase();
      
      if ((text === 'home' || text === 'หน้าแรก') && currentPage.includes('/home/')) {
        link.classList.add('active');
      } else if ((text === 'rank' || text === 'อันดับ') && currentPage.includes('/rank/')) {
        link.classList.add('active');
      } else if ((text === 'favorites' || text === 'รายการโปรด') && currentPage.includes('/favorite/')) {
        link.classList.add('active');
      }
    }
  });
}

// ========== Avatar Display Functions ==========
function updateAvatarDisplay() {
  const userStr = localStorage.getItem('loggedInUser');
  const savedAvatar = localStorage.getItem('userAvatar');
  
  // ดึง avatar circles ทั้งหมดในหน้า
  const avatarCircles = document.querySelectorAll('.avatar-circle');
  
  avatarCircles.forEach(circle => {
    // ลบรูปเก่าออกก่อน (ถ้ามี)
    const existingImg = circle.querySelector('img.avatar-img');
    if (existingImg) {
      existingImg.remove();
    }
    
    const icon = circle.querySelector('.material-icons');
    
    if (savedAvatar && userStr) {
      // มีรูป avatar -> แสดงรูป
      if (icon) icon.style.display = 'none';
      
      const img = document.createElement('img');
      img.src = savedAvatar;
      img.alt = 'User Avatar';
      img.className = 'avatar-img';
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
      circle.appendChild(img);
    } else {
      // ไม่มีรูป -> แสดง icon
      if (icon) icon.style.display = 'block';
    }
  });
  
  // อัปเดตชื่อผู้ใช้ใน mobile menu (ถ้ามี)
  const usernameEl = document.querySelector('.mobile-menu .username');
  if (usernameEl && userStr) {
    try {
      const user = JSON.parse(userStr);
      usernameEl.textContent = user.user_name || 'Guest';
    } catch (e) {
      usernameEl.textContent = 'Guest';
    }
  }
}

// Export functions
window.navigation = {
  navigateTo,
  setupNavigation,
  setActiveNavLink,
  updateAvatarDisplay,
  NAV_PATHS
};

// Auto-setup เมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setActiveNavLink();
  updateAvatarDisplay();
});

// อัปเดต avatar เมื่อมีการเปลี่ยนแปลง localStorage
window.addEventListener('storage', (e) => {
  if (e.key === 'userAvatar' || e.key === 'loggedInUser') {
    updateAvatarDisplay();
  }
});