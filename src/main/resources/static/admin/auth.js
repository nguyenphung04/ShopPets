(function() {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    if (!token) {
        alert('Vui lòng đăng nhập để truy cập trang quản trị.');
        window.location.href = '../regis_log/login.html';
        return;
    }
    if (role != 0) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '../index.html';
        return;
    }
})();