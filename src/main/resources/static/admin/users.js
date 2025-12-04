document.addEventListener('DOMContentLoaded', () => {
    const API_USERS = 'http://localhost:1010/users'; 
    const tableBody = document.getElementById('user-table-body');
    const paginationContainer = document.getElementById('pagination');
    const modal = document.getElementById('userModal');

    let allUsers = [];
    let currentData = [];
    let currentPage = 1;
    const ROWS_PER_PAGE = 5;

    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '../regis_log/login.html'; return; }

    async function loadUsers() {
        try {
            const response = await fetch(API_USERS, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            allUsers = await response.json();
            currentData = allUsers;
            renderTable();
            renderPagination();
        } catch (error) { console.error(error); }
    }

    function renderTable() {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        const end = start + ROWS_PER_PAGE;
        const paginatedItems = currentData.slice(start, end);

        paginatedItems.forEach(u => {
            let actionBtn = '';
            if (u.status === 1) {
                actionBtn = `<button class="btn-delete" onclick="toggleUserStatus('${u.id}', 0)" title="Khóa"><i class="fas fa-lock"></i></button>`;
            } else {
                actionBtn = `<button class="btn-unlock" onclick="toggleUserStatus('${u.id}', 1)" title="Mở khóa"><i class="fas fa-unlock"></i></button>`;
            }

            tableBody.innerHTML += `
                <tr>
                    <td>${u.username}</td>
                    <td>${u.name}</td>
                    <td>${u.role === 0 ? '<b style="color:red">Admin</b>' : 'User'}</td>
                    <td>${u.status === 1 ? '<span style="color:green">Active</span>' : '<span style="color:gray">Locked</span>'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editUser('${u.id}')"><i class="fas fa-edit"></i></button>
                            ${actionBtn}
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

        const createBtn = (text, onClick, active = false, disabled = false) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            btn.className = `page-btn ${active ? 'active' : ''}`;
            btn.disabled = disabled;
            btn.onclick = onClick;
            return btn;
        };

        paginationContainer.appendChild(createBtn('<', () => {
            if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); }
        }, false, currentPage === 1));

        for (let i = 1; i <= pageCount; i++) {
            paginationContainer.appendChild(createBtn(i, () => {
                currentPage = i; renderTable(); renderPagination();
            }, i === currentPage));
        }


        paginationContainer.appendChild(createBtn('>', () => {
            if (currentPage < pageCount) { currentPage++; renderTable(); renderPagination(); }
        }, false, currentPage === pageCount));
    }

    window.searchUsers = () => {
        const term = document.getElementById('search-input').value.toLowerCase();
        currentData = allUsers.filter(u => 
            u.username.toLowerCase().includes(term) || 
            u.name.toLowerCase().includes(term)
        );
        currentPage = 1;
        renderTable();
        renderPagination();
    };

    window.openModal = () => { modal.style.display = 'flex'; };
    window.closeModal = () => modal.style.display = 'none';
    
    window.editUser = (id) => {
        const u = allUsers.find(user => user.id === id);
        if (u) {
            document.getElementById('user-id').value = u.id;
            document.getElementById('username').value = u.username;
            document.getElementById('username').disabled = true;
            document.getElementById('fullname').value = u.name;
            document.getElementById('role').value = u.role;
            document.getElementById('status').value = u.status;
            modal.style.display = 'flex';
        }
    };

    document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const password = document.getElementById('password').value;
        const data = {
            username: document.getElementById('username').value,
            name: document.getElementById('fullname').value,
            role: parseInt(document.getElementById('role').value),
            status: parseInt(document.getElementById('status').value)
        };
        if (password) data.password = password;

        const url = id ? `${API_USERS}/${id}` : API_USERS;
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        closeModal();
        loadUsers();
    });

    window.toggleUserStatus = async (id, newStatus) => {
        if (confirm('Bạn có chắc chắn?')) {
            await fetch(`${API_USERS}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            loadUsers();
        }
    };

    loadUsers();
});