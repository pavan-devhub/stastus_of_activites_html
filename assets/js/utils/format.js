/**
 * Date and number formatting shared by the components.
 *
 * Activity dates in assets/js/data/activity-data.js are [year, month, day] arrays; EPM dates
 * from the backend are ISO strings ("2026-12-15", "2026-11-08T16:05:00"). All are read as local
 * time, so a date never shifts by a day across time zones.
 */
(function (FEED) {
  'use strict';

  var DAY_MS = 86400000;

  function pad(n) { return String(n).padStart(2, '0'); }

  /** [y, m, d] -> Date (local midnight). */
  function dayOf(date) { return new Date(date[0], date[1] - 1, date[2]); }

  function today() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  FEED.format = {
    dayOf: dayOf,

    /** [2026, 8, 2] -> "Aug 02, 2026" */
    dateLabel: function dateLabel(date) {
      return dayOf(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    },

    /** [2026, 8, 2] -> "2026-08-02" (for <time datetime>) */
    isoDay: function isoDay(date) {
      return date[0] + '-' + pad(date[1]) + '-' + pad(date[2]);
    },

    /** "Today", "Tomorrow", "In 16 days" - or "3 days ago" once the date has passed. */
    untilLabel: function untilLabel(date) {
      var days = Math.round((dayOf(date) - today()) / DAY_MS);
      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      if (days > 1) return 'In ' + days + ' days';
      return days === -1 ? 'Yesterday' : -days + ' days ago';
    },

    /** "2026-08" -> "Aug 2026" */
    monthLabel: function monthLabel(ym) {
      var parts = ym.split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    },

    /** "2026-10-15" -> "15 Oct 2026" */
    eventDateShort: function eventDateShort(isoDate) {
      if (!isoDate) return '';
      var p = String(isoDate).slice(0, 10).split('-').map(Number);
      return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    /** "2026-09-30T10:30:12" -> { date: "30 Sep 2026", time: "10:30 AM" }, read as local time. */
    timestampParts: function timestampParts(isoDateTime) {
      if (!isoDateTime) return { date: '', time: '' };
      var d = new Date(String(isoDateTime));
      if (Number.isNaN(d.getTime())) return { date: '', time: '' };
      return {
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    },

    /** Whole-number shares of `values` that add up to exactly 100 (largest remainder). */
    sharesOf: function sharesOf(values) {
      var sum = values.reduce(function (a, b) { return a + b; }, 0);
      if (!sum) return values.map(function () { return 0; });
      var exact = values.map(function (v) { return (v / sum) * 100; });
      var out = exact.map(Math.floor);
      var left = 100 - out.reduce(function (a, b) { return a + b; }, 0);
      exact
        .map(function (v, i) { return [v - Math.floor(v), i]; })
        .sort(function (a, b) { return b[0] - a[0]; })
        .forEach(function (pair) {
          if (left > 0) { out[pair[1]] += 1; left -= 1; }
        });
      return out;
    },
  };
})(window.FEED = window.FEED || {});
