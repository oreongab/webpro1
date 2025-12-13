document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const keepMeLoggedInCheckbox = document.getElementById('keepMeLoggedIn');

    if (!form || !emailInput || !passwordInput || !keepMeLoggedInCheckbox) return;

    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        keepMeLoggedInCheckbox.checked = true;
    }

    emailInput.addEventListener('input', () => {
        const v = emailInput.value;
        if (v.includes('@') && v.length > 3) emailInput.classList.remove('invalid');
        else if (v.length > 0) emailInput.classList.add('invalid');
        else emailInput.classList.remove('invalid');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const emailValue = emailInput.value;
        const passwordValue = passwordInput.value;

        if (emailValue.trim() === '' || passwordValue.trim() === '') {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: emailValue,
                    user_password: passwordValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                const userObject = {
                    user_id: data.user_id,
                    user_name: data.user_name,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    user_email: data.user_email
                };

                localStorage.setItem('loggedInUser', JSON.stringify(userObject));

                if (keepMeLoggedInCheckbox.checked) localStorage.setItem('savedEmail', emailValue);
                else localStorage.removeItem('savedEmail');

                alert('เข้าสู่ระบบสำเร็จ');
                window.location.href = '../home/home.html';
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
});