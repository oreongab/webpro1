function setupMobileMenu() {
  const openBtn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".mobile-menu-close");

  if (!openBtn || !menu) return;

  openBtn.addEventListener("click", () => {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
  });

  closeBtn?.addEventListener("click", () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
  });

  menu.addEventListener("click", (e) => {
    const link = e.target.closest(".mobile-link");
    if (link) {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
    }
  });
}

function setupAvatarClick() {
  document.querySelectorAll(".avatar-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Profile clicked");
    });
  });
}

function setupNavActive() {
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
    });
  });

  mobileLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      mobileLinks.forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
    });
  });
}

function setupChipActive() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    if (chip.classList.contains("active")) {
      chip.classList.remove("active");
      return;
    }

    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
}

function buildStars(rating) {
  if (rating == null) return "";
  const full = Math.round(rating);
  let txt = "";
  for (let i = 0; i < 5; i++) txt += i < full ? "★" : "☆";
  return txt;
}

function renderPlaceCards(list) {
  const grid = document.getElementById("placeGrid");
  const tpl = document.getElementById("placeCardTemplate");
  if (!grid || !tpl) return;

  grid.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    grid.style.display = "none";
    return;
  }

  grid.style.display = "grid";

  list.forEach((p, i) => {
    const card = tpl.content.firstElementChild.cloneNode(true);

    card.dataset.id = p.id ?? i + 1;

    const rank = card.querySelector(".card-rank-number");
    if (rank) rank.textContent = p.rank ?? i + 1;

    const img = card.querySelector(".card-image");
    if (img) {
      img.src = p.imageUrl || "image1.png";
      img.alt = p.title || "";
    }

    const day = card.querySelector(".card-open-days");
    const hour = card.querySelector(".card-open-hours");
    if (day) day.textContent = p.openDays || "";
    if (hour) hour.textContent = p.openHours || "";

    const stars = card.querySelector(".card-stars");
    const rate = card.querySelector(".card-rating");
    if (stars && p.rating != null) stars.textContent = buildStars(p.rating);
    if (rate && p.rating != null) rate.textContent = p.rating.toFixed(1);

    const title = card.querySelector(".card-title");
    if (title) title.textContent = p.title || "";

    grid.appendChild(card);
  });
}

window.renderPlaceCards = renderPlaceCards;

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

function setupOpeningDaysPanel() {
  const btn = document.getElementById("categoryBtn");
  const panel = document.getElementById("openingDaysPanel");
  if (!btn || !panel) return;

  const clearBtn = panel.querySelector(".filter-clear");
  const applyBtn = panel.querySelector(".filter-apply");
  const dayChips = panel.querySelectorAll(".day-chip");

  dayChips.forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("active"));
  });

  clearBtn?.addEventListener("click", () => {
    panel.querySelectorAll("input[type='checkbox']").forEach((cb) => (cb.checked = false));
    dayChips.forEach((chip) => chip.classList.remove("active"));
  });

  applyBtn?.addEventListener("click", () => {
    closePanel();
  });

  function openPanel() {
    panel.style.display = "block";

    const r = btn.getBoundingClientRect();
    const inner = panel.firstElementChild;
    const w = inner ? inner.getBoundingClientRect().width : 320;

    let left = r.right - w;
    if (left < 16) left = 16;

    const top = r.bottom + 8 + window.scrollY;

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
    panel.classList.contains("open") ? closePanel() : openPanel();
  });

  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("open")) return;
    const inPanel = e.target.closest("#openingDaysPanel");
    const isBtn = e.target.closest("#categoryBtn");
    if (!inPanel && !isBtn) closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });
}

function setupCategoryOverlay() {
  const overlay = document.getElementById("categoryOverlay");
  if (!overlay) return;

  const closeBtn = overlay.querySelector(".category-close");
  const clearBtn = overlay.querySelector(".category-clear");
  const applyBtn = overlay.querySelector(".category-apply");
  const placeList = overlay.querySelector(".category-place-list");
  const provinceList = overlay.querySelector(".category-province-list");
  const provinceSearch = document.getElementById("provinceSearch");

  const openers = [
    ...document.querySelectorAll(".nav-link"),
    ...document.querySelectorAll(".mobile-link"),
  ].filter((el) => el.textContent.trim() === "Category");

  function open() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openers.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  });

  closeBtn?.addEventListener("click", close);

  overlay.addEventListener("click", (e) => {
    const inside = e.target.closest(".category-panel");
    if (!inside) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  function singleSelect(listEl) {
    if (!listEl) return;
    const boxes = listEl.querySelectorAll("input[type='checkbox']");
    boxes.forEach((box) => {
      box.addEventListener("change", () => {
        if (!box.checked) return;
        boxes.forEach((b) => { if (b !== box) b.checked = false; });
      });
    });
  }

  singleSelect(placeList);
  singleSelect(provinceList);

  if (provinceSearch && provinceList) {
    const items = provinceList.querySelectorAll("li");
    provinceSearch.addEventListener("input", () => {
      const q = provinceSearch.value.trim().toLowerCase();
      items.forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }

  clearBtn?.addEventListener("click", () => {
    overlay.querySelectorAll(".category-list input[type='checkbox']").forEach((cb) => (cb.checked = false));
    if (provinceSearch) {
      provinceSearch.value = "";
      provinceSearch.dispatchEvent(new Event("input"));
    }
  });

  applyBtn?.addEventListener("click", () => {
    const place = overlay.querySelector(".category-place-list input[type='checkbox']:checked");
    const prov = overlay.querySelector(".category-province-list input[type='checkbox']:checked");

    console.log("Category apply:", {
      placeType: place?.value || null,
      province: prov?.value || null,
    });

    close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupAvatarClick();
  setupNavActive();
  setupChipActive();
  setupFavoriteToggle();
  setupOpeningDaysPanel();
  setupCategoryOverlay();
});