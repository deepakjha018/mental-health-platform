class DailyWellness {
    constructor() {
        this.currentMood = null;
        this.habits = {
            sleep: 0,
            eating: 0,
            activity: 0,
            mindfulness: 0
        };
        this.activities = {
            breathing: 0,
            gratitude: [],
            dailyGoal: { text: '', completed: false }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadProgress();
        this.initializeCharts();
    }

    initializeElements() {
        // Mood elements
        this.moodButtons = document.querySelectorAll('.mood-btn');
        this.moodNotes = document.querySelector('.mood-notes textarea');

        // Habit elements
        this.habitRatings = document.querySelectorAll('.habit-rating');

        // Activity elements
        this.gratitudeInputs = document.querySelectorAll('.gratitude-input input');
        this.saveGratitudeBtn = document.querySelector('.save-gratitude');
        this.goalInput = document.querySelector('.goal-input input');
        this.goalCheckbox = document.querySelector('.goal-status input');
        this.saveGoalBtn = document.querySelector('.save-goal');
    }

    bindEvents() {
        // Mood tracking
        this.moodButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectMood(btn));
        });

        // Habit tracking
        this.habitRatings.forEach(rating => {
            const stars = rating.querySelectorAll('i');
            stars.forEach(star => {
                star.addEventListener('click', () => this.rateHabit(rating, star));
                star.addEventListener('mouseover', () => this.previewRating(rating, star));
                star.addEventListener('mouseout', () => this.resetPreview(rating));
            });
        });

        // Activity tracking
        this.saveGratitudeBtn.addEventListener('click', () => this.saveGratitude());
        this.saveGoalBtn.addEventListener('click', () => this.saveGoal());
        this.goalCheckbox.addEventListener('change', () => this.updateGoalStatus());
    }

    selectMood(button) {
        // Remove selection from all buttons
        this.moodButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Add selection to clicked button
        button.classList.add('selected');
        this.currentMood = button.dataset.mood;
        
        // Save mood data
        this.saveMoodData();
    }

    rateHabit(ratingElement, starElement) {
        const rating = parseInt(starElement.dataset.rating);
        const habitType = ratingElement.closest('.habit-card').querySelector('span').textContent.toLowerCase();
        
        // Update visual rating
        const stars = ratingElement.querySelectorAll('i');
        stars.forEach((star, index) => {
            star.className = index < rating ? 'fas fa-star' : 'far fa-star';
        });

        // Save habit rating
        this.habits[habitType] = rating;
        this.saveHabitData();
    }

    previewRating(ratingElement, starElement) {
        const rating = parseInt(starElement.dataset.rating);
        const stars = ratingElement.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            star.className = index < rating ? 'fas fa-star' : 'far fa-star';
        });
    }

    resetPreview(ratingElement) {
        const habitType = ratingElement.closest('.habit-card').querySelector('span').textContent.toLowerCase();
        const currentRating = this.habits[habitType];
        const stars = ratingElement.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            star.className = index < currentRating ? 'fas fa-star' : 'far fa-star';
        });
    }

    saveGratitude() {
        const entries = Array.from(this.gratitudeInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');

        if (entries.length > 0) {
            this.activities.gratitude = entries;
            this.saveActivityData();
            
            // Show success message
            this.showMessage('Gratitude entries saved successfully!', 'success');
            
            // Clear inputs
            this.gratitudeInputs.forEach(input => input.value = '');
        }
    }

    saveGoal() {
        const goalText = this.goalInput.value.trim();
        if (goalText) {
            this.activities.dailyGoal = {
                text: goalText,
                completed: this.goalCheckbox.checked
            };
            this.saveActivityData();
            
            // Show success message
            this.showMessage('Daily goal saved successfully!', 'success');
        }
    }

    updateGoalStatus() {
        if (this.activities.dailyGoal.text) {
            this.activities.dailyGoal.completed = this.goalCheckbox.checked;
            this.saveActivityData();
        }
    }

    saveMoodData() {
        const moodData = {
            mood: this.currentMood,
            notes: this.moodNotes.value.trim(),
            timestamp: new Date().toISOString()
        };

        let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
        moodHistory.push(moodData);
        localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
        
        this.updateMoodChart();
    }

    saveHabitData() {
        let habitHistory = JSON.parse(localStorage.getItem('habitHistory')) || [];
        habitHistory.push({
            habits: this.habits,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('habitHistory', JSON.stringify(habitHistory));
        
        this.updateHabitChart();
    }

    saveActivityData() {
        let activityHistory = JSON.parse(localStorage.getItem('activityHistory')) || [];
        activityHistory.push({
            activities: this.activities,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
        
        this.updateActivityChart();
    }

    loadProgress() {
        // Load saved data
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
        const habitHistory = JSON.parse(localStorage.getItem('habitHistory')) || [];
        const activityHistory = JSON.parse(localStorage.getItem('activityHistory')) || [];

        // Update UI with latest data
        if (moodHistory.length > 0) {
            const latestMood = moodHistory[moodHistory.length - 1];
            this.currentMood = latestMood.mood;
            this.moodNotes.value = latestMood.notes;
            this.moodButtons.forEach(btn => {
                if (btn.dataset.mood === latestMood.mood) {
                    btn.classList.add('selected');
                }
            });
        }

        if (habitHistory.length > 0) {
            const latestHabits = habitHistory[habitHistory.length - 1].habits;
            this.habits = latestHabits;
            this.updateHabitDisplay();
        }

        if (activityHistory.length > 0) {
            const latestActivities = activityHistory[activityHistory.length - 1].activities;
            this.activities = latestActivities;
            this.updateActivityDisplay();
        }
    }

    updateHabitDisplay() {
        Object.entries(this.habits).forEach(([habit, rating]) => {
            const habitCard = document.querySelector(`.habit-card span[text="${habit}"]`);
            if (habitCard) {
                const stars = habitCard.closest('.habit-card').querySelectorAll('.habit-rating i');
                stars.forEach((star, index) => {
                    star.className = index < rating ? 'fas fa-star' : 'far fa-star';
                });
            }
        });
    }

    updateActivityDisplay() {
        // Update gratitude inputs
        this.activities.gratitude.forEach((entry, index) => {
            if (this.gratitudeInputs[index]) {
                this.gratitudeInputs[index].value = entry;
            }
        });

        // Update goal
        if (this.activities.dailyGoal.text) {
            this.goalInput.value = this.activities.dailyGoal.text;
            this.goalCheckbox.checked = this.activities.dailyGoal.completed;
        }
    }

    initializeCharts() {
        // Mood Chart
        const moodCtx = document.getElementById('moodChart').getContext('2d');
        this.moodChart = new Chart(moodCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Mood Trend',
                    data: [],
                    borderColor: '#4ECDC4',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });

        // Habit Chart
        const habitCtx = document.getElementById('habitChart').getContext('2d');
        this.habitChart = new Chart(habitCtx, {
            type: 'radar',
            data: {
                labels: ['Sleep', 'Eating', 'Activity', 'Mindfulness'],
                datasets: [{
                    label: 'Today\'s Habits',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    borderColor: '#4ECDC4',
                    pointBackgroundColor: '#4ECDC4'
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });

        // Activity Chart
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        this.activityChart = new Chart(activityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending'],
                datasets: [{
                    data: [0, 3],
                    backgroundColor: ['#4ECDC4', '#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                cutout: '70%'
            }
        });

        this.updateAllCharts();
    }

    updateMoodChart() {
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
        const moodValues = {
            'great': 5,
            'good': 4,
            'okay': 3,
            'down': 2,
            'stressed': 1
        };

        const lastWeek = moodHistory.slice(-7);
        const labels = lastWeek.map(entry => {
            const date = new Date(entry.timestamp);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        const data = lastWeek.map(entry => moodValues[entry.mood]);

        this.moodChart.data.labels = labels;
        this.moodChart.data.datasets[0].data = data;
        this.moodChart.update();
    }

    updateHabitChart() {
        const habitData = [
            this.habits.sleep,
            this.habits.eating,
            this.habits.activity,
            this.habits.mindfulness
        ];

        this.habitChart.data.datasets[0].data = habitData;
        this.habitChart.update();
    }

    updateActivityChart() {
        const completed = Object.values(this.activities).filter(activity => {
            if (Array.isArray(activity)) return activity.length > 0;
            if (typeof activity === 'object') return activity.completed;
            return activity > 0;
        }).length;

        this.activityChart.data.datasets[0].data = [completed, 3 - completed];
        this.activityChart.update();
    }

    updateAllCharts() {
        this.updateMoodChart();
        this.updateHabitChart();
        this.updateActivityChart();
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize the daily wellness tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DailyWellness();
}); 