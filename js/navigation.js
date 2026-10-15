/* Shared navigation for all app pages. Detail and booking pages stay reachable
   through their parent flows, but are intentionally not sidebar destinations. */
(function () {
  const menus = {
    candidate: [
      ['dashboard.html', 'Dashboard', 'i-dashboard'], ['interview-setup.html', 'New interview', 'i-mic'],
      ['cv-analyzer.html', 'CV analyzer', 'i-file'], ['history.html', 'History', 'i-clock'],
      ['find-jobs.html', 'Find Jobs', 'i-target'], ['saved-jobs.html', 'Saved Jobs', 'i-file'],
      ['job-history.html', 'Job History', 'i-clock'], ['my-applications.html', 'My Applications', 'i-check-circle'],
      ['ai-training-plan.html', 'AI Training Plan', 'i-bolt'], ['find-experts.html', 'Find Experts', 'i-user'],
      ['my-sessions.html', 'My Sessions', 'i-calendar'], ['notifications.html', 'Notifications', 'i-bell'],
      ['profile.html', 'Profile', 'i-user']
    ],
    employer: [
      ['employer-dashboard.html', 'Dashboard', 'i-dashboard'], ['company-profile.html', 'Company Profile', 'i-user'],
      ['manage-jobs.html', 'Manage Jobs', 'i-file'], ['create-edit-job.html', 'Create / Edit Job', 'i-plus'],
      ['applicants.html', 'Applicants', 'i-user'], ['ai-candidate-matching.html', 'AI Candidate Matching', 'i-bolt'],
      ['candidate-profile.html', 'Candidate Profile', 'i-check-circle'], ['recruitment-pipeline.html', 'Recruitment Pipeline', 'i-target'],
      ['interview-management.html', 'Interview Management', 'i-calendar'], ['employer-notifications.html', 'Notifications', 'i-bell'],
      ['employer-settings.html', 'Settings', 'i-shield']
    ],
    expert: [
      ['expert-dashboard.html', 'Overview', 'i-dashboard'], ['expert-sessions.html', 'My sessions', 'i-calendar'],
      ['expert-availability.html', 'Availability', 'i-clock'], ['expert-account.html', 'My profile', 'i-user'],
      ['expert-reviews.html', 'Reviews & earnings', 'i-check-circle']
    ]
  };
  const audience = ['candidate', 'employer', 'expert'].includes(document.body.dataset.audience) ? document.body.dataset.audience : 'candidate';
  const nav = document.querySelector('.sidebar .side-nav');
  if (!nav) return;
  const page = location.pathname.split('/').pop() || 'dashboard.html';
  nav.setAttribute('aria-label', audience === 'employer' ? 'Employer navigation' : audience === 'expert' ? 'Expert navigation' : 'Main navigation');
  nav.innerHTML = menus[audience].map(([href, label, icon]) => {
    const active = page === href;
    return `<a class="side-link${active ? ' is-active' : ''}" href="${href}" title="${label}"${active ? ' aria-current="page"' : ''}><svg class="icon" aria-hidden="true"><use href="#${icon}" /></svg><span class="side-label">${label}</span></a>`;
  }).join('');
  if (audience === 'expert') {
    const cta = document.querySelector('.side-cta');
    if (cta) { cta.href = 'expert-availability.html'; cta.setAttribute('aria-label', 'Manage availability'); cta.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-plus" /></svg><span class="side-label">Set availability</span>'; }
    const profileLink = document.querySelector('.topbar .user-menu a[href="profile.html"]');
    if (profileLink) profileLink.href = 'expert-account.html';
    const displayName = document.querySelector('.topbar .user-menu__who strong');
    if (displayName) displayName.textContent = 'Maya Chen';
    const email = document.querySelector('.topbar .user-menu__who .muted');
    if (email) email.textContent = 'maya@example.com';
  }

  const sidebar = document.querySelector('.sidebar');
  if (sidebar && !sidebar.querySelector('.sidebar-scroll-track')) {
    const track = document.createElement('div');
    track.className = 'sidebar-scroll-track';
    track.setAttribute('role', 'scrollbar');
    track.setAttribute('aria-label', 'Scroll sidebar navigation');
    track.setAttribute('aria-controls', 'sidebar-navigation');
    track.setAttribute('aria-orientation', 'vertical');
    track.tabIndex = 0;
    track.innerHTML = '<span class="sidebar-scroll-thumb"><svg class="icon" aria-hidden="true"><use href="#i-mic" /></svg></span>';
    nav.id = 'sidebar-navigation';
    sidebar.appendChild(track);
    const thumb = track.firstElementChild;
    const update = () => {
      const max = nav.scrollHeight - nav.clientHeight;
      const h = 30;
      const top = max > 0 ? (nav.scrollTop / max) * (track.clientHeight - h) : 0;
      thumb.style.height = `${h}px`; thumb.style.top = `${top}px`;
      track.hidden = max <= 0;
      track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', `${Math.max(0, max)}`);
      track.setAttribute('aria-valuenow', `${Math.round(nav.scrollTop)}`);
    };
    nav.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
    let startY = 0, startScroll = 0;
    track.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      track.setPointerCapture(e.pointerId); startY = e.clientY; startScroll = nav.scrollTop;
      if (e.target === track) {
        const max = nav.scrollHeight - nav.clientHeight;
        nav.scrollTop = max * Math.max(0, Math.min(1, (e.clientY - track.getBoundingClientRect().top) / track.clientHeight));
        startY = e.clientY; startScroll = nav.scrollTop;
      }
      e.preventDefault();
    });
    track.addEventListener('pointermove', e => {
      if (!track.hasPointerCapture(e.pointerId)) return;
      const travel = track.clientHeight - thumb.offsetHeight;
      nav.scrollTop = startScroll + (e.clientY - startY) / Math.max(1, travel) * (nav.scrollHeight - nav.clientHeight);
    });
    track.addEventListener('keydown', e => {
      const step = e.key === 'PageDown' || e.key === 'PageUp' ? nav.clientHeight : 60;
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault(); nav.scrollTop = e.key === 'Home' ? 0 : e.key === 'End' ? nav.scrollHeight : nav.scrollTop + (e.key === 'ArrowUp' || e.key === 'PageUp' ? -step : step);
      }
    });
  }
})();
