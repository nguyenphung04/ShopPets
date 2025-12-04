document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('pet-detail-container');
    const API_BASE_URL = 'http://localhost:1010/pets/'; 
    let currentPet = null;

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    function formatCurrency(price) {
        if (typeof price !== 'number') price = parseFloat(price);
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    function getGenderText(genderCode) {
        return genderCode === 0 ? 'Đực' : (genderCode === 1 ? 'Cái' : 'Không rõ');
    }
    
    function getPetIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function addToCart(pet, quantity) {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            if (confirm('Bạn cần đăng nhập để mua hàng. Đi đến trang đăng nhập ngay?')) {
                window.location.href = 'regis_log/login.html';
            }
            return;
        }

        try {
            const response = await fetch('http://localhost:1010/cart/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    petId: pet.id,
                    quantity: quantity
                })
            });

            if (response.ok) {
                alert(`Đã thêm ${quantity} x ${pet.name} vào giỏ hàng thành công!`);
            } else {
                if (response.status === 401) {
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    window.location.href = '../regis_log/login.html';
                } else {
                    alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('Lỗi thêm giỏ hàng:', error);
            alert('Lỗi kết nối đến Server.');
        }
    }

    function createBreadcrumb(pet) {
        const categoryName = pet.category ? pet.category.name : 'Danh mục';
        const petNameShort = pet.name.length > 30 ? pet.name.substring(0, 30) + '...' : pet.name;
        
        return `
            <div class="breadcrumb">
                <a href="../index.html">Trang chủ</a> 
                <i class="fas fa-chevron-right"></i>
                <a href="../index.html?filter=${categoryName}">${categoryName}</a>
                <i class="fas fa-chevron-right"></i>
                <span>${petNameShort}</span>
            </div>
        `;
    }
    function renderPetDetail(pet) {
        if (!pet || !pet.category) {
            detailContainer.innerHTML = '<p style="text-align:center; color:red; margin-top: 100px;">Không tìm thấy thông tin sản phẩm.</p>';
            return;
        }
        
        currentPet = pet; 
        const genderText = getGenderText(pet.gender); 
        const breadcrumbHTML = createBreadcrumb(pet);

        detailContainer.innerHTML = `
            ${breadcrumbHTML}
            <div class="detail-container">
                
                <div class="detail-image-wrapper">
                    <img src="${pet.img_url}" alt="${pet.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/500x500?text=No+Image'"/>
                </div>
                
                <div class="detail-info">
                    <h2>${pet.name}</h2>
                    
                    <p class="detail-price">${formatCurrency(pet.price)}</p>
                    
                    <div class="detail-tech-specs">
                        
                        <div class="detail-section-row">
                            <strong>Loại:</strong>
                            <span>${pet.category.name}</span>
                        </div>
                        
                        <div class="detail-section-row">
                            <strong>Màu sắc:</strong>
                            <span>${pet.color || 'Đang cập nhật'}</span>
                        </div>

                        <div class="detail-section-row">
                            <strong>Tuổi:</strong>
                            <span>${pet.age || 'Đang cập nhật'} tháng</span>
                        </div>

                        <div class="detail-section-row">
                            <strong>Giới tính:</strong>
                            <span>${genderText}</span>
                        </div>
                        
                        <div class="detail-section-row">
                            <strong>Sức khỏe:</strong>
                            <span>${pet.health || 'Tốt'}</span>
                        </div>
                        
                        <div class="detail-section-row">
                            <strong>Đặc điểm:</strong>
                            <span>${pet.characteristic || 'Không có'}</span>
                        </div>

                    </div>

                    <div class="quantity-controls">
                        <label for="quantity">Số lượng:</label>
                        <input type="number" id="quantity" value="1" min="1" max="100">
                    </div>

                    <div class="action-buttons">
                        <button id="add-to-cart-btn" class="add-to-cart-btn">
                            <i class="fas fa-shopping-basket"></i> Thêm vào Giỏ hàng
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        
        const quantityInput = document.getElementById('quantity');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            addToCart(currentPet, quantity);
        });
    }

    const mockSearch = () => {
        const term = searchInput.value;
        if (term) {
            window.location.href = `../index.html?search=${encodeURIComponent(term)}`;
        }
    };

    if (searchButton) searchButton.addEventListener('click', mockSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            mockSearch();
        }
    });
    
    async function fetchPetDetail(id) {
        detailContainer.innerHTML = '<p style="text-align:center; margin-top: 100px;">Đang tải thông tin chi tiết...</p>';

        try {
            const response = await fetch(API_BASE_URL + id); 
            
            if (!response.ok) {
                if (response.status === 404) {
                     throw new Error("Không tìm thấy thú cưng với ID này.");
                }
                throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}.`);
            }
            
            const petData = await response.json();
            renderPetDetail(petData);

        } catch (error) {
            console.error('LỖI KẾT NỐI API CHI TIẾT:', error);
            detailContainer.innerHTML = `
                <p style="text-align:center; color:red; margin-top: 100px;">
                    ❌ Lỗi: ${error.message} 
                    <br>
                    Vui lòng kiểm tra kết nối API và ID sản phẩm.
                </p>
            `;
        }
    }

    const petId = getPetIdFromUrl();

    if (petId) {
        fetchPetDetail(petId);
    } else {
        detailContainer.innerHTML = '<p style="text-align:center; color:red; margin-top: 100px;">Thiếu ID sản phẩm. Không thể tải chi tiết.</p>';
    }
});