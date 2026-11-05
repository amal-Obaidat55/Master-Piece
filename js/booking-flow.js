/* UI-only details and confirmation steps for candidate session bookings. */
(function () {
  const storageKey = 'hr_session_booking_draft';
  const page = document.body.dataset.bookingPage;
  if (!page) return;

  const readDraft = () => {
    try { return JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { return null; }
  };
  const saveDraft = draft => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(draft)); } catch { }
  };
  const draft = readDraft();

  function fillSummary(data) {
    if (!data) return;
    document.querySelectorAll('[data-booking-expert]').forEach(el => el.textContent = data.expert || 'Maya Chen');
    document.querySelectorAll('[data-booking-service]').forEach(el => el.textContent = data.service || 'Portfolio review');
    document.querySelectorAll('[data-booking-date]').forEach(el => el.textContent = data.dateLabel || data.date || 'Selected date');
    document.querySelectorAll('[data-booking-time]').forEach(el => el.textContent = data.time || 'Selected time');
    document.querySelectorAll('[data-booking-duration]').forEach(el => el.textContent = data.duration || '45 minutes');
    document.querySelectorAll('[data-booking-price]').forEach(el => el.textContent = data.price || '$75');
    document.querySelectorAll('[data-booking-focus]').forEach(el => el.textContent = data.focus || 'Not specified');
    const notesWrap = document.querySelector('[data-booking-notes-wrap]');
    const notes = document.querySelector('[data-booking-notes]');
    if (notesWrap && notes && data.notes) {
      notes.textContent = data.notes;
      notesWrap.hidden = false;
    }
  }

  fillSummary(draft);

  if (page === 'details') {
    const form = document.querySelector('[data-session-details]');
    if (form && draft) {
      if (draft.focus) form.elements.focus.value = draft.focus;
      if (draft.notes) form.elements.notes.value = draft.notes;
    }
    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const updated = { ...(readDraft() || {}), focus: form.elements.focus.value, notes: form.elements.notes.value.trim() };
      saveDraft(updated);
      location.href = 'booking-confirmation.html';
    });
  }

  if (page === 'confirm') {
    document.querySelector('[data-confirm-booking]')?.addEventListener('click', event => {
      const data = readDraft();
      if (!data?.date || !data?.time) {
        event.currentTarget.disabled = true;
        location.href = '../Expert/book-a-session.html';
        return;
      }
      let sessions = [];
      try { sessions = JSON.parse(localStorage.getItem('hr_sessions') || '[]'); } catch { }
      sessions.unshift({
        date: data.date,
        time: data.time,
        expert: data.expert || 'Maya Chen',
        duration: data.duration || '45 minutes',
        price: data.price || '$75',
        service: data.service || 'Portfolio review',
        focus: data.focus || '',
        notes: data.notes || ''
      });
      try { localStorage.setItem('hr_sessions', JSON.stringify(sessions)); } catch { }
      event.currentTarget.disabled = true;
      location.href = 'my-sessions.html?booking=confirmed';
    });
  }
})();
