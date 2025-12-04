document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('Vui lòng đăng nhập để thanh toán.');
        window.location.href = 'regis_log/login.html';
        return;
    }

    const API_CART = 'http://localhost:1010/cart';
    const API_ORDER = 'http://localhost:1010/orders';

    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');

    axios.get('https://provinces.open-api.vn/api/?depth=1').then(response => {
        response.data.forEach(city => {
            const option = new Option(city.name, city.code);
            citySelect.add(option);
        });
    });

    citySelect.onchange = () => {
        districtSelect.length = 1;
        wardSelect.length = 1;
        if (citySelect.value) {
            axios.get(`https://provinces.open-api.vn/api/p/${citySelect.value}?depth=2`).then(response => {
                response.data.districts.forEach(dist => {
                    const option = new Option(dist.name, dist.code);
                    districtSelect.add(option);
                });
            });
        }
    };

    districtSelect.onchange = () => {
        wardSelect.length = 1;
        if (districtSelect.value) {
            axios.get(`https://provinces.open-api.vn/api/d/${districtSelect.value}?depth=2`).then(response => {
                response.data.wards.forEach(ward => {
                    const option = new Option(ward.name, ward.code);
                    wardSelect.add(option);
                });
            });
        }
    };

    function formatCurrency(price) {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    async function loadCartSummary() {
        try {
            const response = await fetch(API_CART, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const items = await response.json();
            
            const listContainer = document.getElementById('order-items-list');
            const totalEl = document.getElementById('checkout-total');
            let total = 0;
            let html = '';

            items.forEach(item => {
                total += item.subTotal;
                html += `
                    <div class="summary-row">
                        <span style="font-size: 0.9em;">${item.petName} (x${item.quantity})</span>
                        <span>${formatCurrency(item.subTotal)}</span>
                    </div>
                `;
            });

            listContainer.innerHTML = html;
            totalEl.textContent = formatCurrency(total);
        } catch (error) {
            console.error(error);
        }
    }
    loadCartSummary();

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const cityName = citySelect.options[citySelect.selectedIndex].text;
        const districtName = districtSelect.options[districtSelect.selectedIndex].text;
        const wardName = wardSelect.options[wardSelect.selectedIndex].text;

        const orderData = {
            receiverName: document.getElementById('receiverName').value,
            receiverPhone: document.getElementById('receiverPhone').value,
            city: cityName,
            district: districtName,
            ward: wardName,
            address: document.getElementById('addressDetail').value,
            note: document.getElementById('note').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
        };

        try {
            const response = await fetch(API_ORDER, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const result = await response.json();
                
                if (orderData.paymentMethod === 'VNPAY') {
                    window.location.href = result.paymentUrl; 
                } else {
                    alert('Đặt hàng thành công! Cảm ơn bạn.');
                    window.location.href = '../../index.html';
                }
            } else {
                alert('Đặt hàng thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            alert('Lỗi kết nối server.');
        }
    });
});