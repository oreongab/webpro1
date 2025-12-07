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

    // ถ้าชิปที่กดอยู่แล้วเป็น active → กดซ้ำให้เอา active ออก
    if (chip.classList.contains("active")) {
      chip.classList.remove("active");
      return;
    }

    // ถ้าชิปที่กดไม่ active → ลบ active ตัวอื่น แล้วใส่ให้ตัวที่กด
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

// ========== ปุ่ม Opening-days Filter (icon tune) ==========
function setupCategoryButton() {
  const btn = document.getElementById("categoryBtn");
  const panel = document.getElementById("openingDaysPanel");
  if (!btn || !panel) return;

  const clearBtn = panel.querySelector(".filter-clear");
  const applyBtn = panel.querySelector(".filter-apply");
  const dayChips = panel.querySelectorAll(".day-chip");

  // toggle day active
  dayChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
    });
  });

  // clear
  clearBtn?.addEventListener("click", () => {
    panel.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.checked = false;
    });
    dayChips.forEach((chip) => chip.classList.remove("active"));
    console.log("Opening days: clear");
  });

  // apply
  applyBtn?.addEventListener("click", () => {
    console.log("Opening days: apply");
    closePanel();
  });

  function openPanel() {
    panel.style.display = "block";

    const rect = btn.getBoundingClientRect();
    const panelRect = panel.firstElementChild.getBoundingClientRect();

    let left = rect.right - panelRect.width;
    if (left < 16) left = 16;

    const top = rect.bottom + 8 + window.scrollY;

    panel.style.position = "absolute";
    panel.style.left = `${left + window.scrollX}px`;
    panel.style.top = `${top}px`;

    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("open")) {
      closePanel();
    } else {
      openPanel();
    }
  });

  // click นอก panel ปิด
  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("open")) return;
    const insidePanel = e.target.closest("#openingDaysPanel");
    const isButton = e.target.closest("#categoryBtn");
    if (!insidePanel && !isButton) {
      closePanel();
    }
  });

  // Esc ปิด
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      closePanel();
    }
  });
}

// ========== CATEGORY OVERLAY (Place Type + Province) ==========
function setupCategoryOverlay() {
  const overlay = document.getElementById("categoryOverlay");
  if (!overlay) return;

  const panel = overlay.querySelector(".category-panel");
  const closeBtn = overlay.querySelector(".category-close");
  const clearBtn = overlay.querySelector(".category-clear");
  const applyBtn = overlay.querySelector(".category-apply");
  const placeList = overlay.querySelector(".category-place-list");
  const provinceList = overlay.querySelector(".category-province-list");
  const provinceSearch = document.getElementById("provinceSearch");

  // ปุ่มเปิด: nav + mobile link ที่ชื่อ Category
  const openers = [
    ...document.querySelectorAll(".nav-link"),
    ...document.querySelectorAll(".mobile-link"),
  ].filter((el) => el.textContent.trim() === "Category");

  function openOverlay() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // ล็อกไม่ให้หน้าเลื่อน
  }

  function closeOverlay() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openOverlay();
    });
  });

  closeBtn?.addEventListener("click", () => {
    closeOverlay();
  });

  // คลิกนอก panel ปิด
  overlay.addEventListener("click", (e) => {
    if (!overlay.classList.contains("open")) return;
    const inside = e.target.closest(".category-panel");
    if (!inside) {
      closeOverlay();
    }
  });

  // ปิดด้วย ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) {
      closeOverlay();
    }
  });

  // ===== เลือกได้ฝั่งละ 1 อย่าง =====
  function setupSingleSelect(listEl) {
    if (!listEl) return;
    const boxes = listEl.querySelectorAll("input[type='checkbox']");
    boxes.forEach((box) => {
      box.addEventListener("change", () => {
        if (!box.checked) return;
        boxes.forEach((b) => {
          if (b !== box) b.checked = false;
        });
      });
    });
  }

  setupSingleSelect(placeList);
  setupSingleSelect(provinceList);

  // ===== province search =====
  if (provinceSearch && provinceList) {
    const items = provinceList.querySelectorAll("li");

    provinceSearch.addEventListener("input", () => {
      const q = provinceSearch.value.trim().toLowerCase();
      items.forEach((li) => {
        const text = li.textContent.toLowerCase();
        li.style.display = text.includes(q) ? "" : "none";
      });
    });
  }

  // ===== Clear / Apply =====
  clearBtn?.addEventListener("click", () => {
    overlay
      .querySelectorAll(".category-list input[type='checkbox']")
      .forEach((cb) => (cb.checked = false));
    if (provinceSearch) {
      provinceSearch.value = "";
      provinceSearch.dispatchEvent(new Event("input"));
    }
    console.log("Category: clear");
  });

  applyBtn?.addEventListener("click", () => {
    const selectedPlace = overlay.querySelector(
      ".category-place-list input[type='checkbox']:checked"
    );
    const selectedProvince = overlay.querySelector(
      ".category-province-list input[type='checkbox']:checked"
    );

    console.log("Category: apply", {
      placeType: selectedPlace?.value || null,
      province: selectedProvince?.value || null,
    });

    closeOverlay();
  });
}

// ========== กัน error ฟังก์ชันเดิม ==========
function setupAuthButtons() {
  // ไม่มีปุ่ม sign in / sign up แล้ว
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupAvatarClick();
  setupNavActive();
  setupChipActive();
  setupFavoriteToggle();
  setupCategoryButton();    // ปุ่ม filter (Opening days)
  setupCategoryOverlay();   // หน้าต่าง Category
  setupAuthButtons();
});