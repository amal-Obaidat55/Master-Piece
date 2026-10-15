const views = $$('[data-view]');
const sideLinks = $$('.sidebar .side-nav .side-link');

function showRoute() {
  const parts = (location.hash || '#overview').slice(1).split('/');
  const view = views.find(function (v) { return v.dataset.view === parts[0]; }) || views[0];
  const name = view.dataset.view;

  views.forEach(function (v) { v.hidden = (v !== view); });

  sideLinks.forEach(function (link) {
    const on = (link.getAttribute('href') === 'admin-' + name+'.html');
    link.classList.toggle('is-active', on);
    if (on) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });

  const subs = $$('[data-sub]', view);
  if (subs.length) {
    const wanted = subs.find(function (s) { return s.dataset.sub === parts[1]; }) || subs[0];
    subs.forEach(function (s) { s.hidden = (s !== wanted); });
    $$('.admin-tabs a', view).forEach(function (a) {
      if (a.getAttribute('href') === '#' + name + '/' + wanted.dataset.sub) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  const label = $('.side-link.is-active .side-label').textContent;
  $('.topbar__crumb').textContent = 'Admin · ' + label;
  document.title = label + ' — Admin — SpeakUp ';
  document.body.classList.remove('drawer-open');
  window.scrollTo(0, 0);
  drawAllCharts();                      
}

window.addEventListener('hashchange', showRoute);
showRoute();


$$('.filters input[type="search"]').forEach(function (box) {
  box.addEventListener('input', function () {
    const text = box.value.trim().toLowerCase();
    $$('tbody tr', box.closest('.panel')).forEach(function (row) {
      row.hidden = !row.textContent.toLowerCase().includes(text);
    });
  });
});
$$('.filters').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); }); });

$$('input[data-toast-file]').forEach(function (input) {
  input.addEventListener('change', function () { showToast(input.dataset.toastFile, 'ok'); input.value = ''; });
});
