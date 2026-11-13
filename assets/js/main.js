/**
 * Page entry point - starts the layout (navbar, devices panel, dashboard menu, left column cards)
 * and the Status of Activities components, then wires the page-wide bits: links to other pages
 * (data-route, see config.js), dashboard sections that aren't in this export, Logout, the
 * member's name, the footer's subscribe form and the copyright year.
 * Loaded last - all scripts use `defer`, so they run in order once the HTML is parsed.
 */
(function (FEED) {
  'use strict';

  const { $, $$, userName } = FEED.utils;
  const { routes, routeNames } = FEED.config;

  const notIncluded = (name) => `“${name}” is part of the full FEED site and isn’t included in this page.`;

  /**
   * Links and buttons to pages outside this one carry data-route="<key>". A configured URL is
   * followed; without one, the click shows a short notice instead of going nowhere.
   */
  function initRouteLinks() {
    $$('a[data-route]').forEach((link) => {
      const url = routes[link.getAttribute('data-route')];
      if (url) link.setAttribute('href', url);
    });
    document.addEventListener('click', (event) => {
      const el = event.target.closest('[data-route]');
      if (!el) return;
      const key = el.getAttribute('data-route');
      const url = routes[key];
      if (url) {
        if (el.tagName !== 'A') window.location.assign(url); // links follow their href
        return;
      }
      event.preventDefault();
      FEED.navbar.closeAll();
      FEED.toast(notIncluded(routeNames[key] || 'This page'));
    });
  }

  /**
   * In-page links to dashboard sections that only exist in the full dashboard (FEED Updates' See
   * All, the ERS and Plan cards, My Account → Dashboard...) show the notice instead of jumping.
   * The dashboard menu handles its own entries (sidebar.js).
   */
  function initMissingSections() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.hasAttribute('data-route') || link.closest('.db-nav')) return;
      const id = link.getAttribute('href').slice(1);
      if (!id) {
        event.preventDefault(); // href="#" placeholders (social links, as in the React app)
        return;
      }
      if (document.getElementById(id)) return;
      event.preventDefault();
      FEED.navbar.closeAll();
      FEED.toast(notIncluded(link.getAttribute('data-label') || link.textContent.trim().replace(/\s+/g, ' ')));
    });
  }

  /** Buttons with data-scroll-to="<id>" bring that part of the page into view. */
  function initScrollLinks() {
    document.addEventListener('click', (event) => {
      const el = event.target.closest('[data-scroll-to]');
      if (!el) return;
      event.preventDefault();
      FEED.utils.scrollToSection(el.getAttribute('data-scroll-to'));
    });
  }

  /** Logout: the React app ends the session (POST /api/auth/logout) and returns to the home page. */
  function initLogout() {
    $$('[data-action="logout"]').forEach((button) => {
      button.addEventListener('click', () => {
        FEED.navbar.closeAll();
        const target = routes.logout || routes.home;
        if (target) window.location.assign(target);
        else FEED.toast('Logout returns you to the FEED home page, which isn’t included in this page.');
      });
    });
  }

  /** In-page links in the navbar's menus close the menu they are in. */
  function initMenuLinks() {
    document.addEventListener('click', (event) => {
      if (event.target.closest('.fw-account-dropdown a[href^="#"], .nb-panel a[href^="#"]')) FEED.navbar.closeAll();
    });
    // The skip link moves focus to the main content as well as scrolling to it
    document.addEventListener('click', (event) => {
      if (event.target.closest('a[href="#main-content"]')) $('#main-content').focus({ preventScroll: true });
    });
  }

  /** The member's name in the account menu (config.user). */
  function initUser() {
    const name = userName();
    if (name) {
      $$('[data-user-name]').forEach((el) => { el.textContent = name; });
      const accountName = $('.fw-account-name');
      if (accountName) accountName.textContent = name;
      const label = $('.fw-account-label');
      // Above 12 characters the full name no longer fits the pill, so only the first name shows
      if (label) label.textContent = name.length > 12 ? name.split(/\s+/)[0] : name;
    }
    const email = $('.fw-account-email');
    if (email && FEED.config.user.email) email.textContent = FEED.config.user.email;
  }

  /** Footer subscribe form: checks the address in the browser; there is no back end in this export. */
  function initSubscribe() {
    const form = $('[data-subscribe]');
    const status = $('[data-subscribe-status]');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.reset();
      if (status) status.textContent = 'Thank you - you are subscribed to FEED updates.';
    });
  }

  function initYear() {
    const year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function mount(id, component) {
    const el = document.getElementById(id);
    if (el) component.mount(el);
  }

  function init() {
    initUser();

    // Layout: navbar, My Account → Devices, dashboard menu, left column cards
    FEED.navbar.init();
    FEED.devices.init();
    FEED.sidebar.init();
    FEED.leftColumn.init();

    // Status of Activities
    mount('activity-overview', FEED.components.ActivityOverview);
    mount('progress-board', FEED.components.ProgressBoard);

    initRouteLinks();
    initMissingSections();
    initScrollLinks();
    initLogout();
    initMenuLinks();
    initSubscribe();
    initYear();
  }

  init();
})(window.FEED = window.FEED || {});
