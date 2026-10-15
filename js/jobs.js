(() => {
  const jobs = {
    northstar: { title: 'Product Designer', company: 'Northstar Labs', location: 'New York, NY · Remote friendly', facts: 'Full-time · $95k–$125k · Posted 2 days ago', match: '82%', about: 'We’re looking for a curious Product Designer to make complex workflows feel simple. Partner with product and engineering from exploration to polished, accessible experiences.', duties: ['Lead discovery and translate insights into clear journeys.', 'Create prototypes, wireframes, and high quality designs.', 'Partner with engineers through implementation and QA.'], requirements: ['3+ years designing digital products.', 'A portfolio showing thoughtful problem solving.', 'Strong communication and Figma skills.'] },
    brightside: { title: 'UX Researcher', company: 'Brightside', location: 'Remote · US', facts: 'Full-time · $88k–$112k · Posted 4 days ago', match: '76%', about: 'Help us understand the needs of people navigating important life decisions. You’ll plan research, synthesize findings, and bring customer evidence into product choices.', duties: ['Plan and conduct interviews and usability studies.', 'Turn observations into clear product recommendations.', 'Partner with design and product teams throughout delivery.'], requirements: ['3+ years in UX or product research.', 'Experience with qualitative and quantitative methods.', 'Clear communication and synthesis skills.'] },
    linear: { title: 'Product Designer', company: 'Linear', location: 'Remote · North America', facts: 'Full-time · $110k–$145k · Posted 1 week ago', match: '74%', about: 'Design crisp, intuitive workflows for teams building software. Work across the product lifecycle with a small, focused team.', duties: ['Explore product opportunities with the team.', 'Design and refine end-to-end product experiences.', 'Maintain a high bar for interaction and visual quality.'], requirements: ['4+ years designing software products.', 'Strong interaction and visual design portfolio.', 'Comfort working in a fast-moving remote team.'] }
  };
  const read = key => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    }
    catch { return []; }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { }
  };
  const toast = msg => {
    const t = document.querySelector('[data-toast]');
    if (t) {
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(window._toast);
      window._toast = setTimeout(() => t.hidden = true, 2200);
    }
  };
  const detailId = new URLSearchParams(location.search).get('job') || 'northstar';
  const job = jobs[detailId] || jobs.northstar;
  const formatDate = date => new Intl.DateTimeFormat('en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  if (document.querySelector('.detail-layout .detail-main') && location.pathname.endsWith('job-details.html')) {
    const main = document.querySelector('.detail-main');
    const history = read('hr_job_history').filter(x => x.id !== detailId);
    history.unshift({ id: detailId, viewed: new Date().toISOString() });
    write('hr_job_history', history.slice(0, 20));
    document.querySelector('.detail-main .h1')?.replaceChildren(document.createTextNode(job.title));
    const h1 = document.querySelector('.page-head h1');
    if (h1) h1.textContent = job.title;
    const company = main.querySelector('.company-line strong');
    if (company) company.textContent = job.company;
    const locationEl = main.querySelector('.company-line .muted');
    if (locationEl) locationEl.textContent = job.location;
    const facts = main.querySelector('.job-facts');
    if (facts) facts.textContent = job.facts;
    const headings = [...main.querySelectorAll('h2')];
    if (headings[0]?.nextElementSibling) headings[0].nextElementSibling.textContent = job.about;
    const renderList = (heading, items) => {
      const h = headings.find(x => x.textContent.trim() === heading);
      const ul = h?.nextElementSibling;
      if (ul?.tagName === 'UL') ul.innerHTML = items.map(x => `<li>${x}</li>`).join('');
    };
    renderList('What you’ll do', job.duties);
    renderList('Requirements', job.requirements);
    const matchText = document.querySelector('.apply-card p');
    if (matchText) matchText.textContent = `Your profile matches ${job.match} of this role.`;
    const save = document.querySelector('[data-job-save]');
    if (save) {
      save.dataset.save = detailId;
      setSavedStyle(save, read('hr_saved_jobs').includes(detailId));
    }
  }
  function setSavedStyle(button, saved) {
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = button.closest('.apply-card') ? (saved ? '★ Saved' : '☆ Save job') : (saved ? '★' : '☆');
  }

  document.querySelectorAll('[data-job-id]').forEach(card => {
    const b = card.querySelector('[data-job-save]');
    if (b) setSavedStyle(b, read('hr_saved_jobs').includes(card.dataset.jobId));
  });
  const jobCard = (id, action) => {
    const j = jobs[id];
    if (!j) return '';
    return `<article class="job-card">
       <div class="company-logo">${j.company[0]}</div>
       <div class="job-card-main">
       <a href="job-details.html?job=${id}">
       <h3>${j.title}</h3>
       </a>
       <p class="muted">${j.company} · ${j.location}</p>
       <span class="badge">${j.match} match</span>
       </div>
       <div class="job-card-side">
       <a class="btn btnOutline" href="job-details.html?job=${id}">View job</a>
       ${action === 'save' ? `<button class="iconBtn is-saved" data-job-save="${id}" aria-label="Remove saved job">★</button>` : `<small class="muted">Viewed ${action}</small>`}
       </div>
       </article>`;
  };
  const savedList = document.querySelector('[data-saved-list]');
  if (savedList) { const ids = read('hr_saved_jobs'); savedList.innerHTML = ids.length ? ids.map(id => jobCard(id, 'save')).join('') : '<div class="panel empty-state"><span class="empty-state__icon"><svg class="icon"><use href="#i-file" /></svg></span><h2>No saved jobs yet</h2><p>Save a role from Find Jobs to keep it here.</p><a class="btn btnAccent" href="find-jobs.html">Find jobs</a></div>'; }
  const historyList = document.querySelector('[data-job-history]');
  if (historyList) { const entries = read('hr_job_history'); historyList.innerHTML = entries.length ? entries.map(x => jobCard(x.id, formatDate(new Date(x.viewed)))).join('') : '<div class="panel empty-state"><span class="empty-state__icon"><svg class="icon"><use href="#i-clock" /></svg></span><h2>No viewed jobs yet</h2><p>Open a role from Find Jobs and it’ll be saved here.</p><a class="btn btnAccent" href="find-jobs.html">Browse jobs</a></div>'; }

  const applicationTable = document.querySelector('.data-table tbody');
  if (applicationTable) read('hr_applications').forEach(app => {
    const j = jobs[app.id]; if (!j || applicationTable.querySelector(`[data-app-id="${app.id}"]`) || [...applicationTable.rows].some(r => r.innerText.includes(j.company))) return;
    const row = document.createElement('tr'); row.dataset.status = app.status; row.dataset.appId = app.id;
    row.innerHTML = `<td><strong>${j.title}</strong><small>${j.company}</small></td><td>${formatDate(new Date(app.applied))}</td><td><span class="badge">${app.status}</span></td><td>Recruiter review</td>`;
    applicationTable.prepend(row);
  });
  const sessionList = document.querySelector('.session-list');
  if (sessionList) read('hr_sessions').forEach(session => {
    const date = new Date(`${session.date}T12:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const card = document.createElement('article');
    card.className = 'panel session-card';
    card.dataset.session = date < today ? 'past' : 'upcoming';
    card.innerHTML = `<div class="day-bubble">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
    <div>
    <span class="badge">${card.dataset.session === 'past' ? 'Completed' : 'Confirmed'}</span>
    <h3>${session.expert} · Portfolio review</h3>
    <p class="muted">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${session.time} · ${session.duration}</p>
    </div>`
      ;
    sessionList.prepend(card);
  });

  const calendar = document.querySelector('[data-calendar]');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateKey = date =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  let shownMonth = new Date(today.getFullYear(),
    today.getMonth(), 1),
    selectedDate = null,
    selectedTime = null;


  const expertAvailability = read('hr_expert_availability');
  const expertProfile = read('hr_expert_profile');
  if (expertProfile && (location.pathname.endsWith('expert-profile.html') || location.pathname.endsWith('book-a-session.html'))) {
    const name = expertProfile.name || 'Maya Chen';
    const title = expertProfile.title || 'Senior Product Designer';
    const companyName = expertProfile.company || 'Figma';
    const duration = expertProfile.duration || '45 minutes';
    const price = expertProfile.price || '75';
    const heading = document.querySelector('.expert-hero h2');
    if (heading) heading.textContent = name;
    const summary = document.querySelector('.expert-hero .muted');
    if (summary) summary.textContent = `${title} at ${companyName} · ${expertProfile.experience || 9} years experience`;
    const profileName = document.querySelector('.expert-profile-layout .apply-card h3, .detail-layout .apply-card h3');
    if (profileName) profileName.textContent = name;
    const priceBox = document.querySelector('.apply-card .price');
    if (priceBox) priceBox.innerHTML = `$${price} <small>/ ${duration.replace(' minutes', ' min')}</small>`;

    const bookHeading = document.querySelector('.booking-card h1, .page-head h1');
    if (bookHeading && location.pathname.endsWith('book-a-session.html')) bookHeading.textContent = `Book a session with ${name}`;
    if (location.pathname.endsWith('expert-profile.html')) {
      const about = [...document.querySelectorAll('.detail-main h2')].find(h => h.textContent.trim() === 'About me')?.nextElementSibling;
      if (about && expertProfile.bio) about.textContent = expertProfile.bio;
      const chips = [...document.querySelectorAll('.detail-main h2')].find(h => h.textContent.trim() === 'Specialties')?.nextElementSibling;
      if (chips && expertProfile.specialties) chips.innerHTML = expertProfile.specialties.split(',').map(s => `<span class="chip">${s.trim()}</span>`).join('');
    }
  }
  const slotsForDate = key => {
    const date = new Date(`${key}T12:00:00`); date.setHours(0, 0, 0, 0);
    if (date < today) return [];
    if ((expertAvailability?.blocked || []).some(item => item.date === key)) return [];
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const fields = expertAvailability?.fields || {};
    const defaultHours = { Monday: ['09:00', '15:00'], Wednesday: ['10:00', '16:00'], Thursday: ['10:00', '16:00'] };
    if (expertAvailability && !fields[`day-${day}`]) return [];
    if (!expertAvailability && !defaultHours[day]) return [];
    const start = fields[`${day.toLowerCase()}-from`] || defaultHours[day]?.[0] || '10:00';
    const end = fields[`${day.toLowerCase()}-to`] || defaultHours[day]?.[1] || '16:00';
    const toMinutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
    const toLabel = minutes => new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const results = [];
    const sessionMinutes = Number.parseInt((fields.duration || '45 minutes'), 10) || 45;
    for (let time = toMinutes(start); time <= toMinutes(end) - sessionMinutes; time += 90) results.push(toLabel(time));
    return results.slice(0, 5);
  };
  const monthLabel = document.querySelector('[data-month-label]');
  function renderCalendar() {
    if (!calendar) return;
    if (monthLabel) monthLabel.textContent = shownMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const y = shownMonth.getFullYear(), m = shownMonth.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    let monthAvailable = 0;
    const cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span class="weekday">${d}</span>`).join('') + '<span></span>'.repeat(first) + Array.from({ length: days }, (_, i) => {
      const d = i + 1, key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, past = key < dateKey(today), available = slotsForDate(key).length > 0;
      if (available && !past) monthAvailable++;
      return `<button class="day${selectedDate === key ? ' selected' : ''}" type="button" data-date="${key}" ${past || !available ? 'disabled' : ''} aria-label="${key}${available ? ', available' : ''}">${d}</button>`;
    }).join('');
    calendar.innerHTML = cells;
    const availabilityStatus = document.querySelector('[data-availability-status]');
    if (availabilityStatus) availabilityStatus.textContent = monthAvailable ? 'Colored dates have open session times.' : 'No open dates this month. Use the arrows to check another month.';
    const slotBox = document.querySelector('.time-slots');
    const choices = selectedDate ? slotsForDate(selectedDate) : [];
    if (slotBox) slotBox.innerHTML = choices.length ? choices.map(t => `<button class="time-slot" type="button" data-time="${t}">${t}</button>`).join('') : '<p class="muted slot-hint">Choose an available date to see its open times.</p>';
    const book = document.querySelector('[data-book]'); if (book) book.disabled = !(selectedDate && selectedTime);
  }
  if (calendar) { calendar.addEventListener('click', e => { const day = e.target.closest('[data-date]'); if (!day || day.disabled) return; selectedDate = day.dataset.date; selectedTime = null; renderCalendar(); }); renderCalendar(); }
  if (expertAvailability && location.pathname.endsWith('expert-profile.html')) {
    const firstDate = Array.from({ length: 30 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return dateKey(d); }).find(key => slotsForDate(key).length);
    const when = [...document.querySelectorAll('.apply-card p')].find(p => p.textContent.trim().startsWith('Next available:'));
    if (when && firstDate) {
      const date = new Date(`${firstDate}T12:00:00`); when.textContent = `Next available: ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${slotsForDate(firstDate)[0]}`;
    }
    const note = document.querySelector('.availability-note small');
    if (note) note.textContent = `${Object.keys(expertAvailability.fields || {}).filter(k => k.startsWith('day-') && expertAvailability.fields[k]).length} regular days open each week`;
  }

  document.addEventListener('input', e => {
    if (!e.target.matches('[data-search]')) return;
    const q = e.target.value.toLowerCase(); document.querySelectorAll('[data-search-text]').forEach(x => x.hidden = !x.dataset.searchText.toLowerCase().includes(q));
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-job-save')) {
      const id = b.dataset.save || detailId; const ids = read('hr_saved_jobs'); const saved = !ids.includes(id);
      write('hr_saved_jobs', saved ? [id, ...ids] : ids.filter(x => x !== id)); setSavedStyle(b, saved); toast(saved ? 'Job saved' : 'Job removed from saved jobs');
      if (savedList) b.closest('.job-card')?.remove(); return;
    }
    if (b.hasAttribute('data-apply')) {
      const applications = read('hr_applications');
      if (!applications.some(x => x.id === detailId)) applications.unshift({ id: detailId, applied: new Date().toISOString(), status: 'In review' });
      write('hr_applications', applications); toast('Application submitted'); setTimeout(() => location.href = 'my-applications.html', 500); return;
    }
    if (b.hasAttribute('data-clear-history')) { write('hr_job_history', []); if (historyList) historyList.innerHTML = '<div class="panel empty-state"><h2>No viewed jobs yet</h2><p>Open a role from Find Jobs and it’ll be saved here.</p><a class="btn btnAccent" href="find-jobs.html">Browse jobs</a></div>'; }
    if (b.hasAttribute('data-dismiss')) b.closest('[data-notification]')?.remove();
    if (b.hasAttribute('data-mark-read')) {
      document.querySelectorAll('[data-notification]').forEach(n => {
        n.dataset.read = 'yes'; n.classList.remove('is-unread');

      });
      toast('All notifications marked as read');
    }
    if (b.closest('[data-tabs]')) {
      const g = b.closest('[data-tabs]');
      g.querySelectorAll('button').forEach(x => x.classList.toggle('is-on', x === b));
      const s = b.dataset.status;
      if (g.classList.contains('application-tabs'))
        document.querySelectorAll('.data-table tbody tr').forEach(x =>
          x.hidden = s !== 'all' && x.dataset.status !== s);
      if (g.classList.contains('session-tabs')) document.querySelectorAll('[data-session]')
        .forEach(x => x.hidden = x.dataset.session !== s);
      if (g.closest('.section-head') && document.querySelector('.notification-list'))
        document.querySelectorAll('[data-notification]')
          .forEach(x => x.hidden = s === 'unread' && x.dataset.read !== 'no');
    }
    if (b.matches('.time-slot')) {
      selectedTime = b.dataset.time;
      document.querySelectorAll('.time-slot').forEach(x => x.classList.toggle('selected', x === b));
      const book = document.querySelector('[data-book]');
      if (book) book.disabled = false;
    }
    if (b.hasAttribute('data-book')) {
      if (!selectedDate || !selectedTime) return;
      const sessions = read('hr_sessions');
      sessions.unshift({ date: selectedDate, time: selectedTime, expert: 'Maya Chen', duration: '45 minutes', price: '$75' });
      write('hr_sessions', sessions);
      toast('Session booked');
      setTimeout(() => location.href = 'my-sessions.html', 500);
    }
    if (b.dataset.month) {
      selectedDate = null;
      selectedTime = null;
      shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + (b.dataset.month === 'next' ? 1 : -1), 1);
      renderCalendar();
    }
  });
})();
