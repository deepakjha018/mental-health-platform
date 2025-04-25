function provideHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
    }
}

class UIAnimations {
    static addHoverEffects() {
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
                card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            });
        });
    }

    static initializeParallax() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.tool-card');
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardX = rect.left + rect.width / 2;
                const cardY = rect.top + rect.height / 2;

                const angle = Math.atan2(e.clientY - cardY, e.clientX - cardX);
                const distance = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));

                card.style.transform = `
                    rotateX(${mouseY * 10}deg)
                    rotateY(${mouseX * 10}deg)
                    translateZ(0)
                `;
            });
        });
    }
}

// Initialize enhanced UI
document.addEventListener('DOMContentLoaded', () => {
    UIAnimations.addHoverEffects();
    UIAnimations.initializeParallax();
});