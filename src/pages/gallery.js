import { initializeSite } from '../site.js';

initializeSite();

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const galleryItems = [...document.querySelectorAll('[data-gallery-item]')];
const emptyState = document.querySelector('[data-gallery-empty]');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxPosition = document.querySelector('[data-lightbox-position]');

let visibleItems = galleryItems;
let activeIndex = 0;
let returnFocusTarget;

function applyFilter(filter) {
  visibleItems = galleryItems.filter((item) => filter === 'all' || item.dataset.category === filter);
  galleryItems.forEach((item) => {
    const visible = visibleItems.includes(item);
    item.hidden = !visible;
    item.setAttribute('aria-hidden', String(!visible));
  });
  filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  if (emptyState) emptyState.hidden = visibleItems.length > 0;
}

function renderLightbox() {
  const item = visibleItems[activeIndex];
  const image = item?.querySelector('img');
  if (!item || !image || !lightboxImage || !lightboxCaption || !lightboxPosition) return;
  lightboxImage.src = image.dataset.src || image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = item.dataset.caption;
  lightboxPosition.textContent = `${activeIndex + 1} / ${visibleItems.length}`;
}

function openLightbox(item) {
  if (!lightbox) return;
  returnFocusTarget = item;
  activeIndex = visibleItems.indexOf(item);
  renderLightbox();
  lightbox.showModal();
  lightbox.querySelector('[data-lightbox-close]')?.focus();
}

function stepLightbox(direction) {
  activeIndex = (activeIndex + direction + visibleItems.length) % visibleItems.length;
  renderLightbox();
}

filterButtons.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
galleryItems.forEach((item) => item.addEventListener('click', () => openLightbox(item)));
lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', () => lightbox.close());
lightbox?.querySelector('[data-lightbox-previous]')?.addEventListener('click', () => stepLightbox(-1));
lightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => stepLightbox(1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener('close', () => returnFocusTarget?.focus());
lightbox?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') stepLightbox(-1);
  if (event.key === 'ArrowRight') stepLightbox(1);
});

applyFilter('all');
