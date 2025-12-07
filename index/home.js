// ========== เมนูมือถือ (สามขีด) ==========
function setupMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".mobile-menu-close");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.add("open");
  });

  closeBtn?.addEventListener("click", () => {
    menu.classList.remove("open");
  });

  menu.addEventListener("click", (e) => {
    const link = e.target.closest(".mobile-link");
    if (link) {
      menu.classList.remove("open");
    }
  });
}

// ========== avatar click ==========
function setupAvatarClick() {
  const avatarBtns = document.querySelectorAll(".avatar-btn");
  avatarBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Profile button clicked");
    });
  });
}

// ========== active state nav ==========
function setupNavActive() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  const mobileLinks = document.querySelectorAll(".mobile-link");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // ปล่อยให้ link ทำงานตามปกติ (scroll / เปลี่ยนหน้า) ถ้าต้องการ
      e.preventDefault();
      mobileLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

// ========== chips ==========
function setupChipActive() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
}

// ========== ดาว ==========
function buildStars(rating) {
  if (rating == null) return "";
  const full = Math.round(rating);
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += i < full ? "★" : "☆";
  }
  return html;
}

// ========== renderPlaceCards (รอข้อมูลหลังบ้าน) ==========
function renderPlaceCards(places) {
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");

  if (!grid || !tpl) return;

  grid.innerHTML = "";

  if (!Array.isArray(places) || places.length === 0) {
    grid.style.display = "none";
    return;
  }

  grid.style.display = "grid";

  places.forEach((p, index) => {
    const node = tpl.content.firstElementChild.cloneNode(true);

    node.dataset.id = p.id ?? index + 1;

    const rankEl = node.querySelector(".card-rank-number");
    if (rankEl) rankEl.textContent = p.rank ?? index + 1;

    const imgEl = node.querySelector(".card-image");
    if (imgEl) {
      imgEl.src = p.imageUrl || "image1.png";
      imgEl.alt = p.title || "";
    }

    const dayEl = node.querySelector(".card-open-days");
    const hourEl = node.querySelector(".card-open-hours");
    if (dayEl) dayEl.textContent = p.openDays || "";
    if (hourEl) hourEl.textContent = p.openHours || "";

    const starEl = node.querySelector(".card-stars");
    const rateEl = node.querySelector(".card-rating");
    if (starEl && p.rating != null) starEl.textContent = buildStars(p.rating);
    if (rateEl && p.rating != null) rateEl.textContent = p.rating.toFixed(1);

    const titleEl = node.querySelector(".card-title");
    if (titleEl) titleEl.textContent = p.title || "";

    grid.appendChild(node);
  });
}

// เปิดให้หลังบ้านใช้
window.renderPlaceCards = renderPlaceCards;

// ========== toggle หัวใจ ==========
function setupFavoriteToggle() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".card-fav-btn");
    if (!btn) return;

    btn.classList.toggle("is-fav");
    const icon = btn.querySelector(".material-icons");
    if (icon) {
      icon.textContent = btn.classList.contains("is-fav")
        ? "favorite"
        : "favorite_border";
    }
  });
}

// ========== ปุ่ม Category (filter) ==========
function setupCategoryButton() {
  const btn = document.getElementById("categoryBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    console.log("Category button clicked (ไว้เปิด popup filter)");
  });
}



// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupAvatarClick();
  setupNavActive();
  setupChipActive();
  setupFavoriteToggle();
  setupCategoryButton();
  setupAuthButtons();

  // ตัวอย่างทดสอบ template (ลบออกได้)
  // window.renderPlaceCards([
  //   { id: 1, title: "Example Place", rating: 4.8, imageUrl: "image1.png", openDays: "Mon-Sun", openHours: "09:00 - 18:00", rank: 1 }
  // ]);
});