document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    if (!form || !emailInput) return;

    emailInput.addEventListener('input', () => {
        const v = emailInput.value;
        if (v.includes('@') && v.length > 3) emailInput.classList.remove('invalid');
        else if (v.length > 0) emailInput.classList.add('invalid');
        else emailInput.classList.remove('invalid');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userData = {
            user_name: document.getElementById('user_name').value.trim(),
            first_name: document.getElementById('first_name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            user_email: emailInput.value.trim(),
            user_password: document.getElementById('password').value
        };

        if (!userData.user_name || !userData.first_name || !userData.last_name || !userData.user_email || !userData.user_password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

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
