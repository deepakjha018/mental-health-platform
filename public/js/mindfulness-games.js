function provideHapticFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
    }
} 