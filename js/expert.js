(() => {
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const notice = message => {
    const box = document.querySelector('[data-toast]');
    if (!box) return;
    box.textContent = message; box.hidden = false; clearTimeout(window.expertToastTimer);
    window.expertToastTimer = setTimeout(() => box.hidden = true, 2300);
  };

  const availabilityForm = document.querySelector('[data-availability-form]');
  const savedAvailability = read('hr_expert_availability');
  if (availabilityForm && savedAvailability) {
    Object.entries(savedAvailability.fields || {}).forEach(([name, value]) => {
      const field = availabilityForm.elements.namedItem(name);
      if (!field) return;
      if (field.type === 'checkbox') field.checked = !!value;
      else if (value) field.value = value;
    });
  }
  const blockedList = document.querySelector('[data-blocked-dates]');
  let blockedDates = savedAvailability?.blocked || [];
  const renderBlocked = () => {
    if (!blockedList) return;
    blockedList.innerHTML = blockedDates.map((entry, index) => `<span class="blocked-date"><svg class="icon" aria-hidden="true"><use href="#i-calendar" /></svg>${entry.date}${entry.note ? ` · ${entry.note}` : ''}<button type="button" data-remove-block="${index}" aria-label="Remove blocked date">×</button></span>`).join('');
  };
  renderBlocked();
  availabilityForm?.addEventListener('submit', event => {
    event.preventDefault();
    const fields = {};
    [...availabilityForm.elements].forEach(field => {
      if (!field.name || field.name.startsWith('blocked-')) return;
      fields[field.name] = field.type === 'checkbox' ? field.checked : field.value;
    });
    write('hr_expert_availability', { fields, blocked: blockedDates });
    notice('Availability saved');
  });
  document.querySelector('[data-block-date]')?.addEventListener('click', () => {
    const date = availabilityForm.elements.namedItem('blocked-date').value;
    const note = availabilityForm.elements.namedItem('blocked-note').value.trim();
    if (!date) { availabilityForm.elements.namedItem('blocked-date').focus(); return; }
    if (!blockedDates.some(item => item.date === date)) blockedDates.push({ date, note });
    availabilityForm.elements.namedItem('blocked-date').value = '';
    availabilityForm.elements.namedItem('blocked-note').value = '';
    renderBlocked();
  });
  blockedList?.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-block]');
    if (!button) return;
    blockedDates.splice(Number(button.dataset.removeBlock), 1); renderBlocked();
  });

  const profileForm = document.querySelector('[data-expert-profile-form]');
  const profile = read('hr_expert_profile');
  if (profileForm && profile) Object.entries(profile).forEach(([name, value]) => {
    const field = profileForm.elements.namedItem(name); if (field) field.value = value;
  });
  profileForm?.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries([...new FormData(profileForm).entries()]);
    write('hr_expert_profile', values); notice('Expert profile saved');
  });

  document.querySelector('[data-expert-tabs]')?.addEventListener('click', event => {
    const button = event.target.closest('[data-expert-filter]'); if (!button) return;
    document.querySelectorAll('[data-expert-filter]').forEach(item => item.classList.toggle('is-on', item === button));
    document.querySelectorAll('[data-expert-session]').forEach(card => card.hidden = button.dataset.expertFilter !== 'all' && card.dataset.expertSession !== button.dataset.expertFilter);
  });
  const sessionList = document.querySelector('.expert-session-list');
  const updateRequestCount = () => {
    const count = sessionList?.querySelectorAll('[data-expert-session="requested"]').length || 0;
    const badge = document.querySelector('[data-expert-filter="requested"] b');
    if (badge) badge.textContent = String(count);
  };
  const savedSessionActions = read('hr_expert_session_actions') || {};
  sessionList?.querySelectorAll('[data-expert-session="requested"]').forEach(card => {
    const action = savedSessionActions[card.querySelector('h3')?.textContent || 'session'];
    if (action === 'decline') card.remove();
    if (action === 'accept') {
      card.dataset.expertSession = 'upcoming';
      const badge = card.querySelector('.badge'); if (badge) { badge.textContent = 'Confirmed'; badge.classList.add('badge-green'); }
      const actions = card.querySelector('.expert-session-actions');
      if (actions) actions.innerHTML = '<button class="btn btnOutline" type="button" data-session-action="message">View details</button>';
    }
  });
  updateRequestCount();
  sessionList?.addEventListener('click', event => {
    const button = event.target.closest('[data-session-action]'); if (!button) return;
    const card = button.closest('[data-expert-session]');
    const action = button.dataset.sessionAction;
    if (action === 'message') { notice('Session details are shown above'); return; }
    const state = read('hr_expert_session_actions') || {};
    state[card.querySelector('h3')?.textContent || 'session'] = action;
    write('hr_expert_session_actions', state);
    if (action === 'accept') {
      card.dataset.expertSession = 'upcoming';
      const badge = card.querySelector('.badge'); if (badge) { badge.textContent = 'Confirmed'; badge.classList.add('badge-green'); }
      card.querySelector('.expert-session-actions').innerHTML = '<button class="btn btnOutline" type="button" data-session-action="message">View details</button>';
      notice('Session request accepted');
    } else {
      card.remove(); notice('Session request declined');
    }
    updateRequestCount();
  });
})();
