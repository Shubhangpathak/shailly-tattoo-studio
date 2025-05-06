const gallery = document.getElementById('gallery');
const btnRight = document.querySelector('.scroll-right');
const btnLeft = document.querySelector('.scroll-left');
const exploreBtn = document.querySelector('.explore-btn');

function updateButtons() {
  if (!gallery || !btnLeft || !btnRight) return;
  
  btnLeft.style.display = gallery.scrollLeft > 0 ? 'block' : 'none';
  btnRight.style.display =
    gallery.scrollLeft + gallery.clientWidth < gallery.scrollWidth - 5
      ? 'block'
      : 'none';
}

function scrollGallery(direction) {
  if (!gallery) return;
  
  const scrollAmount = gallery.clientWidth * 0.8;
  
  // For better mobile alignment, find the closest image
  if (window.innerWidth <= 767) {
    const imageElement = gallery.querySelector('.gallery-image');
    if (!imageElement) return;
    
    const imageWidth = imageElement.offsetWidth;
    const scrollPosition = gallery.scrollLeft + (direction * imageWidth);
    // Snap to the closest image
    gallery.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  } else {
    gallery.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
}

// For explore button on mobile
if (exploreBtn) {
  exploreBtn.addEventListener('click', function() {
    window.location.href = '/gallery'; // Change this to your gallery page URL
  });
}

// Only add event listeners if elements exist
if (gallery) {
  gallery.addEventListener('scroll', updateButtons);
  window.addEventListener('load', updateButtons);
  window.addEventListener('resize', updateButtons);
}