class WellnessTracker {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.initializeMoodChart();
        this.initializeCarousel();
        this.loadTodayData();
    }

    initializeElements() {
        // Mood tracking elements
        this.moodButtons = document.querySelectorAll('.mood-btn');
        this.moodNotes = document.querySelector('.mood-notes textarea');
        
        // Activity tracking elements
        this.activityChecklist = document.querySelectorAll('.activity-checklist input');
        
        // Save button
        this.saveButton = document.querySelector('.save-progress');
        
        // Tips carousel elements
        this.carousel = document.querySelector('.tips-carousel');
        this.carouselDots = document.querySelectorAll('.carousel-dots .dot');
        
        // Chart
        this.moodChart = document.getElementById('moodChart');
    }

    bindEvents() {
        // Mood selection
        this.moodButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleMoodSelection(btn));
        });

        // Activity checkboxes
        this.activityChecklist.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleActivityToggle(checkbox));
        });

        // Save progress
        this.saveButton.addEventListener('click', () => this.saveProgress());

        // Carousel navigation
        this.carouselDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.showTip(index));
        });

        // Auto-save on changes
        this.moodNotes.addEventListener('input', debounce(() => this.autoSave(), 1000));
    }

    handleMoodSelection(button) {
        // Remove active class from all buttons
        this.moodButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        button.classList.add('active');
        
        // Trigger auto-save
        this.autoSave();
    }

    handleActivityToggle(checkbox) {
        // Update progress bar
        this.updateActivityProgress();
        
        // Trigger auto-save
        this.autoSave();
    }

    updateActivityProgress() {
        const total = this.activityChecklist.length;
        const completed = Array.from(this.activityChecklist).filter(cb => cb.checked).length;
        const progress = (completed / total) * 100;

        // Update progress visualization
        document.querySelector('.activity-progress').style.width = `${progress}%`;
    }

    initializeMoodChart() {
        const ctx = this.moodChart.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast7Days(),
                datasets: [{
                    label: 'Mood Score',
                    data: this.getLast7DaysMood(),
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', 'Bad', 'Down', 'Okay', 'Good', 'Great'];
                                return labels[value];
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        return days;
    }

    getLast7DaysMood() {
        // Get mood data from localStorage or return placeholder data
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || {};
        const last7Days = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            last7Days.push(moodHistory[dateKey] || null);
        }
        
        return last7Days;
    }

    initializeCarousel() {
        this.currentTip = 0;
        this.tipCount = document.querySelectorAll('.tip-card').length;
        
        // Start auto-rotation
        this.startCarousel();
    }

    startCarousel() {
        this.carouselInterval = setInterval(() => {
            this.showNextTip();
        }, 5000);
    }

    showNextTip() {
        this.currentTip = (this.currentTip + 1) % this.tipCount;
        this.showTip(this.currentTip);
    }

    showTip(index) {
        // Update tip cards
        const tips = document.querySelectorAll('.tip-card');
        tips.forEach(tip => tip.classList.remove('active'));
        tips[index].classList.add('active');

        // Update dots
        this.carouselDots.forEach(dot => dot.classList.remove('active'));
        this.carouselDots[index].classList.add('active');

        // Reset interval
        clearInterval(this.carouselInterval);
        this.startCarousel();
    }

    loadTodayData() {
        const today = new Date().toISOString().split('T')[0];
        const savedData = JSON.parse(localStorage.getItem(`wellness_${today}`)) || {};

        // Load mood
        if (savedData.mood) {
            const moodBtn = document.querySelector(`[data-mood="${savedData.mood}"]`);
            if (moodBtn) moodBtn.classList.add('active');
        }

        // Load notes
        if (savedData.notes) {
            this.moodNotes.value = savedData.notes;
        }

        // Load activities
        if (savedData.activities) {
            this.activityChecklist.forEach(checkbox => {
                checkbox.checked = savedData.activities[checkbox.name] || false;
            });
            this.updateActivityProgress();
        }
    }

    autoSave() {
        const data = this.collectData();
        const today = new Date().toISOString().split('T')[0];
        
        localStorage.setItem(`wellness_${today}`, JSON.stringify(data));
        this.updateMoodHistory(data.mood);
        this.updateChart();
    }

    saveProgress() {
        this.autoSave();
        
        // Show success message
        const saveButton = document.querySelector('.save-progress');
        const originalText = saveButton.innerHTML;
        
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveButton.classList.add('saved');
        
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.classList.remove('saved');
        }, 2000);
    }

    collectData() {
        // Get selected mood
        const activeMoodBtn = document.querySelector('.mood-btn.active');
        const mood = activeMoodBtn ? activeMoodBtn.dataset.mood : null;

        // Get notes
        const notes = this.moodNotes.value;

        // Get activities
        const activities = {};
        this.activityChecklist.forEach(checkbox => {
            activities[checkbox.name] = checkbox.checked;
        });

        return {
            mood,
            notes,
            activities,
            timestamp: new Date().toISOString()
        };
    }

    updateMoodHistory(mood) {
        const moodValues = {
            'great': 5,
            'good': 4,
            'okay': 3,
            'down': 2,
            'bad': 1
        };

        if (!mood) return;

        const today = new Date().toISOString().split('T')[0];
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || {};
        
        moodHistory[today] = moodValues[mood];
        localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    }

    updateChart() {
        this.chart.data.datasets[0].data = this.getLast7DaysMood();
        this.chart.update();
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize wellness tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WellnessTracker();
}); 