export function initializeDeferredImages() {
  const images = document.querySelectorAll('.deferred-image[data-src]');
  const load = image => {
    image.loading = 'eager';
    image.decoding = 'async';
    image.src = image.dataset.src;
    delete image.dataset.src;
  };
  if (!('IntersectionObserver' in window)) {
    images.forEach(load);
    return;
  }
  // Request images only when their own frame enters view, including carousel clipping.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      load(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px', threshold: 0.01 });
  images.forEach(image => observer.observe(image));
}
