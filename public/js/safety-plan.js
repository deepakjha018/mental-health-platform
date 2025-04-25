let currentStep = 1;
const safetyPlan = {
    warningSigns: [],
    copingStrategies: [],
    contacts: [],
    professionals: []
};

function openSafetyPlanModal() {
    document.getElementById('safetyPlanModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSafetyPlanModal() {
    const modal = document.getElementById('safetyPlanModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Reset the form state
    currentStep = 1;
    const steps = document.querySelectorAll('.plan-step');
    steps.forEach(step => step.classList.remove('active'));
    steps[0].classList.add('active');
    
    // Clear any success messages
    const successMessage = modal.querySelector('.success-message');
    if (successMessage) {
        successMessage.remove();
    }
}

function nextStep(step) {
    document.querySelector(`.plan-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.plan-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('completed');
    currentStep = step;
    updateProgress();
}

function previousStep(step) {
    document.querySelector(`.plan-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.plan-step[data-step="${step}"]`).classList.add('active');
    currentStep = step;
    updateProgress();
}

function updateProgress() {
    const progress = ((currentStep - 1) / 3) * 100;
    document.querySelectorAll('.step-progress').forEach((el, index) => {
        if (index < currentStep - 1) {
            el.style.width = '100%';
        }
    });
}

function addWarningSign() {
    const input = document.getElementById('warningSign');
    if (input.value.trim()) {
        safetyPlan.warningSigns.push(input.value);
        addListItem('warningSignsList', input.value);
        input.value = '';
    }
}

function addCopingStrategy() {
    const input = document.getElementById('copingStrategy');
    if (input.value.trim()) {
        safetyPlan.copingStrategies.push(input.value);
        addListItem('copingStrategiesList', input.value);
        input.value = '';
    }
}

function addContact() {
    const name = document.getElementById('contactName');
    const phone = document.getElementById('contactPhone');
    if (name.value.trim() && phone.value.trim()) {
        const contact = { name: name.value, phone: phone.value };
        safetyPlan.contacts.push(contact);
        addListItem('contactsList', `${name.value} - ${phone.value}`);
        name.value = '';
        phone.value = '';
    }
}

function addProfessional() {
    const name = document.getElementById('professionalName');
    const phone = document.getElementById('professionalPhone');
    if (name.value.trim() && phone.value.trim()) {
        const professional = { name: name.value, phone: phone.value };
        safetyPlan.professionals.push(professional);
        addListItem('professionalsList', `${name.value} - ${phone.value}`);
        name.value = '';
        phone.value = '';
    }
}

function addListItem(listId, text) {
    const list = document.getElementById(listId);
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="list-item">
            <span>${text}</span>
            <button class="btn-remove" onclick="this.parentElement.remove()">×</button>
        </div>
    `;
    li.classList.add('fade-in');
    list.appendChild(li);
}

function saveSafetyPlan() {
    localStorage.setItem('safetyPlan', JSON.stringify(safetyPlan));
    showSuccessMessage();
}

function showSuccessMessage() {
    const modalContent = document.querySelector('.modal-content');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message fade-in';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Safety Plan Saved!</h3>
        <p>Your plan has been saved successfully.</p>
        <button onclick="closeSafetyPlanModal()" class="btn-close">Close</button>
    `;
    modalContent.appendChild(successDiv);
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    const modal = document.getElementById('safetyPlanModal');
    window.onclick = function(event) {
        if (event.target === modal) {
            closeSafetyPlanModal();
        }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeSafetyPlanModal();
        }
    });
});
