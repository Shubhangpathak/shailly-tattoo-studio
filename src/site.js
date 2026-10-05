import { initializeScrollReveals } from './animations/scroll-reveal.js';
import { initializeDeferredImages } from './loading/deferred-images.js';

const BOOKING_ENDPOINT = 'https://api.web3forms.com/submit';
const MOBILE_BREAKPOINT = 800;
const ANALYTICS_ID = 'G-5MWCYGM2BV';
const ADSENSE_CLIENT = 'ca-pub-7933115760252853';

const pageLinks = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery.html' },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'locations', label: 'Locations', href: '/#locations' },
];

function headerMarkup(currentPage) {
  const links = pageLinks
    .map(({ id, label, href }) => {
      const current = currentPage === id;
      return `<a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a>`;
    })
    .join('');

  return `
    <header class="site-header" data-site-header-root>
      <div class="site-header__inner section-shell">
        <a class="brand" href="/" aria-label="Shailly's Tattoo Studio home">
          <img src="/brand-logo.webp" alt="" width="210" height="88" />
        </a>
        <nav class="desktop-nav" aria-label="Primary navigation">${links}</nav>
        <div class="site-header__actions">
          <button class="button button--compact button--primary desktop-booking" type="button" data-booking-trigger>Book now</button>
          <button class="menu-toggle" type="button" data-menu-trigger aria-controls="mobile-menu" aria-expanded="false">
            <span class="sr-only">Open navigation</span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
        <nav aria-label="Mobile navigation">${links}</nav>
        <button class="button button--primary" type="button" data-booking-trigger>Book a consultation</button>
        <p>Mumbai · Raipur<br />Monday–Saturday, 11:00 am–8:00 pm</p>
      </div>
    </header>`;
}

function footerMarkup() {
  return `
    <footer class="site-footer">
      <div class="site-footer__main section-shell">
        <div class="site-footer__brand">
          <a class="brand brand--footer" href="/" aria-label="Shailly's Tattoo Studio home">
            <img src="/brand-logo.webp" alt="" width="210" height="88" loading="lazy" />
          </a>
          <p>Custom tattoos, made personal.<br />Mumbai &amp; Raipur.</p>
        </div>
        <nav class="footer-column" aria-label="Footer navigation">
          <p class="footer-heading">Navigate</p>
          <a href="/">Home</a><a href="/gallery.html">Gallery</a><a href="/#about">Our story</a><a href="/#pricing">Pricing</a><a href="/#locations">Locations</a>
        </nav>
        <div class="footer-column footer-column--studios">
          <p class="footer-heading">Our studios</p>
          <a class="footer-studio" href="tel:+918962163217"><span>Andheri West · Mumbai</span><span class="footer-studio__phone">+91 89621 63217</span></a>
          <a class="footer-studio" href="tel:+919399951345"><span>Powai · Mumbai</span><span class="footer-studio__phone">+91 93999 51345</span></a>
          <a class="footer-studio" href="tel:+919826198127"><span>Shankar Nagar · Raipur</span><span class="footer-studio__phone">+91 98261 98127</span></a>
        </div>
        <div class="footer-column footer-column--social">
          <p class="footer-heading">Follow</p>
          <a href="https://www.instagram.com/shaillystattoostudio" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
          <a href="https://www.facebook.com/shailly.shrivastav" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a>
          <a href="https://www.youtube.com/@shaillystattoostudio" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
        </div>
        <div class="site-footer__email">
          <span>Have a question?</span>
          <a href="mailto:shaillystattoostudio01@gmail.com">shaillystattoostudio01@gmail.com <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="site-footer__legal section-shell">
        <p>© <span data-current-year></span> Shailly's Tattoo Studio</p>
        <div><a href="/privacy-policy.html">Privacy policy</a><a href="/#faq">Tattoo FAQs</a></div>
      </div>
    </footer>`;
}

function bookingDialogMarkup() {
  return `
    <dialog class="booking-dialog" data-booking-modal aria-labelledby="booking-title">
      <div class="booking-dialog__header">
        <div><p class="eyebrow">Start your consultation</p><h2 id="booking-title">Tell us about your idea.</h2></div>
        <button class="icon-button" type="button" data-booking-close aria-label="Close booking form">×</button>
      </div>
      <form class="booking-form" data-booking-form>
        <input type="hidden" name="access_key" value="537eb431-be83-4838-ab49-5b346fba20a0" />
        <div class="form-grid">
          <div class="field field--wide"><label for="booking-name">Full name <span aria-hidden="true">*</span></label><input id="booking-name" name="fullName" type="text" autocomplete="name" required /></div>
          <div class="field"><label for="booking-phone">Phone number <span aria-hidden="true">*</span></label><input id="booking-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" pattern="[0-9+() -]{10,18}" required /></div>
          <div class="field"><label for="booking-email">Email address <span aria-hidden="true">*</span></label><input id="booking-email" name="email" type="email" autocomplete="email" required /></div>
          <div class="field">
            <label for="booking-location">Studio <span aria-hidden="true">*</span></label>
            <select id="booking-location" name="location" required>
              <option value="">Choose a studio</option>
              <option value="Mumbai - Andheri West">Mumbai · Andheri West</option>
              <option value="Mumbai - Powai">Mumbai · Powai</option>
              <option value="Raipur - Shankar Nagar">Raipur · Shankar Nagar</option>
            </select>
          </div>
          <div class="field"><label for="booking-date">Preferred date <span aria-hidden="true">*</span></label><input id="booking-date" name="preferredDate" type="date" required /></div>
          <div class="field"><label for="booking-time">Preferred time <span aria-hidden="true">*</span></label><input id="booking-time" name="preferredTime" type="time" min="11:00" max="20:00" required /><small>Studio hours: 11:00 am–8:00 pm</small></div>
          <div class="field field--wide"><label for="booking-idea">Tattoo idea <span class="optional">Optional</span></label><textarea id="booking-idea" name="tattooDescription" rows="4" placeholder="Style, placement, size, references, or the story behind it"></textarea></div>
        </div>
        <div class="form-status" data-form-status role="status" aria-live="polite"></div>
        <div class="booking-form__footer"><p>Submitting this form requests a consultation; it does not confirm an appointment.</p><button class="button button--primary" type="submit" data-submit-button>Request consultation</button></div>
      </form>
    </dialog>`;
}

function initializeMenu() {
  const trigger = document.querySelector('[data-menu-trigger]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!trigger || !menu) return;

  const closeMenu = () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.querySelector('.sr-only').textContent = 'Open navigation';
    menu.hidden = true;
    document.body.classList.remove('menu-open');
  };

  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
      return;
    }
    trigger.setAttribute('aria-expanded', 'true');
    trigger.querySelector('.sr-only').textContent = 'Close navigation';
    menu.hidden = false;
    document.body.classList.add('menu-open');
    menu.querySelector('a')?.focus();
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a, [data-booking-trigger]')) closeMenu();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu();
  });
}

function initializeBookingDialog() {
  const dialog = document.querySelector('[data-booking-modal]');
  const form = document.querySelector('[data-booking-form]');
  const status = document.querySelector('[data-form-status]');
  const submitButton = document.querySelector('[data-submit-button]');
  const dateField = document.querySelector('#booking-date');
  if (!dialog || !form || !status || !submitButton || !dateField) return;

  let returnFocusTarget;
  const localToday = new Date();
  const offset = localToday.getTimezoneOffset() * 60_000;
  dateField.min = new Date(localToday.getTime() - offset).toISOString().slice(0, 10);

  const setStatus = (message = '', type = '') => {
    status.textContent = message;
    status.dataset.type = type;
  };

  document.querySelectorAll('[data-booking-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      returnFocusTarget = trigger;
      setStatus();
      dialog.showModal();
      dialog.querySelector('input:not([type="hidden"])')?.focus();
    });
  });

  dialog.querySelector('[data-booking-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => returnFocusTarget?.focus());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    setStatus('Sending your request…', 'pending');

    try {
      const payload = Object.fromEntries(new FormData(form));
      const response = await fetch(BOOKING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'The request could not be sent.');

      form.reset();
      dateField.min = new Date(Date.now() - offset).toISOString().slice(0, 10);
      setStatus('Thank you—your request is in. We will contact you to confirm the consultation.', 'success');
    } catch (error) {
      setStatus(error.message || 'Something went wrong. Please try again or call the studio.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Request consultation';
    }
  });
}

function initializeThirdPartyScripts() {
  window.addEventListener(
    'load',
    () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', ANALYTICS_ID);

      const analytics = document.createElement('script');
      analytics.async = true;
      analytics.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
      document.head.append(analytics);

      const ads = document.createElement('script');
      ads.async = true;
      ads.crossOrigin = 'anonymous';
      ads.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.append(ads);
    },
    { once: true },
  );
}

export function initializeSite() {
  const currentPage = document.body.dataset.page || 'home';
  const headerTarget = document.querySelector('[data-site-header]');
  const footerTarget = document.querySelector('[data-site-footer]');
  const bookingTarget = document.querySelector('[data-booking-dialog]');

  if (headerTarget) headerTarget.innerHTML = headerMarkup(currentPage);
  if (footerTarget) footerTarget.innerHTML = footerMarkup();
  if (bookingTarget) bookingTarget.innerHTML = bookingDialogMarkup();
  document.querySelector('[data-current-year]')?.replaceChildren(String(new Date().getFullYear()));

  initializeMenu();
  initializeBookingDialog();
  initializeDeferredImages();
  initializeScrollReveals();
  initializeThirdPartyScripts();
}
