const NAV = {
  home: "../home/home.html",
  rank: "../rank/rank.html",
  category: "../home/home.html",
  favorites: "../favorite/favorite.html",
  profile: "../user1/user-profile.html",
  login: "../login/login.html",
  signup: "../signup/signup.html",
  place: "../place/place-detail.html",
  about: "../about/about.html",
  terms: "../Terms/terms.html",
  privacy: "../Privacy/privacy.html"
};

const getPageKey = () => {
  const p = window.location.pathname.toLowerCase();
  if (p.includes("/home/")) return "home";
  if (p.includes("/rank/")) return "rank";
  if (p.includes("/favorite/")) return "favorites";
  if (p.includes("/user1/")) return "profile";
  if (p.includes("/about/")) return "about";
  if (p.includes("/terms/")) return "terms";
  if (p.includes("/privacy/")) return "privacy";
  return "home";
};

const go = (page, opts = {}) => {
  let path = NAV[page];
  if (!path) return;

  if (page === "category") {
    const categoryOverlay = document.getElementById("categoryOverlay");
    if (categoryOverlay) {
      const isOpen = categoryOverlay.classList.contains("open");
      if (isOpen) {
        categoryOverlay.classList.remove("open");
        categoryOverlay.setAttribute("aria-hidden", "true");
      } else {
        categoryOverlay.classList.add("open");
        categoryOverlay.setAttribute("aria-hidden", "false");
      }
      return;
    }
  }

  const params = new URLSearchParams();
  if (opts.id != null) params.set("id", String(opts.id));
  if (opts.from) params.set("from", String(opts.from));

  const query = params.toString();
  if (query) path += (path.includes("?") ? "&" : "?") + query;

  window.location.href = path;
};

const setupNavLinks = () => {
  document.querySelectorAll(".nav-link").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const text = a.textContent.trim().toLowerCase();
      if (text === "home" || text === "หน้าแรก") go("home");
      else if (text === "rank" || text === "อันดับ") go("rank");
      else if (text === "category" || text === "หมวดหมู่") go("category");
      else if (text === "favorites" || text === "รายการโปรด") go("favorites");
    });
  });

  document.querySelectorAll(".mobile-link").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const text = a.textContent.trim().toLowerCase();
      const menu = document.getElementById("mobileMenu");
      if (menu) menu.classList.remove("open");

      if (text === "home" || text === "หน้าแรก") go("home");
      else if (text === "rank" || text === "อันดับ") go("rank");
      else if (text === "category" || text === "หมวดหมู่") go("category");
      else if (text === "favorites" || text === "รายการโปรด") go("favorites");
    });
  });

  document.querySelectorAll(".avatar-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const user = localStorage.getItem("loggedInUser");
      go(user ? "profile" : "login");
    });
  });

  document.querySelectorAll(".place-detail-back, .fav-back, .rank-back").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.length > 1 ? window.history.back() : go("home");
    });
  });
};

const setupFooterLinks = () => {
  const from = getPageKey();
  document.querySelectorAll('a[href="#about"], a[href="#terms"], a[href="#privacy"]').forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const href = a.getAttribute("href").toLowerCase();
      if (href === "#about") go("about", { from });
      else if (href === "#terms") go("terms", { from });
      else if (href === "#privacy") go("privacy", { from });
    });
  });
};

const setActiveNav = () => {
  const p = window.location.pathname.toLowerCase();
  document.querySelectorAll(".nav-link, .mobile-link").forEach(a => {
    a.classList.remove("active");
    const text = a.textContent.trim().toLowerCase();
    if ((text === "home" || text === "หน้าแรก") && p.includes("/home/")) a.classList.add("active");
    if ((text === "rank" || text === "อันดับ") && p.includes("/rank/")) a.classList.add("active");
    if ((text === "favorites" || text === "รายการโปรด") && p.includes("/favorite/")) a.classList.add("active");
  });
};

const updateAvatarDisplay = () => {
  const userStr = localStorage.getItem("loggedInUser");
  if (!userStr) {
    return;
  }

  try {
    const user = JSON.parse(userStr);
    const avatarUrl = localStorage.getItem(`userAvatar_${user.user_id}`);

    if (avatarUrl) {
      document.querySelectorAll(".avatar-circle").forEach(circle => {
        const icon = circle.querySelector(".material-icons");
        let img = circle.querySelector("img.avatar-img");
        
        if (!img) {
          img = document.createElement("img");
          img.className = "avatar-img";
          img.style.cssText = "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 50%;";
          circle.style.position = "relative";
          circle.appendChild(img);
        }
        
        img.src = avatarUrl;
        if (icon) icon.style.display = "none";
      });
    } else {
      document.querySelectorAll(".avatar-circle").forEach(circle => {
        const icon = circle.querySelector(".material-icons");
        if (icon) icon.style.display = "";
      });
    }
  } catch (e) {
    console.error("Avatar display error:", e);
  }
};

window.navigation = { go, NAV, getPageKey, updateAvatarDisplay };

document.addEventListener("DOMContentLoaded", () => {
  setupNavLinks();
  setupFooterLinks();
  setActiveNav();
  updateAvatarDisplay();
});