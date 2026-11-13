/**
 * Progress board - under the count cards:
 *  - "Overall Progress": a donut of completed / in progress / upcoming, with a legend of the
 *    counts and their shares;
 *  - "Program-wise Activity Status": each FEED program's counts and progress, filterable by
 *    program, by status (programs with any activity in it) and by month;
 *  - "Recent Updates & Milestones": a timeline, newest milestone last and starred.
 *
 * Markup it fills (index.html): #apb-overall-body, #apb-filters, #apb-table, #apb-timeline.
 */
(function (FEED) {
  'use strict';

  var D = FEED.data.activities;
  var fmt = FEED.format;
  var esc = FEED.utils.esc;
  var icon = FEED.utils.icon;

  var STATUS_FILTERS = [
    { id: 'all', label: 'All Status' },
    { id: 'completed', label: 'Completed' },
    { id: 'inProgress', label: 'In Progress' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  /* ---------- overall progress ---------- */

  function overall() {
    var T = D.TOTALS;
    var pct = fmt.sharesOf([T.completed, T.inProgress, T.upcoming]);
    var sum = T.completed + T.inProgress + T.upcoming || 1;
    var a1 = (T.completed / sum) * 360;
    var a2 = ((T.completed + T.inProgress) / sum) * 360;

    var legend = [
      { id: 'completed', label: 'Completed', value: T.completed, pct: pct[0], icon: icon('check', 12, { stroke: 3.4 }) },
      { id: 'progress', label: 'In Progress', value: T.inProgress, pct: pct[1], icon: icon('dots-ring') },
      { id: 'upcoming', label: 'Upcoming', value: T.upcoming, pct: pct[2], icon: icon('clock', 24, { stroke: 2.6 }) },
    ];

    return '<div class="apb-donut" role="img"'
      + ' aria-label="' + pct[0] + '% completed, ' + pct[1] + '% in progress, ' + pct[2] + '% upcoming"'
      + ' style="--a1:' + a1 + 'deg;--a2:' + a2 + 'deg">'
      + '<div class="apb-donut-hole"><strong>' + pct[0] + '%</strong><span>Completed</span></div>'
      + '</div>'
      + '<ul class="apb-legend">'
      + legend.map(function (l) {
        return '<li>'
          + '<span class="apb-legend-icon apb-legend-icon-' + l.id + '" aria-hidden="true">' + l.icon + '</span>'
          + '<span class="apb-legend-label">' + l.label + '</span>'
          + '<span class="apb-legend-value"><strong>' + l.value + '</strong> (' + l.pct + '%)</span>'
          + '</li>';
      }).join('')
      + '</ul>';
  }

  /* ---------- filters ---------- */

  /** A styled native dropdown: a hidden label, an optional leading icon, the select, a chevron. */
  function select(name, label, options, value, leadIcon, extraClass) {
    return '<label class="apb-select' + (extraClass ? ' ' + extraClass : '') + '">'
      + '<span class="visually-hidden">' + esc(label) + '</span>'
      + (leadIcon ? icon(leadIcon, 16, { className: 'apb-select-icon' }) : '')
      + '<select name="' + name + '">'
      + options.map(function (o) {
        return '<option value="' + esc(o.id) + '"' + (o.id === value ? ' selected' : '') + '>' + esc(o.label) + '</option>';
      }).join('')
      + '</select>'
      + icon('chevron-down', 16, { stroke: 2.2, className: 'apb-select-chevron' })
      + '</label>';
  }

  /* ---------- program table ---------- */

  function tableRows(state) {
    var rows = D.PROGRAMS.filter(function (p) {
      return p.month === state.month
        && (state.program === 'all' || p.id === state.program)
        && (state.status === 'all' || p[state.status] > 0);
    });

    var head = '<div class="apb-row apb-row-head" role="row">'
      + '<span role="columnheader">#</span>'
      + '<span role="columnheader" class="apb-col-name">Program / Module</span>'
      + '<span role="columnheader" class="apb-num">Total</span>'
      + '<span role="columnheader" class="apb-num">Completed</span>'
      + '<span role="columnheader" class="apb-num">In Progress</span>'
      + '<span role="columnheader" class="apb-num">Upcoming</span>'
      + '<span role="columnheader">Progress</span>'
      + '</div>';

    if (rows.length === 0) {
      return head + '<div class="apb-row apb-row-empty" role="row"><span role="cell">No programs match these filters.</span></div>';
    }

    return head + rows.map(function (p, i) {
      var pct = p.total ? Math.round((p.completed / p.total) * 100) : 0;
      return '<div class="apb-row" role="row">'
        + '<span role="cell" class="apb-index">' + (i + 1) + '</span>'
        + '<span role="cell" class="apb-col-name">'
        + '<span class="apb-prog-icon apb-tone-' + p.tone + '" aria-hidden="true">' + icon(p.icon, 15, { stroke: 2.2 }) + '</span>'
        + '<span class="apb-prog-name">' + esc(p.name) + '</span>'
        + '</span>'
        // data-label names each figure when the rows turn into cards on narrow screens
        + '<span role="cell" class="apb-num apb-total" data-label="Total">' + p.total + '</span>'
        + '<span role="cell" class="apb-num" data-label="Completed"><span class="apb-pill apb-pill-completed">' + p.completed + '</span></span>'
        + '<span role="cell" class="apb-num" data-label="In Progress"><span class="apb-pill apb-pill-progress">' + p.inProgress + '</span></span>'
        + '<span role="cell" class="apb-num" data-label="Upcoming"><span class="apb-pill apb-pill-upcoming">' + p.upcoming + '</span></span>'
        + '<span role="cell" class="apb-progress">'
        + '<span class="apb-bar' + (pct === 100 ? ' is-full' : '') + '" role="progressbar" aria-valuenow="' + pct + '"'
        + ' aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(p.name) + ' progress"><span style="width:' + pct + '%"></span></span>'
        + '<strong>' + pct + '%</strong>'
        + '</span>'
        + '</div>';
    }).join('');
  }

  /* ---------- milestones ---------- */

  function timeline() {
    var last = D.MILESTONES.length - 1;
    return D.MILESTONES.map(function (m, i) {
      var latest = i === last;
      return '<li' + (latest ? ' class="is-latest"' : '') + '>'
        + '<span class="apb-node" aria-hidden="true">'
        + (latest ? icon('star', 14, { fill: true }) : icon('check', 14, { stroke: 3.4 }))
        + '</span>'
        + '<time class="apb-ms-date" datetime="' + fmt.isoDay(m.date) + '">' + esc(fmt.dateLabel(m.date)) + '</time>'
        + '<span class="apb-ms-text">' + m.lines.map(function (line) { return '<span>' + esc(line) + '</span>'; }).join('') + '</span>'
        + '</li>';
    }).join('');
  }

  function mount(root) {
    var months = D.PROGRAMS.map(function (p) { return p.month; })
      .filter(function (m, i, all) { return all.indexOf(m) === i; })
      .sort()
      .reverse();
    var state = { program: 'all', status: 'all', month: months[0] };

    var table = root.querySelector('#apb-table');
    var filters = root.querySelector('#apb-filters');

    root.querySelector('#apb-overall-body').innerHTML = overall();
    root.querySelector('#apb-timeline').innerHTML = timeline();

    filters.innerHTML = select('program', 'Program',
      [{ id: 'all', label: 'All Programs' }].concat(D.PROGRAMS.map(function (p) { return { id: p.id, label: p.name }; })),
      state.program)
      + select('status', 'Status', STATUS_FILTERS, state.status)
      + select('month', 'Month', months.map(function (m) { return { id: m, label: fmt.monthLabel(m) }; }),
        state.month, 'calendar-days', 'apb-select-month');

    filters.addEventListener('change', function (e) {
      if (!e.target.name) return;
      state[e.target.name] = e.target.value;
      table.innerHTML = tableRows(state);
    });

    table.innerHTML = tableRows(state);
  }

  FEED.components = FEED.components || {};
  FEED.components.ProgressBoard = { mount: mount };
})(window.FEED = window.FEED || {});
