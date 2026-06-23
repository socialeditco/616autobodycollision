(function () {
  'use strict';

  const SELECTORS = {
    header: '.site-header',
    menuToggle: '[data-menu-toggle]',
    drawerClose: '[data-drawer-close]',
    drawerOverlay: '[data-drawer-overlay]',
    mobileDrawer: '[data-mobile-drawer]',
    mobileLinks: '[data-mobile-drawer] a',
    internalLinks: 'a[href^="#"]',
    lightbox: '[data-lightbox]',
    lightboxImage: '[data-lightbox-image]',
    lightboxClose: '[data-lightbox-close]',
    lightboxTriggers: '[data-lightbox-src]',
    quoteButton: '[data-submit-quote]',
    appointmentButton: '[data-book-appointment]',
    appointmentDate: '#appointmentDate'
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    setCurrentYear();
    setActiveNavLinks();
    normalizeSiteCtas();
    initHeaderState();
    initMobileDrawer();
    initSmoothScroll();
    initHeroFallbacks();
    initHeroSlider();
    initContactModeForm();
    initGsapReveals();
    initBeforeAfterAnimations();
    initLightbox();
    initContactForm();
    initFlatpickr();
  });

  function setCurrentYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function setActiveNavLinks() {
    const currentPage = document.body.getAttribute('data-page') || 'home';
    document.querySelectorAll('[data-nav-page]').forEach(function (link) {
      if (link.getAttribute('data-nav-page') === currentPage) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function normalizeSiteCtas() {
    const desktopButtons = [
      { label: 'Book Appointment', href: 'contact.html?type=appointment#appointment' },
      { label: 'Get Quote', href: 'contact.html?type=quote#appointment' },
      { label: 'Sell Car', href: 'contact.html?type=sell#appointment' }
    ];

    document.querySelectorAll('.header-actions').forEach(function (actions) {
      const menu = actions.querySelector('[data-menu-toggle]');
      actions.querySelectorAll('a.btn').forEach(function (button) { button.remove(); });

      desktopButtons.forEach(function (item) {
        const link = document.createElement('a');
        link.className = 'btn header-mode-btn';
        link.href = item.href;
        link.textContent = item.label;
        actions.insertBefore(link, menu || null);
      });
    });

    document.querySelectorAll('.drawer-cta-grid').forEach(function (grid) {
      grid.innerHTML = '';
      desktopButtons.forEach(function (item) {
        const link = document.createElement('a');
        link.className = 'btn btn-wide';
        link.href = item.href;
        link.textContent = item.label;
        grid.appendChild(link);
      });
    });
  }

  function initHeaderState() {
    const header = document.querySelector(SELECTORS.header);
    if (!header) return;

    const updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 6);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function initMobileDrawer() {
    const toggle = document.querySelector(SELECTORS.menuToggle);
    const close = document.querySelector(SELECTORS.drawerClose);
    const overlay = document.querySelector(SELECTORS.drawerOverlay);
    const drawer = document.querySelector(SELECTORS.mobileDrawer);
    const links = document.querySelectorAll(SELECTORS.mobileLinks);

    if (!toggle || !drawer) return;

    const openDrawer = function () {
      document.body.classList.add('drawer-open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      const firstLink = drawer.querySelector('a, button');
      if (firstLink) window.setTimeout(function () { firstLink.focus(); }, 80);
    };

    const closeDrawer = function () {
      document.body.classList.remove('drawer-open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', openDrawer);
    if (close) close.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('drawer-open');
        toggle.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && document.body.classList.contains('drawer-open')) closeDrawer();
    });
  }

  function initSmoothScroll() {
    const header = document.querySelector(SELECTORS.header);
    const headerOffset = function () { return header ? header.offsetHeight + 16 : 0; };

    document.querySelectorAll(SELECTORS.internalLinks).forEach(function (link) {
      link.addEventListener('click', function (event) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        history.pushState(null, '', href);
      });
    });
  }

  function initHeroFallbacks() {
    const desktopHero = document.querySelector('.canva-hero-desktop img');
    const mobileHero = document.querySelector('.canva-hero-mobile img');

    if (desktopHero) {
      desktopHero.onerror = function () {
        desktopHero.onerror = null;
        desktopHero.src = 'assets/hero-desktop.png';
      };
    }

    if (mobileHero) {
      mobileHero.onerror = function () {
        mobileHero.onerror = null;
        mobileHero.src = 'assets/hero-mobile.png';
      };
    }
  }

  function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('[data-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-slide-dot]'));
    const prev = slider.querySelector('[data-slide-prev]');
    const next = slider.querySelector('[data-slide-next]');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        const isActive = slideIndex === current;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-selected', String(dotIndex === current));
      });
    };

    const restartTimer = function () {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () { showSlide(current + 1); }, 5000);
    };

    if (prev) prev.addEventListener('click', function () { showSlide(current - 1); restartTimer(); });
    if (next) next.addEventListener('click', function () { showSlide(current + 1); restartTimer(); });
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () { showSlide(dotIndex); restartTimer(); });
    });

    showSlide(0);
    if (!prefersReducedMotion) restartTimer();
  }

  function initContactModeForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const formGrid = form.querySelector('.form-grid');
    const actions = form.querySelector('.form-actions');
    if (!formGrid) return;

    const params = new URLSearchParams(window.location.search);
    const initialMode = normalizeMode(params.get('type') || params.get('mode') || 'quote');

    if (!form.querySelector('[data-form-mode-toggle]')) {
      const modePanel = document.createElement('div');
      modePanel.className = 'form-mode-panel';
      modePanel.setAttribute('data-form-mode-toggle', '');
      modePanel.innerHTML = `
        <span class="client-note">Choose request type</span>
        <div class="form-mode-buttons" role="group" aria-label="Choose form request type">
          <button type="button" class="btn" data-form-mode="appointment">Book Appointment</button>
          <button type="button" class="btn" data-form-mode="quote">Get Quote</button>
          <button type="button" class="btn" data-form-mode="sell">Sell Car</button>
        </div>
        <p class="form-mode-help" data-form-mode-help></p>`;
      form.insertBefore(modePanel, formGrid);
    }

    if (!document.getElementById('requestType')) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = 'requestType';
      hidden.name = 'requestType';
      form.appendChild(hidden);
    }

    appendField(formGrid, 'vin', 'VIN', 'text', '1G1YZ23J9P5800001', 'vehicle-detail-field');
    appendField(formGrid, 'licensePlate', 'License Plate', 'text', 'ABC 1234', 'vehicle-detail-field');
    appendField(formGrid, 'mileage', 'Mileage', 'text', '85,000', 'sell-field');
    appendField(formGrid, 'askingPrice', 'Asking Price / Payoff', 'text', '$8,500 or payoff amount', 'sell-field');
    appendSelect(formGrid, 'preferredContact', 'Preferred Communication', ['Call', 'Text', 'Email'], 'vehicle-detail-field');
    appendSelect(formGrid, 'dropOffNeeds', 'Drop-off Needs', ['Need drop-off help', 'Need rental coordination', 'Dropping vehicle off myself', 'Not sure yet'], 'appointment-field vehicle-detail-field');

    if (!form.querySelector('[data-image-upload-grid]')) {
      const uploadBlock = document.createElement('div');
      uploadBlock.className = 'image-upload-block full';
      uploadBlock.setAttribute('data-image-upload-grid', '');
      uploadBlock.innerHTML = `
        <div class="image-upload-heading">
          <span class="client-note">Image upload placeholders</span>
          <p>Final build can accept real uploads. These placeholders show the exact vehicle angles we would request for appointment, quote, or sell-car submissions.</p>
        </div>
        <div class="image-upload-grid">
          ${createImageUpload('frontImage', 'Front image')}
          ${createImageUpload('rearImage', 'Rear image')}
          ${createImageUpload('leftImage', 'Left side image')}
          ${createImageUpload('rightImage', 'Right side image')}
        </div>`;
      formGrid.appendChild(uploadBlock);
    }

    form.querySelectorAll('[data-form-mode]').forEach(function (button) {
      button.addEventListener('click', function () {
        setFormMode(normalizeMode(button.getAttribute('data-form-mode')));
      });
    });

    setFormMode(initialMode);

    function setFormMode(mode) {
      const requestType = document.getElementById('requestType');
      if (requestType) requestType.value = mode;
      form.setAttribute('data-active-form-mode', mode);

      form.querySelectorAll('[data-form-mode]').forEach(function (button) {
        const active = button.getAttribute('data-form-mode') === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      const help = form.querySelector('[data-form-mode-help]');
      if (help) {
        help.textContent = mode === 'appointment'
          ? 'Appointment mode prioritizes service type, preferred date/time, drop-off needs, contact preference, and vehicle images.'
          : mode === 'sell'
            ? 'Sell Car mode collects vehicle details, VIN, mileage, asking price or payoff notes, condition notes, and four required vehicle-angle images.'
            : 'Quote mode collects damage details, service type, VIN/license information, preferred contact method, and four damage/vehicle images.';
      }

      const serviceLabel = document.querySelector('label[for="serviceType"]');
      const message = document.getElementById('message');
      const submitQuote = document.querySelector('[data-submit-quote]');
      const bookAppointment = document.querySelector('[data-book-appointment]');

      if (serviceLabel) serviceLabel.textContent = mode === 'sell' ? 'Vehicle Condition' : 'Service Type';
      if (message) {
        message.placeholder = mode === 'appointment'
          ? 'Tell us what you need looked at, where the damage is, and any scheduling details.'
          : mode === 'sell'
            ? 'Tell us about the vehicle condition, known damage, title status, payoff, and anything else we should know.'
            : 'Tell us what happened, where the damage is, and whether insurance is involved.';
      }
      if (submitQuote) submitQuote.textContent = mode === 'sell' ? 'Submit Sell Car Request' : mode === 'appointment' ? 'Submit Appointment Request' : 'Submit Quote Request';
      if (bookAppointment) bookAppointment.textContent = mode === 'sell' ? 'Request Vehicle Review' : 'Book Appointment';
    }
  }

  function normalizeMode(mode) {
    const cleaned = String(mode || '').toLowerCase().trim();
    if (cleaned === 'appointment' || cleaned === 'book') return 'appointment';
    if (cleaned === 'sell' || cleaned === 'sell-car' || cleaned === 'sellcar') return 'sell';
    return 'quote';
  }

  function appendField(grid, id, label, type, placeholder, className) {
    if (document.getElementById(id)) return;
    const wrap = document.createElement('div');
    wrap.className = 'form-field ' + (className || '');
    wrap.innerHTML = `<label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}">`;
    const messageField = document.getElementById('message')?.closest('.form-field');
    grid.insertBefore(wrap, messageField || null);
  }

  function appendSelect(grid, id, label, options, className) {
    if (document.getElementById(id)) return;
    const wrap = document.createElement('div');
    wrap.className = 'form-field ' + (className || '');
    wrap.innerHTML = `<label for="${id}">${label}</label><select id="${id}" name="${id}"><option value="">Select one</option>${options.map(function (option) { return `<option>${option}</option>`; }).join('')}</select>`;
    const messageField = document.getElementById('message')?.closest('.form-field');
    grid.insertBefore(wrap, messageField || null);
  }

  function createImageUpload(id, label) {
    return `<label class="image-upload-card" for="${id}"><span>${label}</span><small>Click to attach image</small><input id="${id}" name="${id}" type="file" accept="image/*"></label>`;
  }

  function initGsapReveals() {
    if (prefersReducedMotion || typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger !== 'undefined') window.gsap.registerPlugin(window.ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(function (item) {
      window.gsap.fromTo(item, { autoAlpha: 0, y: 34, scale: 0.985 }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: typeof window.ScrollTrigger !== 'undefined' ? { trigger: item, start: 'top 82%', once: true } : undefined
      });
    });
  }

  function initBeforeAfterAnimations() {
    if (prefersReducedMotion || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    document.querySelectorAll('[data-ba-card]').forEach(function (card) {
      const beforeImg = card.querySelector('.ba-before img');
      const afterImg = card.querySelector('.ba-after img');
      if (!beforeImg || !afterImg) return;

      window.gsap.set(beforeImg, { yPercent: 100 });
      window.gsap.set(afterImg, { yPercent: -100 });
      window.gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 78%', once: true } })
        .to(beforeImg, { yPercent: 0, duration: 1.05, ease: 'power3.out' }, 0)
        .to(afterImg, { yPercent: 0, duration: 1.05, ease: 'power3.out' }, 0.08);
    });
  }

  function initLightbox() {
    const lightbox = document.querySelector(SELECTORS.lightbox);
    const lightboxImage = document.querySelector(SELECTORS.lightboxImage);
    const close = document.querySelector(SELECTORS.lightboxClose);
    if (!lightbox || !lightboxImage) return;

    let lastFocused = null;
    const openLightbox = function (src, alt) {
      lastFocused = document.activeElement;
      lightboxImage.src = src;
      lightboxImage.alt = alt || 'Gallery image';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (close) close.focus();
    };
    const closeLightbox = function () {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
    };

    document.querySelectorAll(SELECTORS.lightboxTriggers).forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const img = trigger.querySelector('img');
        const src = trigger.getAttribute('data-lightbox-src') || (img ? img.src : '');
        const alt = trigger.getAttribute('data-lightbox-alt') || (img ? img.alt : '');
        if (src) openLightbox(src, alt);
      });
    });
    if (close) close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox(); });
  }

  function initContactForm() {
    const quoteButton = document.querySelector(SELECTORS.quoteButton);
    const appointmentButton = document.querySelector(SELECTORS.appointmentButton);
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    form.addEventListener('submit', function (event) { event.preventDefault(); });
    if (quoteButton) quoteButton.addEventListener('click', function () { alert('Demo: This request would be sent to 616 Autobody.'); });
    if (appointmentButton) appointmentButton.addEventListener('click', function () { alert('Demo: This appointment/review request would be added to the shop workflow.'); });
  }

  function initFlatpickr() {
    const dateInput = document.querySelector(SELECTORS.appointmentDate);
    if (!dateInput || typeof window.flatpickr === 'undefined') return;

    window.flatpickr(dateInput, {
      minDate: 'today',
      disableMobile: false,
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'F j, Y'
    });
  }
})();
