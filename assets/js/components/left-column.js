/**
 * Left column cards (the same as on every dashboard page):
 * - FEED Updates: the list rolls upwards endlessly (a CSS animation over cloned rows);
 * - Krishi Coins: the balance counts up from zero;
 * - ERS: the whole card opens the assessment, as in the React app - here that page isn't
 *   included, so the card's link shows the notice (main.js) and a click anywhere on the card
 *   does the same.
 * (behaviour ported from src/pages/Dashboard.jsx)
 */
(function (FEED) {
  'use strict';

  const { $, prefersReducedMotion } = FEED.utils;

  // FEED Updates shows this many rows at a time while it rolls (see feed-updates.css)
  const UPDATES_VISIBLE = 5;

  /**
   * Appends hidden copies of a list's items so a CSS animation can loop it seamlessly.
   * Copies are hidden from screen readers and taken out of the Tab order.
   */
  function cloneForLoop(list, copies) {
    const items = Array.from(list.children);
    for (let c = 1; c < copies; c++) {
      items.forEach((item) => {
        const copy = item.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('data-clone', '');
        copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
        copy.querySelectorAll('a, button').forEach((node) => node.setAttribute('tabindex', '-1'));
        list.appendChild(copy);
      });
    }
    return items.length;
  }

  function initUpdates() {
    const updates = $('[data-marquee="updates"]');
    if (!updates || prefersReducedMotion()) return;
    const count = updates.children.length;
    // Enough copies that, after moving up one full pass, the window is still full
    const copies = Math.max(2, 1 + Math.ceil(UPDATES_VISIBLE / count));
    cloneForLoop(updates, copies);
    updates.style.setProperty('--upd-copies', copies);
    updates.style.setProperty('--upd-count', count);
    updates.classList.add('is-looping');
  }

  /** Krishi Coins: the balance counts up from zero (ease-out over 1.1s). */
  function initCounter() {
    const value = $('[data-count-to]');
    if (!value || prefersReducedMotion()) return;
    const target = Number(value.getAttribute('data-count-to'));
    const format = new Intl.NumberFormat('en-IN');
    const duration = 1100;
    const start = performance.now();
    value.setAttribute('aria-label', format.format(target));
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      value.textContent = format.format(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
      else value.removeAttribute('aria-label');
    };
    requestAnimationFrame(tick);
  }

  /** The whole ERS card acts like its "Start Assessment" link. */
  function initErsCard() {
    const card = $('[data-ers-card]');
    if (!card) return;
    const link = $('.db-ers-cta', card);
    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button') || !link) return;
      link.click();
    });
  }

  function init() {
    initUpdates();
    initCounter();
    initErsCard();
  }

  FEED.leftColumn = { init };
})(window.FEED = window.FEED || {});
