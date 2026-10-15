function employerToast(message) {
    const t = document.querySelector('[data-toast]');
    if (!t) return;
    t.textContent = message;
    t.hidden = false;
    clearTimeout(window.employerToastTimer);
    window.employerToastTimer = setTimeout(() => t.hidden = true, 2600)
}
document.addEventListener('input', e => {
    if (!e.target.matches('[data-search]')) return;
    const q = e.target.value.toLowerCase();
    const table = e.target.closest('.job-toolbar')?.nextElementSibling?.querySelector('tbody');
    if (table) table.querySelectorAll('tr')
        .forEach(row =>
            row.hidden = !row.textContent.toLowerCase().includes(q));
    else document.querySelectorAll('[data-search-text]')
        .forEach(row => row.hidden = !row.dataset.searchText.toLowerCase().includes(q))
}
);
document.addEventListener('change', e => {
    if (e.target.matches('[data-job-status]'))
        document.querySelectorAll('#jobs-table tbody tr')
            .forEach(row => row.hidden = e.target.value !== 'all' && row.dataset.status !== e.target.value);
    if (e.target.matches('[data-app-status]'))
        document.querySelectorAll('#applicants-table tbody tr')
            .forEach(row => row.hidden = e.target.value !== 'all' && row.dataset.status !== e.target.value);
    if (e.target.matches('.pipeline-card select')) {
        const card = e.target.closest('.pipeline-card'),
            old = card.parentElement,
            newCol = [...document.querySelectorAll('.pipeline-column')]
                .find(c =>
                    c.querySelector('.pipeline-column-head h2').textContent === e.target.value);
        if (newCol) {
            newCol.append(card);
            const oldCount = old.querySelectorAll('.pipeline-card').length, newCount = newCol.querySelectorAll('.pipeline-card').length;
            old.querySelector('.pipeline-column-head .badge').textContent = oldCount;
            newCol.querySelector('.pipeline-column-head .badge').textContent = newCount;
            employerToast('Candidate moved to ' + e.target.value)
        }
    }
});
document.addEventListener('submit', e => {
    if (e.target.matches('#company-form')) {
        e.preventDefault();
        employerToast('Company profile saved')
    }
    if (e.target.matches('#job-form')) {
        e.preventDefault();
        employerToast(e.submitter?.name === 'draft' ? 'Job saved as draft' : 'Job published')
    }
    if (e.target.matches('#settings-form')) {
        e.preventDefault();
        employerToast('Settings saved')
    }
    if (e.target.matches('#schedule-form')) {
        const submitter = e.submitter;
        if (submitter?.value === 'confirm') {
            e.preventDefault();
            e.target.closest('dialog').close();
            employerToast('Interview invitation sent')
        }
    }
});
document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-open-schedule'))
        document.querySelector('[data-schedule-dialog]')?.showModal();
    if (b.hasAttribute('data-dismiss'))
        b.closest('[data-notification]')?.remove();
    if (b.hasAttribute('data-mark-read')) {
        document.querySelectorAll('[data-notification]')
            .forEach(n => {
                n.dataset.read = 'yes';
                n.classList.remove('is-unread')
            });
        employerToast('Notifications marked as read')
    }
    if (b.hasAttribute('data-candidate-action'))
        employerToast(b.dataset.candidateAction === 'shortlist' ? 'Candidate added to your shortlist' : 'CV download is ready');
    if (b.closest('.notification-tabs')) {
        const status = b.dataset.status;
        b.closest('.notification-tabs').querySelectorAll('button')
            .forEach(x => x.classList.toggle('is-on', x === b));

        document.querySelectorAll('[data-notification]')
            .forEach(n => n.hidden = status === 'unread' && n.dataset.read !== 'no')
    }
});
