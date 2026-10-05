const EASING = 'cubic-bezier(.16, 1, .3, 1)';
const registeredElements = new WeakSet();

export function initializeScrollReveals(root = document) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const animations = new Set();
  const reveal = async (element, delay = 0, blur = 8, duration = 600, distance = 24) => {
    // Let newly requested photos decode before revealing their frame.
    const images = [...element.querySelectorAll('.deferred-image[src]')];
    await Promise.all(images.map(image => image.decode().catch(() => {})));
    element.classList.remove('scroll-reveal--pending');
    if (motion.matches) return;
    const animation = element.animate([
      { opacity: 0, transform: `translateY(${distance}px)`, filter: `blur(${blur}px)` },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
    ], { duration, delay, easing: EASING, fill: 'both' });
    animations.add(animation);
    animation.finished.then(() => {
      animations.delete(animation);
      animation.cancel(); // Release overrides so card hover styles work normally.
    }).catch(() => animations.delete(animation));
  };
  const observer = new IntersectionObserver(entries => {
    const groups = new Map();
    entries.filter(entry => entry.isIntersecting).forEach(({ target }) => {
      observer.unobserve(target);
      const group = target.closest('.gallery-grid, section') || target.parentElement;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(target);
    });
    groups.forEach(elements => {
      elements.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
      elements.forEach((element, index) => reveal(element, index * 70));
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  root.querySelectorAll('.scroll-reveal').forEach(element => {
    if (registeredElements.has(element)) return;
    registeredElements.add(element);
    element.classList.add('scroll-reveal--pending');
    observer.observe(element);
  });
  root.querySelectorAll('.hero-reveal').forEach((element, index) => {
    if (registeredElements.has(element)) return;
    registeredElements.add(element);
    reveal(element, Math.min(index * 35, 245), 5, 520, 14);
  });
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer.disconnect();
    document.querySelectorAll('.scroll-reveal--pending').forEach(element => element.classList.remove('scroll-reveal--pending'));
    animations.forEach(animation => animation.cancel());
  });
}
