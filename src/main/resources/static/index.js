document.addEventListener('DOMContentLoaded', () => {
    let allPets = [];
    let filteredPets = []; 
    
    const petListContainer = document.getElementById('pet-list');
    const paginationContainer = document.getElementById('pagination-controls');
    
    const filterAllButton = document.getElementById('filter-all');
    const filterDogsButton = document.getElementById('filter-dogs');
    const filterCatsButton = document.getElementById('filter-cats');
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const ITEMS_PER_PAGE = 9; 
    let currentPage = 1;
    const API_URL = 'http://localhost:1010/pets';
    const API_USER_DETAILS = 'http://localhost:1010/users/details';
    function updateHeaderUI() {
        const token = localStorage.getItem('accessToken');
        const currentUsername = localStorage.getItem('currentUsername');
        const headerRight = document.querySelector('.header-right-actions');

        if (!headerRight) return;

        if (token && currentUsername) {
            headerRight.innerHTML = `
                <div class="user-dropdown-container">
                    <div class="user-icon-area">
                        <i class="fas fa-user-circle"></i> 
                        ${currentUsername}
                    </div>
                    <ul class="dropdown-menu" id="user-menu">
                        <li class="username-display">Xin chào, ${currentUsername}!</li>
                        <li>
                            <a href="user/profile/profile.html" id="manage-profile-btn"> <i class="fas fa-cog"></i> Quản lý thông tin
                            </a>
                        </li>
                        <li>
                            <a href="#" id="logout-btn">
                                <i class="fas fa-sign-out-alt"></i> Đăng xuất
                            </a>
                        </li>
                    </ul>
                </div>
                <a href="user/cart/cart.html" class="nav-icon cart-icon" title="Giỏ hàng">
                    <i class="fas fa-shopping-cart"></i> 
                    <span id="cart-count" class="cart-badge">0</span>
                </a>
            `;
            const logoutBtn = document.getElementById('logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.clear();
                    alert('Bạn đã đăng xuất.');
                    window.location.reload();
                });
            }
        } else {
            headerRight.innerHTML = `
                <a href="regis_log/login.html" class="nav-icon" title="Đăng nhập"><i class="fas fa-sign-in-alt"></i></a>
                <a href="regis_log/register.html" class="nav-icon" title="Đăng ký"><i class="fas fa-user-plus"></i></a>
                <a href="user/cart/cart.html" class="nav-icon cart-icon" title="Giỏ hàng">
                    <i class="fas fa-shopping-cart"></i> 
                    <span id="cart-count" class="cart-badge">0</span>
                </a>
            `;
        }
    }
    async function verifyTokenOnLoad() {
        const token = localStorage.getItem('accessToken');
        const username = localStorage.getItem('currentUsername');

        if (!token) return;

        try {
            const response = await fetch(`${API_USER_DETAILS}?username=${username}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                console.warn('Token hết hạn hoặc Server reset key. Tự động đăng xuất.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('currentUsername');
                localStorage.removeItem('role');
                updateHeaderUI();
            }
        } catch (error) {
            console.error('Không thể kết nối Server để check token:', error);
        }
    }
    function formatCurrency(price) {
        if (typeof price !== 'number') price = parseFloat(price);
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    function getGenderInfo(genderCode) {
        if (genderCode === 0) return { text: 'Đực', iconClass: 'fas fa-mars gender-male' };
        if (genderCode === 1) return { text: 'Cái', iconClass: 'fas fa-venus gender-female' };
        return { text: 'Không rõ', iconClass: 'fas fa-genderless' };
    }
    
    function createPetCard(pet) {
        const gender = getGenderInfo(pet.gender);
        return `
            <a href="pet-details/detail.html?id=${pet.id}" class="pet-card-link">
                <div class="pet-card" data-id="${pet.id}">
                    <img src="${pet.img_url}" alt="${pet.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x250?text=No+Image'"/>
                    <div class="pet-info">
                        <h3>${pet.name}</h3>
                        <p class="pet-price">${formatCurrency(pet.price)}</p>
                        
                        <div class="pet-detail">
                            <div class="detail-item">
                                <i class="fas fa-paw"></i>
                                <span>${pet.category ? pet.category.name : 'Khác'}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-birthday-cake"></i>
                                <span>${pet.age} tháng</span>
                            </div>
                            <div class="detail-item">
                                <i class="${gender.iconClass}"></i>
                                <span>${gender.text}</span>
                            </div>
                        </div>

                        <p style="font-size:0.9em;">
                            <strong>Đặc điểm:</strong> ${pet.characteristic}
                        </p>
                    </div>
                </div>
            </a>
        `;
    }

    function displayPetsForCurrentPage(petsToDisplay) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentItems = petsToDisplay.slice(startIndex, endIndex);

        if(!petListContainer) return;
        petListContainer.innerHTML = ''; 
        
        if (currentItems.length === 0) {
            petListContainer.innerHTML = '<p style="text-align:center; width:100%;">Không tìm thấy thú cưng nào phù hợp.</p>';
            return;
        }

        currentItems.forEach(pet => {
            petListContainer.insertAdjacentHTML('beforeend', createPetCard(pet));
        });
    }

    function setupPagination(petsToDisplay) {
        if(!paginationContainer) return;
        const totalPages = Math.ceil(petsToDisplay.length / ITEMS_PER_PAGE);
        paginationContainer.innerHTML = ''; 
        
        if (totalPages <= 1) return;
        
        const prevButton = document.createElement('button');
        prevButton.textContent = '<< Trước';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => { currentPage--; renderPage(petsToDisplay); });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', () => { currentPage = i; renderPage(petsToDisplay); });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Sau >>';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => { currentPage++; renderPage(petsToDisplay); });
        paginationContainer.appendChild(nextButton);
    }

    function renderPage(pets) {
        displayPetsForCurrentPage(pets);
        setupPagination(pets);
        if (petListContainer) petListContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function handleFilter(categoryName) {
        document.querySelectorAll('.filter-controls button').forEach(btn => btn.classList.remove('active'));
        if(searchInput) searchInput.value = '';

        let buttonId = "filter-all";
        if (categoryName === "Chó") buttonId = "filter-dogs";
        else if (categoryName === "Mèo") buttonId = "filter-cats";
        
        const btn = document.getElementById(buttonId);
        if(btn) btn.classList.add('active');

        if (categoryName === 'Tất cả') {
            filteredPets = allPets;
        } else {
            filteredPets = allPets.filter(pet => pet.category && pet.category.name === categoryName);
        }
        currentPage = 1;
        renderPage(filteredPets);
    }

    function handleSearch() {
        if(!searchInput) return;
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        document.querySelectorAll('.filter-controls button').forEach(btn => btn.classList.remove('active'));

        if (!searchTerm) {
            handleFilter('Tất cả');
            return;
        }

        const searchResults = allPets.filter(pet => {
            return pet.name.toLowerCase().includes(searchTerm) ||
                   (pet.color && pet.color.toLowerCase().includes(searchTerm)) ||
                   (pet.characteristic && pet.characteristic.toLowerCase().includes(searchTerm)) ||
                   (pet.category && pet.category.name.toLowerCase().includes(searchTerm));
        });

        currentPage = 1;
        renderPage(searchResults);
    }

    if (filterAllButton) filterAllButton.addEventListener('click', () => handleFilter('Tất cả'));
    if (filterDogsButton) filterDogsButton.addEventListener('click', () => handleFilter('Chó'));
    if (filterCatsButton) filterCatsButton.addEventListener('click', () => handleFilter('Mèo'));
    
    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    async function fetchPets() {
        if (petListContainer) petListContainer.innerHTML = '<p style="text-align:center; width:100%;">Đang kết nối đến API Java...</p>';

        try {
            const response = await fetch(API_URL); 
            if (!response.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}.`);
            
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Dữ liệu không hợp lệ.");

            allPets = data;
            filteredPets = allPets;
            renderPage(filteredPets);
            
            if (filterAllButton) filterAllButton.classList.add('active');

        } catch (error) {
            console.error('LỖI KẾT NỐI API:', error);
            if (petListContainer) {
                petListContainer.innerHTML = `
                    <p style="color:red; text-align:center; width:100%;">
                        ❌ Lỗi kết nối API! Backend có đang chạy không?<br>${error.message}
                    </p>
                `;
            }
            if (paginationContainer) paginationContainer.innerHTML = '';
        }
    }

    updateHeaderUI(); 
    verifyTokenOnLoad();
    fetchPets();
});