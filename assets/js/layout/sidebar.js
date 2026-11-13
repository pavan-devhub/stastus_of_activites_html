/**
 * Dashboard menu (left column) - nested accordion, the selected entry, and the slide-in drawer
 * below 1200px. Markup: <aside class="db-sidebar" id="db-sidebar"> in index.html.
 * (behaviour ported from the sidebar in src/pages/Dashboard.jsx)
 *
 * This export holds only the Status of Activities page, so that entry stays selected. The other
 * entries are the dashboard's other pages: choosing one shows a short notice instead of
 * navigating. Branches (My Profile, MY Org, ...) still open and close.
 */
(function (FEED) {
  'use strict';

  const { $, $$, lockScroll, trapTab } = FEED.utils;
  const DRAWER_MODE = '(max-width: 1199.98px)';
  const CURRENT = '#status';

  let sidebar, nav, toggle, backdrop, closeButton;
  let drawerMode = false;
  let drawerOpen = false;

  /* ------------------------------------------------------------ accordion */
  function setBranch(button, open) {
    const list = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(open));
    if (list) list.hidden = !open;
    // Closing a branch closes everything inside it too
    if (!open && list) $$('[aria-expanded="true"]', list).forEach((inner) => setBranch(inner, false));
  }

  // One open branch per level, as in the React app
  function toggleBranch(button) {
    const open = button.getAttribute('aria-expanded') !== 'true';
    if (open) {
      const level = button.closest('ul');
      $$(':scope > li > [aria-expanded="true"]', level).forEach((other) => {
        if (other !== button) setBranch(other, false);
      });
    }
    setBranch(button, open);
  }

  /* ------------------------------------------------------------ selected entry */
  // The branch buttons above a row, outermost first
  function ownersOf(link) {
    const owners = [];
    let list = link.closest('.db-nav-sublist');
    while (list) {
      const owner = nav.querySelector(`[aria-controls="${list.id}"]`);
      if (!owner) break;
      owners.unshift(owner);
      list = owner.closest('.db-nav-sublist');
    }
    return owners;
  }

  function selectLink(link) {
    $$('.is-active, .has-active', nav).forEach((item) => item.classList.remove('is-active', 'has-active'));
    $$('[aria-current]', nav).forEach((item) => item.removeAttribute('aria-current'));
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
    ownersOf(link).forEach((owner) => {
      owner.classList.add('has-active');
      if (owner.getAttribute('aria-expanded') !== 'true') toggleBranch(owner);
    });
  }

  /* ------------------------------------------------------------ drawer (below 1200px) */
  function setDrawer(open, { restoreFocus = true } = {}) {
    if (!drawerMode) open = false;
    if (open === drawerOpen) return;
    drawerOpen = open;
    sidebar.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    lockScroll('sidebar', open);
    if (open) {
      FEED.navbar.closeAll();
      // The drawer turns visible at once (only its slide is animated), so focus can move in now
      closeButton.focus({ preventScroll: true });
    } else if (restoreFocus) {
      toggle.focus();
    }
  }

  function syncMode(isDrawer) {
    drawerMode = isDrawer;
    setDrawer(false, { restoreFocus: false });
    // In drawer mode the menu is a modal dialog; on desktop it's a plain landmark
    if (isDrawer) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      sidebar.setAttribute('aria-labelledby', 'db-sidebar-heading');
      sidebar.removeAttribute('aria-label');
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      sidebar.removeAttribute('aria-labelledby');
      sidebar.setAttribute('aria-label', 'Dashboard menu');
    }
  }

  /* ------------------------------------------------------------ init */
  function init() {
    sidebar = $('[data-sidebar]');
    if (!sidebar) return;
    nav = $('.db-nav', sidebar);
    toggle = $('[data-sidebar-toggle]');
    backdrop = $('[data-sidebar-backdrop]');
    closeButton = $('[data-sidebar-close]', sidebar);

    const current = $(`a[href="${CURRENT}"]`, nav);
    if (current) selectLink(current);

    nav.addEventListener('click', (event) => {
      const branch = event.target.closest('button[aria-controls]');
      if (branch) {
        toggleBranch(branch);
        return;
      }
      const link = event.target.closest('a.db-nav-item, a.db-nav-subitem');
      if (!link) return;
      event.preventDefault();
      if (drawerOpen) setDrawer(false, { restoreFocus: false });
      if (link.getAttribute('href') === CURRENT) {
        // Already here: back to the top of the page's content
        FEED.utils.scrollToSection('status-of-activities');
        return;
      }
      const label = link.textContent.trim().replace(/\s+/g, ' ');
      FEED.toast(`“${label}” is part of the full FEED dashboard and isn’t included in this page.`);
    });

    toggle.addEventListener('click', () => setDrawer(!drawerOpen));
    closeButton.addEventListener('click', () => setDrawer(false));
    backdrop.addEventListener('click', () => setDrawer(false));
    sidebar.addEventListener('keydown', (event) => {
      if (!drawerOpen) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        setDrawer(false);
      } else {
        trapTab(sidebar, event);
      }
    });

    FEED.utils.watchMedia(DRAWER_MODE, syncMode);
  }

  FEED.sidebar = { init, open: () => setDrawer(true), close: () => setDrawer(false) };
})(window.FEED = window.FEED || {});
