document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');

  const fromMap = {
    home: '../home/home.html',
    favorites: '../favorite/favorite.html',
    rank: '../rank/rank.html',
    about: '../about/about.html',
    terms: '../Terms/terms.html'
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