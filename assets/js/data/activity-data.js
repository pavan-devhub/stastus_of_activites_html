/**
 * The figures behind the page: the four count cards and the lists they open, the Overall Progress
 * donut, the program-wise table and the milestones timeline. Every count is worked out from these
 * rows, so the numbers always agree with each other (24 total = 16 completed + 5 in progress +
 * 3 upcoming).
 *
 * These are placeholder figures from the approved design - the FEED backend has no endpoint for
 * program activity counts yet. Icons are names from assets/js/utils/icons.js; `route` is a key of
 * FEED.config.routes; dates are [year, month, day].
 */
(function (FEED) {
  'use strict';

  var PROGRAMS = [
    { id: 'safe-mission', name: 'Safe Mission', icon: 'shield-check', tone: 'green', month: '2026-08', total: 6, completed: 4, inProgress: 1, upcoming: 1 },
    { id: 'epm', name: 'EPM (Export Promotional Meetings)', icon: 'calendar-days', tone: 'blue', month: '2026-08', total: 5, completed: 3, inProgress: 1, upcoming: 1 },
    { id: 'feed-world', name: 'Feed World', icon: 'book-open', tone: 'indigo', month: '2026-08', total: 4, completed: 4, inProgress: 0, upcoming: 0 },
    { id: 'feed-card', name: 'Feed Card', icon: 'credit-card', tone: 'orange', month: '2026-08', total: 3, completed: 2, inProgress: 1, upcoming: 0 },
    { id: 'kyj', name: 'Know Your Schemes', icon: 'layers', tone: 'green', month: '2026-08', total: 3, completed: 2, inProgress: 0, upcoming: 1 },
    { id: 'yuva-krushi', name: 'Yuva Krushi', icon: 'sprout', tone: 'teal', month: '2026-08', total: 3, completed: 1, inProgress: 2, upcoming: 0 },
  ];

  /**
   * Behind the "In Progress" count: what it is, its next step, how far along it is - a share, or a
   * state when there's no share yet (`state`) - the action that moves it on, and the FEED section
   * it belongs to. One per in-progress activity, so the list always matches TOTALS.inProgress.
   */
  var IN_PROGRESS = [
    {
      id: 'export-course', title: 'Export Course', note: 'Next: finish the remaining modules',
      icon: 'graduation-cap', tone: 'violet', progress: 73,
      action: { label: 'Continue', icon: 'circle-play' },
      link: { label: 'My Exports', icon: 'ship', tone: 'violet', route: 'exports' },
    },
    {
      id: 'fssai', title: 'Statutory Compliance – FSSAI', note: 'Next: upload the pending document',
      icon: 'file-check-2', tone: 'blue', progress: 0, state: { label: 'Pending', kind: 'pending' },
      action: { label: 'Upload Document', icon: 'upload' },
      link: { label: 'My Org', icon: 'building-2', tone: 'indigo', route: 'org-about' },
    },
    {
      id: 'ers', title: 'ERS', note: 'Next step to be defined',
      icon: 'clipboard-plus', tone: 'green', progress: 50,
      action: { label: 'Update', icon: 'pencil-line' },
      link: { label: 'ERS', icon: 'layers', tone: 'purple', route: 'ers' },
    },
    {
      id: 'banana-sample', title: 'Banana – Sample', note: 'Next: follow up with the lab – report awaited',
      icon: 'banana', tone: 'amber', progress: 45, state: { label: 'Awaiting report', kind: 'waiting' },
      action: { label: 'Follow Up', icon: 'phone-call' },
      link: { label: 'KYS', icon: 'leaf', tone: 'green', route: 'schemes' },
    },
    {
      id: 'yuva-krushi-enrolment', title: 'Yuva Krushi Enrolment', note: 'Next: complete your profile details',
      icon: 'sprout', tone: 'teal', progress: 40,
      action: { label: 'Continue', icon: 'circle-play' },
      link: { label: 'Yuva Krushi', icon: 'sprout', tone: 'teal', route: 'yuva-krushi' },
    },
  ];

  // The FEED section chips the completed and upcoming activities link to - one per program above.
  var SECTION = {
    safeMission: { label: 'Safe Mission', icon: 'shield-check', tone: 'green', route: 'safe-mission' },
    epm: { label: 'EPM', icon: 'calendar-days', tone: 'blue', route: 'epm' },
    feedWorld: { label: 'Feed World', icon: 'book-open', tone: 'indigo', route: 'feedworld' },
    feedCard: { label: 'Feed Card', icon: 'credit-card', tone: 'amber', route: 'feed-card' },
    kys: { label: 'KYS', icon: 'leaf', tone: 'green', route: 'schemes' },
    yuvaKrushi: { label: 'Yuva Krushi', icon: 'sprout', tone: 'teal', route: 'yuva-krushi' },
  };

  var VIEW = { label: 'View Details', icon: 'eye' };

  /**
   * Behind the "Completed" count: as many per program as PROGRAMS has completed, so the list
   * always matches TOTALS.completed.
   */
  var COMPLETED = [
    { id: 'sm-registration', title: 'Safe Mission Registration', note: 'Registered for the programme', icon: 'user-check', tone: 'green', date: [2026, 8, 2], action: VIEW, link: SECTION.safeMission },
    { id: 'sm-training', title: 'Food Safety Training – Module 1', note: 'Module completed', icon: 'graduation-cap', tone: 'green', date: [2026, 8, 9], action: VIEW, link: SECTION.safeMission },
    { id: 'sm-checklist', title: 'Farm Hygiene Checklist', note: 'Checklist submitted and approved', icon: 'list-checks', tone: 'green', date: [2026, 8, 16], action: VIEW, link: SECTION.safeMission },
    { id: 'sm-visit', title: 'Safe Mission Field Visit', note: 'Visit report filed', icon: 'map-pin', tone: 'green', date: [2026, 8, 23], action: VIEW, link: SECTION.safeMission },
    { id: 'epm-registration', title: 'EPM Registration', note: 'Seat confirmed for the August meet', icon: 'ticket', tone: 'blue', date: [2026, 8, 5], action: VIEW, link: SECTION.epm },
    { id: 'epm-attended', title: 'EPM Session Attended', note: 'Attendance recorded', icon: 'users', tone: 'blue', date: [2026, 8, 12], action: VIEW, link: SECTION.epm },
    { id: 'epm-feedback', title: 'EPM Feedback', note: 'Feedback submitted', icon: 'message-square-text', tone: 'blue', date: [2026, 8, 14], action: VIEW, link: SECTION.epm },
    { id: 'fw-july', title: 'Feed World – July Edition', note: 'Edition read', icon: 'newspaper', tone: 'indigo', date: [2026, 8, 1], action: VIEW, link: SECTION.feedWorld },
    { id: 'fw-quiz', title: 'Feed World Quiz', note: 'Quiz completed', icon: 'trophy', tone: 'indigo', date: [2026, 8, 8], action: VIEW, link: SECTION.feedWorld },
    { id: 'fw-article', title: 'Feed World Article Shared', note: 'Shared with your members', icon: 'share-2', tone: 'indigo', date: [2026, 8, 19], action: VIEW, link: SECTION.feedWorld },
    { id: 'fw-august', title: 'Feed World – August Edition', note: 'Edition read', icon: 'newspaper', tone: 'indigo', date: [2026, 8, 29], action: VIEW, link: SECTION.feedWorld },
    { id: 'fc-application', title: 'Feed Card Application', note: 'Application approved', icon: 'badge-check', tone: 'amber', date: [2026, 8, 7], action: VIEW, link: SECTION.feedCard },
    { id: 'fc-kyc', title: 'Feed Card KYC', note: 'KYC verified', icon: 'id-card', tone: 'amber', date: [2026, 8, 18], action: VIEW, link: SECTION.feedCard },
    { id: 'kys-shortlist', title: 'Scheme Shortlist', note: 'Shortlisted the schemes you qualify for', icon: 'file-search', tone: 'green', date: [2026, 8, 11], action: VIEW, link: SECTION.kys },
    { id: 'kys-documents', title: 'Scheme Documents Check', note: 'All documents in order', icon: 'folder-check', tone: 'green', date: [2026, 8, 20], action: VIEW, link: SECTION.kys },
    { id: 'yk-orientation', title: 'Yuva Krushi Orientation', note: 'Orientation attended', icon: 'presentation', tone: 'teal', date: [2026, 8, 26], action: VIEW, link: SECTION.yuvaKrushi },
  ];

  /**
   * Behind the "Upcoming" count: one per upcoming activity in PROGRAMS. An action with its own
   * `route` opens that page instead of the program's.
   */
  var UPCOMING = [
    {
      id: 'up-epm', title: 'EPM – Next Meet', note: 'Registrations are open', icon: 'calendar-days', tone: 'blue', date: [2026, 12, 15],
      action: { label: 'Register', icon: 'ticket', route: 'epm-register' }, link: SECTION.epm,
    },
    {
      id: 'up-safe-mission', title: 'Safe Mission Guidelines Briefing', note: 'Read the new guidelines before the briefing', icon: 'shield-check', tone: 'green', date: [2026, 11, 28],
      action: { label: 'Read Guidelines', icon: 'book-open-text' }, link: SECTION.safeMission,
    },
    {
      id: 'up-kys', title: 'Scheme Eligibility Review', note: 'Keep your land and ID documents ready', icon: 'file-search', tone: 'green', date: [2026, 12, 5],
      action: { label: 'Prepare', icon: 'clipboard-list' }, link: SECTION.kys,
    },
  ];

  /** The milestones timeline, oldest first; each description is the two lines it shows. */
  var MILESTONES = [
    { date: [2026, 8, 24], lines: ['Dashboard', 'implemented'] },
    { date: [2026, 8, 25], lines: ['FEED World', 'bugs fixed'] },
    { date: [2026, 8, 28], lines: ['FEED World', 'backend completed'] },
    { date: [2026, 9, 3], lines: ['EPM page', 'fixes & updates'] },
    { date: [2026, 9, 10], lines: ['Safe Mission', 'frontend completed'] },
  ];

  /** Totals across the programs: { total, completed, inProgress, upcoming }. */
  var TOTALS = PROGRAMS.reduce(function (sum, p) {
    return {
      total: sum.total + p.total,
      completed: sum.completed + p.completed,
      inProgress: sum.inProgress + p.inProgress,
      upcoming: sum.upcoming + p.upcoming,
    };
  }, { total: 0, completed: 0, inProgress: 0, upcoming: 0 });

  FEED.data = FEED.data || {};
  FEED.data.activities = {
    PROGRAMS: PROGRAMS,
    IN_PROGRESS: IN_PROGRESS,
    COMPLETED: COMPLETED,
    UPCOMING: UPCOMING,
    MILESTONES: MILESTONES,
    TOTALS: TOTALS,
  };
})(window.FEED = window.FEED || {});
