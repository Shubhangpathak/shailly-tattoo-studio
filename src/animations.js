import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Helper function to safely animate elements
  // Now uses autoAlpha and sets some common defaults
  function animateIn(elements, customToVars, customFromVars = {}) {
    const validElements = gsap.utils.toArray(elements).filter(el => el);
    if (validElements.length === 0) return;

    const fromVars = {
      autoAlpha: 0, // Handles opacity and visibility
      y: 25,        // Default y offset, good for mobile
      ...customFromVars
    };

    const toVars = {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1, // Default stagger for multiple elements
      scrollTrigger: {
        trigger: validElements[0].closest('section') || validElements[0], // Sensible default trigger
        start: 'top 85%', // Default start, good for mobile
        once: true,       // Play animation once
        // toggleActions: "play none none none", // 'once:true' is often enough
      },
      ...customToVars
    };
    
    // If scrollTrigger is explicitly passed in customToVars, merge it smartly
    if (customToVars.scrollTrigger) {
        toVars.scrollTrigger = { ...toVars.scrollTrigger, ...customToVars.scrollTrigger };
    }
    
    // If elements is a single element, don't apply stagger
    if (validElements.length === 1 && toVars.stagger !== undefined) {
        delete toVars.stagger;
    }


    return gsap.fromTo(validElements, fromVars, toVars);
  }

  // --- Global Animation Defaults (can be adjusted) ---
  const defaultScrollStart = "top 85%"; // Elements are well into view on mobile
  const defaultYOffset = 25; // Reduced for subtle mobile animations

  // 1. Hero Section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top 70%", // Hero can animate a bit sooner
        once: true,
      }
    });
    heroTimeline
      .fromTo('.hero-heading', { autoAlpha: 0, y: defaultYOffset + 10 }, { autoAlpha: 1, y: 0, duration: 1 }, 0)
      .fromTo(heroSection.querySelectorAll('.main-hero-btn, .hero-phone-btn'), { autoAlpha: 0, y: defaultYOffset }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.15 }, 0.3);
  }

  // 2. About Section
  const aboutSection = document.querySelector('.about');
  if (aboutSection) {
    const aboutTitle = aboutSection.querySelector('.about-title');
    const aboutTexts = aboutSection.querySelectorAll('.about-text');

    if (aboutTitle) {
      animateIn(aboutTitle, 
        { duration: 1 }, // customToVars
        { y: defaultYOffset + 10 } // customFromVars
      );
    }
    if (aboutTexts.length > 0) {
      animateIn(aboutTexts, {
        stagger: 0.15,
        delay: 0.1, // Slight delay after trigger
        duration: 0.9, // Slightly longer duration for a smoother reveal
        scrollTrigger: {
          trigger: aboutTexts[0], // Trigger based on the first paragraph itself
          start: "top 88%", // When 88% of the first paragraph's top hits the viewport top
          // scrub: true, // uncomment for scroll-linked animation instead of triggered once
        }
      }, {
        y: defaultYOffset // customFromVars
      });
    }
  }

  
  // 3. CTA Section
  const ctaSection = document.querySelector('.cta');
  if(ctaSection) {
      const ctaTl = gsap.timeline({
          scrollTrigger: { trigger: ctaSection, start: defaultScrollStart, once: true}
      });
      ctaTl.fromTo(ctaSection.querySelectorAll('.cta-content h2, .cta-content .btn-primary'), {autoAlpha: 0, y: defaultYOffset}, {autoAlpha: 1, y:0, stagger: 0.2, duration: 0.9})
           .fromTo(ctaSection.querySelector('.cta-content2 p'), {autoAlpha: 0, y: defaultYOffset -10}, {autoAlpha: 1, y:0, duration: 0.7}, "-=0.5");
  }

  // 4. Gallery Section (Preview part + Images)
  const gallerySection = document.querySelector('.gallery-section');
  if (gallerySection) {
    // Preview container within gallery
    const galleryPreviewContainer = gallerySection.querySelector('.preview-container');
    if (galleryPreviewContainer) {
      animateIn(galleryPreviewContainer.querySelector('h3'), { scrollTrigger: { trigger: galleryPreviewContainer, start: defaultScrollStart } }, { y: defaultYOffset + 10 });
      animateIn(galleryPreviewContainer.querySelector('.btn-primary'), { delay: 0.2, scrollTrigger: { trigger: galleryPreviewContainer, start: defaultScrollStart } }, { y: defaultYOffset });
    }
    // Gallery Images
    animateIn(gallerySection.querySelectorAll('.gallery-image'), { stagger: 0.08, duration: 0.7, scrollTrigger: { trigger: '.gallery-container', start: 'top 80%' } }, { y: defaultYOffset });
  }

  // 5. Stats Section
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    // Stat Items reveal
    animateIn(statsSection.querySelectorAll('.stat-item'), 
        { stagger: 0.2, duration: 0.9, scrollTrigger: {trigger: statsSection, start: "top 80%" } }, 
        { y: defaultYOffset + 15 }
    );

    // Stat Numbers Animation
    statsSection.querySelectorAll('.stat-number').forEach(numElement => {
      const rawFinalValue = numElement.textContent || "0";
      const match = rawFinalValue.match(/(-)?([$])?([\d,.]+)([MKB%])?/);
      
      let prefix = (match && match[2]) ? match[2] : (match && match[1] ? match[1] : "");
      let suffix = (match && match[4]) ? match[4] : "";
      let targetNum = match ? parseFloat(match[3].replace(/,/g, '')) : 0;
      if (match && match[1] && !prefix.includes('-')) targetNum = -targetNum;

      let numData = { val: 0 };
      if (targetNum < 0) numData.val = Math.abs(targetNum) * 0.3; // Optional: start closer for negatives

      numElement.textContent = prefix + numData.val.toFixed(suffix === '%' ? 1 : 0) + suffix; // Initial display

      gsap.to(numData, {
        val: targetNum,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: numElement,
          start: "top 90%", // Ensure number is well in view
          once: true
        },
        onUpdate: function() {
          let currentVal = numData.val;
          let displayValue = currentVal.toFixed(suffix === '%' ? 1 : 0);
          if (suffix !== '%' && Math.abs(currentVal - Math.round(currentVal)) < 0.05) { // Check if it's very close to a whole number
             displayValue = Math.round(currentVal).toString();
          } else if (displayValue.endsWith('.0') && suffix !== '%') {
             displayValue = displayValue.substring(0, displayValue.length - 2);
          }
          numElement.textContent = prefix + displayValue + suffix;
        },
        onComplete: function() { // Ensure final value is exact
          let finalDisplay = targetNum.toFixed(suffix === '%' ? 1 : 0);
          if (suffix !== '%' && Math.abs(targetNum - Math.round(targetNum)) < 0.001) {
             finalDisplay = Math.round(targetNum).toString();
          } else if (finalDisplay.endsWith('.0') && suffix !== '%') {
             finalDisplay = finalDisplay.substring(0, finalDisplay.length - 2);
          }
          numElement.textContent = prefix + finalDisplay + suffix;
        }
      });
    });
  }

  // 6. Pricing Section
  const pricingContainer = document.querySelector('.pricing-container');
  if (pricingContainer) {
    const pricingPreview = pricingContainer.querySelector('.preview-container');
     if (pricingPreview) {
        animateIn(pricingPreview.querySelector('h3'), { scrollTrigger: {trigger: pricingPreview, start: defaultScrollStart }}, {y: defaultYOffset + 10});
        animateIn(pricingPreview.querySelector('.btn-primary'), { delay: 0.2, scrollTrigger: {trigger: pricingPreview, start: defaultScrollStart }}, {y: defaultYOffset});
    }
    animateIn(pricingContainer.querySelectorAll('.pricing-card'), { stagger: 0.15, duration: 0.9, scrollTrigger: {trigger: '.pricing-grid', start: "top 80%"}}, { y: defaultYOffset + 15 });
  }

  // 7. Testimonials Section
  const testimonialsSection = document.querySelector('.testimonials-section');
  if(testimonialsSection){
      // The .review-card animation might need adjustment if it's a horizontal marquee.
      // Assuming they stack or are otherwise individually scroll-revealable on mobile.
      animateIn(testimonialsSection.querySelectorAll('.review-card'), 
        { scale: 1, stagger: 0.15, duration: 0.9, scrollTrigger: { trigger: testimonialsSection, start: "top 80%"} }, 
        { scale: 0.95, y:0 } // fromVars: start slightly scaled down, no y motion
      );
  }

  // 8. FAQ Section
  const faqSection = document.querySelector('.faq-section');
  if (faqSection) {
    const faqHeader = faqSection.querySelector('.faq-header');
    if(faqHeader){
        animateIn(faqHeader.querySelector('.faq-title'), { scrollTrigger: { trigger: faqHeader, start: defaultScrollStart }}, { y: defaultYOffset + 10});
        animateIn(faqHeader.querySelector('.faq-subtitle'), { delay: 0.15, scrollTrigger: { trigger: faqHeader, start: defaultScrollStart }}, { y: defaultYOffset });
    }
    animateIn(faqSection.querySelectorAll('.faq-item'), { stagger: 0.1, duration: 0.7, scrollTrigger: { trigger: '.faq-items', start: "top 85%"}}, { y: defaultYOffset - 5 });
  }
  
  // 9. Footer Animations (assuming .footer and its children exist in your HTML)
  const footer = document.querySelector('.footer'); // Make sure you have a <footer class="footer">
  if (footer) {
    const footerTl = gsap.timeline({
        scrollTrigger: { trigger: footer, start: "top 95%", once: true } // Trigger when footer is almost visible
    });

    footerTl.fromTo(footer.querySelectorAll('.footer-nav, .footer-contact, .footer-social'), 
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.8 }, 
        0
    );
    // Star icon animation if they exist in your footer
    if (footer.querySelector('.star-icon')) {
        footerTl.fromTo(footer.querySelectorAll('.star-icon'),
            { autoAlpha: 0, scale: 0.5, rotation: -30 },
            { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
            0.2 // Start slightly after other footer elements
        );
    }
  }

  // --- Generic Fallback for remaining content in sections (Optional, if not covered by specific animations) ---
  // This can be broad, so use with caution or make more specific.
  // document.querySelectorAll('section').forEach(section => {
  //   const unAnimatedHeadings = section.querySelectorAll('h1:not([data-animated]), h2:not([data-animated]), h3:not([data-animated])');
  //   // Add data-animated attribute after animating to prevent re-animation by other rules
  // });

}

// Call initAnimations when the DOM is ready
// If using a framework like React/Vue/Svelte, call this in the appropriate lifecycle hook (e.g., onMounted, useEffect)
// document.addEventListener('DOMContentLoaded', initAnimations);
// If you're exporting this function, you'll call it from your main script file.