class ActivityManager {
  constructor() {
    this.activities = [
      {
        id: 'breathing',
        title: 'Deep Breathing',
        duration: 5,
        completed: false,
        streak: 0,
        lastCompleted: null
      },
      {
        id: 'journal',
        title: 'Daily Journal',
        duration: 10,
        completed: false,
        streak: 0,
        lastCompleted: null
      }
    ];

    this.initializeProgressBars();
    this.setupEventListeners();
  }

  initializeProgressBars() {
    this.activities.forEach(activity => {
      const progressBar = document.querySelector(`#${activity.id} .progress-bar`);
      if (progressBar) {
        progressBar.style.width = '0%';
      }
    });
  }

  setupEventListeners() {
    document.querySelectorAll('.start-activity').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const activityId = e.target.closest('.activity-card').dataset.activity;
        this.startActivity(activityId);
      });
    });
  }

  startActivity(activityId) {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) return;

    const card = document.querySelector(`[data-activity="${activityId}"]`);
    const timerElement = card.querySelector('.activity-timer');
    const progressBar = card.querySelector('.progress-bar');

    let timeLeft = activity.duration * 60;
    const updateInterval = setInterval(() => {
      timeLeft--;
      
      // Update progress bar
      const progress = ((activity.duration * 60 - timeLeft) / (activity.duration * 60)) * 100;
      progressBar.style.width = `${progress}%`;

      // Update timer display
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (timeLeft <= 0) {
        clearInterval(updateInterval);
        this.completeActivity(activityId);
      }
    }, 1000);
  }

  completeActivity(activityId) {
    const activity = this.activities.find(a => a.id === activityId);
    activity.completed = true;
    activity.streak++;
    activity.lastCompleted = new Date();
    
    // Update UI
    const card = document.querySelector(`[data-activity="${activityId}"]`);
    card.classList.add('completed');
    card.querySelector('.streak-counter').textContent = activity.streak;
  }
} 