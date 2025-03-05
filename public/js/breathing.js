class BreathingExercise {
    constructor() {
        this.techniques = {
            box: {
                name: 'Box Breathing',
                description: 'Inhale for 4 counts, hold for 4, exhale for 4, hold for 4',
                sequence: [
                    { action: 'inhale', duration: 4000 },
                    { action: 'hold', duration: 4000 },
                    { action: 'exhale', duration: 4000 },
                    { action: 'hold', duration: 4000 }
                ]
            },
            '478': {
                name: '4-7-8 Breathing',
                description: 'Inhale for 4 counts, hold for 7, exhale for 8',
                sequence: [
                    { action: 'inhale', duration: 4000 },
                    { action: 'hold', duration: 7000 },
                    { action: 'exhale', duration: 8000 }
                ]
            },
            deep: {
                name: 'Deep Breathing',
                description: 'Deep inhale for 5 counts, brief hold, long exhale for 5 counts',
                sequence: [
                    { action: 'inhale', duration: 5000 },
                    { action: 'hold', duration: 2000 },
                    { action: 'exhale', duration: 5000 }
                ]
            },
            alternate: {
                name: 'Alternate Nostril',
                description: 'Alternate between nostrils while breathing',
                sequence: [
                    { action: 'inhale-left', duration: 4000 },
                    { action: 'hold', duration: 2000 },
                    { action: 'exhale-right', duration: 4000 },
                    { action: 'inhale-right', duration: 4000 },
                    { action: 'hold', duration: 2000 },
                    { action: 'exhale-left', duration: 4000 }
                ]
            }
        };

        this.currentTechnique = null;
        this.isPlaying = false;
        this.currentStep = 0;
        this.timer = null;
        this.sessionStartTime = null;
        this.totalDuration = 300; // 5 minutes in seconds
        this.remainingTime = this.totalDuration;
        
        this.initializeElements();
        this.bindEvents();
        this.loadProgress();
        this.createAmbientParticles();
    }

    initializeElements() {
        this.breathCircle = document.querySelector('.breath-circle');
        this.breathGuide = document.querySelector('.breath-guide');
        this.breathText = document.querySelector('.breath-text');
        this.timerDisplay = document.querySelector('.timer');
        this.startButton = document.getElementById('startBreathing');
        this.prevButton = document.getElementById('previousExercise');
        this.nextButton = document.getElementById('nextExercise');
        this.exerciseName = document.getElementById('exerciseName');
        this.exerciseDescription = document.getElementById('exerciseDescription');
        this.progressFill = document.querySelector('.progress-fill');
        this.timeRemaining = document.querySelector('.time-remaining');
        this.techniqueButtons = document.querySelectorAll('.btn-select-technique');
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.toggleExercise());
        this.prevButton.addEventListener('click', () => this.changeTechnique('prev'));
        this.nextButton.addEventListener('click', () => this.changeTechnique('next'));
        
        this.techniqueButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.breathing-card');
                const technique = card.dataset.technique;
                this.selectTechnique(technique);
                
                // Remove selected class from all cards and add to the clicked one
                document.querySelectorAll('.breathing-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    }

    createAmbientParticles() {
        const container = this.breathCircle;
        for(let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'breath-particle';
            container.appendChild(particle);
        }
    }

    selectTechnique(technique) {
        if (this.isPlaying) {
            this.pauseExercise();
        }
        
        this.currentTechnique = technique;
        this.currentStep = 0;
        this.remainingTime = this.totalDuration;
        this.updateTechniqueDisplay();
        
        // Enable start button
        this.startButton.disabled = false;
        
        // Reset displays
        this.timerDisplay.textContent = '5:00';
        this.timeRemaining.textContent = '5:00';
        this.progressFill.style.width = '0%';
        this.breathText.textContent = 'Get Ready';
        
        // Update circle animation duration
        this.updateAnimationDuration();
    }

    updateAnimationDuration() {
        if (!this.currentTechnique) return;
        
        const sequence = this.techniques[this.currentTechnique].sequence;
        const currentStep = sequence[this.currentStep];
        this.breathCircle.style.setProperty('--duration', `${currentStep.duration}ms`);
    }

    toggleExercise() {
        if (!this.currentTechnique) return;
        
        if (this.isPlaying) {
            this.pauseExercise();
        } else {
            this.startExercise();
        }
    }

    startExercise() {
        this.isPlaying = true;
        this.sessionStartTime = Date.now();
        this.startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        this.playSequence();
        this.startTimer();
    }

    pauseExercise() {
        this.isPlaying = false;
        this.startButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        clearTimeout(this.timer);
        
        // Pause animations
        this.breathCircle.style.animationPlayState = 'paused';
        this.breathGuide.style.animationPlayState = 'paused';
    }

    playSequence() {
        if (!this.isPlaying || !this.currentTechnique) return;

        const sequence = this.techniques[this.currentTechnique].sequence;
        const step = sequence[this.currentStep];
        
        // Update the breathing circle animation
        this.breathCircle.className = 'breath-circle';
        void this.breathCircle.offsetWidth; // Trigger reflow
        this.breathCircle.classList.add(step.action);
        
        // Update instruction text
        this.updateInstruction(step.action);
        
        // Update animation duration
        this.updateAnimationDuration();

        // Schedule next step
        this.timer = setTimeout(() => {
            this.currentStep = (this.currentStep + 1) % sequence.length;
            this.playSequence();
        }, step.duration);
    }

    updateInstruction(action) {
        const instructions = {
            'inhale': 'Breathe In',
            'exhale': 'Breathe Out',
            'hold': 'Hold',
            'inhale-left': 'Inhale Left Nostril',
            'exhale-right': 'Exhale Right Nostril',
            'inhale-right': 'Inhale Right Nostril',
            'exhale-left': 'Exhale Left Nostril'
        };

        this.breathText.textContent = instructions[action] || action;
    }

    startTimer() {
        const updateTimer = () => {
            if (!this.isPlaying) return;
            
            this.remainingTime--;
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            
            this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.timeRemaining.textContent = this.timerDisplay.textContent;
            
            // Update progress bar
            const progress = ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100;
            this.progressFill.style.width = `${progress}%`;
            
            if (this.remainingTime > 0) {
                setTimeout(updateTimer, 1000);
            } else {
                this.completeExercise();
            }
        };
        
        updateTimer();
    }

    changeTechnique(direction) {
        if (!this.currentTechnique) return;
        
        const techniques = Object.keys(this.techniques);
        let currentIndex = techniques.indexOf(this.currentTechnique);
        
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % techniques.length;
        } else {
            currentIndex = (currentIndex - 1 + techniques.length) % techniques.length;
        }

        this.selectTechnique(techniques[currentIndex]);
        
        // Update selected card
        document.querySelectorAll('.breathing-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.technique === techniques[currentIndex]) {
                card.classList.add('selected');
            }
        });
    }

    updateTechniqueDisplay() {
        const technique = this.techniques[this.currentTechnique];
        this.exerciseName.textContent = technique.name;
        this.exerciseDescription.textContent = technique.description;
    }

    completeExercise() {
        this.isPlaying = false;
        this.startButton.innerHTML = '<i class="fas fa-play"></i> Start';
        this.breathText.textContent = 'Exercise Complete!';
        this.remainingTime = this.totalDuration;
        this.currentStep = 0;
        this.updateProgress();
        
        // Show completion message
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.textContent = 'Great job! You\'ve completed your breathing exercise.';
        this.breathCircle.appendChild(message);
        
        setTimeout(() => {
            message.remove();
            this.breathText.textContent = 'Get Ready';
        }, 3000);
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('breathingProgress')) || {
            totalMinutes: 0,
            sessions: 0,
            streak: 0,
            lastPractice: null
        };

        this.updateProgressDisplay(progress);
    }

    updateProgress() {
        if (!this.sessionStartTime) return;

        const sessionDuration = (Date.now() - this.sessionStartTime) / 1000 / 60; // in minutes
        const progress = JSON.parse(localStorage.getItem('breathingProgress')) || {
            totalMinutes: 0,
            sessions: 0,
            streak: 0,
            lastPractice: null
        };

        const today = new Date().toDateString();
        
        progress.totalMinutes += sessionDuration;
        progress.sessions += 1;

        if (progress.lastPractice === today) {
            // Already practiced today
        } else if (progress.lastPractice === new Date(Date.now() - 86400000).toDateString()) {
            // Practiced yesterday
            progress.streak += 1;
        } else {
            // Streak broken
            progress.streak = 1;
        }

        progress.lastPractice = today;

        localStorage.setItem('breathingProgress', JSON.stringify(progress));
        this.updateProgressDisplay(progress);
    }

    updateProgressDisplay(progress) {
        const statValues = document.querySelectorAll('.stat-value');
        statValues[0].textContent = Math.round(progress.totalMinutes);
        statValues[1].textContent = progress.sessions;
        statValues[2].textContent = progress.streak;
    }
}

// Initialize breathing exercise when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BreathingExercise();
}); 