const schedForm = $('#sched-form');

schedForm.addEventListener('change', function () {
  const later = schedForm.when.value === 'schedule';
  $('#sched-fields').hidden = !later;
  $('#sched-label').textContent = later ? 'Schedule interview' : 'Start a new interview';
  schedForm.scheduledAt.required = later;
});

schedForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm(schedForm)) return;
  if (schedForm.when.value === 'schedule') {
    showToast('Interview scheduled.', 'ok');
    setTimeout(function () { location.href = 'history.html'; }, 900);
  } else {
    location.href = 'interview-room.html';
  }
});
