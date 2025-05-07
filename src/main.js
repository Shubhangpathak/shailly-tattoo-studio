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

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
    menuToggle.style.display = 'block';
  }

  function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    menuToggle.style.display = 'none';
  }

  // Open mobile menu
  if (menuToggle) {
    menuToggle.addEventListener('click', openMobileMenu);
  }

  // Close mobile menu when clicking the close button
  if (closeMenu) {
    closeMenu.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking anywhere on the overlay
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      // Only close if clicking the overlay itself, not its children
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });
  }

  // Close menu when clicking on links
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close menu when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Initialize GSAP animations
  initAnimations();
});
