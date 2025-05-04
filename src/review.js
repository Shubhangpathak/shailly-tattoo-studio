// This file is kept for compatibility - the testimonials now use CSS animation for infinite scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Pause animation on hover for better user experience
    const reviewTrack = document.querySelector('.review-track');
    
    if (reviewTrack) {
        // Add hover functionality to pause the animation
        reviewTrack.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        reviewTrack.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
});