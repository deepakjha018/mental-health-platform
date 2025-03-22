function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Check auth status on protected pages
if (window.location.pathname !== '/login.html' && 
    window.location.pathname !== '/register.html') {
    checkAuth();
}

// Add this to handle logout
function logout() {
    localStorage.removeItem('user');
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        window.location.href = '/login.html';
    });
}
