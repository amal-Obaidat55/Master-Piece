/* Candidate pages use a responsive website navigation in place of the dashboard sidebar. */
(function () {
  const body = document.body;
  if (body.dataset.audience !== 'candidate') return;

  const links = [
    ['dashboard.html', 'Dashboard', 'i-dashboard'],
    ['find-jobs.html', 'Find Jobs', 'i-target'],
    ['interview-setup.html', 'New interview', 'i-mic'],
    ['cv-analyzer.html', 'CV analyzer', 'i-file'],
    ['my-applications.html', 'My Applications', 'i-check-circle'],
    ['ai-training-plan.html', 'AI Training Plan', 'i-bolt'],
    ['history.html', 'History', 'i-clock'],
    ['saved-jobs.html', 'Saved Jobs', 'i-file'],
    ['job-history.html', 'Job History', 'i-clock'],
    ['../Expert/find-experts.html', 'Find Experts', 'i-user'],
    ['my-sessions.html', 'My Sessions', 'i-calendar'],
    ['notifications.html', 'Notifications', 'i-bell'],
  ];

  const appMain = document.querySelector('.app-main');
  const accountMenu = document.querySelector('#user-panel');
  if (!appMain || !accountMenu || appMain.querySelector('.candidate-nav')) return;

  const inExpertArea = /\/Expert\//i.test(location.pathname);
  const current = location.pathname.split('/').pop() || 'dashboard.html';
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#${name}" /></svg>`;
  const nav = document.createElement('header');
  nav.className = 'candidate-nav';
  nav.innerHTML = `
    <a class="brand candidate-nav__brand" href="${inExpertArea ? '../Job seeker/index.html' : 'index.html'}" aria-label="SpeakUp home">
      <svg class="brandMark" aria-hidden="true"><use href="#i-logo" /></svg><span class="brandName">SpeakUp</span>
    </a>
    <nav class="candidate-nav__links" aria-label="Job seeker navigation"></nav>
    <div class="candidate-nav__actions">
      <a class="btn btnAccent candidate-nav__cta" href="${inExpertArea ? '../Job seeker/interview-setup.html' : 'interview-setup.html'}">${icon('i-plus')}<span>New interview</span></a>
    </div>`;

  const primary = nav.querySelector('.candidate-nav__links');
  const moreGroup = document.createElement('div');
  moreGroup.className = 'candidate-nav__account-links';
  moreGroup.innerHTML = '<div class="candidate-nav__account-heading">More</div>';
  const adminLink = accountMenu.querySelector("a[href*=\"admin.html\"]");
  accountMenu.insertBefore(moreGroup, adminLink || null);

  const anchors = links.map(([href, label, glyph]) => {
    const a = document.createElement('a');
    a.className = 'candidate-nav__link';
    a.href = inExpertArea
      ? (href.startsWith('../Expert/') ? href.slice('../Expert/'.length) : `../Job seeker/${href}`)
      : href;
    a.innerHTML = `${icon(glyph)}<span>${label}</span>`;
    if (href.split('/').pop() === current) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
    return a;
  });
  anchors.forEach(a => primary.appendChild(a));
  appMain.insertBefore(nav, appMain.firstChild);

  function fitLinks() {
    anchors.forEach(a => primary.appendChild(a));
    let used = 0;
    let spilling = false;
    const available = primary.clientWidth;
    const gap = parseFloat(getComputedStyle(primary).columnGap) || 0;
    const pinnedMore = new Set(['history.html', 'saved-jobs.html', 'job-history.html']);
    anchors.forEach((a, index) => {
      if (pinnedMore.has(a.getAttribute('href').split('/').pop())) {
        moreGroup.appendChild(a);
        return;
      }
      const width = a.getBoundingClientRect().width;
      if (!spilling && used + width + (index ? gap : 0) <= available) {
        used += width + (index ? gap : 0);
      } else {
        spilling = true;
        moreGroup.appendChild(a);
      }
    });
    moreGroup.hidden = moreGroup.children.length <= 1;
  }

  fitLinks();
  if ('ResizeObserver' in window) new ResizeObserver(fitLinks).observe(nav);
  else window.addEventListener('resize', fitLinks);
})();
