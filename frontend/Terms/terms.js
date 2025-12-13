document.addEventListener('DOMContentLoaded', () => {
  const back = document.querySelector('.back');
  if (!back) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');

  const fromMap = {
    home: '../home/home.html',
    favorites: '../favorite/favorite.html',
    rank: '../rank/rank.html',
    about: '../about/about.html',
    privacy: '../Privacy/privacy.html'
  };

  back.addEventListener('click', () => {
    if (from && fromMap[from]) {
      window.location.href = fromMap[from];
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../home/home.html';
  });
});