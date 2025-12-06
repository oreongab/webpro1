document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');

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

    // Sign Up
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const userData = {
            user_name: document.getElementById('user_name').value.trim(),
            first_name: document.getElementById('first_name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            user_email: document.getElementById('email').value.trim(),
            user_password: document.getElementById('password').value
        };

        if (!userData.user_name || !userData.first_name || !userData.last_name || !userData.user_email || !userData.user_password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            console.log('Sending register request...');
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
                window.location.href = '../login/login.html';
            } else {
                alert(data.message || 'เกิดข้อผิดพลาด');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            alert('ไม่สามารถเชื่อมต่อ server ได้');
        }
    });
});
