import './style.css'
import './styles/navbar.css'
import './styles/modern-normalize.css'
import './styles/home.css'
import './styles/cta.css'
import './styles/about.css'
import './styles/preview.css'
import './gallery.js'
import './styles/gallery.css'
import './styles/price.css'
import './styles/findus.css'
import './styles/faq.css'
import './styles/review.css'
import './styles/responsive.css'
import './review.js'

document.querySelector('#app').innerHTML = `
  <nav>
      <div class="logo-text"><img src="/logo.png" alt=""></div>
      <div class="menu">
        <a href="#about-section">Our Work</a>
        <a href="#about-section">About Us</a>
        <a href="#price-section">Work with Us</a>
        </div>
      <div class="menu-bar" id="menu-toggle"><img src="/icons/bx-menu.svg" alt=""></div>
    </nav>

    <!-- Mobile menu overlay -->
    <div class="mobile-menu-overlay" id="mobile-menu">
      <div class="mobile-menu-content">
        <div class="mobile-menu-header">
          <div class="logo-text"><img src="/logo.png" alt="Shailly's Tattoo Studio"></div>
          <div class="close-menu" id="close-menu">×</div>
        </div>
        <div class="mobile-menu-links">
          <a href="#hero-section">Home</a>
          <a href="#about-section">About</a>
          <a href="#price-section">Pricing</a>
          <a href="#contact" class="get-in-touch-mobile">Get in touch</a>
        </div>
      </div>
    </div>
`

// setupCounter(document.querySelector('#counter'))

// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });
});
