const forms = { login: $('#form-login'), signup: $('#form-signup'), forgot: $('#form-forgot') };
const forgotDone = $('#forgot-done');
const tabs = $$('.auth__seg [role="tab"]');
const titles = { login: 'Log in', signup: 'Create an account', forgot: 'Reset your password' };

function setMode(mode) {
  if (!forms[mode]) mode = 'login';

  Object.keys(forms).forEach(function (name) { forms[name].hidden = (name !== mode); });
  forgotDone.hidden = true;
  tabs.forEach(function (tab) { tab.setAttribute('aria-selected', tab.dataset.mode === mode); });
  $('.auth__seg').hidden = (mode === 'forgot');       
  clearErrors(forms[mode]);
  document.title = titles[mode] + ' — SpeakUp ';
}


document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-mode]');
  if (btn) setMode(btn.dataset.mode);
});

setMode(new URLSearchParams(location.search).get('mode') || 'login');


$('#s-pass').addEventListener('input', function (e) {
  const pass = e.target.value;
  let level = 0;
  if (pass.length >= 8) level++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) level++;
  if (/\d/.test(pass)) level++;
  if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 14) level++;
  if (!pass) level = 0;

  $('#strength').dataset.level = level;
  const messages = [
    'Use 8+ characters with letters and numbers.',
    'Weak. Add numbers or capital letters.',
    'Okay. A symbol or more length makes it stronger.',
    'Strong.',
    'Very strong.'
  ];
  $('#strength-label').textContent = pass ? messages[level] : messages[0];
});


function goToDashboard(message) {
  showToast(message, 'ok');
  setTimeout(function () { location.href = 'dashboard.html'; }, 700);
}

forms.login.addEventListener('submit', function (e) {
  e.preventDefault();
  if (validateForm(forms.login)) goToDashboard('Welcome back.');
});

forms.signup.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm(forms.signup)) return;
  const firstName = $('#s-name').value.trim().split(' ')[0];
  goToDashboard('Welcome, ' + firstName + '.');
});

forms.forgot.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm(forms.forgot)) return;
  forms.forgot.hidden = true;
  forgotDone.hidden = false;
  $('#forgot-done-text').textContent = 'If an account exists for ' + $('#f-email').value.trim() + ', a reset link is on its way.';
});
