const cvForm = $('#cv-form');
const dropzone = $('#dz');
const fileInput = $('#cv-file');
const cvError = $('#cv-error');
const descriptionBox = cvForm.jobDescription;


function resetDropzone() {
  dropzone.classList.remove('has-file');
  $('[data-dz-title]', dropzone).textContent = 'Drop your CV here';
  $('[data-dz-sub]', dropzone).textContent = 'or click to choose a file';
  fileInput.value = '';
}

function takeFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (['.pdf', '.doc', '.docx'].indexOf(ext) === -1) { showToast('Upload a PDF, DOC, DOCX file.', 'bad'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('That file is over 5 MB. Choose a smaller one.', 'bad'); return; }

  dropzone.classList.add('has-file');
  $('[data-dz-title]', dropzone).textContent = file.name;
  $('[data-dz-sub]', dropzone).textContent = Math.round(file.size / 1024) + ' KB — click to replace';
  $$('input[name="savedCv"]').forEach(function (radio) { radio.checked = false; });   // الملف الجديد يلغي اختيار المحفوظ
  cvError.hidden = true;
}

fileInput.addEventListener('change', function () { if (fileInput.files[0]) takeFile(fileInput.files[0]); });
['dragenter', 'dragover'].forEach(function (name) {
  dropzone.addEventListener(name, function (e) { e.preventDefault(); dropzone.classList.add('is-over'); });
});
['dragleave', 'drop'].forEach(function (name) {
  dropzone.addEventListener(name, function (e) { e.preventDefault(); dropzone.classList.remove('is-over'); });
});
dropzone.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) takeFile(e.dataTransfer.files[0]); });

cvForm.addEventListener('change', function (e) {
  if (e.target.name === 'savedCv') { resetDropzone(); cvError.hidden = true; }
});
cvForm.addEventListener('click', function (e) { if (e.target.closest('.saved__item .iconBtn')) e.preventDefault(); });


$('#saved-jd').addEventListener('change', function (e) {
  const option = e.target.options[e.target.selectedIndex];
  if (!option.value) return;
  cvForm.jobTitle.value = option.dataset.title;
  descriptionBox.value = option.dataset.text;
  updateCount();
  e.target.value = '';
});

function updateCount() {
  const n = descriptionBox.value.length;
  $('#jd-count').textContent = n ? n.toLocaleString() + ' / 8,000' : '';
}
descriptionBox.addEventListener('input', updateCount);


cvForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const hasCv = dropzone.classList.contains('has-file') || $('input[name="savedCv"]:checked');
  cvError.hidden = !!hasCv;
  cvError.textContent = 'Upload a CV or choose a saved one.';
  const descriptionOk = validateForm(cvForm);
  if (!hasCv || !descriptionOk) return;

  $('#results').hidden = true;
  $('#analyzing').hidden = false;
  $('#btn-analyze').disabled = true;
  setTimeout(function () {
    $('#analyzing').hidden = true;
    $('#btn-analyze').disabled = false;
    $('#results').hidden = false;
    $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 2000);
});

$('#btn-reanalyze').addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  descriptionBox.focus({ preventScroll: true });
});


$('#btn-optimize').addEventListener('click', function () {
  $('#opt-start').hidden = true;
  $('#opt-result').hidden = false;
  showToast('Your optimized CV is ready.', 'ok');
});

$('#opt-copy').addEventListener('click', function () {
  navigator.clipboard.writeText($('#opt-text').value);
  showToast('Copied to clipboard.', 'ok');
});

$('#opt-download').addEventListener('click', function () {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([$('#opt-text').value], { type: 'text/plain' }));
  link.download = 'optimized-cv.txt';
  link.click();
});
