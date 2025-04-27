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

function updatePageContent(lang) {
    // Update document title
    document.title = translations[lang].websiteTitle;
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            // Handle placeholder text for inputs
            if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}

// Modify existing changeLanguage function to include the new update function
function changeLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-language', lang);
    updatePageContent(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}
