/* Reveal the destination page from the clicked Login/Get started control. */
(function () {
  const storageKey = 'speakup-route-reveal';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (document.body.dataset.shell === 'none' && /\/auth\.html$/i.test(location.pathname)) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      sessionStorage.removeItem(storageKey);
      if (saved && !reduceMotion && Element.prototype.animate && Date.now() - saved.time < 5000) {
        document.documentElement.style.setProperty('--route-reveal-x', `${saved.x}px`);
        document.documentElement.style.setProperty('--route-reveal-y', `${saved.y}px`);
        document.documentElement.style.setProperty('--route-reveal-radius', `${saved.radius}px`);
        document.body.classList.add('auth-route-reveal');
        document.body.addEventListener('animationend', function (event) {
          if (event.animationName !== 'auth-route-expand') return;
          document.body.classList.remove('auth-route-reveal');
          document.documentElement.style.removeProperty('--route-reveal-x');
          document.documentElement.style.removeProperty('--route-reveal-y');
          document.documentElement.style.removeProperty('--route-reveal-radius');
        }, { once: true });
      }
    } catch (error) {
      sessionStorage.removeItem(storageKey);
    }
    return;
  }

  let navigating = false;
  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link || link.target || event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || target.pathname !== new URL('auth.html', location.href).pathname) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;

    const rect = link.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const radius = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) * 1.4);
    try { sessionStorage.setItem(storageKey, JSON.stringify({ x, y, radius, time: Date.now() })); } catch (error) { }
    location.assign(target.href);
  }, true);
})();
