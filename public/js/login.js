document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Get email and password values
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // Check if login credentials are entered
    if (email && password) {
        alert("Login successful!");
        window.location.href = "index.html"; // Redirect to main website
    } else {
        alert("Please enter valid credentials.");
    }
});

// Guest Login Functionality
document.getElementById("guestLogin").addEventListener("click", function() {
    alert("You are continuing as a guest.");
    window.location.href = "index.html"; // Redirect to main website
});