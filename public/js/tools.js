class MentalHealthTools {
    constructor() {
        // Initialize state variables
        this.state = {
            isExercising: false,
            breathingInterval: null,
            exerciseTimer: null,
            duration: 240, // 4 minutes default duration
            breathingPhases: {
                inhale: { duration: 4000, text: 'Breathe In', phase: 'Inhale deeply...' },
                hold: { duration: 4000, text: 'Hold', phase: 'Hold your breath...' },
                exhale: { duration: 4000, text: 'Breathe Out', phase: 'Release slowly...' }
            }
        };

        // Initialize all tools
        this.initializeTools();
        this.setupEventListeners();
        this.setupAutoSave();
    }

    initializeTools() {
        this.initializeMoodTracker();
        this.initializeBreathingExercise();
        this.initializeJournal();
        this.initializeProgressTracker();
    }

    setupEventListeners() {
        // Page visibility change handler for auto-save
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveAllData();
            }
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => this.saveAllData(), 30000);
    }

    saveAllData() {
        this.saveMoodData();
        this.saveJournalData();
        this.saveProgressData();
    }

    // Mood Tracker Methods
    initializeMoodTracker() {
        const moodOptions = document.querySelectorAll('.mood-option');
        const moods = this.loadMoodData();

        moodOptions.forEach(option => {
            option.addEventListener('click', () => this.handleMoodSelection(option, moodOptions));
        });

        this.updateMoodHistory();
        this.updateMoodInsights();
    }

    handleMoodSelection(selectedOption, allOptions) {
        // Remove previous selection and add new selection
        allOptions.forEach(opt => opt.classList.remove('selected'));
        selectedOption.classList.add('selected');

        // Save new mood
        const mood = {
            type: selectedOption.dataset.mood,
            timestamp: new Date().toISOString()
        };

        const moods = this.loadMoodData();
        moods.push(mood);
        localStorage.setItem('moodHistory', JSON.stringify(moods));

        this.updateMoodHistory();
        this.updateMoodInsights();
    }

    loadMoodData() {
        return JSON.parse(localStorage.getItem('moodHistory') || '[]');
    }

    saveMoodData() {
        // Implementation for saving mood data
    }

    updateMoodHistory() {
        const moods = this.loadMoodData();
        const moodHistory = document.getElementById('moodHistory');
        
        const recentMoods = moods.slice(-5).reverse();
        moodHistory.innerHTML = `
            <h3>Recent Moods</h3>
            <div class="mood-history">
                ${recentMoods.map(mood => `
                    <div class="mood-history-item">
                        <i class="fas ${this.getMoodIcon(mood.type)}"></i>
                        <span>${new Date(mood.timestamp).toLocaleDateString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getMoodIcon(mood) {
        const icons = {
            great: 'fa-grin-stars',
            good: 'fa-smile',
            okay: 'fa-meh',
            sad: 'fa-frown',
            terrible: 'fa-sad-tear'
        };
        return icons[mood] || 'fa-meh';
    }

    updateMoodInsights() {
        const moods = this.loadMoodData();
        const moodStats = document.querySelector('.mood-stats');
        
        const moodCounts = moods.reduce((acc, mood) => {
            acc[mood.type] = (acc[mood.type] || 0) + 1;
            return acc;
        }, {});

        const mostFrequentMood = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])[0];

        moodStats.innerHTML = `
            <p>Most frequent mood: <strong>${mostFrequentMood?.[0] || 'No data'}</strong></p>
            <p>Total entries: ${moods.length}</p>
        `;
    }

    // Breathing Exercise Methods
    initializeBreathingExercise() {
        const startBtn = document.getElementById('startBreathing');
        const resetBtn = document.getElementById('resetBreathing');

        startBtn.addEventListener('click', () => this.toggleBreathingExercise(startBtn));
        resetBtn.addEventListener('click', () => this.resetBreathingExercise());
    }

    toggleBreathingExercise(startBtn) {
        if (!this.state.isExercising) {
            this.state.isExercising = true;
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            document.getElementById('resetBreathing').disabled = false;
            this.startBreathingExercise();
        } else {
            this.state.isExercising = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            this.stopBreathingExercise();
        }
    }

    async startBreathingExercise() {
        if (!this.state.isExercising) return;

        // Start the timer
        this.startTimer();

        const runBreathingCycle = async () => {
            while (this.state.isExercising) {
                // Inhale phase
                await this.executeBreathingPhase('inhale', {
                    text: 'Breathe In',
                    phase: 'Inhale deeply through your nose...'
                });
                if (!this.state.isExercising) break;

                // Hold phase
                await this.executeBreathingPhase('hold', {
                    text: 'Hold',
                    phase: 'Hold your breath...'
                });
                if (!this.state.isExercising) break;

                // Exhale phase
                await this.executeBreathingPhase('exhale', {
                    text: 'Breathe Out',
                    phase: 'Exhale slowly through your mouth...'
                });
                if (!this.state.isExercising) break;
            }
        };

        runBreathingCycle();
    }

    async executeBreathingPhase(phase, config) {
        const breathingText = document.getElementById('breathingText');
        const breathingPhase = document.getElementById('breathingPhase');
        const breathingCircle = document.getElementById('breathingCircle');

        breathingText.textContent = config.text;
        breathingPhase.textContent = config.phase;
        breathingCircle.style.animation = `${phase} 4s forwards`;
        await this.countDown(4, breathingPhase, config.text);
    }

    async countDown(seconds, element, prefix) {
        for(let i = seconds; i > 0; i--) {
            if (!this.state.isExercising) break;
            element.textContent = `${prefix} ${i} seconds...`;
            await this.delay(1000);
        }
    }

    startTimer() {
        this.state.exerciseTimer = setInterval(() => {
            this.state.duration--;
            this.updateTimer();
            
            if (this.state.duration <= 0) {
                this.completeExercise();
            }
        }, 1000);
    }

    completeExercise() {
        this.stopBreathingExercise();
        const breathingText = document.getElementById('breathingText');
        const breathingPhase = document.getElementById('breathingPhase');
        const startBtn = document.getElementById('startBreathing');
        
        breathingText.textContent = 'Exercise Complete!';
        breathingPhase.textContent = 'Great job!';
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        this.state.isExercising = false;
    }

    stopBreathingExercise() {
        clearInterval(this.state.exerciseTimer);
        const breathingCircle = document.getElementById('breathingCircle');
        const breathingText = document.getElementById('breathingText');
        const breathingPhase = document.getElementById('breathingPhase');
        
        breathingCircle.style.animation = 'none';
        breathingText.textContent = 'Paused';
        breathingPhase.textContent = 'Click start to resume';
        this.state.isExercising = false;
    }

    resetBreathingExercise() {
        this.stopBreathingExercise();
        this.state.duration = 240;
        this.updateTimer();
        
        const breathingText = document.getElementById('breathingText');
        const breathingPhase = document.getElementById('breathingPhase');
        const breathingCircle = document.getElementById('breathingCircle');
        const progressRing = document.querySelector('.progress-ring');
        
        breathingText.textContent = 'Ready';
        breathingPhase.textContent = 'Click start to begin';
        breathingCircle.style.animation = 'none';
        progressRing.style.strokeDashoffset = 2 * Math.PI * 48;
    }

    updateTimer() {
        const minutes = Math.floor(this.state.duration / 60);
        const seconds = this.state.duration % 60;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        const progress = (this.state.duration / 240) * (2 * Math.PI * 48);
        document.querySelector('.progress-ring').style.strokeDashoffset = progress;
    }

    // Journal Methods
    initializeJournal() {
        const saveBtn = document.getElementById('saveJournal');
        const journalEntry = document.getElementById('journalEntry');

        saveBtn.addEventListener('click', () => this.saveJournalEntry());
        this.setupJournalTags();
        this.updateJournalHistory();
    }

    saveJournalEntry() {
        const entry = this.createJournalEntry();
        if (entry.text.trim()) {
            const entries = this.loadJournalEntries();
            entries.push(entry);
            localStorage.setItem('journalEntries', JSON.stringify(entries));
            document.getElementById('journalEntry').value = '';
            this.updateJournalHistory();
        }
    }

    createJournalEntry() {
        const selectedTags = Array.from(document.querySelectorAll('.tag.selected'))
            .map(tag => tag.dataset.tag);
            
        return {
            text: document.getElementById('journalEntry').value,
            tags: selectedTags,
            timestamp: new Date().toISOString()
        };
    }

    loadJournalEntries() {
        return JSON.parse(localStorage.getItem('journalEntries') || '[]');
    }

    updateJournalHistory() {
        const entries = this.loadJournalEntries();
        const journalHistory = document.getElementById('journalHistory');
        
        const recentEntries = entries.slice(-3).reverse();
        journalHistory.innerHTML = `
            <h3>Recent Entries</h3>
            ${recentEntries.map(entry => `
                <div class="journal-history-item">
                    <p>${entry.text.substring(0, 100)}${entry.text.length > 100 ? '...' : ''}</p>
                    <small>${new Date(entry.timestamp).toLocaleDateString()}</small>
                </div>
            `).join('')}
        `;
    }

    setupJournalTags() {
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                this.updateJournalEntry();
            });
        });
    }

    // Progress Tracker Methods
    initializeProgressTracker() {
        this.setupProgressFilters();
        this.updateProgressStats();
        this.renderMoodChart('week');
        this.updateInsights();
    }

    setupProgressFilters() {
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.renderMoodChart(button.dataset.period);
            });
        });
    }

    updateProgressStats() {
        const moods = this.loadMoodData();
        if (moods.length === 0) return;

        const moodValues = { great: 5, good: 4, okay: 3, sad: 2, terrible: 1 };
        
        // Calculate average mood
        const average = moods.reduce((acc, mood) => 
            acc + moodValues[mood.type], 0) / moods.length;
        document.getElementById('moodAverage').textContent = average.toFixed(1);

        // Calculate best streak
        let currentStreak = 1;
        let bestStreak = 1;
        for (let i = 1; i < moods.length; i++) {
            if (moodValues[moods[i].type] >= 4) { // Good or Great mood
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        document.getElementById('bestStreak').textContent = bestStreak;

        // Update total entries
        document.getElementById('totalEntries').textContent = moods.length;
    }

    renderMoodChart(period) {
        const ctx = document.getElementById('progressChart');
        const moods = this.loadMoodData();
        
        if (moods.length === 0) return;

        const moodValues = { great: 5, good: 4, okay: 3, sad: 2, terrible: 1 };
        let filteredMoods;
        let groupedData;

        switch(period) {
            case 'week':
                filteredMoods = this.getLastNDays(moods, 7);
                groupedData = this.groupByDay(filteredMoods);
                break;
            case 'month':
                filteredMoods = this.getLastNDays(moods, 30);
                groupedData = this.groupByWeek(filteredMoods);
                break;
            case 'year':
                filteredMoods = this.getLastNDays(moods, 365);
                groupedData = this.groupByMonth(filteredMoods);
                break;
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: groupedData.labels,
                datasets: [{
                    label: 'Mood Trend',
                    data: groupedData.values,
                    borderColor: '#8B5CF6',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const labels = ['Terrible', 'Sad', 'Okay', 'Good', 'Great'];
                                return `Mood: ${labels[Math.round(context.parsed.y) - 1]}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', 'Terrible', 'Sad', 'Okay', 'Good', 'Great'];
                                return labels[value];
                            }
                        }
                    }
                }
            }
        });
    }

    updateInsights() {
        const moods = this.loadMoodData();
        if (moods.length === 0) return;

        const moodValues = { great: 5, good: 4, okay: 3, sad: 2, terrible: 1 };
        const insights = [];

        // Most frequent mood
        const moodCounts = moods.reduce((acc, mood) => {
            acc[mood.type] = (acc[mood.type] || 0) + 1;
            return acc;
        }, {});
        const mostFrequentMood = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])[0];

        // Best day of the week
        const dayMoods = moods.reduce((acc, mood) => {
            const day = new Date(mood.timestamp).getDay();
            if (!acc[day]) acc[day] = [];
            acc[day].push(moodValues[mood.type]);
            return acc;
        }, {});

        const dayAverages = Object.entries(dayMoods).map(([day, values]) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
            avg: values.reduce((a, b) => a + b) / values.length
        }));

        const bestDay = dayAverages.sort((a, b) => b.avg - a.avg)[0];

        const insightsHTML = `
            <div class="insight-item">
                <div class="insight-icon">
                    <i class="fas fa-chart-pie"></i>
                </div>
                <div>
                    <h5>Most Common Mood</h5>
                    <p>${mostFrequentMood[0].charAt(0).toUpperCase() + mostFrequentMood[0].slice(1)}</p>
                </div>
            </div>
            <div class="insight-item">
                <div class="insight-icon">
                    <i class="fas fa-calendar"></i>
                </div>
                <div>
                    <h5>Best Day</h5>
                    <p>${bestDay.day} (Average: ${bestDay.avg.toFixed(1)})</p>
                </div>
            </div>
        `;

        document.getElementById('moodInsights').innerHTML = insightsHTML;
    }

    getLastNDays(moods, n) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - n);
        return moods.filter(mood => new Date(mood.timestamp) > cutoff);
    }

    // Helper methods for data grouping
    groupByDay(moods) {
        // Implementation for daily grouping
    }

    groupByWeek(moods) {
        // Implementation for weekly grouping
    }

    groupByMonth(moods) {
        // Implementation for monthly grouping
    }

    // Utility Methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }
}

// Initialize tools when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mentalHealthTools = new MentalHealthTools();
});
