// -----------------------------
// 1. ปุ่มย้อนกลับ
// -----------------------------
document.querySelectorAll('.back-icon').forEach(btn => {
  btn.addEventListener('click', () => {
    window.history.back();
  });
});

// -----------------------------
// 2. เปลี่ยนรูปโปรไฟล์จากไฟล์ที่ user เลือก
// -----------------------------
const avatarContainer = document.querySelector('.profile-avatar');
const avatarImg = document.getElementById('profileAvatar');
const avatarInput = document.getElementById('avatarInput');
const changeProtoTrigger = document.getElementById('changeProtoTrigger');

// ให้คลิกได้ทั้ง "Change Proto" และตัวรูป
if (changeProtoTrigger) {
  changeProtoTrigger.addEventListener('click', () => {
    avatarInput.click();
  });
}
if (avatarContainer) {
  avatarContainer.addEventListener('click', () => {
    avatarInput.click();
  });
}

// เมื่อ user เลือกรูปจากเครื่อง
if (avatarInput) {
  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;

    // ✅ แสดง preview รูปทันที
    const previewUrl = URL.createObjectURL(file);
    avatarImg.src = previewUrl;

    // ใส่ class เพื่อสลับจาก SVG → รูปจริง
    avatarContainer.classList.add('has-image');

    // 🧩 NOTE สำหรับทีม Backend:
    // ตรงนี้สามารถเพิ่มโค้ดอัปโหลดไฟล์ไป server ได้ เช่น:
    //
    // const formData = new FormData();
    // formData.append('avatar', file);
    // fetch('/api/upload-avatar', { method: 'POST', body: formData })
    //   .then(res => res.json())
    //   .then(data => {
    //     // data.avatarUrl = URL รูปจริงหลังอัปโหลด
    //     avatarImg.src = data.avatarUrl;
    //   });
  });
}

// -----------------------------
// 3. Touch feedback (มือถือ) ให้ปุ่มรู้สึกว่ากดได้
// -----------------------------
function addTouchFeedback(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('touchstart', () => {
      el.classList.add('active-touch');
    }, { passive: true });

    const clear = () => el.classList.remove('active-touch');
    el.addEventListener('touchend', clear, { passive: true });
    el.addEventListener('touchcancel', clear, { passive: true });
  });
}

// เพิ่ม feedback ให้ element ที่กดได้
addTouchFeedback('.back-icon');
addTouchFeedback('.profile-avatar');
addTouchFeedback('.change-proto');
addTouchFeedback('.change-inline');
addTouchFeedback('.save-button button');