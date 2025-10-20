// Hidden admin login - Press Ctrl+Shift+A to trigger
let adminMode = false;

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        showLoginModal();
    }
});

function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="admin-modal-content">
            <span class="admin-close">&times;</span>
            <h2>Admin Login</h2>
            <form id="adminLoginForm">
                <input type="text" id="adminUser" placeholder="Username" required>
                <input type="password" id="adminPass" placeholder="Password" required>
                <button type="submit">Login</button>
                <p id="loginError" class="error-msg"></p>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.admin-close').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    document.getElementById('adminLoginForm').onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;
        
        if (user === ADMIN_CONFIG.username && pass === ADMIN_CONFIG.password) {
            sessionStorage.setItem('adminAuth', 'true');
            adminMode = true;
            modal.remove();
            enableAdminMode();
        } else {
            document.getElementById('loginError').textContent = 'Invalid credentials';
        }
    };
}

function enableAdminMode() {
    document.body.classList.add('admin-active');
    
    // Add edit buttons to editable sections
    const sections = ['aboutMe', 'skills', 'experience', 'education', 'certifications', 'projects'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section && !section.querySelector('.admin-edit-btn')) {
            const btn = document.createElement('button');
            btn.className = 'admin-edit-btn';
            btn.textContent = '✏️ Edit';
            btn.onclick = () => editSection(id);
            section.querySelector('.glass-card').prepend(btn);
        }
    });

    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'admin-logout-btn';
    logoutBtn.textContent = 'Logout Admin';
    logoutBtn.onclick = logout;
    document.body.appendChild(logoutBtn);
}

function editSection(sectionId) {
    const section = document.getElementById(sectionId);
    const content = section.querySelector('.glass-card');
    const currentHTML = content.innerHTML;

    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="admin-modal-content admin-editor">
            <span class="admin-close">&times;</span>
            <h2>Edit ${sectionId}</h2>
            <textarea id="contentEditor">${currentHTML}</textarea>
            <div class="admin-actions">
                <button id="saveContent">Save</button>
                <button id="cancelEdit">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.admin-close').onclick = () => modal.remove();
    document.getElementById('cancelEdit').onclick = () => modal.remove();
    document.getElementById('saveContent').onclick = () => {
        const newContent = document.getElementById('contentEditor').value;
        content.innerHTML = newContent;
        
        // Save to localStorage
        const saved = JSON.parse(localStorage.getItem('portfolioContent') || '{}');
        saved[sectionId] = newContent;
        localStorage.setItem('portfolioContent', JSON.stringify(saved));
        
        modal.remove();
        enableAdminMode(); // Re-add edit buttons
    };
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    adminMode = false;
    document.body.classList.remove('admin-active');
    document.querySelectorAll('.admin-edit-btn, .admin-logout-btn').forEach(el => el.remove());
}

// Check if already logged in
if (sessionStorage.getItem('adminAuth') === 'true') {
    adminMode = true;
    window.addEventListener('load', enableAdminMode);
}

// Load saved content on page load
window.addEventListener('load', () => {
    const saved = JSON.parse(localStorage.getItem('portfolioContent') || '{}');
    Object.keys(saved).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.querySelector('.glass-card').innerHTML = saved[sectionId];
        }
    });
});
