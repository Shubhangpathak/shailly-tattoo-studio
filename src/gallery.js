const gallery = document.getElementById('gallery');
const btnRight = document.querySelector('.scroll-right');
const btnLeft = document.querySelector('.scroll-left');
const exploreBtn = document.querySelector('.explore-btn');

function updateButtons() {
  if (!gallery || !btnLeft || !btnRight) return;
  
  // Show left button if we've scrolled right
  btnLeft.style.display = gallery.scrollLeft > 10 ? 'block' : 'none';
  
  // Show right button if there's more content to scroll
  const isAtEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10;
  btnRight.style.display = isAtEnd ? 'none' : 'block';
}

function scrollGallery(direction) {
  if (!gallery) return;
  
  const scrollAmount = gallery.clientWidth * 0.8;
  const currentScroll = gallery.scrollLeft;
  const maxScroll = gallery.scrollWidth - gallery.clientWidth;
  
  // For better mobile alignment, find the closest image
  if (window.innerWidth <= 767) {
    const imageElement = gallery.querySelector('.gallery-image');
    if (!imageElement) return;
    
    const imageWidth = imageElement.offsetWidth + 15; // Add gap
    const scrollPosition = currentScroll + (direction * imageWidth);
    
    // Ensure we don't scroll beyond boundaries
    const boundedScroll = Math.max(0, Math.min(scrollPosition, maxScroll));
    gallery.scrollTo({ left: boundedScroll, behavior: 'smooth' });
  } else {
    const newScroll = currentScroll + (direction * scrollAmount);
    const boundedScroll = Math.max(0, Math.min(newScroll, maxScroll));
    gallery.scrollTo({ left: boundedScroll, behavior: 'smooth' });
  }
}

// For explore button on mobile
if (exploreBtn) {
  exploreBtn.addEventListener('click', function() {
    window.location.href = '/gallery';
  });
}

// Only add event listeners if elements exist
if (gallery) {
  gallery.addEventListener('scroll', updateButtons);
  window.addEventListener('load', updateButtons);
  window.addEventListener('resize', updateButtons);
  
  // Add click event listeners for scroll buttons
  if (btnLeft) {
    btnLeft.addEventListener('click', () => scrollGallery(-1));
  }
  if (btnRight) {
    btnRight.addEventListener('click', () => scrollGallery(1));
  }
}