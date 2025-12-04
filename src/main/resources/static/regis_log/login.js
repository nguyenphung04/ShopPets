document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const API_LOGIN_URL = 'http://localhost:1010/api/auth/login';

    function showToast(message, isSuccess) {
        const toast = document.getElementById('toast-message');
        if(toast) {
            toast.textContent = message;
            toast.className = `toast-notification ${isSuccess ? 'toast-success' : 'toast-error'}`;
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 3000);
        } else {
            alert(message);
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                showToast(error.message || 'Đăng nhập thất bại', false);
                return;
            }

            const data = await response.json();

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('currentUsername', data.username);
            localStorage.setItem('role', data.role);

            showToast('Đăng nhập thành công!', true);
            setTimeout(() => {
                if (data.role === 0) {
                    window.location.href = '../admin/index.html'; 
                } else {
                    window.location.href = '../index.html';
                }
            }, 1000);

        } catch (error) {
            console.error(error);
            showToast('Lỗi kết nối server', false);
        }
    });
});