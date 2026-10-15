function $(selector, root) { return (root || document).querySelector(selector); }
function $$(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }


function getTheme() { return document.documentElement.dataset.theme || 'light'; }

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('hr_theme', theme);
  $$('[data-action="theme"]').forEach(function (btn) {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}
setTheme(getTheme());


document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'theme') setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  if (action === 'menu') document.body.classList.add('drawer-open');          
  if (action === 'menu-close') document.body.classList.remove('drawer-open');
  if (action === 'mobileMenu') toggleMobileMenu(btn);                         
});

document.addEventListener('click', function (e) {
  if (e.target.matches('.scrim') || e.target.closest('.sidebar .side-link[href]')) {
    document.body.classList.remove('drawer-open');
  }
  if (e.target.closest('#mobileMenu a')) toggleMobileMenu($('[data-action="mobileMenu"]'));
});

function toggleMobileMenu(btn) {
  const menu = $('#mobileMenu');
  const willOpen = menu.hidden;                      
  menu.hidden = !willOpen;
  document.body.classList.toggle('menu-open', willOpen);
  btn.setAttribute('aria-expanded', willOpen);
  btn.querySelector('use').setAttribute('href', willOpen ? '#i-x' : '#i-menu');
}


function closeDropdowns() { $$('.dropdown-panel').forEach(function (p) { p.hidden = true; }); }

$$('[data-dropdown]').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const panel = document.getElementById(btn.dataset.dropdown);
    const wasHidden = panel.hidden;
    closeDropdowns();
    panel.hidden = !wasHidden;
  });
});
document.addEventListener('click', function (e) { if (!e.target.closest('.dropdown-panel')) closeDropdowns(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDropdowns(); });


const readAll = $('#notif-read');
if (readAll) {
  readAll.addEventListener('click', function () {
    $$('.notif__item').forEach(function (n) { n.classList.remove('is-unread'); });
    $('.notif-dot').hidden = true;
  });
}


let lastTrigger = null;

function openModal(id, trigger) {
  const modal = document.getElementById(id);
  const form = $('form', modal);
  lastTrigger = trigger;

  if (trigger && trigger.dataset.title) $('[data-title]', modal).textContent = trigger.dataset.title;
  if (form) {
    form.reset();
    clearErrors(form);
    const row = trigger && trigger.closest('[data-row]');
    if (row && trigger.hasAttribute('data-edit')) fillForm(form, row.dataset);
    const editing = !!(trigger && trigger.hasAttribute('data-edit'));
    $$('[data-create-only]', form).forEach(function (box) {
      box.hidden = editing;
      $('input', box).disabled = editing;
    });
  }
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const first = $('input, select, textarea', modal);
  if (first) first.focus();
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function fillForm(form, values) {
  $$('[name]', form).forEach(function (el) {
    const v = values[el.name];
    if (v === undefined) return;
    if (el.type === 'checkbox') el.checked = (v === 'true');
    else el.value = v;
  });
}

document.addEventListener('click', function (e) {
  const opener = e.target.closest('[data-open]');
  if (opener) { openModal(opener.dataset.open, opener); return; }

  const modal = e.target.closest('.modal');
  if (!modal) return;
  const clickedBackdrop = (e.target === modal);
  if (clickedBackdrop || e.target.closest('[data-close]')) { closeModal(modal); return; }

  if (e.target.closest('[data-confirm]')) {
    const row = lastTrigger && lastTrigger.closest('[data-row]');
    if (row && modal.dataset.removes !== undefined) row.remove();
    closeModal(modal);
    if (modal.dataset.toast) showToast(modal.dataset.toast, 'ok');
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  $$('.modal:not([hidden])').forEach(closeModal);
});

document.addEventListener('click', function (e) {
  const save = e.target.closest('[data-save]');
  if (!save) return;
  const modal = save.closest('.modal');
  const form = $('form', modal);
  if (!validateForm(form)) return;
  closeModal(modal);
  showToast(save.dataset.save, 'ok');
});


function showToast(message, type) {
  type = type || 'info';
  let region = $('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('role', 'status');
    document.body.appendChild(region);
  }
  const icon = type === 'ok' ? 'check-circle' : type === 'bad' ? 'alert' : 'info';
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-' + icon + '"/></svg><span></span>';
  $('span', toast).textContent = message;
  region.appendChild(toast);

  setTimeout(function () {
    toast.classList.add('is-out');
    setTimeout(function () { toast.remove(); }, 260);
  }, 4200);
}

document.addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-toast]');
  if (btn) showToast(btn.dataset.toast, 'ok');
});



function showError(input, message) {
  const field = input.closest('.field') || input.parentNode;
  field.classList.add('has-error');
  let box = $('.field__error', field);
  if (!box) {
    box = document.createElement('div');
    box.className = 'field__error';
    box.setAttribute('role', 'alert');
    field.appendChild(box);
  }
  box.textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearErrors(form) {
  $$('.has-error', form).forEach(function (f) { f.classList.remove('has-error'); });
  $$('.field__error:not([data-static])', form).forEach(function (box) { box.remove(); });   
  $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
}

function defaultMessage(el) {
  if (el.validity.valueMissing) return 'This field is required.';
  if (el.validity.typeMismatch) return 'Enter a valid email address.';
  if (el.validity.tooShort) return 'Use at least ' + el.minLength + ' characters.';
  return 'This value isn’t valid.';
}

function validateForm(form) {
  clearErrors(form);
  let firstBad = null;
  $$('input, select, textarea', form).forEach(function (el) {
    if (el.disabled || el.type === 'file' || el.closest('[hidden]')) return;
    if (el.checkValidity()) return;
    showError(el, el.dataset.msg || defaultMessage(el));
    if (!firstBad) firstBad = el;
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
}

document.addEventListener('input', function (e) {
  const field = e.target.closest('.has-error');
  if (!field) return;
  field.classList.remove('has-error');
  const box = $('.field__error', field);
  if (box) box.remove();
});


document.addEventListener('submit', function (e) {
  const form = e.target;
  if (!form.matches('[data-validate]')) return;
  e.preventDefault();
  if (!validateForm(form)) return;
  if (form.dataset.toast) showToast(form.dataset.toast, 'ok');
  if (form.dataset.next) {
    setTimeout(function () { location.href = form.dataset.next; }, form.dataset.toast ? 900 : 0);
  }
});

document.addEventListener('click', function (e) {
  const eye = e.target.closest('[data-toggle-pass]');
  if (!eye) return;
  const input = eye.parentNode.querySelector('input');
  const show = (input.type === 'password');
  input.type = show ? 'text' : 'password';
  eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  eye.querySelector('use').setAttribute('href', show ? '#i-eye-off' : '#i-eye');
});


$$('[role="tablist"]:not([data-manual])').forEach(function (list) {
  list.addEventListener('click', function (e) {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    $$('[role="tab"]', list).forEach(function (t) {
      const on = (t === tab);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  });
});


$$('[data-seg]').forEach(function (seg) {
  seg.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('button', seg).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
  });
});


document.addEventListener('click', function (e) {
  const btn = e.target.closest('.acc__btn, .qa__btn');
  if (!btn) return;
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  if (btn.matches('.acc__btn') && !isOpen) {
    $$('.acc__btn[aria-expanded="true"]', btn.closest('.acc').parentNode).forEach(function (other) {
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')).classList.remove('is-open');
    });
  }
  btn.setAttribute('aria-expanded', !isOpen);
  panel.classList.toggle('is-open', !isOpen);
});


if ('IntersectionObserver' in window) {
  const watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      watcher.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(function (el) { watcher.observe(el); });
} else {
  $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
}



$$('[data-count]').forEach(function (el) {
  const target = Number(el.dataset.count);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || target === 0) return;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / 1000, 1);              
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  })(start);
});



function drawChart(box) {
  const points = box.dataset.points.split(',').map(function (p) {
    const parts = p.split(':');
    return { label: parts[0].trim(), value: Number(parts[1]) };
  });
  const max = Number(box.dataset.max || 100);
  const H = Number(box.dataset.height || 240);
  const W = Math.max(280, box.clientWidth);
  const pad = { left: 34, right: 14, top: 14, bottom: 30 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const n = points.length;

  const x = function (i) { return pad.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW); };
  const y = function (v) { return pad.top + innerH - Math.min(v / max, 1) * innerH; };

  let svg = '';
  [0, 25, 50, 75, 100].forEach(function (g) {
    const gy = pad.top + innerH - (g / 100) * innerH;
    svg += '<line class="chart__grid" x1="' + pad.left + '" x2="' + (W - pad.right) + '" y1="' + gy + '" y2="' + gy + '"/>' +
      '<text class="chart__tick" x="' + (pad.left - 8) + '" y="' + (gy + 4) + '" text-anchor="end">' + Math.round(g / 100 * max) + '</text>';
  });
  const step = Math.max(1, Math.ceil(n / Math.floor(innerW / 70)));
  points.forEach(function (p, i) {
    if (i % step === 0 || i === n - 1) {
      svg += '<text class="chart__tick" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + p.label + '</text>';
    }
  });
  const line = points.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.value).toFixed(1); }).join(' ');
  const area = line + ' L' + x(n - 1).toFixed(1) + ' ' + (pad.top + innerH) + ' L' + x(0).toFixed(1) + ' ' + (pad.top + innerH) + ' Z';
  svg += '<path class="chart__area" d="' + area + '"/><path class="chart__line" d="' + line + '" pathLength="1"/>';
  points.forEach(function (p, i) {
    svg += '<circle class="chart__dot" cx="' + x(i).toFixed(1) + '" cy="' + y(p.value).toFixed(1) + '" r="5"><title>' + p.label + ': ' + p.value + '</title></circle>';
  });

  box.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + (box.dataset.label || 'Chart') + '">' + svg + '</svg>';
}

function drawAllCharts() { $$('[data-chart]').forEach(drawChart); }
drawAllCharts();
let resizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawAllCharts, 200);
});



$$('.tags').forEach(function (box) {
  const input = $('input', box);

  function addTag(text) {
    text = text.trim().replace(/,$/, '');
    if (!text) return;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = '<span></span><button type="button" aria-label="Remove tag"><svg class="icon" aria-hidden="true"><use href="#i-x"/></svg></button>';
    $('span', tag).textContent = text;
    box.insertBefore(tag, input);
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value);
      input.value = '';
    }
  });
  box.addEventListener('click', function (e) {
    const remove = e.target.closest('.tag button');
    if (remove) remove.parentNode.remove(); else input.focus();
  });
});



$$('[data-greeting]').forEach(function (el) {
  const hour = new Date().getHours();
  el.textContent = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
});

document.addEventListener('click', function (e) {
  if (!e.target.closest('[data-print]')) return;
  $$('.qa__body').forEach(function (body) { body.classList.add('is-open'); });
  window.print();
});
