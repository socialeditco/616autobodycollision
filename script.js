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
    initHeaderState();
    initMobileDrawer();
    initSmoothScroll();
    initHeroSlider();
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
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, 80);
      }
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
      if (event.key === 'Escape' && document.body.classList.contains('drawer-open')) {
        closeDrawer();
      }
    });
  }

  function initSmoothScroll() {
    const header = document.querySelector(SELECTORS.header);
    const headerOffset = function () {
      return header ? header.offsetHeight + 16 : 0;
    };

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

  function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('[data-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-slide-dot]'));
    const prev = slider.querySelector('[data-slide-prev]');
    const next = slider.querySelector('[data-slide-next]');
    const intervalMs = 5000;
    let current = 0;
    let timer = null;

    if (slides.length !== 2) {
      console.warn('Homepage hero slider should contain exactly 2 slides. Found:', slides.length);
    }

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
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, intervalMs);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    showSlide(0);
    if (!prefersReducedMotion) restartTimer();
  }

  function initGsapReveals() {
    if (prefersReducedMotion || typeof window.gsap === 'undefined') return;

    if (typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    const revealItems = document.querySelectorAll('[data-reveal]');
    revealItems.forEach(function (item) {
      window.gsap.fromTo(item,
        { autoAlpha: 0, y: 34, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: typeof window.ScrollTrigger !== 'undefined' ? {
            trigger: item,
            start: 'top 82%',
            once: true
          } : undefined
        }
      );
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

      const tl = window.gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 78%',
          once: true
        }
      });

      tl.to(beforeImg, {
        yPercent: 0,
        duration: 1.05,
        ease: 'power3.out'
      }, 0)
      .to(afterImg, {
        yPercent: 0,
        duration: 1.05,
        ease: 'power3.out'
      }, 0.08);
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
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
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

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  function initContactForm() {
    const quoteButton = document.querySelector(SELECTORS.quoteButton);
    const appointmentButton = document.querySelector(SELECTORS.appointmentButton);
    const form = document.querySelector('[data-contact-form]');

    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    if (quoteButton) {
      quoteButton.addEventListener('click', function () {
        alert('Demo: Your quote request would be sent to 616 Autobody.');
      });
    }

    if (appointmentButton) {
      appointmentButton.addEventListener('click', function () {
        alert('Demo: Your appointment request would be added to the shop’s calendar.');
      });
    }
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
