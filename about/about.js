document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("aboutBackBtn");
  if (!backBtn) return;

  backBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");

    if (from && window.navigation?.NAV?.[from]) {
      window.navigation.go(from);
      return;
    }

    if (window.history.length > 1) window.history.back();
    else window.navigation?.go("home");
  });
});