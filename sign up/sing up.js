document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.querySelector('.form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const eyeButton = document.querySelector('.eye');

    // =======================================================
    // 1. ฟังก์ชันสลับการแสดงรหัสผ่าน (Toggle Password Visibility)
    // =======================================================

    function setPasswordVisibility(show) {
        const s = passwordInput.selectionStart, e = passwordInput.selectionEnd;
        
        // สลับประเภทของ input ระหว่าง 'text' และ 'password'
        passwordInput.type = show ? 'text' : 'password';
        
        // อัปเดตสถานะของปุ่มตาสำหรับ CSS และ Accessibility
        eyeButton.setAttribute('aria-pressed', String(show));
        eyeButton.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        
        // คืนตำแหน่ง Cursor เดิมหลังสลับ
        if (document.activeElement === passwordInput && s != null) {
            passwordInput.setSelectionRange(s, e);
        }
    }

    // ป้องกันการโฟกัสเปลี่ยนเมื่อกดปุ่มตา (เพื่อให้อยู่ในช่องรหัสผ่าน)
    eyeButton.addEventListener('mousedown', function(e) {
        e.preventDefault();
    });
    
    // เมื่อคลิกปุ่มตา ให้เรียกฟังก์ชันสลับ
    eyeButton.addEventListener('click', function() {
        setPasswordVisibility(passwordInput.type === 'password');
    });

    // =======================================================
    // 2. จัดการการส่งฟอร์ม (Form Submission Handler)
    // =======================================================

    form.addEventListener('submit', function(event) {
        // 1. ป้องกันการรีเฟรชหน้าเว็บ (สำคัญมากสำหรับการทำ AJAX)
        event.preventDefault(); 
        
        const firstName = document.getElementById('first-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 2. ตรวจสอบข้อมูลเบื้องต้น
        if (firstName === '' || email === '' || password === '' || confirmPassword === '') {
            alert('❌ กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        // 3. ตรวจสอบรหัสผ่านตรงกัน
        if (password !== confirmPassword) {
            alert('🚫 รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
            // ไฮไลต์ช่องรหัสผ่านเพื่อให้ผู้ใช้เห็นได้ชัด
            passwordInput.focus();
            confirmPasswordInput.value = ''; // ล้างช่องยืนยันรหัสผ่าน
            return;
        }
        
        // 4. หากข้อมูลถูกต้อง ให้จำลองการส่งข้อมูล (ในความเป็นจริงจะมีการเรียก API)
        alert(`✅ สร้างบัญชีสำเร็จ! \nกำลังส่งข้อมูลสำหรับผู้ใช้: ${firstName} (${email})`);
        
        // *** โค้ดจริงที่คุณจะใช้ส่งข้อมูลไปยัง Backend: ***
        /*
        fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                firstName: firstName, 
                // ... ข้อมูลอื่น ๆ 
                email: email, 
                password: password 
            })
        })
        .then(response => response.json())
        .then(data => {
            // จัดการการตอบกลับจากเซิร์ฟเวอร์
            if (data.success) {
                window.location.href = 'success.html'; // ไปหน้าสำเร็จ
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        });
        */
        // *** สิ้นสุดโค้ดจริง ***
    });

    // =======================================================
    // 3. จัดการปุ่ม Sign In with Google
    // =======================================================
    document.querySelector('.btn-google').addEventListener('click', function() {
        alert('🌐 ฟังก์ชัน Sign In with Google ต้องมีการตั้งค่า API ของ Google จริง');
    });

});