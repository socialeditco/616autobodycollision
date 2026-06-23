(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
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
  });
})();
