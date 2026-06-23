(function () {
  'use strict';

  const reviews = [
    { name: 'Julie Brigance', meta: '10 reviews · 2 photos', date: 'a year ago', text: 'My car was really rusty by the wheels. 616 cut out the junk areas and replaced the metal. Then they coated it with bed liner before match painting it. While they understandably couldn’t guarantee it won’t rust again in a few years, they did excellent work.' },
    { name: 'Andrew Van Liere', meta: 'Local Guide · 62 reviews · 4 photos', date: '7 months ago', text: 'Great price. May not have the curb appeal of some big name body shops, but the price for the work they did was great.' },
    { name: 'CJ Edwards', meta: 'Local Guide · 9 reviews · 2 photos', date: '2 years ago', text: 'First time going to a body shop. I was skeptical at first, but Rebecca and her team did an amazing job. She kept me informed and updated during the whole repair/shipping process. The work they did on my car was perfect, and I appreciate how kind the entire staff was to me. Would recommend for sure!' },
    { name: 'John DenBraber', meta: '4 reviews · 1 photo', date: 'a year ago', text: 'Rebecca and the team did a great job on both my vehicles within a month of each other. Pricing was great, and the communication during the whole process gave me confidence my vehicles were in great hands!' },
    { name: 'Ethan H', meta: 'Local Guide · 17 reviews', date: '3 years ago', text: 'Brought my 2016 GMC Terrain here to get two fender panels installed and painted as well as some paint work on a few other parts of my vehicle. The guys did an excellent job! My SUV looks new again. Very thankful I brought my vehicle here. I highly recommend this shop!' },
    { name: 'Ryan Karadsheh', meta: '4 reviews', date: '3 years ago', text: 'These guys are amazing. They do top-notch quality work, competitive pricing, and they are courteous and professional. I’m a used car dealer and I’ve been through my fair share of body shops. These guys are by far the best in town.' },
    { name: 'Chris Thompson', meta: 'Local Guide · 11 reviews · 1 photo', date: '2 years ago', text: 'If you are in the greater Grand Rapids area and are looking for a quality and trustworthy body shop, I highly recommend 616 Auto Body. I have used them multiple times and they have always done an outstanding job for me. Courteous, professional, and affordable.' },
    { name: 'Doug Draper', meta: '1 review', date: '2 years ago', text: 'Great place to do business with! I would recommend them always. My truck they repaired looks awesome! They went above and beyond for me.' },
    { name: 'Vicente Villarreal', meta: 'Local Guide · 22 reviews · 10 photos', date: '2 years ago', text: 'The finished product was very good, and they got it done quickly once I got my van in. Just want to say thank you to Rebecca.' }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    insertTrustSection();
    loadMiniGallery();
    initReviewCarousel();
  });

  function insertTrustSection() {
    if (document.querySelector('[data-review-carousel]')) return;

    const welcomeSection = document.querySelector('.intro-card')?.closest('.section');
    if (!welcomeSection) return;

    const section = document.createElement('section');
    section.className = 'section trust-section';
    section.innerHTML = `
      <div class="container">
        <div class="section-heading" data-reveal>
          <span class="eyebrow">Trust</span>
          <h2>Real reviews build real confidence.</h2>
          <p class="lead">A dedicated trust section gives visitors quick proof that local customers already appreciate the quality, communication, pricing, and finished repair work.</p>
          <p class="client-note trust-client-note">Client note: We can also update and improve your Google Business Profile and have new 5-star Google reviews automatically applied to this section.</p>
        </div>
      </div>
      <div class="review-carousel" data-review-carousel aria-label="Customer review carousel. Drag or swipe left and right to browse reviews.">
        <div class="review-track" data-review-track>${reviews.map(createReviewCard).join('')}</div>
      </div>
      <div class="container">
        <div class="review-trust-actions" data-reveal>
          <a class="btn" href="contact.html?type=quote#appointment">Turn Reviews Into Trust</a>
          <p>For the final build, this section can be connected to a managed review workflow so strong Google reviews keep refreshing the homepage without manual updates.</p>
        </div>
      </div>`;

    welcomeSection.insertAdjacentElement('afterend', section);
  }

  function createReviewCard(review) {
    return `
      <article class="review-card">
        <div class="review-top">
          <div class="reviewer"><strong>${escapeHtml(review.name)}</strong><span>${escapeHtml(review.meta)}</span></div>
          <div class="review-stars" aria-label="5 star review">★★★★★</div>
        </div>
        <p>“${escapeHtml(review.text)}”</p>
        <span class="review-date">${escapeHtml(review.date)}</span>
      </article>`;
  }

  function initReviewCarousel() {
    const carousel = document.querySelector('[data-review-carousel]');
    const track = document.querySelector('[data-review-track]');
    if (!carousel || !track) return;

    if (!track.dataset.cloned) {
      Array.from(track.children).forEach(function (card) {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      track.dataset.cloned = 'true';
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let paused = false;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let resumeTimer = null;
    const speed = window.matchMedia('(max-width: 760px)').matches ? 0.38 : 0.55;

    function halfWidth() {
      return Math.max(1, track.scrollWidth / 2);
    }

    function normalizeScroll() {
      const half = halfWidth();
      if (carousel.scrollLeft >= half) carousel.scrollLeft -= half;
      if (carousel.scrollLeft <= 0) carousel.scrollLeft += half;
    }

    function pauseBriefly() {
      paused = true;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () { paused = false; }, 1400);
    }

    window.setTimeout(function () {
      carousel.scrollLeft = 1;
      normalizeScroll();
    }, 80);

    carousel.addEventListener('pointerdown', function (event) {
      dragging = true;
      paused = true;
      startX = event.clientX;
      startScroll = carousel.scrollLeft;
      carousel.classList.add('is-dragging');
      if (carousel.setPointerCapture) carousel.setPointerCapture(event.pointerId);
    });

    carousel.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      event.preventDefault();
      carousel.scrollLeft = startScroll - (event.clientX - startX);
      normalizeScroll();
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (eventName) {
      carousel.addEventListener(eventName, function (event) {
        if (!dragging) return;
        dragging = false;
        carousel.classList.remove('is-dragging');
        if (carousel.releasePointerCapture && event.pointerId) {
          try { carousel.releasePointerCapture(event.pointerId); } catch (error) {}
        }
        pauseBriefly();
      });
    });

    carousel.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        pauseBriefly();
        normalizeScroll();
      }
    }, { passive: true });

    carousel.addEventListener('scroll', function () {
      if (dragging) normalizeScroll();
    }, { passive: true });

    if (!reducedMotion) {
      const tick = function () {
        if (!paused && !dragging) {
          carousel.scrollLeft += speed;
          normalizeScroll();
        }
      };

      if (window.gsap && window.gsap.ticker) {
        window.gsap.ticker.add(tick);
      } else {
        const loop = function () {
          tick();
          window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
      }
    }
  }

  function loadMiniGallery() {
    const target = document.querySelector('[data-mini-gallery]');
    if (!target) return;

    const limit = Number(target.getAttribute('data-mini-gallery-limit') || 4);

    fetch('gallery.html', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Gallery page could not be loaded.');
        return response.text();
      })
      .then(function (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const cards = Array.from(doc.querySelectorAll('.gallery-grid .ba-card')).slice(0, limit);
        target.innerHTML = '';

        if (!cards.length) {
          target.innerHTML = '<div class="card mini-gallery-loading">Gallery preview will appear here once before-and-after projects are added.</div>';
          return;
        }

        cards.forEach(function (card) {
          const clone = card.cloneNode(true);
          clone.removeAttribute('data-reveal');
          clone.removeAttribute('data-ba-card');
          clone.querySelectorAll('[data-reveal]').forEach(function (el) { el.removeAttribute('data-reveal'); });
          clone.querySelectorAll('[data-ba-card]').forEach(function (el) { el.removeAttribute('data-ba-card'); });
          clone.querySelectorAll('button.ba-panel').forEach(function (button) {
            const link = document.createElement('a');
            link.href = 'gallery.html';
            link.className = button.className;
            link.setAttribute('data-label', button.getAttribute('data-label') || 'Gallery');
            link.setAttribute('aria-label', 'View full before and after gallery');
            link.innerHTML = button.innerHTML;
            button.replaceWith(link);
          });
          target.appendChild(clone);
        });
      })
      .catch(function () {
        target.innerHTML = '<div class="card mini-gallery-loading">Before-and-after preview is ready for client gallery images.</div>';
      });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
