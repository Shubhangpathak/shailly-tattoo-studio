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
import './styles/stats.css'
import './styles/footer.css'
import './styles/responsive.css'
import './review.js'
import './style.css'
import './utiles.css'
import './styles/gallerypage.css'
import './styles/mobile-enhancements.css'
import { initAnimations } from './animations.js'

document.querySelector('#app').innerHTML = `
  <nav>
      <div class="logo-text"><img src="/logo.png" alt=""></div>
      <div class="menu">
        <a href="gallery.html">Gallery</a>
        <a href="#about">About</a>
        <a href="#findus">Location</a>
        <a href="#price-section" class="clr-light">Book Now</a>
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
          <a href="#gallery-section">Gallery</a>
          <a href="#about-section">About</a>
          <a href="#price-section">Pricing</a>
          <a href="#findus">Locations</a>
          <a href="#price-section" class="get-in-touch-mobile">Book Now</a>
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

  // Mobile menu toggle functionality
  const menuToggle = document.getElementById('menu-toggle');
  const closeMenu = document.getElementById('close-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');

  // Open mobile menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
      menuToggle.style.display = 'none'; // Hide menu bar when menu is open
    });
  }

  // Close mobile menu
  if (closeMenu) {
    closeMenu.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = ''; // Re-enable scrolling
      menuToggle.style.display = 'block'; // Show menu bar when menu is closed
    });
  }

  // Close menu when clicking on links
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
      menuToggle.style.display = 'block'; // Show menu bar when menu is closed
    });
  });

  // Initialize GSAP animations
  initAnimations();
});
