document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const currentUsername = localStorage.getItem('currentUsername');
    const LOGIN_PAGE = '../regis_log/login.html'; 

    if (!accessToken || !currentUsername) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    const API_BASE_URL = 'http://localhost:1010/users';
    let currentUserId = null;

    const profileForm = document.getElementById('profile-form');
    const profileUsernameInput = document.getElementById('profile-username');
    const profileNameInput = document.getElementById('profile-name');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    function showToast(message, isSuccess) {
        const toast = document.getElementById('toast-message');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'toast-notification'; 
        
        setTimeout(() => {
            toast.classList.add(isSuccess ? 'toast-success' : 'toast-error');
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async function fetchUserData() {
        try {
            const response = await fetch(`${API_BASE_URL}/details?username=${currentUsername}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Phiên đăng nhập hết hạn', false);
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = LOGIN_PAGE;
                }, 1500);
                return;
            }

            const user = await response.json();
            currentUserId = user.id;
            profileUsernameInput.value = user.username;
            profileNameInput.value = user.name || '';
            profileNameInput.defaultValue = user.name || '';

        } catch (error) {
            console.error(error);
            showToast('Lỗi kết nối server', false);
        }
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = profileNameInput.value.trim();
        const currentPass = currentPasswordInput.value;
        const newPass = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;

        if (newPass && newPass !== confirmPass) {
            showToast('Mật khẩu xác nhận không khớp!', false);
            return;
        }

        const isPassChange = newPass.length > 0;
        const isNameChange = name !== profileNameInput.defaultValue;

        if (!isNameChange && !isPassChange) {
            showToast('Không có thay đổi nào để lưu.', false);
            return;
        }
        if (isPassChange && !currentPass) {
            showToast('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới.', false);
            return;
        }

        const updateData = {
            name: name,
            username: currentUsername,
            password: isPassChange ? newPass : null,
            currentPassword: isPassChange ? currentPass : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${currentUserId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                if (isPassChange) {
                    showToast('Đổi mật khẩu thành công! Đang đăng xuất...', true);
                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = LOGIN_PAGE;
                    }, 2000);
                } else {
                    showToast('Cập nhật thông tin thành công!', true);
                    profileNameInput.defaultValue = name;
                }
            } else {
                const err = await response.json().catch(() => ({}));
                showToast(err.message || 'Cập nhật thất bại. Vui lòng thử lại.', false);
            }
        } catch (error) {
            console.error(error);
            showToast('Lỗi kết nối đến Server API.', false);
        }
    });

    fetchUserData();
});