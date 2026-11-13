/**
 * Activity overview - the four count cards and the box they open.
 *
 * Each count is a card (icon tile, number and label, a chevron, a slim meter of its share of all
 * activities, and a caption). Clicking a card opens a box under the cards, pointing up at it,
 * that lists its activities (activity-list.js); "Total Activities" is open to start with.
 * Clicking the open card again or pressing Escape closes the box; clicking another card switches
 * to it. The box only scrolls itself into view when someone opens one, never on page load.
 *
 * Markup it fills (index.html): #ash-stats (the <ul>) and #ash-panel-host (the box's slot),
 * inside .ash-bottom.
 */
(function (FEED) {
  'use strict';

  var D = FEED.data.activities;
  var T = D.TOTALS;
  var esc = FEED.utils.esc;
  var icon = FEED.utils.icon;

  // Each status's share of all activities, in whole percents that add up to 100 (as in the donut).
  var shares = FEED.format.sharesOf([T.completed, T.inProgress, T.upcoming]);

  // The three parts of the Total card's meter - the same split and colours as the donut.
  var SPLIT = [
    { key: 'done', value: T.completed },
    { key: 'progress', value: T.inProgress },
    { key: 'upcoming', value: T.upcoming },
  ];

  var STATS = [
    { id: 'total', value: T.total, label: 'Total Activities', tone: 'orange', icon: 'target-arrow', caption: 'Across ' + D.PROGRAMS.length + ' programs' },
    { id: 'completed', value: T.completed, label: 'Completed', tone: 'green', icon: 'circle-check', share: shares[0], caption: shares[0] + '% of all activities' },
    { id: 'progress', value: T.inProgress, label: 'In Progress', tone: 'blue', icon: 'dots-ring', share: shares[1], caption: shares[1] + '% of all activities' },
    { id: 'upcoming', value: T.upcoming, label: 'Upcoming', tone: 'purple', icon: 'clock', share: shares[2], caption: shares[2] + '% of all activities' },
  ];

  /** The slim bar on a card: its share of all activities, or for Total the three-way split. */
  function meter(stat) {
    if (stat.share === undefined) {
      return '<span class="ash-meter ash-meter-split" aria-hidden="true">'
        + SPLIT.map(function (s) { return '<span class="ash-meter-' + s.key + '" style="flex-grow:' + s.value + '"></span>'; }).join('')
        + '</span>';
    }
    return '<span class="ash-meter" aria-hidden="true"><span class="ash-meter-fill" style="width:' + stat.share + '%"></span></span>';
  }

  function card(stat) {
    return '<li><button type="button" class="ash-stat ash-tone-' + stat.tone + '" data-stat="' + stat.id + '" aria-expanded="false">'
      + '<span class="ash-stat-top">'
      + '<span class="ash-stat-icon">' + icon(stat.icon, 24, { stroke: 2.4, className: 'ash-stat-svg ash-stat-svg-' + stat.id }) + '</span>'
      + '<span class="ash-stat-text"><strong>' + stat.value + '</strong><span>' + esc(stat.label) + '</span></span>'
      + '<span class="ash-stat-chevron" aria-hidden="true">' + icon('chevron-down', 24, { stroke: 2.6 }) + '</span>'
      + '</span>'
      + meter(stat)
      + '<span class="ash-stat-caption">' + esc(stat.caption) + '</span>'
      + '</button></li>';
  }

  function mount(root) {
    var list = root.querySelector('#ash-stats');
    var host = root.querySelector('#ash-panel-host');
    var openId = 'total'; // open on arrival, so the page arrives with every activity listed
    var pickedByUser = false;

    list.innerHTML = STATS.map(card).join('');
    var buttons = Array.prototype.slice.call(list.querySelectorAll('[data-stat]'));

    function update() {
      buttons.forEach(function (btn) {
        var isOpen = btn.getAttribute('data-stat') === openId;
        btn.classList.toggle('is-active', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) btn.setAttribute('aria-controls', 'ash-stat-panel');
        else btn.removeAttribute('aria-controls');
      });

      // A fresh element each time, so switching cards replays the opening animation.
      host.innerHTML = '';
      var index = STATS.findIndex(function (s) { return s.id === openId; });
      if (index < 0) return;
      var stat = STATS[index];

      var panel = document.createElement('div');
      panel.id = 'ash-stat-panel';
      panel.className = 'ash-panel ash-tone-' + stat.tone;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', 'ash-panel-title');
      // which column the open card is in, four across or two by two - for the pointer
      panel.style.setProperty('--col4', index);
      panel.style.setProperty('--col2', index % 2);
      host.appendChild(panel);
      FEED.components.ActivityList.mount(panel, stat.id, 'ash-panel-title');

      if (pickedByUser) {
        panel.scrollIntoView({ behavior: FEED.utils.prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      }
    }

    FEED.utils.delegate(list, 'click', '[data-stat]', function (e, btn) {
      var id = btn.getAttribute('data-stat');
      pickedByUser = true;
      openId = openId === id ? null : id;
      update();
    });

    // Escape anywhere in the overview closes the open box and hands focus back to its card.
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !openId) return;
      var tile = list.querySelector('[data-stat="' + openId + '"]');
      openId = null;
      update();
      if (tile) tile.focus();
    });

    update();
  }

  FEED.components = FEED.components || {};
  FEED.components.ActivityOverview = { mount: mount };
})(window.FEED = window.FEED || {});
