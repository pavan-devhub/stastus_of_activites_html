/**
 * Site configuration - the one file to edit when connecting this page to the rest of the FEED site.
 *
 * routes: the pages outside this one that its links and buttons lead to (navbar, footer, FEED
 *   Updates, the activity lists, View Reports). They carry data-route="<key>". Set a key to its
 *   URL and the link follows it; a key left empty shows a short notice instead of navigating,
 *   because this export contains only the Status of Activities page. (The dashboard menu's other
 *   entries and the left column's ERS / Plan links show the same notice - see sidebar.js and
 *   main.js.)
 *
 * user: the signed-in member shown in the account menu (the React app reads it from
 *   GET /api/auth/me). An empty name shows "FEED Member".
 */
(function (FEED) {
  'use strict';

  FEED.config = {
    routes: {
      // navbar and footer
      home: '',            // FEED home page (logo, Home)
      about: '',           // About Us section of the home page
      events: '',          // Events & Updates
      roadmap: '',         // Export Road Map
      how: '',             // How Feed Works
      fpo: '',             // FPO
      exports: '',         // Exports (also "My Exports" in the activity lists)
      contact: '',         // Contact Us
      logout: '',          // where Logout lands; falls back to `home`
      // FEED Updates and the activity lists
      epm: '',             // EPM page
      'epm-register': '',  // register for the next EPM
      'safe-mission': '',  // Safe Mission page
      feedworld: '',       // FEED World page
      'feed-card': '',     // Feed Card page
      schemes: '',         // Know Your Schemes
      'yuva-krushi': '',   // Yuva Krushi
      ers: '',             // ERS - Export Readiness Assessment
      'org-about': '',     // My Org → About My Org
      reports: ''          // My Reports (View Reports, View Detailed Status, View Full Timeline)
    },

    // Names of the pages above, for the notice shown while a route is not set
    routeNames: {
      home: 'Home', about: 'About Us', events: 'Events & Updates', roadmap: 'Export Road Map',
      how: 'How Feed Works', fpo: 'FPO', exports: 'Exports', contact: 'Contact Us', epm: 'EPM',
      'epm-register': 'EPM Registration', 'safe-mission': 'Safe Mission', feedworld: 'FEED World',
      'feed-card': 'Feed Card', schemes: 'Know Your Schemes', 'yuva-krushi': 'Yuva Krushi',
      ers: 'ERS Assessment', 'org-about': 'My Org', reports: 'My Reports'
    },

    user: {
      firstName: '',
      lastName: '',
      email: 'member@example.com'
    }
  };
})(window.FEED = window.FEED || {});
