// shared/nav.js

const NAV = {
  home: "../home/home.html",
  rank: "../rank/rank.html",
  category: "../home/home.html", // เปิด overlay ในหน้า home
  favorites: "../favorite/favorite.html",
  profile: "../user1/user-profile.html",
  login: "../login/login.html",
  signup: "../signup/signup.html",
  place: "../place/place-detail.html",

  about: "../about/about.html",
  terms: "../terms/terms.html",
  privacy: "../privacy/privacy.html",
};

function getPageKey() {
  const p = (window.location.pathname || "").toLowerCase();

  if (p.includes("/home/")) return "home";
  if (p.includes("/rank/")) return "rank";
  if (p.includes("/favorite/")) return "favorites";
  if (p.includes("/user1/")) return "profile";
  if (p.includes("/about/")) return "about";
  if (p.includes("/terms/")) return "terms";
  if (p.includes("/privacy/")) return "privacy";

  return "home";
}

function go(page, opts = {}) {
  let path = NAV[page];
  if (!path) return;

  // category: เปิด overlay แทนการเปลี่ยนหน้า
  if (page === "category") {
    const overlay = document.getElementById("categoryOverlay");
    if (overlay) {
      overlay.classList.add("open");
      return;
    }
  }

  const qs = new URLSearchParams();
  if (opts.id != null) qs.set("id", String(opts.id));
  if (opts.from) qs.set("from", String(opts.from));

  const q = qs.toString();
  if (q) path += (path.includes("?") ? "&" : "?") + q;

  window.location.href = path;
}

function setupNavLinks() {
  // เมนูบน (desktop)
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = (a.textContent || "").trim().toLowerCase();

      if (t === "home" || t === "หน้าแรก") return go("home");
      if (t === "rank" || t === "อันดับ") return go("rank");
      if (t === "category" || t === "หมวดหมู่") return go("category");
      if (t === "favorites" || t === "รายการโปรด") return go("favorites");
    });
  });

  // เมนูมือถือ
  document.querySelectorAll(".mobile-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = (a.textContent || "").trim().toLowerCase();

      const menu = document.getElementById("mobileMenu");
      if (menu) menu.classList.remove("open");

      if (t === "home" || t === "หน้าแรก") return go("home");
      if (t === "rank" || t === "อันดับ") return go("rank");
      if (t === "category" || t === "หมวดหมู่") return go("category");
      if (t === "favorites" || t === "รายการโปรด") return go("favorites");
    });
  });

  // avatar -> profile/login
  document.querySelectorAll(".avatar-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const userStr = localStorage.getItem("loggedInUser");
      if (userStr) go("profile");
      else go("login");
    });
  });

  // ปุ่ม back ที่มีในบางหน้า (ถ้ามี class เหล่านี้)
  document
    .querySelectorAll(".place-detail-back, .fav-back, .rank-back")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.history.length > 1) window.history.back();
        else go("home");
      });
    });
}

function setupFooterLinks() {
  const from = getPageKey();

  // ดัก footer links เดิมที่เป็น #about/#terms/#privacy ให้ไปหน้าใหม่
  document
    .querySelectorAll('a[href="#about"], a[href="#terms"], a[href="#privacy"]')
    .forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (a.getAttribute("href") || "").toLowerCase();

        if (href === "#about") return go("about", { from });
        if (href === "#terms") return go("terms", { from });
        if (href === "#privacy") return go("privacy", { from });
      });
    });
}

function setActiveNav() {
  const p = (window.location.pathname || "").toLowerCase();

  document.querySelectorAll(".nav-link, .mobile-link").forEach((a) => {
    a.classList.remove("active");

    const t = (a.textContent || "").trim().toLowerCase();

    if ((t === "home" || t === "หน้าแรก") && p.includes("/home/")) a.classList.add("active");
    if ((t === "rank" || t === "อันดับ") && p.includes("/rank/")) a.classList.add("active");
    if ((t === "favorites" || t === "รายการโปรด") && p.includes("/favorite/"))
      a.classList.add("active");
  });
}

window.navigation = { go, NAV, getPageKey };

document.addEventListener("DOMContentLoaded", () => {
  setupNavLinks();
  setupFooterLinks();
  setActiveNav();
});