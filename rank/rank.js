function setupMenu() {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".mobile-menu-close");

  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
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

function setupChips() {
  const bar = document.querySelector(".chip-bar");
  if (!bar) return;

  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    bar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
}

function buildStars(score) {
  if (score == null) return "";
  const full = Math.round(score);
  let s = "";
  for (let i = 0; i < 5; i++) s += i < full ? "★" : "☆";
  return s;
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

    const rankEl = card.querySelector(".card-rank-number");
    if (rankEl) rankEl.textContent = p.rank ?? i + 1;

    const imgEl = card.querySelector(".card-image");
    if (imgEl) {
      imgEl.src = p.imageUrl || "image1.png";
      imgEl.alt = p.title || "";
    }

    const dayEl = card.querySelector(".card-open-days");
    const hourEl = card.querySelector(".card-open-hours");
    if (dayEl) dayEl.textContent = p.openDays || "";
    if (hourEl) hourEl.textContent = p.openHours || "";

    const starEl = card.querySelector(".card-stars");
    const rateEl = card.querySelector(".card-rating");
    if (p.rating != null) {
      if (starEl) starEl.textContent = buildStars(p.rating);
      if (rateEl) rateEl.textContent = Number(p.rating).toFixed(1);
    }

    const titleEl = card.querySelector(".card-title");
    if (titleEl) titleEl.textContent = p.title || "";

    grid.appendChild(card);
  });
}

window.renderPlaceCards = renderPlaceCards;

function setupFav() {
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

function setupFilterPanel() {
  const btn = document.getElementById("filterBtn");
  const panel = document.getElementById("openingDaysPanel");
  if (!btn || !panel) return;

  const clearBtn = panel.querySelector(".filter-clear");
  const applyBtn = panel.querySelector(".filter-apply");
  const chips = panel.querySelectorAll(".day-chip");

  chips.forEach((c) => c.addEventListener("click", () => c.classList.toggle("active")));

  clearBtn?.addEventListener("click", () => {
    panel.querySelectorAll("input[type='checkbox']").forEach((cb) => (cb.checked = false));
    chips.forEach((c) => c.classList.remove("active"));
  });

  applyBtn?.addEventListener("click", () => closePanel());

  function openPanel() {
    panel.style.display = "block";

    const rect = btn.getBoundingClientRect();
    const inner = panel.firstElementChild;
    const w = inner ? inner.getBoundingClientRect().width : 260;

    let left = rect.right - w;
    if (left < 16) left = 16;

    const top = rect.bottom + 8 + window.scrollY;

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
    const inside = e.target.closest("#openingDaysPanel");
    const isBtn = e.target.closest("#filterBtn");
    if (!inside && !isBtn) closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupChips();
  setupFav();
  setupFilterPanel();
});