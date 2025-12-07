// about.js
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('aboutBackBtn');
  if (!backBtn) return;

  // อ่าน query string ?from=index / ?from=favorites / ?from=rank
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');

  // map from -> ไฟล์ปลายทาง (แก้ชื่อไฟล์ตามโปรเจคจริงได้)
  const fromMap = {
    index: 'index.html',
    favorites: 'favorites.html',
    rank: 'rank.html'
  };

  backBtn.addEventListener('click', () => {
    if (from && fromMap[from]) {
      // ถ้ารู้ว่ามาจากไหน ให้กลับไปหน้านั้น
      window.location.href = fromMap[from];
    } else if (window.history.length > 1) {
      // เผื่อกรณีเปิดจากที่อื่น ใช้ history ปกติ
      window.history.back();
    } else {
      // กันพลาด กลับไปหน้า index
      window.location.href = 'index.html';
    }
  });
});