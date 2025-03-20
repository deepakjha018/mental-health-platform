class MentalHealthTools {
    constructor() {
        this.initializeMoodTracker();
        this.initializeBreathingExercise();
        this.initializeJournal();
        this.initializeProgressTracker();
        this.setupEventListeners();
        this.setupAutoSave();
        this.isExercising = false;
        this.breathingInterval = null;
        this.exerciseTimer = null;
        this.duration = 240; // 4 minutes
    }

    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveAllData();
            }
        });
    }

    setupAutoSave() {
        setInterval(() => this.saveAllData(), 30000); // Auto-save every 30 seconds
    }

    saveAllData() {
        // Save all tool states
        this.saveMoodData();
        this.saveJournalData();
        this.saveProgressData();
    }

    initializeMoodTracker() {
        const moodOptions = document.querySelectorAll('.mood-option');
        const moodHistory = document.getElementById('moodHistory');
        const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');

        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                moodOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // Save mood
                const mood = {
                    type: option.dataset.mood,
                    timestamp: new Date().toISOString()
                };
                moods.push(mood);
                localStorage.setItem('moodHistory', JSON.stringify(moods));

                this.updateMoodHistory();
            });
        });

        this.updateMoodHistory();
        this.updateMoodInsights();
    }

    updateMoodHistory() {
        const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
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
        const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
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

    initializeBreathingExercise() {
        const startBtn = document.getElementById('startBreathing');
        const resetBtn = document.getElementById('resetBreathing');
        const breathingCircle = document.getElementById('breathingCircle');
        
        this.breathingPhases = {
            inhale: { duration: 4000, text: 'Breathe In', phase: 'Inhale deeply...' },
            hold: { duration: 4000, text: 'Hold', phase: 'Hold your breath...' },
            exhale: { duration: 4000, text: 'Breathe Out', phase: 'Release slowly...' }
        };

        startBtn.addEventListener('click', () => {
            if (!this.isExercising) {
                this.startBreathingExercise();
                startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                resetBtn.disabled = false;
            } else {
                this.stopBreathingExercise();
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            }
            this.isExercising = !this.isExercising;
        });

        resetBtn.addEventListener('click', () => {
            this.resetBreathingExercise();
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            resetBtn.disabled = true;
        });
    }

    async startBreathingExercise() {
        const breathingText = document.getElementById('breathingText');
        const breathingPhase = document.getElementById('breathingPhase');
        const breathingCircle = document.getElementById('breathingCircle');
        const startBtn = document.getElementById('startBreathing');

        // Start the countdown timer
        this.startTimer();

        // Breathing cycle
        const runBreathingCycle = async () => {
            if (!this.isExercising) return;

            // Inhale phase - 4 seconds
            breathingText.textContent = 'Breathe In';
            breathingPhase.textContent = 'Inhale slowly through your nose...';
            breathingCircle.style.animation = 'breatheIn 4s forwards';
            await this.countDown(4, breathingPhase, 'Inhale for');
            if (!this.isExercising) return;

            // Hold phase - 4 seconds
            breathingText.textContent = 'Hold';
            breathingPhase.textContent = 'Hold your breath...';
            breathingCircle.style.animation = 'hold 4s forwards';
            await this.countDown(4, breathingPhase, 'Hold for');
            if (!this.isExercising) return;

            // Exhale phase - 4 seconds
            breathingText.textContent = 'Breathe Out';
            breathingPhase.textContent = 'Exhale slowly through your mouth...';
            breathingCircle.style.animation = 'breatheOut 4s forwards';
            await this.countDown(4, breathingPhase, 'Exhale for');

            // Continue cycle if still exercising
            if (this.isExercising) {
                runBreathingCycle();
            }
        };

        runBreathingCycle();
    }

    async countDown(seconds, element, prefix) {
        for(let i = seconds; i > 0; i--) {
            if (!this.isExercising) break;
            element.textContent = `${prefix} ${i} seconds...`;
            await this.delay(1000);
        }
    }

    startTimer() {
        this.exerciseTimer = setInterval(() => {
            this.duration--;
            this.updateTimer();
            
            if (this.duration <= 0) {
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
        this.isExercising = false;
    }

    stopBreathingExercise() {
        clearInterval(this.exerciseTimer);
        const breathingCircle = document.getElementById('breathingCircle');
        const breathingText = document.getElementById('breathingText');
        const breathingPhase = document.getElementById('breathingPhase');
        
        breathingCircle.style.animation = 'none';
        breathingText.textContent = 'Paused';
        breathingPhase.textContent = 'Click start to resume';
        this.isExercising = false;
    }

    resetBreathingExercise() {
        this.stopBreathingExercise();
        this.duration = 240;
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
        const minutes = Math.floor(this.duration / 60);
        const seconds = this.duration % 60;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        const progress = (this.duration / 240) * (2 * Math.PI * 48);
        document.querySelector('.progress-ring').style.strokeDashoffset = progress;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeJournal() {
        const saveBtn = document.getElementById('saveJournal');
        const journalEntry = document.getElementById('journalEntry');
        const journalHistory = document.getElementById('journalHistory');

        saveBtn.addEventListener('click', () => {
            const entry = {
                text: journalEntry.value,
                timestamp: new Date().toISOString()
            };

            if (entry.text.trim()) {
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                entries.push(entry);
                localStorage.setItem('journalEntries', JSON.stringify(entries));

                journalEntry.value = '';
                this.updateJournalHistory();
            }
        });

        this.updateJournalHistory();

        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                this.updateJournalEntry();
            });
        });
    }

    updateJournalHistory() {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
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

    updateJournalEntry() {
        const selectedTags = Array.from(document.querySelectorAll('.tag.selected'))
            .map(tag => tag.dataset.tag);
            
        const entry = {
            text: document.getElementById('journalEntry').value,
            tags: selectedTags,
            timestamp: new Date().toISOString()
        };

        return entry;
    }

    initializeProgressTracker() {
        this.setupProgressFilters();
        this.updateProgressStats();
        this.renderMoodChart('week'); // Default to weekly view
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
        const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
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
        const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        
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
        const moods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
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
}

// Initialize tools when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mentalHealthTools = new MentalHealthTools();
});
