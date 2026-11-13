/**
 * Activity list - what the box under the count cards shows (see activity-overview.js).
 *
 * A header (icon, title with the count, a line on what's listed), then the activities as a table:
 * #, the activity and a note, the list's own column (progress, completion date, scheduled date,
 * or for "All Activities" a status pill with either), the action, and the FEED section it belongs
 * to. "All Activities" also has status filter buttons; long lists show their first few with a
 * "Show all" button. Below ~720px wide each row becomes a card (CSS container query).
 *
 * Usage: FEED.components.ActivityList.mount(element, 'total' | 'progress' | 'completed' | 'upcoming', titleId)
 */
(function (FEED) {
  'use strict';

  var D = FEED.data.activities;
  var fmt = FEED.format;
  var esc = FEED.utils.esc;
  var icon = FEED.utils.icon;

  function byDate(dir) {
    return function (a, b) { return dir * (fmt.dayOf(a.date) - fmt.dayOf(b.date)); };
  }

  function tagged(items, status) {
    return items.map(function (a) { return Object.assign({ status: status }, a); });
  }

  var COMPLETED = D.COMPLETED.slice().sort(byDate(-1)); // newest first
  var UPCOMING = D.UPCOMING.slice().sort(byDate(1)); // soonest first

  // The "All Activities" filter buttons; `id` matches the status tag each row gets in that list.
  var FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'progress', label: 'In progress' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ];

  var LISTS = {
    total: {
      title: 'All Activities',
      sub: 'Every activity across your programs: in progress first, then upcoming, then completed.',
      icon: 'target-arrow',
      column: 'Status',
      items: tagged(D.IN_PROGRESS, 'progress').concat(tagged(UPCOMING, 'upcoming'), tagged(COMPLETED, 'completed')),
      pageSize: 8,
      filters: true,
    },
    progress: {
      title: 'In Progress Activities',
      sub: 'Activities you have started, with the next step for each.',
      icon: 'dots-ring',
      column: 'Status / Progress',
      items: D.IN_PROGRESS,
    },
    completed: {
      title: 'Completed Activities',
      sub: 'Everything you have finished, most recent first.',
      icon: 'circle-check',
      column: 'Completed on',
      items: COMPLETED,
      pageSize: 5,
    },
    upcoming: {
      title: 'Upcoming Activities',
      sub: 'What is scheduled next, soonest first.',
      icon: 'clock',
      column: 'Scheduled for',
      items: UPCOMING,
    },
  };

  /* ---------- cells ---------- */

  function timeTag(date) {
    return '<time datetime="' + fmt.isoDay(date) + '">' + esc(fmt.dateLabel(date)) + '</time>';
  }

  function progressBar(a) {
    return '<span class="alp-bar" role="progressbar" aria-valuenow="' + a.progress + '" aria-valuemin="0" aria-valuemax="100"'
      + ' aria-label="' + esc(a.title) + ' progress"><span style="width:' + a.progress + '%"></span></span>';
  }

  function statePill(kind, label) {
    return '<span class="alp-state alp-state-' + kind + '">' + esc(label) + '</span>';
  }

  /** "All Activities": a status pill, then the progress bar or the date. */
  function statusSummary(a) {
    if (a.status === 'progress') {
      return '<span class="alp-progress-top">'
        + statePill(a.state ? a.state.kind : 'progress', a.state ? a.state.label : 'In progress')
        + (a.progress > 0 ? '<span class="alp-progress-pct">' + a.progress + '%</span>' : '')
        + '</span>' + progressBar(a);
    }
    var done = a.status === 'completed';
    return '<span class="alp-when-stack">'
      + statePill(a.status, done ? 'Completed' : 'Upcoming')
      + '<span class="alp-when-sub">' + timeTag(a.date) + (done ? '' : ' · ' + esc(fmt.untilLabel(a.date))) + '</span>'
      + '</span>';
  }

  /** The list's own column for one activity. */
  function statusCell(listId, a) {
    if (listId === 'total') return statusSummary(a);
    if (listId === 'completed') {
      return '<span class="alp-when">' + icon('circle-check', 16, { stroke: 2.4, className: 'alp-when-done' }) + timeTag(a.date) + '</span>';
    }
    if (listId === 'upcoming') {
      return '<span class="alp-when alp-when-stack">'
        + '<span class="alp-when">' + icon('calendar-clock', 16, { stroke: 2.2, className: 'alp-when-icon' }) + timeTag(a.date) + '</span>'
        + '<span class="alp-until">' + esc(fmt.untilLabel(a.date)) + '</span>'
        + '</span>';
    }
    return '<span class="alp-progress-top">'
      + (a.state ? statePill(a.state.kind, a.state.label) : '<strong>' + a.progress + '%</strong>')
      + (a.state && a.progress > 0 ? '<span class="alp-progress-pct">' + a.progress + '%</span>' : '')
      + '</span>' + progressBar(a);
  }

  function row(listId, a, i) {
    return '<div class="alp-row" role="row">'
      + '<span role="cell" class="alp-c-num"><span class="alp-num">' + (i + 1) + '</span></span>'
      + '<span role="cell" class="alp-c-activity">'
      + '<span class="alp-icon alp-tone-' + a.tone + '" aria-hidden="true">' + icon(a.icon, 20) + '</span>'
      + '<span class="alp-activity-text">'
      + '<span class="alp-activity-title">' + esc(a.title) + '</span>'
      + '<span class="alp-activity-note">' + esc(a.note) + '</span>'
      + '</span></span>'
      + '<span role="cell" class="alp-c-progress">' + statusCell(listId, a) + '</span>'
      + '<span role="cell" class="alp-c-action">'
      + '<button type="button" class="alp-action" data-route="' + esc(a.action.route || a.link.route) + '"'
      + ' aria-label="' + esc(a.action.label + ': ' + a.title) + '">'
      + icon(a.action.icon, 16, { stroke: 2.2 }) + ' ' + esc(a.action.label) + '</button>'
      + '</span>'
      + '<span role="cell" class="alp-c-link">'
      + '<button type="button" class="alp-link alp-tone-' + a.link.tone + '" data-route="' + esc(a.link.route) + '"'
      + ' aria-label="Open ' + esc(a.link.label) + '">'
      + icon(a.link.icon, 14, { stroke: 2.4 }) + ' ' + esc(a.link.label) + '</button>'
      + '</span>'
      + '</div>';
  }

  /* ---------- the whole list ---------- */

  function render(state) {
    var list = LISTS[state.listId];
    var items = list.items;
    var filtered = state.filter === 'all' ? items : items.filter(function (a) { return a.status === state.filter; });
    var shown = list.pageSize && !state.showAll ? filtered.slice(0, list.pageSize) : filtered;
    var words = list.title.split(' ');
    var last = words.pop();

    var html = '<div class="alp alp-list-' + state.listId + '">'
      + '<div class="alp-head">'
      + '<span class="alp-head-icon" aria-hidden="true">' + icon(list.icon, 24, { stroke: 2.4 }) + '</span>'
      + '<div class="alp-head-text">'
      // the count sticks to the title's last word, so it never wraps onto a line alone
      + '<h3 id="' + state.titleId + '" class="alp-title">' + esc(words.join(' ')) + ' '
      + '<span class="alp-title-end">' + esc(last) + '<span class="alp-count">' + items.length + '</span></span></h3>'
      + '<p class="alp-sub">' + esc(list.sub) + '</p>'
      + '</div></div>';

    if (list.filters) {
      html += '<div class="alp-filters" role="group" aria-label="Show activities by status">'
        + FILTERS.map(function (f) {
          var count = f.id === 'all' ? items.length : items.filter(function (a) { return a.status === f.id; }).length;
          return '<button type="button" class="alp-filter" data-filter="' + f.id + '" data-focus-key="filter-' + f.id + '"'
            + ' aria-pressed="' + (state.filter === f.id) + '">' + esc(f.label)
            + '<span class="alp-filter-count">' + count + '</span></button>';
        }).join('')
        + '</div>';
    }

    html += '<div class="alp-table" role="table" aria-labelledby="' + state.titleId + '">'
      + '<div class="alp-row alp-row-head" role="row">'
      + '<span role="columnheader" class="alp-c-num">#</span>'
      + '<span role="columnheader">Activity</span>'
      + '<span role="columnheader">' + esc(list.column) + '</span>'
      + '<span role="columnheader">' + (state.listId === 'progress' ? 'Next action' : 'Action') + '</span>'
      + '<span role="columnheader">Linked to</span>'
      + '</div>'
      + shown.map(function (a, i) { return row(state.listId, a, i); }).join('')
      + '</div>';

    if (list.pageSize && filtered.length > list.pageSize) {
      html += '<div class="alp-foot">'
        + '<span class="alp-foot-count">Showing ' + shown.length + ' of ' + filtered.length + '</span>'
        + '<button type="button" class="alp-more' + (state.showAll ? ' is-open' : '') + '" data-more data-focus-key="more"'
        + ' aria-expanded="' + state.showAll + '">'
        + (state.showAll ? 'Show fewer' : 'Show all ' + filtered.length) + ' '
        + icon('chevron-down', 16, { stroke: 2.4 }) + '</button>'
        + '</div>';
    }

    return html + '</div>';
  }

  function mount(el, listId, titleId) {
    if (!LISTS[listId]) return;
    var state = { listId: listId, titleId: titleId, filter: 'all', showAll: false };
    var draw = function () { FEED.utils.render(el, render(state)); };

    FEED.utils.delegate(el, 'click', '[data-filter]', function (e, btn) {
      state.filter = btn.getAttribute('data-filter');
      state.showAll = false;
      draw();
    });

    FEED.utils.delegate(el, 'click', '[data-more]', function () {
      state.showAll = !state.showAll;
      draw();
    });

    draw();
  }

  FEED.components = FEED.components || {};
  FEED.components.ActivityList = { mount: mount };
})(window.FEED = window.FEED || {});
