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
  const scrollWork = (direction) => {
    const card = workRail.querySelector('.featured-card');
    if (!card) return;

    const gap = Number.parseFloat(getComputedStyle(workRail).columnGap) || 0;
    workRail.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
  };

  document.querySelector('[data-work-previous]')?.addEventListener('click', () => scrollWork(-1));
  document.querySelector('[data-work-next]')?.addEventListener('click', () => scrollWork(1));
}
