document.addEventListener('DOMContentLoaded', function() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;
    
    function showTestimonial(index) {
      // Hide all testimonials
      testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
      });
      
      // Remove active class from all dots
      dots.forEach(dot => {
        dot.classList.remove('active');
      });
      
      // Show the current testimonial and activate dot
      testimonials[index].classList.add('active');
      dots[index].classList.add('active');
      currentIndex = index;
    }
    
    // Event listeners for dots
    dots.forEach(dot => {
      dot.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        showTestimonial(index);
      });
    });
    
    // Event listeners for prev/next buttons
    prevBtn.addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentIndex);
    });
    
    nextBtn.addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    });
    
    // Auto-rotate testimonials every 5 seconds
    setInterval(function() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 5000);
  });