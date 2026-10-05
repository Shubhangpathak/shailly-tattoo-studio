import { initializeSite } from '../site.js';

initializeSite();

const powaiDialog = document.querySelector('[data-powai-dialog]');
const powaiTrigger = document.querySelector('[data-powai-trigger]');

if (powaiDialog && powaiTrigger) {
  powaiTrigger.addEventListener('click', () => powaiDialog.showModal());
  powaiDialog.querySelector('[data-powai-close]')?.addEventListener('click', () => powaiDialog.close());
  powaiDialog.addEventListener('click', (event) => {
    if (event.target === powaiDialog) powaiDialog.close();
  });
  powaiDialog.addEventListener('close', () => powaiTrigger.focus());
}

const workRail = document.querySelector('[data-work-rail]');

if (workRail) {
  const previous = document.querySelector('[data-work-previous]');
  const next = document.querySelector('[data-work-next]');
  const updateControls = () => {
    const maxScroll = workRail.scrollWidth - workRail.clientWidth;
    if (previous) previous.disabled = workRail.scrollLeft <= 2;
    if (next) next.disabled = workRail.scrollLeft >= maxScroll - 2;
  };
  const scrollWork = (direction) => {
    const card = workRail.querySelector('.featured-card');
    if (!card) return;

    const gap = Number.parseFloat(getComputedStyle(workRail).columnGap) || 0;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    workRail.scrollBy({ left: direction * (card.offsetWidth + gap), behavior });
  };

  previous?.addEventListener('click', () => scrollWork(-1));
  next?.addEventListener('click', () => scrollWork(1));
  workRail.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', updateControls);
  workRail.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    scrollWork(event.key === 'ArrowLeft' ? -1 : 1);
  });
  updateControls();
}
