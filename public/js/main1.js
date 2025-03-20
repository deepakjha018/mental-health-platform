class UserSession {
    static init() {
        const session = localStorage.getItem('userSession');
        const nav = document.querySelector('header nav');
        const loginBtn = nav.querySelector('.btn-login');

        if (session) {
            const userData = JSON.parse(session);
            if (userData.isLoggedIn) {
                // Replace login button with user menu
                if (loginBtn) {
                    const userMenu = document.createElement('div');
                    userMenu.className = 'user-menu';
                    userMenu.innerHTML = `
                        <button class="user-button">
                            <i class="fas fa-user-circle"></i>
                            ${userData.username}
                        </button>
                        <div class="user-dropdown">
                            <a href="/profile.html"><i class="fas fa-user"></i> Profile</a>
                            <a href="/settings.html"><i class="fas fa-cog"></i> Settings</a>
                            <a href="#" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                        </div>
                    `;
                    loginBtn.replaceWith(userMenu);

                    // Add logout functionality
                    userMenu.querySelector('.logout-btn').addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('userSession');
                        window.location.reload();
                    });
                }
            }
        }
    }
}

// Initialize user session management
document.addEventListener('DOMContentLoaded', UserSession.init);
