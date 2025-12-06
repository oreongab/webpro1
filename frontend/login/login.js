document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const keepMeLoggedInCheckbox = document.getElementById('keepMeLoggedIn');

    // โหลดข้อมูล email ที่บันทึกไว้ (ถ้ามี)
    const savedEmail = localStorage.getItem('savedEmail');
    
    if (savedEmail) {
        emailInput.value = savedEmail;
        keepMeLoggedInCheckbox.checked = true;
    }

    // Email validation
    emailInput.addEventListener('input', function() {
        if (this.value.includes('@') && this.value.length > 3) {
            this.classList.remove('invalid');
        } else if (this.value.length > 0) {
            this.classList.add('invalid');
        } else {
            this.classList.remove('invalid');
        }
    });

    // เชื่อมต่อกับ Backend API
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const emailValue = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        
        if (emailValue.trim() === '' || passwordValue.trim() === '') {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            console.log('Sending login request...');
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_email: emailValue,
                    user_password: passwordValue
                })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                // บันทึก user_id และข้อมูล user ใน localStorage
                localStorage.setItem('currentUserId', data.user_id);
                localStorage.setItem('currentUserName', data.user_name);
                localStorage.setItem('currentUserPassword', passwordValue);
                
                // บันทึกหรือลบ email ตามการติ๊ก checkbox
                if (keepMeLoggedInCheckbox.checked) {
                    localStorage.setItem('savedEmail', emailValue);
                } else {
                    localStorage.removeItem('savedEmail');
                }
                
                alert('เข้าสู่ระบบสำเร็จ');
                window.location.href = '../deskmain.html';
            } else {
                alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            if (error.message.includes('HTTP')) {
                alert('ไม่สามารถเชื่อมต่อ server ได้ กรุณาตรวจสอบว่า backend server รันอยู่');
            } else {
                alert('เกิดข้อผิดพลาด: ' + error.message);
            }
        }
    });

    // Google Sign-In placeholder
    document.querySelector('.btn-google')?.addEventListener('click', function() {
        alert('ฟีเจอร์ Google Sign-In ยังไม่พร้อมใช้งาน');
    });

});