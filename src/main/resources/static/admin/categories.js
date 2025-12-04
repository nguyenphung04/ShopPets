document.addEventListener('DOMContentLoaded', () => {
    const API_CATS = 'http://localhost:1010/categories';
    const tableBody = document.getElementById('cat-table-body');
    const modal = document.getElementById('catModal');
    let allCats = [];
    const token = localStorage.getItem('accessToken');
    
    async function loadCats() {
        const res = await fetch(API_CATS);
        allCats = await res.json();
        renderTable(allCats);
    }

    function renderTable(cats) {
        tableBody.innerHTML = '';
        cats.forEach(c => {
            tableBody.innerHTML += `
                <tr>
                    <td>${c.id.substring(0, 8)}...</td>
                    <td><b>${c.name}</b></td>
                    <td>
                        <span style="background: #e1f5fe; color: #0288d1; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
                            ${c.productCount} sản phẩm
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editCat('${c.id}')"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="btn-delete" onclick="deleteCat('${c.id}')"><i class="fas fa-trash"></i> Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    window.openModal = () => {
        document.getElementById('cat-form').reset();
        document.getElementById('cat-id').value = '';
        document.getElementById('modal-title').innerText = 'Thêm Danh Mục';
        modal.style.display = 'flex';
    };
    window.closeModal = () => modal.style.display = 'none';

    window.editCat = (id) => {
        const c = allCats.find(cat => cat.id === id);
        if (c) {
            document.getElementById('cat-id').value = c.id;
            document.getElementById('cat-name').value = c.name;
            document.getElementById('modal-title').innerText = 'Sửa Danh Mục';
            modal.style.display = 'flex';
        }
    };

    document.getElementById('cat-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-id').value;
        const name = document.getElementById('cat-name').value;
        const url = id ? `${API_CATS}/${id}` : API_CATS;
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name })
        });
        closeModal();
        loadCats();
    });

    window.deleteCat = async (id) => {
        if(confirm('Xóa danh mục này?')) {
            await fetch(`${API_CATS}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            loadCats();
        }
    };
    
    window.searchCats = () => {
        const term = document.getElementById('search-input').value.toLowerCase();
        renderTable(allCats.filter(c => c.name.toLowerCase().includes(term)));
    };

    loadCats();
});