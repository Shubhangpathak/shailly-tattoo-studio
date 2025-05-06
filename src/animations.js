import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Helper function to safely animate elements
  function safeAnimate(elements, fromVars, toVars) {
    // Convert NodeList to Array and filter out any null/undefined elements
    const validElements = elements instanceof NodeList || Array.isArray(elements) 
      ? Array.from(elements).filter(el => el !== null && el !== undefined)
      : (elements ? [elements] : []);
    
    // Only proceed if we have valid elements
    if (validElements.length === 0) return;
    
    // Apply the animation
    return gsap.fromTo(validElements, fromVars, toVars);
  }
  
  // Add reveal class to sections for initial state
  document.querySelectorAll('.hero, .about, .preview, .pricing-container, .gallery-section, .faq-section, .findus').forEach(section => {
    if (section) section.classList.add('reveal');
  });
  
  // Main sections fade in
  const revealSections = document.querySelectorAll('.reveal');
  if (revealSections.length > 0) {
    revealSections.forEach(section => {
      if (!section) return;
      
      safeAnimate(section, 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          visibility: 'visible',
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }
  
  // Footer animations
  const footers = document.querySelectorAll('.footer');
  if (footers.length > 0) {
    footers.forEach(footer => {
      if (!footer) return;
      
      // Footer sections staggered animation
      const footerSections = footer.querySelectorAll('.footer-nav, .footer-contact, .footer-social');
      if (footerSections.length > 0) {
        safeAnimate(footerSections,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            scrollTrigger: {
              trigger: footer,
              start: "top 90%"
            }
          }
        );
      }
      
      // Star icon animation
      const stars = footer.querySelectorAll('.star-icon');
      if (stars.length > 0) {
        safeAnimate(stars,
          { opacity: 0, scale: 0.5, rotation: -30 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: footer,
              start: "top 90%"
            }
          }
        );
      }
    });
  }
  
  // Stats section animations
  const statsSections = document.querySelectorAll('.stats-section');
  if (statsSections.length > 0) {
    statsSections.forEach(section => {
      if (!section) return;
      
      const statItems = section.querySelectorAll('.stat-item');
      if (statItems.length > 0) {
        statItems.forEach(item => {
          if (item) item.classList.add('reveal-item');
        });
        
        safeAnimate(statItems,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            visibility: 'visible',
            className: "+=revealed",
            scrollTrigger: {
              trigger: section,
              start: "top 75%"
            }
          }
        );
      }
      
      // Animate the numbers
      const statNumbers = section.querySelectorAll('.stat-number');
      if (statNumbers.length > 0) {
        statNumbers.forEach(numElement => {
          if (!numElement) return;
          
          const finalValue = numElement.textContent;
          let prefix = '';
          let suffix = '';
          let targetNum = 0;
          
          // Handle different formats: $900M, $10M, 6.7%, -21%
          if (finalValue.includes('$')) {
            prefix = '$';
            if (finalValue.includes('M')) {
              suffix = 'M';
              targetNum = parseFloat(finalValue.replace('$', '').replace('M', ''));
            } else {
              targetNum = parseFloat(finalValue.replace('$', ''));
            }
          } else if (finalValue.includes('%')) {
            suffix = '%';
            targetNum = parseFloat(finalValue.replace('%', ''));
          } else if (finalValue.includes('-')) {
            prefix = '-';
            if (finalValue.includes('%')) {
              suffix = '%';
              targetNum = parseFloat(finalValue.replace('-', '').replace('%', ''));
            } else {
              targetNum = parseFloat(finalValue.replace('-', ''));
            }
          } else {
            targetNum = parseFloat(finalValue);
          }
          
          // For demonstration, we'll animate from 0 to the target value
          let startValue = 0;
          if (finalValue.includes('-')) {
            // For negative values, animate from a positive number down to negative
            startValue = Math.abs(targetNum);
          }

          numElement.textContent = prefix + startValue + suffix;
          
          gsap.to(numElement, {
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
              const progress = this.progress();
              let currentValue;
              
              if (finalValue.includes('-')) {
                // For negative values, we animate from positive to negative
                currentValue = prefix + (startValue - (progress * (startValue + targetNum))).toFixed(1) + suffix;
              } else {
                currentValue = prefix + (progress * targetNum).toFixed(1) + suffix;
              }
              
              // Remove decimal for whole numbers
              if (currentValue.endsWith('.0' + suffix)) {
                currentValue = currentValue.replace('.0', '');
              }
              
              numElement.textContent = currentValue;
            },
            onComplete: function() {
              numElement.textContent = finalValue; // Ensure we end with the exact value
            },
            scrollTrigger: {
              trigger: section,
              start: "top 75%"
            }
          });
        });
      }
    });
  }
  
  // Staggered animations for gallery images
  const gallerySections = document.querySelectorAll('.gallery-section');
  if (gallerySections.length > 0) {
    gallerySections.forEach(section => {
      if (!section) return;
      
      const images = section.querySelectorAll('.gallery-image');
      if (images.length > 0) {
        images.forEach(img => {
          if (img) img.classList.add('reveal-item');
        });
        
        safeAnimate(images,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            visibility: 'visible',
            scrollTrigger: {
              trigger: section,
              start: "top 70%"
            }
          }
        );
      }
    });
  }
  
  // Staggered animations for pricing cards
  const pricingGrids = document.querySelectorAll('.pricing-grid');
  if (pricingGrids.length > 0) {
    pricingGrids.forEach(grid => {
      if (!grid) return;
      
      const cards = grid.querySelectorAll('.pricing-card');
      if (cards.length > 0) {
        cards.forEach(card => {
          if (card) card.classList.add('reveal-item');
        });
        
        safeAnimate(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.9,
            visibility: 'visible',
            scrollTrigger: {
              trigger: grid,
              start: "top 75%"
            }
          }
        );
      }
    });
  }
  
  // FAQ items reveal
  const faqContainers = document.querySelectorAll('.faq-items');
  if (faqContainers.length > 0) {
    faqContainers.forEach(container => {
      if (!container) return;
      
      const items = container.querySelectorAll('.faq-item');
      if (items.length > 0) {
        items.forEach(item => {
          if (item) item.classList.add('reveal-item');
        });
        
        safeAnimate(items,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.7,
            visibility: 'visible',
            scrollTrigger: {
              trigger: container,
              start: "top 80%"
            }
          }
        );
      }
    });
  }
  
  // Testimonial cards animation
  const reviewCards = document.querySelectorAll('.review-card');
  if (reviewCards.length > 0) {
    reviewCards.forEach(card => {
      if (!card) return;
      
      card.classList.add('reveal-item');
      
      safeAnimate(card,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          visibility: 'visible',
          scrollTrigger: {
            trigger: card,
            start: "top 85%"
          }
        }
      );
    });
  }
  
  // Heading and button animations within sections
  const allSections = document.querySelectorAll('section');
  if (allSections.length > 0) {
    allSections.forEach(section => {
      if (!section) return;
      
      const headings = section.querySelectorAll('h1, h2, h3, h4');
      const buttons = section.querySelectorAll('.btn-primary');
      const paragraphs = section.querySelectorAll('p:not(.review-card p)');
      
      if (headings.length > 0) {
        safeAnimate(headings,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
              trigger: section,
              start: "top 75%"
            }
          }
        );
      }
      
      if (buttons.length > 0) {
        safeAnimate(buttons,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.3,
            scrollTrigger: {
              trigger: section,
              start: "top 75%"
            }
          }
        );
      }
      
      if (paragraphs.length > 0) {
        safeAnimate(paragraphs,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            scrollTrigger: {
              trigger: section,
              start: "top 75%"
            }
          }
        );
      }
    });
  }
} 