function showLocalHelp() {
    hideAllSections();
    document.getElementById('localHelp').classList.add('active');
}

function showSupportGroups() {
    hideAllSections();
    document.getElementById('supportGroups').classList.add('active');
}

function showSelfHelp() {
    hideAllSections();
    document.getElementById('selfHelp').classList.add('active');
}

function showHelpOthers() {
    hideAllSections();
    document.getElementById('helpOthers').classList.add('active');
}

function hideAllSections() {
    const sections = document.querySelectorAll('.resource-section');
    sections.forEach(section => section.classList.remove('active'));
}

function searchLocalHelp() {
    const zipCode = document.getElementById('locationInput').value;
    if (zipCode) {
        // Here you would typically make an API call to get local facilities
        // For demo purposes, showing static example:
        const facilitiesList = document.getElementById('facilitiesList');
        facilitiesList.innerHTML = `
            <div class="facility">
                <h4>Mental Health Center</h4>
                <p>123 Main St, ${zipCode}</p>
                <p>Phone: (555) 123-4567</p>
                <a href="tel:5551234567" class="btn-call">Call Now</a>
            </div>
        `;
    }
}

// Add event listeners for facility type filtering
document.addEventListener('DOMContentLoaded', function() {
    const facilityButtons = document.querySelectorAll('.facility-type');
    facilityButtons.forEach(button => {
        button.addEventListener('click', function() {
            facilityButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Here you would filter facilities based on type
        });
    });
});
