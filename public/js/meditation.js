class MeditationPlayer {
    constructor() {
        this.sessions = {
            beginner: [
                {
                    id: 'mindful-breathing',
                    name: 'Mindful Breathing',
                    description: 'Perfect introduction to meditation practice',
                    duration: 600, // 10 minutes in seconds
                    audioSrc: 'audio/mindful-breathing.mp3',
                    category: 'beginner'
                },
                {
                    id: 'body-scan',
                    name: 'Body Scan Relaxation',
                    description: 'Gentle guidance through body awareness',
                    duration: 900, // 15 minutes
                    audioSrc: 'audio/body-scan.mp3',
                    category: 'beginner'
                }
            ],
            stress: [
                {
                    id: 'stress-release',
                    name: 'Stress Release',
                    description: 'Let go of tension and find calm',
                    duration: 1200, // 20 minutes
                    audioSrc: 'audio/stress-release.mp3',
                    category: 'stress'
                }
            ],
            sleep: [
                {
                    id: 'peaceful-sleep',
                    name: 'Peaceful Sleep',
                    description: 'Gentle guidance into restful sleep',
                    duration: 1800, // 30 minutes
                    audioSrc: 'audio/peaceful-sleep.mp3',
                    category: 'sleep'
                }
            ],
            focus: [
                {
                    id: 'sharp-focus',
                    name: 'Sharp Focus',
                    description: 'Enhance concentration and mental clarity',
                    duration: 900, // 15 minutes
                    audioSrc: 'audio/sharp-focus.mp3',
                    category: 'focus'
                }
            ]
        };

        this.currentSession = null;
        this.isPlaying = false;
        this.timer = null;
        this.timeRemaining = 0;
        this.audio = new Audio();
        
        this.initializeElements();
        this.bindEvents();
        this.loadProgress();
    }

    initializeElements() {
        // Player controls
        this.playPauseBtn = document.getElementById('playPause');
        this.prevBtn = document.getElementById('previousTrack');
        this.nextBtn = document.getElementById('nextTrack');
        this.timerDisplay = document.querySelector('.timer-display');
        this.progressRing = document.querySelector('.progress-ring-circle');
        this.trackName = document.getElementById('trackName');
        this.trackDescription = document.getElementById('trackDescription');

        // Category tabs and meditation cards
        this.categoryTabs = document.querySelectorAll('.category-tab');
        this.meditationCards = document.querySelectorAll('.meditation-card');
        this.startButtons = document.querySelectorAll('.start-session');

        // Calculate progress ring properties
        this.progressRing.style.strokeDasharray = `${2 * Math.PI * 54} ${2 * Math.PI * 54}`;
        this.progressRing.style.strokeDashoffset = `${2 * Math.PI * 54}`;
    }

    bindEvents() {
        // Player controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.playPreviousSession());
        this.nextBtn.addEventListener('click', () => this.playNextSession());

        // Category tabs
        this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchCategory(e.target.dataset.category));
        });

        // Start session buttons
        this.startButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.meditation-card');
                const category = card.dataset.category;
                const index = Array.from(this.meditationCards).indexOf(card);
                this.startSession(category, index);
            });
        });

        // Audio events
        this.audio.addEventListener('ended', () => this.handleSessionEnd());
    }

    togglePlayPause() {
        if (!this.currentSession) return;

        if (this.isPlaying) {
            this.pauseSession();
        } else {
            this.resumeSession();
        }
    }

    startSession(category, index) {
        const session = this.sessions[category][index];
        if (!session) return;

        // Stop current session if any
        if (this.currentSession) {
            this.stopSession();
        }

        this.currentSession = session;
        this.timeRemaining = session.duration;
        this.audio.src = session.audioSrc;
        
        this.updateDisplay();
        this.resumeSession();
    }

    pauseSession() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.audio.pause();
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    resumeSession() {
        this.isPlaying = true;
        this.audio.play();
        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.handleSessionEnd();
            }
        }, 1000);
    }

    stopSession() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.audio.pause();
        this.audio.currentTime = 0;
        this.timeRemaining = 0;
        this.currentSession = null;
        this.updateDisplay();
    }

    updateDisplay() {
        // Update timer display
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update progress ring
        if (this.currentSession) {
            const progress = 1 - (this.timeRemaining / this.currentSession.duration);
            const circumference = 2 * Math.PI * 54;
            this.progressRing.style.strokeDashoffset = circumference * (1 - progress);
        }

        // Update track info
        if (this.currentSession) {
            this.trackName.textContent = this.currentSession.name;
            this.trackDescription.textContent = this.currentSession.description;
        } else {
            this.trackName.textContent = 'Select a Session';
            this.trackDescription.textContent = 'Choose from our meditation library';
        }
    }

    switchCategory(category) {
        // Update active tab
        this.categoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Show/hide meditation cards
        this.meditationCards.forEach(card => {
            card.style.display = card.dataset.category === category ? 'block' : 'none';
        });
    }

    handleSessionEnd() {
        this.stopSession();
        this.updateProgress();
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('meditationProgress')) || {
            totalMinutes: 0,
            sessions: 0,
            streak: 0,
            lastSession: null
        };

        this.updateProgressDisplay(progress);
    }

    updateProgress() {
        if (!this.currentSession) return;

        const progress = JSON.parse(localStorage.getItem('meditationProgress')) || {
            totalMinutes: 0,
            sessions: 0,
            streak: 0,
            lastSession: null
        };

        const today = new Date().toDateString();
        const sessionMinutes = this.currentSession.duration / 60;

        // Update total minutes
        progress.totalMinutes += sessionMinutes;
        
        // Update sessions count
        progress.sessions += 1;

        // Update streak
        if (progress.lastSession === today) {
            // Already meditated today
        } else if (progress.lastSession === new Date(Date.now() - 86400000).toDateString()) {
            // Meditated yesterday
            progress.streak += 1;
        } else {
            // Streak broken
            progress.streak = 1;
        }

        progress.lastSession = today;

        localStorage.setItem('meditationProgress', JSON.stringify(progress));
        this.updateProgressDisplay(progress);
    }

    updateProgressDisplay(progress) {
        const statValues = document.querySelectorAll('.stat-value');
        statValues[0].textContent = Math.round(progress.totalMinutes);
        statValues[1].textContent = progress.sessions;
        statValues[2].textContent = progress.streak;
    }

    playPreviousSession() {
        if (!this.currentSession) return;

        const category = this.currentSession.category;
        const sessions = this.sessions[category];
        const currentIndex = sessions.findIndex(s => s.id === this.currentSession.id);
        const newIndex = (currentIndex - 1 + sessions.length) % sessions.length;

        this.startSession(category, newIndex);
    }

    playNextSession() {
        if (!this.currentSession) return;

        const category = this.currentSession.category;
        const sessions = this.sessions[category];
        const currentIndex = sessions.findIndex(s => s.id === this.currentSession.id);
        const newIndex = (currentIndex + 1) % sessions.length;

        this.startSession(category, newIndex);
    }
}

// Initialize meditation player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MeditationPlayer();
});

function createAudioVisualizer() {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    // Connect to audio source
    // Create canvas visualization
} 