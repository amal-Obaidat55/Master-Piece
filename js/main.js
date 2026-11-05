function $(selector, root) { return (root || document).querySelector(selector); }
function $$(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

/* Give the admin sidebar the same draggable microphone scroll control as the app sidebars. */
(function initAdminSidebarScrollbar() {
  if (document.body.dataset.shell !== 'admin') return;
  const sidebar = document.querySelector('.sidebar');
  const nav = sidebar && sidebar.querySelector('.side-nav');
  if (!sidebar || !nav || sidebar.querySelector('.sidebar-scroll-track')) return;

  const track = document.createElement('div');
  track.className = 'sidebar-scroll-track';
  track.setAttribute('role', 'scrollbar');
  track.setAttribute('aria-label', 'Scroll admin navigation');
  track.setAttribute('aria-controls', 'admin-sidebar-navigation');
  track.setAttribute('aria-orientation', 'vertical');
  track.tabIndex = 0;
  track.innerHTML = '<span class="sidebar-scroll-thumb"><svg class="icon" aria-hidden="true"><use href="#i-mic" /></svg></span>';
  nav.id = 'admin-sidebar-navigation';
  sidebar.appendChild(track);

  const thumb = track.firstElementChild;
  const update = () => {
    const max = nav.scrollHeight - nav.clientHeight;
    const thumbHeight = Math.min(track.clientHeight, 50);
    const travel = Math.max(0, track.clientHeight - thumbHeight);
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${max > 0 ? (nav.scrollTop / max) * travel : 0}px`;
    track.hidden = max <= 0;
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', `${Math.max(0, max)}`);
    track.setAttribute('aria-valuenow', `${Math.round(nav.scrollTop)}`);
  };

  nav.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);

  let startY = 0;
  let startScroll = 0;
  track.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    track.setPointerCapture(event.pointerId);
    startY = event.clientY;
    startScroll = nav.scrollTop;
    if (event.target === track) {
      const max = nav.scrollHeight - nav.clientHeight;
      nav.scrollTop = max * Math.max(0, Math.min(1, (event.clientY - track.getBoundingClientRect().top) / track.clientHeight));
      startY = event.clientY;
      startScroll = nav.scrollTop;
    }
    event.preventDefault();
  });
  track.addEventListener('pointermove', event => {
    if (!track.hasPointerCapture(event.pointerId)) return;
    const travel = track.clientHeight - thumb.offsetHeight;
    nav.scrollTop = startScroll + (event.clientY - startY) / Math.max(1, travel) * (nav.scrollHeight - nav.clientHeight);
  });
  track.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) return;
    const step = event.key === 'PageDown' || event.key === 'PageUp' ? nav.clientHeight : 60;
    event.preventDefault();
    nav.scrollTop = event.key === 'Home' ? 0 : event.key === 'End' ? nav.scrollHeight : nav.scrollTop + (event.key === 'ArrowUp' || event.key === 'PageUp' ? -step : step);
  });
})();


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

/* Admin page access controls: ask for a user-facing reason before disabling a role page. */
(function initRolePageAccess() {
  const storageKey = 'speakup_disabled_role_pages';
  const readDisabled = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  };
  const writeDisabled = value => {
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch {}
  };
  const normalizePath = path => decodeURIComponent(path).replace(/\\/g, '/').toLowerCase();

  if (document.body.dataset.shell === 'admin') {
    const modal = document.querySelector('#modal-disable-page');
    if (!modal) return;
    let pending = null;
    const disabled = readDisabled();
    const getCardPath = card => {
      const link = card.querySelector('a[href]');
      return link ? normalizePath(new URL(link.href, location.href).pathname) : null;
    };
    document.querySelectorAll('.role-page-card').forEach(card => {
      const toggle = card.querySelector('.switch input[type="checkbox"]');
      const path = getCardPath(card);
      if (!toggle || !path) return;
      toggle.checked = !disabled[path];
      toggle.addEventListener('change', () => {
        if (toggle.checked) {
          const next = readDisabled();
          delete next[path];
          writeDisabled(next);
          showToast('Page access restored.', 'ok');
          return;
        }
        toggle.checked = true;
        pending = {
          card,
          path,
          title: card.querySelector('h3')?.textContent.trim() || 'this page',
          role: card.closest('section.panel')?.querySelector('.panel__head h2')?.textContent.trim() || 'Workspace'
        };
        document.querySelector('#disable-page-name').textContent = `${pending.title} · ${pending.role}`;
        document.querySelector('#disable-page-reason').value = '';
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        document.querySelector('#disable-page-reason').focus();
      });
    });
    modal.addEventListener('click', event => {
      if (event.target.closest('[data-disable-cancel]') || event.target === modal) {
        modal.hidden = true;
        document.body.style.overflow = '';
        pending = null;
      }
      if (!event.target.closest('[data-disable-confirm]')) return;
      const reasonField = document.querySelector('#disable-page-reason');
      const reason = reasonField.value.trim();
      if (!pending || !reason) {
        reasonField.setCustomValidity('Enter a reason so the user understands why access was disabled.');
        reasonField.reportValidity();
        reasonField.addEventListener('input', () => reasonField.setCustomValidity(''), { once: true });
        return;
      }
      const next = readDisabled();
      next[pending.path] = { reason, title: pending.title, role: pending.role, updatedAt: Date.now() };
      writeDisabled(next);
      pending.card.querySelector('.switch input[type="checkbox"]').checked = false;
      modal.hidden = true;
      document.body.style.overflow = '';
      pending = null;
      showToast('Page disabled. The user will see your reason.', 'ok');
    });
  }

  if (document.body.dataset.shell !== 'app') return;
  const disabled = readDisabled()[normalizePath(location.pathname)];
  if (!disabled) return;
  const audience = document.body.dataset.audience;
  const homeHref = audience === 'expert' ? 'expert-dashboard.html'
    : audience === 'employer' ? 'employer-dashboard.html'
      : /\/Expert\//i.test(location.pathname) ? '../Job seeker/dashboard.html' : 'dashboard.html';
  document.body.insertAdjacentHTML('afterbegin', `
    <section class="page-disabled-screen" role="alertdialog" aria-modal="true" aria-labelledby="page-disabled-title">
      <div class="page-disabled-card">
        <span class="page-disabled-icon" aria-hidden="true">!</span>
        <p class="eyebrow">${disabled.role || 'Workspace'} page unavailable</p>
        <h1 id="page-disabled-title">${disabled.title || 'This page'} is temporarily unavailable</h1>
        <p class="page-disabled-reason"></p>
        <a class="btn btnAccent" href="${homeHref}">Go to dashboard</a>
      </div>
    </section>`);
  document.querySelector('.page-disabled-reason').textContent = disabled.reason;
})();


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
