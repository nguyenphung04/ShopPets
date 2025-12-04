document.addEventListener('DOMContentLoaded', () => {

    const accessToken = localStorage.getItem('accessToken');
    const currentUsername = localStorage.getItem('currentUsername');
    
    if (!accessToken || !currentUsername) {
        alert('Vui lòng đăng nhập để truy cập trang này.');
        window.location.href = 'regis_log/login.html'; 
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
    const updateMessage = document.getElementById('update-message');

    function showToast(message, isSuccess) {
        const toast = document.getElementById('toast-message');
        toast.textContent = message;
        toast.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336'; 
        
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    function showFormMessage(message, isSuccess) {
        updateMessage.textContent = message;
        updateMessage.style.display = 'block';
        updateMessage.className = 'update-message ' + (isSuccess ? 'message-success' : 'message-error');
    }

    function isPasswordStrong(password) {
        if (password.length > 0 && password.length < 8) return { valid: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' };
        if (password.length > 0 && !/(?=.*[a-zA-Z])/.test(password)) return { valid: false, message: 'Mật khẩu mới phải chứa ít nhất 1 chữ cái.' };
        if (password.length > 0 && !/(?=.*\d)/.test(password)) return { valid: false, message: 'Mật khẩu mới phải chứa ít nhất 1 số.' };
        return { valid: true };
    }

    async function fetchUserData() {
        try {
            const response = await fetch(`${API_BASE_URL}/details?username=${currentUsername}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.status === 401 || response.status === 403) {
                 alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
                 localStorage.removeItem('accessToken');
                 localStorage.removeItem('currentUsername');
                 window.location.href = '../../regis_log/login.html'; 
                 return;
            }

            if (!response.ok) throw new Error('Không thể tải thông tin người dùng.');

            const user = await response.json();
            
            currentUserId = user.id; 
            profileUsernameInput.value = user.username;
            profileNameInput.value = user.name || '';
            
            profileNameInput.defaultValue = user.name || ''; 

        } catch (error) {
            console.error('Lỗi tải dữ liệu người dùng:', error);
            showFormMessage('Lỗi kết nối đến server. Không thể tải thông tin.', false);
        }
    }
    
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        updateMessage.style.display = 'none'; 

        const name = profileNameInput.value.trim();
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            showFormMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.', false);
            return;
        }

        const passwordValidation = isPasswordStrong(newPassword);
        if (!passwordValidation.valid) {
            showFormMessage(passwordValidation.message, false);
            return;
        }
        
        const isPasswordChangeRequested = newPassword.length > 0;
        const isNameChangeRequested = name !== profileNameInput.defaultValue; 

        if (isPasswordChangeRequested && currentPassword.length === 0) {
            showFormMessage('Vui lòng nhập Mật khẩu hiện tại để đổi mật khẩu.', false);
            return;
        }
        
        if (!isNameChangeRequested && !isPasswordChangeRequested) {
            showFormMessage('Không có thay đổi nào để lưu.', false);
            return;
        }
        
        const updateData = {
            name: name,
            username: currentUsername,
            password: isPasswordChangeRequested ? newPassword : null, 
            currentPassword: isPasswordChangeRequested ? currentPassword : null
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
                showToast(isPasswordChangeRequested ? 'Đổi mật khẩu và cập nhật tên thành công!' : 'Cập nhật tên thành công!', true);
                
                if (isPasswordChangeRequested) {
                    setTimeout(() => {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('currentUsername');
                        window.location.href = '../../regis_log/login.html'; 
                    }, 1500);
                } else {
                    setTimeout(() => { window.location.reload(); }, 1000);
                }
                
            } else {
                const error = await response.json().catch(() => ({ message: 'Lỗi không xác định.' }));
                showToast(`Lưu thất bại: ${error.message || 'Lỗi server.'}`, false);
            }
        } catch (error) {
            console.error('Lỗi kết nối PUT:', error);
            showToast('Lỗi kết nối đến Server API.', false);
        }
    });

    fetchUserData();
});