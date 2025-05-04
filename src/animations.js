import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Add reveal class to sections for initial state
  document.querySelectorAll('.hero, .cta, .about, .preview, .pricing-container, .gallery-section, .testimonials-section, .faq-section, .findus, .stats-section, .footer').forEach(section => {
    section.classList.add('reveal');
  });
  
  // Main sections fade in
  gsap.utils.toArray('.reveal').forEach(section => {
    gsap.fromTo(section, 
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
  
  // Footer animations
  gsap.utils.toArray('.footer').forEach(footer => {
    // Footer sections staggered animation
    const footerSections = footer.querySelectorAll('.footer-nav, .footer-contact, .footer-social');
    
    gsap.fromTo(footerSections,
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
    
    // Star icon animation
    const stars = footer.querySelectorAll('.star-icon');
    
    gsap.fromTo(stars,
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
  });
  
  // Stats section animations
  gsap.utils.toArray('.stats-section').forEach(section => {
    const statItems = section.querySelectorAll('.stat-item');
    statItems.forEach(item => item.classList.add('reveal-item'));
    
    gsap.fromTo(statItems,
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
    
    // Animate the numbers
    const statNumbers = section.querySelectorAll('.stat-number');
    statNumbers.forEach(numElement => {
      const finalValue = numElement.textContent;
      let hasPlus = false;
      let targetNum = 0;
      
      if (finalValue.includes('+')) {
        hasPlus = true;
        targetNum = parseInt(finalValue.replace('+', ''));
      } else if (finalValue.includes('%')) {
        hasPlus = false;
        targetNum = parseInt(finalValue.replace('%', ''));
      } else {
        targetNum = parseInt(finalValue);
      }
      
      gsap.fromTo(numElement, 
        { textContent: 0 },
        {
          textContent: targetNum,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          stagger: 0.25,
          scrollTrigger: {
            trigger: section,
            start: "top 75%"
          },
          onComplete: () => {
            if (hasPlus) {
              numElement.textContent = targetNum + '+';
            } else if (finalValue.includes('%')) {
              numElement.textContent = targetNum + '%';
            }
          }
        }
      );
    });
  });
  
  // Staggered animations for gallery images
  gsap.utils.toArray('.gallery-section').forEach(section => {
    const images = section.querySelectorAll('.gallery-image');
    images.forEach(img => img.classList.add('reveal-item'));
    
    gsap.fromTo(images,
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
  });
  
  // Staggered animations for pricing cards
  gsap.utils.toArray('.pricing-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.pricing-card');
    cards.forEach(card => card.classList.add('reveal-item'));
    
    gsap.fromTo(cards,
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
  });
  
  // FAQ items reveal
  gsap.utils.toArray('.faq-items').forEach(container => {
    const items = container.querySelectorAll('.faq-item');
    items.forEach(item => item.classList.add('reveal-item'));
    
    gsap.fromTo(items,
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
  });
  
  // Testimonial cards animation
  gsap.utils.toArray('.review-card').forEach(card => {
    card.classList.add('reveal-item');
    
    gsap.fromTo(card,
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
  
  // Heading and button animations within sections
  gsap.utils.toArray('section').forEach(section => {
    const headings = section.querySelectorAll('h1, h2, h3, h4');
    const buttons = section.querySelectorAll('.btn-primary');
    const paragraphs = section.querySelectorAll('p:not(.review-card p)');
    
    gsap.fromTo(headings,
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
    
    gsap.fromTo(buttons,
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
    
    gsap.fromTo(paragraphs,
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
  });
} 