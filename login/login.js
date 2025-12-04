document.addEventListener('DOMContentLoaded', function() {
    const pw = document.getElementById('password');
    const eye = document.querySelector('.eye');
    const form = document.querySelector('.form');

    // ฟังก์ชันสลับการแสดงรหัสผ่าน
    function setVisible(show){
        const s = pw.selectionStart, e = pw.selectionEnd;
        pw.type = show ? 'text' : 'password';
        eye.setAttribute('aria-pressed', String(show));
        eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        
        // คืนตำแหน่ง Cursor เดิมหลังสลับประเภท input
        if (document.activeElement === pw && s != null) pw.setSelectionRange(s, e);
    }

    // ป้องกันการโฟกัสเปลี่ยนเมื่อกดปุ่มตา (เพื่อให้อยู่ในช่องรหัสผ่าน)
    eye.addEventListener('mousedown', e => e.preventDefault());
    
    // สลับการแสดงรหัสผ่านเมื่อคลิก
    eye.addEventListener('click', () => setVisible(pw.type === 'password'));


    // ** ตัวอย่าง JavaScript สำหรับจัดการการส่งฟอร์ม (จำลอง) **
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ
        
        const emailValue = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        
        // ตรวจสอบค่าว่าง
        if (emailValue.trim() === '' || passwordValue.trim() === '') {
            alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการล็อกอิน');
            return;
        }

        // *** ส่วนนี้คือโค้ดที่คุณต้องเขียนเพื่อส่งข้อมูลจริงไป Backend ***
        alert(`กำลังส่งข้อมูลล็อกอิน...\nอีเมล: ${emailValue}`);
        // ตัวอย่าง: fetch('/api/login', { method: 'POST', body: JSON.stringify({ email: emailValue, password: passwordValue }) })
        // ***
    });

    // ** ตัวอย่างสำหรับปุ่ม Sign In with Google **
    document.querySelector('.btn-google').addEventListener('click', function() {
        alert('เปิดหน้าต่าง Google Sign-In (ต้องใช้ API จริง)');
    });

});