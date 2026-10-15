const form = $('#setup-form');
const sections = $$('.wiz');
const stepperItems = $$('#stepper .stepper__item');
const stepperLines = $$('#stepper .stepper__line');
let step = 1;                        


function chosen(name) {
  const input = form.querySelector('input[name="' + name + '"]:checked');
  return input ? input.dataset.label : '';
}

function currentChoices() {
  const tags = $$('#focus-box .tag > span').map(function (t) { return t.textContent; });
  const cv = form.cvId.options[form.cvId.selectedIndex];
  const language = form.languageId.options[form.languageId.selectedIndex];
  const description = form.jobDescription.value.trim();

  return [
    ['Job title', form.jobTitle.value.trim()],
    ['Type', chosen('typeId')],
    ['Level', chosen('levelId')],
    ['Difficulty', chosen('difficultyId')],
    ['Language', language.value ? language.text : ''],
    ['Questions', form.questionCount.value],
    ['Time limit', form.durationMin.value + ' min'],
    ['Focus', tags.join(', ')],
    ['CV', cv.value ? cv.dataset.name : ''],
    ['Job description', description ? 'Added (' + description.length.toLocaleString() + ' characters)' : '']
  ];
}

function fillList(dl, showEmpty) {
  dl.innerHTML = '';
  currentChoices().forEach(function (item) {
    if (!item[1] && !showEmpty) return;
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = item[0];
    if (item[1]) dd.textContent = item[1];
    else dd.innerHTML = '<span class="review-empty">Not set</span>';
    dl.append(dt, dd);
  });
}

function updateSummary() {
  fillList($('#summary'), false);
  $('#summary-empty').hidden = $('#summary').children.length > 0;
  const length = form.jobDescription.value.length;
  $('#jd-count').textContent = length ? length.toLocaleString() + ' / 8,000' : '';
}


function updateRange(input, output, unit) {
  const percent = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.setProperty('--fill', percent + '%');             
  output.textContent = input.value + unit;
}
function updateRanges() {
  updateRange(form.questionCount, $('#qOut'), ' questions');
  updateRange(form.durationMin, $('#dOut'), ' min');
}


function goToStep(n) {
  step = n;
  sections.forEach(function (sec) { sec.hidden = (Number(sec.dataset.step) !== n); });
  stepperItems.forEach(function (item, i) {
    item.classList.toggle('is-active', i + 1 === n);
    item.classList.toggle('is-done', i + 1 < n);
  });
  stepperLines.forEach(function (line, i) { line.classList.toggle('is-done', i + 1 < n); });

  $('#btn-back').hidden = (n === 1);
  $('#btn-next').hidden = (n === 3);
  $('#btn-submit').hidden = (n !== 3);
  if (n === 3) fillList($('#review'), true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#btn-next').addEventListener('click', function () { if (validateForm(form)) goToStep(step + 1); });
$('#btn-back').addEventListener('click', function () { goToStep(step - 1); });
$('#edit-details').addEventListener('click', function () { goToStep(2); });
stepperItems.forEach(function (item, i) {
  item.addEventListener('click', function () { if (i + 1 < step) goToStep(i + 1); });   
});

form.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && step < 3 && e.target.id !== 'focus-input') {
    e.preventDefault();
    $('#btn-next').click();
  }
});


function updateMode() {
  const later = form.mode.value === 'schedule';
  $('#schedule-fields').hidden = !later;
  $('#mic-hint').hidden = later;
  $('#submit-label').textContent = later ? 'Schedule interview' : 'Start interview';
  form.scheduledAt.required = later;                               

  const min = new Date(Date.now() + 5 * 60000);
  min.setMinutes(min.getMinutes() - min.getTimezoneOffset());
  form.scheduledAt.min = min.toISOString().slice(0, 16);
}


form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm(form)) return;

  if (form.mode.value === 'schedule') {
    if (new Date(form.scheduledAt.value) < new Date(Date.now() + 4 * 60000)) {
      showError(form.scheduledAt, 'Choose a time at least 5 minutes from now.');
      return;
    }
    showToast('Interview scheduled.', 'ok');
    setTimeout(function () { location.href = 'history.html'; }, 900);
  } else {
    location.href = 'interview-room.html';
  }
});


form.addEventListener('input', function () { updateRanges(); updateSummary(); });
form.addEventListener('change', function (e) { if (e.target.name === 'mode') updateMode(); updateSummary(); });
$('#focus-box').addEventListener('keyup', updateSummary);           
$('#focus-box').addEventListener('click', function () { setTimeout(updateSummary, 0); });  

updateRanges();
updateSummary();
updateMode();
form.jobTitle.focus({ preventScroll: true });         
