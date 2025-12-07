// privacy.js
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('privacyBackBtn');
  if (!backBtn) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get('from'); // index / favorites / rank / about / terms ...

  const fromMap = {
    index: 'index.html',
    favorites: 'favorites.html',
    rank: 'rank.html',
    about: 'about.html',
    terms: 'terms.html'
  };

  backBtn.addEventListener('click', () => {
    if (from && fromMap[from]) {
      window.location.href = fromMap[from];
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });
});