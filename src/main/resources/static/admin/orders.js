document.addEventListener('DOMContentLoaded', () => {
    const API_ORDERS = 'http://localhost:1010/admin/orders';
    const tableBody = document.getElementById('order-table-body');
    const paginationContainer = document.getElementById('pagination');
    const modal = document.getElementById('orderModal');
    let allOrders = [];
    let currentData = [];
    let currentPage = 1;
    const ROWS_PER_PAGE = 5;
    
    let currentOrderId = null;
    const token = localStorage.getItem('accessToken');

    if (!token) { window.location.href = '../regis_log/login.html'; return; }

    function formatCurrency(price) { return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); }
    function formatDate(dateString) { return new Date(dateString).toLocaleDateString('vi-VN'); }
    function getStatusBadge(status) { 
        switch(status) {
            case 0: return '<span class="badge badge-pending">Chờ xử lý</span>';
            case 1: return '<span class="badge badge-paid">Đã thanh toán</span>';
            case 2: return '<span class="badge badge-shipping">Đang giao</span>';
            case 3: return '<span class="badge badge-completed">Hoàn thành</span>';
            case 4: return '<span class="badge badge-cancelled">Đã hủy</span>';
            default: return '<span>Không rõ</span>';
        }
    }

    async function loadOrders() {
        try {
            const res = await fetch(API_ORDERS, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.status === 401) window.location.href = '../regis_log/login.html';
            allOrders = await res.json();
            currentData = allOrders;
            renderTable();
            renderPagination();
        } catch (e) { console.error(e); }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        const end = start + ROWS_PER_PAGE;
        const paginatedItems = currentData.slice(start, end);

        paginatedItems.forEach(o => {
            tableBody.innerHTML += `
                <tr>
                    <td>#${o.id.substring(0,8)}</td>
                    <td>${formatDate(o.orderDate)}</td>
                    <td><strong>${o.receiverName}</strong><br><small>${o.receiverPhone}</small></td>
                    <td style="color: #e74c3c; font-weight: bold;">${formatCurrency(o.totalAmount)}</td>
                    <td>${o.paymentMethod}</td>
                    <td>${getStatusBadge(o.status)}</td>
                    <td><button class="btn-edit" onclick="viewOrder('${o.id}')"><i class="fas fa-eye"></i> Xem</button></td>
                </tr>
            `;
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(currentData.length / ROWS_PER_PAGE);
        if (pageCount <= 1) return;

        const createBtn = (text, onClick, active = false, disabled = false) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.className = `page-btn ${active ? 'active' : ''}`;
            btn.disabled = disabled;
            btn.onclick = onClick;
            return btn;
        };

        paginationContainer.appendChild(createBtn('<', () => { if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); } }, false, currentPage === 1));
        for (let i = 1; i <= pageCount; i++) {
            paginationContainer.appendChild(createBtn(i, () => { currentPage = i; renderTable(); renderPagination(); }, i === currentPage));
        }
        paginationContainer.appendChild(createBtn('>', () => { if (currentPage < pageCount) { currentPage++; renderTable(); renderPagination(); } }, false, currentPage === pageCount));
    }

    window.searchOrders = () => {
        const term = document.getElementById('search-input').value.toLowerCase();
        currentData = allOrders.filter(o => 
            o.id.toLowerCase().includes(term) || 
            o.receiverName.toLowerCase().includes(term) ||
            o.receiverPhone.includes(term)
        );
        currentPage = 1;
        renderTable();
        renderPagination();
    };

    window.viewOrder = (id) => {
        const order = allOrders.find(o => o.id === id);
        if(order) {
            currentOrderId = id;
            document.getElementById('order-id-display').textContent = '#' + id.substring(0,8);
            document.getElementById('detail-name').textContent = order.receiverName;
            document.getElementById('detail-phone').textContent = order.receiverPhone;
            document.getElementById('detail-address').textContent = order.shippingAddress;
            document.getElementById('detail-date').textContent = formatDate(order.orderDate);
            document.getElementById('detail-method').textContent = order.paymentMethod;
            document.getElementById('detail-note').textContent = order.note || 'Không có';
            document.getElementById('detail-total').textContent = formatCurrency(order.totalAmount);
            document.getElementById('order-status-select').value = order.status;

            const itemsList = document.getElementById('order-items-list');
            itemsList.innerHTML = '';
            if (order.orderDetails) {
                order.orderDetails.forEach(d => {
                    itemsList.innerHTML += `<li><span>${d.pet ? d.pet.name : 'SP đã xóa'} <small>(x${d.quantity})</small></span><strong>${formatCurrency(d.price * d.quantity)}</strong></li>`;
                });
            }
            modal.style.display = 'flex';
        }
    };

    window.updateOrderStatus = async () => {
        const newStatus = parseInt(document.getElementById('order-status-select').value);
        await fetch(`${API_ORDERS}/${currentOrderId}?status=${newStatus}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        modal.style.display = 'none';
        loadOrders();
    };

    window.closeModal = () => modal.style.display = 'none';

    loadOrders();
});