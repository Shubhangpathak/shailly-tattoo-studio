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
import './styles/modal.css'
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
        <a href="Home.html">Home</a>
        <a href="gallery.html">Gallery</a>
        <a href="#about">About</a>
        <a href="#findus">Location</a>
        <a id="openBookingModal" class="clr-light">Book Now</a>
        </div>
      <div class="menu-bar" id="menu-toggle"><img src="/icons/bx-menu.svg" alt=""></div>
    </nav>

    <!-- Mobile menu overlay -->
    <div class="mobile-menu-overlay" id="mobile-menu">
      <div class="mobile-menu-content">
        <div class="mobile-menu-links">
          <a href="index.html">Home</a>
          <a href="gallery,html">Gallery</a>
          <a href="#about">About</a>
          <a href="#price">Pricing</a>
          <a href="#findus">Locations</a>
          <a id="openBookingModal" class="get-in-touch-mobile">Book Now</a>
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
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');

  // State
  let isMobileNavOpen = false;

  // Toggle mobile menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      isMobileNavOpen = !isMobileNavOpen;
      if (isMobileNavOpen) {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Close menu when clicking on links
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      isMobileNavOpen = false;
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Initialize GSAP animations
  initAnimations();
});

// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bookingModal');
    const openButtons = document.querySelectorAll('#openBookingModal');
    const closeButton = document.querySelector('.close-modal-btn');
    const bookingForm = document.getElementById('tattooBookingForm'); // Get the form

    // Open modal function
    function openModal() {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }
    }

    // Close modal function
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Add click event listeners to all open modal buttons
    openButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    // Close modal when clicking the close button
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Handle form submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            const formData = new FormData(bookingForm);
            const object = {};
            formData.forEach((value, key) => object[key] = value);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200) {
                    alert('Form submitted successfully!'); // Show success alert
                    bookingForm.reset(); // Reset the form
                    closeModal(); // Close the modal
                } else {
                    console.log(response);
                    alert('Something went wrong: ' + jsonResponse.message);
                }
            })
            .catch(error => {
                console.log(error);
                alert('Something went wrong!');
            });
        });
    }
});


// scroll bar letf
function updateButtons() {
  if (!gallery || !btnLeft || !btnRight) return;
  
  // Show left button if we've scrolled right
  btnLeft.style.display = gallery.scrollLeft > 10 ? 'block' : 'none';
  
  // Show right button if there's more content to scroll
  const isAtEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10;
  btnRight.style.display = isAtEnd ? 'none' : 'block';
}