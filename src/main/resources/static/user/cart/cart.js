document.addEventListener('DOMContentLoaded', () => {
    const cartContent = document.getElementById('cart-content');
    const cartSummary = document.getElementById('cart-summary');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    const accessToken = localStorage.getItem('accessToken');
    const API_CART_URL = 'http://localhost:1010/cart';

    function formatCurrency(price) {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    async function fetchCart() {
        if (!accessToken) {
            cartContent.innerHTML = '<p class="empty-cart-msg">Vui lòng <a href="../../regis_log/login.html">đăng nhập</a> để xem giỏ hàng.</p>';
            return;
        }

        try {
            const response = await fetch(API_CART_URL, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.status === 401) {
                alert('Phiên đăng nhập hết hạn.');
                window.location.href = '../../regis_log/login.html';
                return;
            }

            const cartItems = await response.json();
            renderCartTable(cartItems);

        } catch (error) {
            console.error('Lỗi tải giỏ hàng:', error);
            cartContent.innerHTML = '<p class="empty-cart-msg">Lỗi kết nối đến server.</p>';
        }
    }

    function renderCartTable(items) {
        if (!items || items.length === 0) {
            cartContent.innerHTML = '<p class="empty-cart-msg">Giỏ hàng của bạn đang trống.</p>';
            cartSummary.style.display = 'none';
            return;
        }

        let totalBill = 0;
        let html = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach(item => {
            totalBill += item.subTotal;
            html += `
                <tr data-id="${item.id}">
                    <td style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.petImage}" alt="${item.petName}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/80'">
                        <div><strong>${item.petName}</strong></div>
                    </td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                               onchange="updateQuantity('${item.id}', this.value)">
                    </td>
                    <td>${formatCurrency(item.subTotal)}</td>
                    <td>
                        <button class="btn-remove" onclick="removeItem('${item.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        
        cartContent.innerHTML = html;
        cartTotalPrice.textContent = formatCurrency(totalBill);
        cartSummary.style.display = 'block';
    }

    window.updateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const response = await fetch(`${API_CART_URL}/${cartId}?quantity=${newQuantity}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.ok) {
                fetchCart(); 
            } else {
                alert('Lỗi cập nhật số lượng.');
            }
        } catch (error) {
            console.error(error);
        }
    };
    window.removeItem = async (cartId) => {
        if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;

        try {
            const response = await fetch(`${API_CART_URL}/${cartId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.ok) {
                fetchCart(); 
            } else {
                alert('Lỗi xóa sản phẩm.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    fetchCart();
});