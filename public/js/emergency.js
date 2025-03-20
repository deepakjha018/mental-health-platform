// Emergency Help Page Functionality
class EmergencySupport {
    constructor() {
        this.initializeGeolocation();
        this.bindEvents();
        this.loadResources();
    }

    initializeGeolocation() {
        this.userLocation = null;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                },
                error => {
                    console.log("Error getting location:", error);
                }
            );
        }
    }

    bindEvents() {
        // Bind click events for resource buttons
        document.querySelectorAll('.btn-resource').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('onclick');
                if (action) {
                    const functionName = action.replace('()', '');
                    if (typeof this[functionName] === 'function') {
                        this[functionName]();
                    }
                }
            });
        });

        // Bind find help button
        const findHelpBtn = document.querySelector('.btn-find-help');
        if (findHelpBtn) {
            findHelpBtn.addEventListener('click', () => this.findLocalHelp());
        }
    }

    loadResources() {
        this.resources = {
            emergencyContacts: [
                {
                    name: "National Suicide Prevention Lifeline",
                    number: "1-800-273-8255",
                    available: "24/7"
                },
                {
                    name: "Crisis Text Line",
                    number: "741741",
                    available: "24/7"
                },
                {
                    name: "Emergency Services",
                    number: "911",
                    available: "24/7"
                }
            ],
            localServices: [],
            copingStrategies: [
                "Deep breathing exercises",
                "Grounding techniques",
                "Progressive muscle relaxation",
                "Mindfulness meditation",
                "Positive affirmations"
            ]
        };
    }

    findLocalHelp() {
        if (!this.userLocation) {
            this.showMessage("Please enable location services to find help nearby.", "warning");
            return;
        }

        // Simulate API call to find local mental health services
        this.showMessage("Searching for mental health services in your area...", "info");
        
        // In a real implementation, this would make an API call to a service directory
        setTimeout(() => {
            const mockServices = [
                {
                    name: "City Mental Health Center",
                    distance: "2.3 miles",
                    phone: "555-0123",
                    address: "123 Health St"
                },
                {
                    name: "Community Crisis Center",
                    distance: "3.1 miles",
                    phone: "555-0124",
                    address: "456 Care Ave"
                }
            ];

            this.displayLocalServices(mockServices);
        }, 1000);
    }

    displayLocalServices(services) {
        const container = document.createElement('div');
        container.className = 'local-services-modal';
        
        container.innerHTML = `
            <div class="modal-content">
                <h3>Mental Health Services Nearby</h3>
                <div class="services-list">
                    ${services.map(service => `
                        <div class="service-item">
                            <h4>${service.name}</h4>
                            <p><i class="fas fa-map-marker-alt"></i> ${service.distance}</p>
                            <p><i class="fas fa-phone"></i> ${service.phone}</p>
                            <p><i class="fas fa-location-dot"></i> ${service.address}</p>
                            <a href="tel:${service.phone}" class="btn-call">Call Now</a>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-close">Close</button>
            </div>
        `;

        document.body.appendChild(container);

        container.querySelector('.btn-close').addEventListener('click', () => {
            container.remove();
        });
    }

    showSafetyPlan() {
        const safetyPlanSteps = [
            "Recognize warning signs",
            "Use internal coping strategies",
            "Connect with others",
            "Contact professionals",
            "Make the environment safe",
            "Reasons to live"
        ];

        this.showModal("Create Safety Plan", safetyPlanSteps);
    }

    showCopingStrategies() {
        this.showModal("Coping Strategies", this.resources.copingStrategies);
    }

    showSupportNetwork() {
        const networkSteps = [
            "Identify trusted friends and family",
            "Add professional support contacts",
            "Join support groups",
            "Create emergency contact list",
            "Share your plan with trusted people"
        ];

        this.showModal("Build Support Network", networkSteps);
    }

    showModal(title, items) {
        const modal = document.createElement('div');
        modal.className = 'resource-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <ul class="resource-steps">
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <button class="btn-close">Close</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.btn-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// Initialize emergency support when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmergencySupport();
});

function findLocalHelp() {
    alert("Finding local help...");
}

function showSafetyPlan() {
    alert("Creating a safety plan...");
}

function showCopingStrategies() {
    alert("Viewing coping strategies...");
}

function showSupportNetwork() {
    alert("Building a support network...");
}