document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const API_REGISTER_URL = 'http://localhost:1010/api/auth/register'; 

    function showToast(message, isSuccess) {
        const toast = document.getElementById('toast-message');
        toast.textContent = message;
        toast.className = `toast-notification ${isSuccess ? 'toast-success' : 'toast-error'}`;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showToast('Lỗi: Mật khẩu xác nhận không khớp.', false);
            return;
        }
        
        const userData = { name, username, password };

        try {
            const response = await fetch(API_REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Đăng ký thành công! Đang chuyển sang trang đăng nhập...', true);
                setTimeout(() => {
                    window.location.href = 'login.html'; 
                }, 1500);
            } else {
                if (response.status === 409) {
                     showToast('Đăng ký thất bại: Tên đăng nhập đã tồn tại.', false);
                } else {
                     showToast(`Đăng ký thất bại: ${result.message || 'Lỗi không xác định'}`, false);
                }
            }

        } catch (error) {
            console.error('Lỗi:', error);
            showToast('Lỗi kết nối đến Server API.', false);
        }
    });
});