const themeRadio = $('input[name="theme"][value="' + getTheme() + '"]');
if (themeRadio) themeRadio.checked = true;

$$('input[name="theme"]').forEach(function (radio) {
  radio.addEventListener('change', function () { setTheme(radio.value); });
});

$('#avatar-file').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { showToast('Choose a photo under 3 MB.', 'bad'); this.value = ''; return; }
  $('#p-avatar').innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt="">';
  showToast('Photo updated.', 'ok');
});

$('#form-pass').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  if (!validateForm(form)) return;
  if (form.newPassword.value !== form.confirm.value) {
    showError(form.confirm, 'The passwords don’t match.');
    form.confirm.focus();
    return;
  }
  form.reset();
  showToast('Password updated.', 'ok');
});

$('#delete-go').addEventListener('click', function () {
  const password = $('#del-pass');
  if (!password.value) { showError(password, 'Enter your password to confirm.'); password.focus(); return; }
  location.href = 'index.html';
});
