const registeredImages = new WeakSet();

export function initializeDeferredImages(root = document) {
  const images = [...root.querySelectorAll('.deferred-image[data-src]')].filter(image => !registeredImages.has(image));
  images.forEach(image => registeredImages.add(image));
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
