document.addEventListener('DOMContentLoaded', () => {
  const back = document.querySelector('.back');
  if (!back) return;

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

  back.addEventListener('click', () => {
    if (from && fromMap[from]) {
      window.location.href = fromMap[from];
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../home/home.html';
  });
});