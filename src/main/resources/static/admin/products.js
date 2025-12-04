document.addEventListener('DOMContentLoaded', () => {
    const API_PETS = 'http://localhost:1010/pets'; 
    const API_CATEGORIES = 'http://localhost:1010/categories';
    
    const tableBody = document.getElementById('product-table-body');
    const paginationContainer = document.getElementById('pagination');
    const modal = document.getElementById('productModal');
    const categorySelect = document.getElementById('category');
    const previewImg = document.getElementById('preview-img');
    const productFileInput = document.getElementById('product-file');
    
    let allPets = [];  
    let currentData = []; 
    let currentPage = 1;
    const ROWS_PER_PAGE = 5;
    
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '../regis_log/login.html'; return; }

    function formatCurrency(price) {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    function showToast(message, isSuccess) {
        const toast = document.getElementById('toast-message');
        if(toast) {
            toast.textContent = message;
            toast.style.backgroundColor = isSuccess ? '#2ecc71' : '#e74c3c';
            toast.className = `toast-notification show`;
            setTimeout(() => { toast.classList.remove('show'); }, 3000);
        } else { alert(message); }
    }

    async function loadCategories() {
        try {
            const res = await fetch(API_CATEGORIES);
            const categories = await res.json();
            categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
            categories.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.name;
                categorySelect.appendChild(option);
            });
        } catch (e) { console.error('Lỗi tải danh mục'); }
    }

    async function loadProducts() {
        try {
            const res = await fetch(API_PETS);
            allPets = await res.json();
            
            currentData = allPets;
            currentPage = 1;
            renderTable();
            renderPagination();
            
        } catch (e) { console.error(e); }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        
        const paginatedItems = currentData.slice(startIndex, endIndex);

        paginatedItems.forEach(p => {
            const catName = p.category ? p.category.name : 'Chưa phân loại';
            const originText = p.origin === 0 ? 'Thuần chủng' : 'Lai';
            
            tableBody.innerHTML += `
                <tr>
                    <td><img src="${p.img_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td><b>${p.name}</b></td>
                    <td>${catName}</td>
                    <td style="color: #e74c3c; font-weight: bold;">${formatCurrency(p.price)}</td>
                    <td>${originText}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(currentData.length / ROWS_PER_PAGE);
        
        if (pageCount <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.innerText = '<';
        prevBtn.className = 'page-btn';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
                renderPagination();
            }
        };
        paginationContainer.appendChild(prevBtn);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.onclick = () => {
                currentPage = i;
                renderTable();
                renderPagination();
            };
            paginationContainer.appendChild(btn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.innerText = '>';
        nextBtn.className = 'page-btn';
        nextBtn.disabled = currentPage === pageCount;
        nextBtn.onclick = () => {
            if (currentPage < pageCount) {
                currentPage++;
                renderTable();
                renderPagination();
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    window.searchProducts = () => {
        const term = document.getElementById('search-input').value.toLowerCase();
        
        currentData = allPets.filter(p => p.name.toLowerCase().includes(term));
        
        currentPage = 1;
        
        renderTable();
        renderPagination();
    };

    productFileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    window.openModal = () => {
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('existing-img-url').value = '';
        previewImg.style.display = 'none';
        document.getElementById('modal-title').innerText = 'Thêm Sản Phẩm';
        modal.style.display = 'flex';
    };

    window.closeModal = () => modal.style.display = 'none';

    window.editProduct = (id) => {
        const p = allPets.find(pet => pet.id === id);
        if (p) {
            document.getElementById('product-id').value = p.id;
            document.getElementById('name').value = p.name;
            document.getElementById('price').value = p.price;
            document.getElementById('age').value = p.age;
            document.getElementById('gender').value = p.gender;
            document.getElementById('origin').value = p.origin;
            document.getElementById('color').value = p.color || '';
            document.getElementById('health').value = p.health || '';
            document.getElementById('characteristic').value = p.characteristic || '';
            
            if (p.category) document.getElementById('category').value = p.category.id;
            
            document.getElementById('existing-img-url').value = p.img_url;
            previewImg.src = p.img_url;
            previewImg.style.display = 'block';
            
            document.getElementById('modal-title').innerText = 'Sửa Sản Phẩm';
            modal.style.display = 'flex';
        }
    };

    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value;
        const file = productFileInput.files[0];
        
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('age', document.getElementById('age').value);
        formData.append('gender', document.getElementById('gender').value);
        formData.append('origin', document.getElementById('origin').value);
        formData.append('color', document.getElementById('color').value);
        formData.append('health', document.getElementById('health').value);
        formData.append('characteristic', document.getElementById('characteristic').value);
        formData.append('categoryId', document.getElementById('category').value);
        formData.append('img_url', document.getElementById('existing-img-url').value);

        if (file) {
            formData.append('file', file);
        }

        const url = id ? `${API_PETS}/${id}` : API_PETS;
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                showToast('Lưu thành công!', true);
                closeModal();
                loadProducts();
            } else {
                const err = await res.json();
                showToast(err.message || 'Lỗi lưu sản phẩm', false);
            }
        } catch (e) {
            console.error(e);
            showToast('Lỗi kết nối server', false);
        }
    });
    window.deleteProduct = async (id) => {
        if(confirm('Xóa sản phẩm này?')) {
            try {
                const res = await fetch(`${API_PETS}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(res.ok) {
                    showToast('Đã xóa thành công', true);
                    loadProducts();
                }
            } catch (e) { console.error(e); }
        }
    };

    loadCategories();
    loadProducts();
});