// Assessment Questions Database
const assessmentQuestions = [
    {
        id: 1,
        question: "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
        category: "mood",
        options: [
            { text: "Not at all", score: 0 },
            { text: "Several days", score: 1 },
            { text: "More than half the days", score: 2 },
            { text: "Nearly every day", score: 3 }
        ]
    },
    {
        id: 2,
        question: "How often have you had little interest or pleasure in doing things?",
        category: "mood",
        options: [
            { text: "Not at all", score: 0 },
            { text: "Several days", score: 1 },
            { text: "More than half the days", score: 2 },
            { text: "Nearly every day", score: 3 }
        ]
    },
    {
        id: 3,
        question: "How would you rate your sleep quality?",
        category: "physical",
        options: [
            { text: "Very good", score: 0 },
            { text: "Fairly good", score: 1 },
            { text: "Fairly bad", score: 2 },
            { text: "Very bad", score: 3 }
        ]
    },
    {
        id: 4,
        question: "How often do you feel tired or have little energy?",
        category: "physical",
        options: [
            { text: "Not at all", score: 0 },
            { text: "Several days", score: 1 },
            { text: "More than half the days", score: 2 },
            { text: "Nearly every day", score: 3 }
        ]
    },
    {
        id: 5,
        question: "How is your appetite?",
        category: "physical",
        options: [
            { text: "Normal", score: 0 },
            { text: "Somewhat changed", score: 1 },
            { text: "Significantly changed", score: 2 },
            { text: "Severely changed", score: 3 }
        ]
    },
    {
        id: 6,
        question: "How often do you feel anxious or worried?",
        category: "anxiety",
        options: [
            { text: "Not at all", score: 0 },
            { text: "Several days", score: 1 },
            { text: "More than half the days", score: 2 },
            { text: "Nearly every day", score: 3 }
        ]
    },
    {
        id: 7,
        question: "How well can you concentrate on things?",
        category: "cognitive",
        options: [
            { text: "Very well", score: 0 },
            { text: "Fairly well", score: 1 },
            { text: "With difficulty", score: 2 },
            { text: "With great difficulty", score: 3 }
        ]
    },
    {
        id: 8,
        question: "How often do you feel lonely or isolated?",
        category: "social",
        options: [
            { text: "Not at all", score: 0 },
            { text: "Several days", score: 1 },
            { text: "More than half the days", score: 2 },
            { text: "Nearly every day", score: 3 }
        ]
    },
    {
        id: 9,
        question: "How do you feel about your future?",
        category: "outlook",
        options: [
            { text: "Very optimistic", score: 0 },
            { text: "Somewhat optimistic", score: 1 },
            { text: "Somewhat pessimistic", score: 2 },
            { text: "Very pessimistic", score: 3 }
        ]
    },
    {
        id: 10,
        question: "Have you had thoughts that you would be better off not living?",
        category: "risk",
        options: [
            { text: "Not at all", score: 0 },
            { text: "Several days", score: 1 },
            { text: "More than half the days", score: 2 },
            { text: "Nearly every day", score: 3 }
        ]
    }
];

class AssessmentManager {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.totalQuestions = assessmentQuestions.length;
        this.initializeElements();
        this.bindEvents();
        this.displayQuestion();
    }

    initializeElements() {
        this.progressBar = document.querySelector('.progress-bar');
        this.questionContainer = document.querySelector('.question-card');
        this.navigationBtns = document.querySelector('.assessment-navigation');
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.option')) {
                this.handleOptionSelect(e.target);
            }
            if (e.target.matches('.prev-question')) {
                this.showPreviousQuestion();
            }
            if (e.target.matches('.next-question')) {
                this.showNextQuestion();
            }
            if (e.target.matches('.submit-assessment')) {
                this.submitAssessment();
            }
        });
    }

    displayQuestion() {
        const question = assessmentQuestions[this.currentQuestion];
        this.updateProgressBar();
        
        this.questionContainer.innerHTML = `
            <h3>${question.question}</h3>
            <div class="options">
                ${question.options.map((option, index) => `
                    <label class="option ${this.answers[this.currentQuestion] === index ? 'selected' : ''}">
                        <input type="radio" name="q${question.id}" value="${index}" 
                            ${this.answers[this.currentQuestion] === index ? 'checked' : ''}>
                        <span>${option.text}</span>
                    </label>
                `).join('')}
            </div>
        `;

        this.updateNavigationButtons();
    }

    updateProgressBar() {
        const progressPercentage = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            // Ensure smooth animation
            progressBar.style.transition = 'width 0.5s ease-in-out';
            progressBar.style.width = `${progressPercentage}%`;

            // Force 100% on last question
            if (this.currentQuestion === this.totalQuestions - 1) {
                setTimeout(() => {
                    progressBar.style.width = '100%';
                }, 100);
            }
        }
    }

    updateNavigationButtons() {
        const isFirst = this.currentQuestion === 0;
        const isLast = this.currentQuestion === assessmentQuestions.length - 1;
        
        this.navigationBtns.innerHTML = `
            <button class="btn-secondary prev-question" ${isFirst ? 'disabled' : ''}>
                <i class="fas fa-arrow-left"></i> Previous
            </button>
            ${isLast ? `
                <button class="btn-primary submit-assessment">
                    Complete Assessment
                </button>
            ` : `
                <button class="btn-primary next-question">
                    Next <i class="fas fa-arrow-right"></i>
                </button>
            `}
        `;
    }

    handleOptionSelect(option) {
        const selectedValue = option.value;
        this.answers[this.currentQuestion] = parseInt(selectedValue);

        // Remove selection from all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked option
        option.parentElement.classList.add('selected');

        // Add delay before moving to next question
        setTimeout(() => {
            if (this.currentQuestion < this.totalQuestions - 1) {
                this.currentQuestion++;
                this.displayQuestion();
            } else {
                // Ensure progress bar shows 100% before showing results
                this.updateProgressBar();
                setTimeout(() => {
                    this.submitAssessment();
                }, 500);
            }
        }, 300);
    }

    showPreviousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.displayQuestion();
        }
    }

    showNextQuestion() {
        if (this.currentQuestion < assessmentQuestions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
        }
    }

    calculateResults() {
        const results = {
            totalScore: 0,
            categories: {
                mood: 0,
                physical: 0,
                anxiety: 0,
                cognitive: 0,
                social: 0,
                outlook: 0,
                risk: 0
            }
        };

        this.answers.forEach((answer, index) => {
            const question = assessmentQuestions[index];
            const score = question.options[answer].score;
            
            results.totalScore += score;
            results.categories[question.category] += score;
        });

        return results;
    }

    getRecommendations(results) {
        const recommendations = [];
        const totalScore = results.totalScore;
        const maxScore = assessmentQuestions.length * 3;
        const scorePercentage = (totalScore / maxScore) * 100;

        // Add general recommendations based on score
        if (scorePercentage < 25) {
            recommendations.push({
                type: 'general',
                text: 'Your mental health appears to be in a good place. Continue your positive habits.',
                actions: ['Maintain regular exercise', 'Practice mindfulness', 'Stay connected with loved ones']
            });
        } else if (scorePercentage < 50) {
            recommendations.push({
                type: 'moderate',
                text: 'You might be experiencing some challenges. Consider implementing some self-care strategies.',
                actions: ['Start a daily meditation practice', 'Establish a regular sleep schedule', 'Reach out to friends or family']
            });
        } else {
            recommendations.push({
                type: 'urgent',
                text: 'Your responses indicate significant distress. Professional support is recommended.',
                actions: ['Contact a mental health professional', 'Call our 24/7 helpline', 'Share your feelings with a trusted person']
            });
        }

        // Add category-specific recommendations
        Object.entries(results.categories).forEach(([category, score]) => {
            if (score > 4) {
                recommendations.push(this.getCategoryRecommendation(category));
            }
        });

        return recommendations;
    }

    getCategoryRecommendation(category) {
        const recommendations = {
            mood: {
                type: 'mood',
                text: 'Consider mood-enhancing activities',
                actions: ['Practice gratitude journaling', 'Engage in enjoyable activities', 'Get regular sunlight exposure']
            },
            physical: {
                type: 'physical',
                text: 'Focus on physical well-being',
                actions: ['Improve sleep hygiene', 'Regular exercise', 'Balanced nutrition']
            },
            anxiety: {
                type: 'anxiety',
                text: 'Try anxiety management techniques',
                actions: ['Deep breathing exercises', 'Progressive muscle relaxation', 'Limit caffeine intake']
            },
            cognitive: {
                type: 'cognitive',
                text: 'Enhance cognitive function',
                actions: ['Mental exercises', 'Regular breaks', 'Stress management']
            },
            social: {
                type: 'social',
                text: 'Increase social connection',
                actions: ['Join support groups', 'Schedule regular social activities', 'Volunteer']
            },
            outlook: {
                type: 'outlook',
                text: 'Work on positive thinking',
                actions: ['Practice positive affirmations', 'Set achievable goals', 'Celebrate small wins']
            },
            risk: {
                type: 'risk',
                text: 'Seek immediate support',
                actions: ['Contact emergency services', 'Call crisis hotline', 'Reach out to a trusted person']
            }
        };

        return recommendations[category];
    }

    submitAssessment() {
        const results = this.calculateResults();
        const recommendations = this.getRecommendations(results);
        this.displayResults(results, recommendations);
    }

    displayResults(results, recommendations) {
        // Hide assessment form
        document.querySelector('.assessment-form').style.display = 'none';
        
        // Show results container
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.style.display = 'block';

        // Update results content
        this.updateResultsContent(results, recommendations);

        // Show emergency alert if needed
        if (results.categories.risk > 4) {
            document.querySelector('.emergency-alert').classList.add('show');
        }
    }

    updateResultsContent(results, recommendations) {
        // Implementation for updating the results display
        // This would update the DOM with scores, recommendations, and relevant resources
    }
}

// Initialize assessment when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AssessmentManager();
}); 