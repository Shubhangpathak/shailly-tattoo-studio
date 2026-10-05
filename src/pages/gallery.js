import { initializeSite } from '../site.js';
import { initializeDeferredImages } from '../loading/deferred-images.js';
import { initializeScrollReveals } from '../animations/scroll-reveal.js';
import { element, TAGS, validateItems } from '../gallery/shared.js';

initializeSite();
const grid = document.querySelector('[data-gallery-grid]');
const status = document.querySelector('[data-gallery-status]');
const emptyState = document.querySelector('[data-gallery-empty]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxPosition = document.querySelector('[data-lightbox-position]');
let galleryItems = [], visibleItems = [];
let activeFilter = 'all', activeIndex = 0, returnFocusTarget;
let loading = false, loadFailed = false;

function applyFilter(filter) {
  activeFilter = filter;
  visibleItems = galleryItems.filter(({ photo }) => filter === 'all' || photo.tags.includes(filter));
  galleryItems.forEach(item => { item.card.hidden = !visibleItems.includes(item); });
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  emptyState.hidden = loading || loadFailed || visibleItems.length > 0;
  emptyState.textContent = galleryItems.length ? 'No work is available in this category yet.' : 'New work is on the way. Check back soon.';
}

function renderLightbox() {
  const photo = visibleItems[activeIndex]?.photo;
  if (!photo) return;
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = [photo.title, ...photo.tags.map(tag => TAGS[tag])].join(' · ');
  lightboxPosition.textContent = `${activeIndex + 1} / ${visibleItems.length}`;
}

function openLightbox(item) {
  returnFocusTarget = item.card;
  activeIndex = visibleItems.indexOf(item);
  renderLightbox();
  lightbox.showModal();
  lightbox.querySelector('[data-lightbox-close]').focus();
}

function stepLightbox(direction) {
  if (!visibleItems.length) return;
  activeIndex = (activeIndex + direction + visibleItems.length) % visibleItems.length;
  renderLightbox();
}

function renderCollection(items) {
  galleryItems = items.map(photo => {
    const card = element('button', { class: 'gallery-item scroll-reveal', type: 'button', 'data-gallery-item': '', 'aria-label': `Open ${photo.title} preview` });
    const image = element('img', { class: 'deferred-image', 'data-src': photo.thumbnail, alt: photo.alt, width: photo.width, height: photo.height, decoding: 'async' });
    const caption = element('span');
    caption.append(element('strong', {}, photo.title), element('small', {}, photo.tags.map(tag => TAGS[tag]).join(' · ') || 'All work'));
    card.append(image, caption);
    const item = { photo, card };
    card.addEventListener('click', () => openLightbox(item));
    return item;
  });
  grid.replaceChildren(...galleryItems.map(item => item.card));
  applyFilter(activeFilter);
  initializeDeferredImages(grid);
  initializeScrollReveals(grid);
}

async function loadGallery() {
  if (loading) return;
  loading = true; loadFailed = false;
  grid.setAttribute('aria-busy', 'true');
  status.hidden = false;
  status.textContent = 'Loading the gallery…';
  emptyState.hidden = true;
  try {
    let items;
    try {
      const response = await fetch('/api/gallery.php', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Could not load the gallery.');
      items = validateItems((await response.json()).items);
    } catch (error) {
      if (!import.meta.env.DEV) throw error;
      items = validateItems((await import('../gallery/seed.json')).default);
    }
    loading = false;
    renderCollection(items);
    status.hidden = true;
  } catch {
    loadFailed = true;
    grid.replaceChildren();
    galleryItems = []; visibleItems = [];
    status.replaceChildren(element('p', {}, 'We couldn’t load the gallery. Please try again.'), element('button', { class: 'button button--secondary', type: 'button' }, 'Try again'));
    status.querySelector('button').addEventListener('click', loadGallery);
  } finally {
    loading = false;
    grid.setAttribute('aria-busy', 'false');
  }
}

filterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
lightbox.querySelector('[data-lightbox-previous]').addEventListener('click', () => stepLightbox(-1));
lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => returnFocusTarget?.focus());
lightbox.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  stepLightbox(event.key === 'ArrowLeft' ? -1 : 1);
});
loadGallery();

