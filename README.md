# FEED - Status of Activities (static HTML/CSS/JS)

The dashboard's **Status of Activities** page from the FEED React app, rebuilt as a standard static
page: semantic HTML, one CSS file per component, and small plain-JavaScript files. No build step
and no dependencies.

The page keeps the dashboard's **navbar**, **left column** (FEED Updates, the dashboard menu, the
ERS / Krishi Coins / Plan cards) and **footer**. Only this page is included: links to other pages
show a short notice instead of navigating (see [Links to other pages](#links-to-other-pages)).
The EPM registration / volunteer lists that sit under the banner in the React app are not part of
this page.

**Open it:** double-click `index.html`, or serve the folder with any static server
(for example `npx serve .`). Fonts load from Google Fonts, so they need an internet connection;
everything else is local.

## Folder structure

```
status of activites/
├── index.html                  the page
├── README.md
└── assets/
    ├── css/
    │   ├── base/               variables.css (tokens, breakpoints), reset.css, base.css (icons, a11y helpers)
    │   ├── layout/             navbar.css, dashboard.css (page grid + toolbar), footer.css
    │   └── components/
    │       ├── notification-bell.css, account-menu.css, devices.css     navbar pop-ups
    │       ├── feed-updates.css, sidebar-nav.css, summary-cards.css,
    │       │   ers-card.css, krishi-coins-card.css, plan-card.css       left column
    │       ├── status-hero.css        the banner (prefix ash-)
    │       ├── activity-overview.css  the four count cards and the box they open (ash-)
    │       ├── activity-list.css      the activity list inside that box (alp-)
    │       ├── progress-board.css     overall progress, program table, milestones (apb-)
    │       └── toast.css              the notices
    ├── js/
    │   ├── config.js           URLs of the other FEED pages, the member's name / e-mail
    │   ├── utils/
    │   │   ├── utils.js        shared helpers (FEED.utils): DOM, focus trap, icons, FEED.toast
    │   │   └── format.js       dates, month labels, whole-number shares (FEED.format)
    │   ├── data/
    │   │   └── activity-data.js   every figure on the page (programs, activities, milestones)
    │   ├── layout/
    │   │   ├── navbar.js       services mega menu, notifications, My Account, mobile menu, hide-on-scroll
    │   │   ├── devices.js      My Account → Devices panel
    │   │   └── sidebar.js      dashboard menu: accordion, selected entry, drawer below 1200px
    │   ├── components/
    │   │   ├── left-column.js        FEED Updates loop, Krishi Coins counter, ERS card click
    │   │   ├── activity-overview.js  count cards; opens / switches / closes the list box
    │   │   ├── activity-list.js      All / In Progress / Completed / Upcoming lists, filters, "Show all"
    │   │   └── progress-board.js     donut + legend, program table with filters, milestones
    │   └── main.js             starts everything; links, notices, Logout, subscribe form, year
    └── images/
        ├── status/             the banner photo and the progress photo
        ├── brand/  menu/  backgrounds/  footer/
        └── dashboard/art/      left column artwork (SVG)
```

Scripts are plain `defer` scripts on one `window.FEED` namespace (not ES modules), so the page
also works when opened straight from disk (`file://`). They load in dependency order: config,
utils, data, layout, components, `main.js` last.

Icons are one inline SVG sprite at the top of `<body>` (Lucide icons, the same version as the
React app; social icons from Font Awesome Free). Static markup uses
`<svg class="icon" width="20" height="20"><use href="#icon-house"></use></svg>`; scripts use
`FEED.utils.icon('house', 20)`. The sprite holds only the icons this page uses.

## Page structure

```
<body>
  skip link → #main-content
  icon sprite
  <header class="site-header">          navbar, services mega menu, notifications, My Account, mobile menu
  <main id="main-content" class="db-layout" data-view="status">
    .db-toolbar                          "Dashboard menu" button + breadcrumb (below 1200px)
    .db-left-col
      <section class="db-updates">       FEED Updates
      <aside class="db-sidebar">         dashboard menu (Status of Activities selected)
      <section class="db-summary-grid">  ERS, Krishi Coins, Plan
    .db-main
      <section class="ash" id="status-of-activities">
        .ash-top                         banner: <h1>, buttons, photo and quote
        #activity-overview               "Activity Overview": four count cards, the list box
          #progress-board                Overall Progress, Program-wise Activity Status,
                                         Recent Updates & Milestones
  </main>
  menu backdrop, devices panel, toast region
  <footer class="new-footer">
```

## What works

| Part | Behaviour |
|---|---|
| Count cards | Total (open on arrival), Completed, In Progress, Upcoming. A card opens a box under the cards with a pointer to it; the same card again or **Escape** closes it; another card switches. |
| Activity lists | All Activities has status filters (All / In progress / Upcoming / Completed) and shows 8 rows with **Show all**; Completed shows 5 with **Show all 16**; In Progress and Upcoming list theirs in full. "In N days" is worked out from today's date. |
| Progress board | Donut and legend from the same figures; the program table filters by program, status and month. |
| Navbar | Services mega menu, notifications (badge clears when opened), My Account menu, profile picture preview, Devices panel, mobile menu, hides while scrolling down. |
| Dashboard menu | Branches open and close (one per level). Below 1200px it is a slide-in drawer with a focus trap. |
| Left column | FEED Updates rolls endlessly; Krishi Coins counts up. |
| Footer | Subscribe form validates the address (no back end). |

All figures are the React app's placeholder data, kept in `assets/js/data/activity-data.js`;
change them there and every count, meter, list, donut and table follows.

## Links to other pages

This export contains only the Status of Activities page. Anything that leads elsewhere shows a
short notice ("… isn't included in this page") instead of navigating:

- Links and buttons with `data-route="<key>"` (navbar, footer, FEED Updates, the activity lists'
  actions and section chips, View Reports / View Detailed Status / View Full Timeline). Put a URL
  against the key in `assets/js/config.js → routes` and they follow it instead.
- The dashboard menu's other entries, FEED Updates' **See All**, and the ERS / Plan card links
  (sections of the full dashboard).

**Explore Activities** scrolls to Activity Overview. Social icons and Redeem are placeholders, as
in the React app.

## Responsive behaviour

Checked from 280px (folded phones) to 2560px, with every list state open, for horizontal
scrolling, overlapping text and cut-off content.

| Width | Layout |
|---|---|
| 0 – 767 | One column: toolbar, Status of Activities, then the left column's cards. Count cards 2 × 2; each activity and each program becomes a card (counts labelled, 2 × 2 below ~420px); the milestones run down the page; the footer is one column below 380px. |
| 768 – 1199 | Still one column; the left column's cards sit side by side under the content. The banner keeps its curved photo from ~760px. |
| 1200+ | Two columns: left column beside the content, as in the React app. Content width is capped at 1920px. |

The Status of Activities blocks size themselves with container queries (`cqi` units and
`@container` rules), so they respond to the width they actually get, beside the left column or not.

## Accessibility

One `<h1>` (the banner title), `<h2>` per section, `<h3>` for the list title. Count cards are
buttons with `aria-expanded` / `aria-controls`; the list box is a labelled region; filter buttons
use `aria-pressed`; progress bars are `role="progressbar"` with values. Keyboard: Tab through
everything, Escape closes the list box, menus and the drawer. Animations stop when the visitor
asks for reduced motion.
