document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');

  const fromMap = {
    home: '../home/home.html',
    favorites: '../favorite/favorite.html',
    rank: '../rank/rank.html',
    profile: '../user1/user-profile.html',
    terms: '../Terms/terms.html',
    privacy: '../Privacy/privacy.html',
    about: '../about/about.html'
  };

  backBtn.addEventListener('click', () => {
    if (from && fromMap[from]) {
      window.location.href = fromMap[from];
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../home/home.html';
  });
});