
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isWide = function () { return matchMedia('(min-width: 769px)').matches; };
const clamp = function (n, min, max) { return Math.max(min, Math.min(max, n)); };


const hero = $('#hero');
requestAnimationFrame(function () {
  requestAnimationFrame(function () { hero.classList.add('is-ready'); });
});


const prompts = [
  'Tell me about yourself.',
  'Why do you want this role?',
  'Describe a challenge you solved.',
  'Where do you see yourself in five years?'
];
const questionEl = $('#hero-question');
let promptIndex = 0;

function typeNextPrompt() {
  const text = prompts[promptIndex % prompts.length];
  let letters = 0;
  questionEl.textContent = '';

  (function typeLetter() {
    letters++;
    questionEl.textContent = text.slice(0, letters);
    if (letters < text.length) {
      setTimeout(typeLetter, 38);
    } else {
      setTimeout(function () { promptIndex++; typeNextPrompt(); }, 2600);
    }
  })();
}

if (reduceMotion) {
  questionEl.textContent = prompts[0];
  $('#hero-wave').classList.remove('is-live');
} else {
  setTimeout(typeNextPrompt, 1100);
}

const startTime = performance.now();
setInterval(function () {
  const seconds = Math.floor((performance.now() - startTime) / 1000) % 600;
  $('#hero-timer').textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}, 1000);

if (reduceMotion) $('#marquee').style.animation = 'none';


const manifesto = $('#manifesto');
const words = $$('.w', manifesto);

function paintManifesto() {
  const box = manifesto.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = clamp((vh * 0.85 - box.top) / (vh * 0.6 + box.height * 0.6), 0, 1);
  const litCount = reduceMotion ? words.length : Math.round(progress * words.length);
  words.forEach(function (word, i) { word.classList.toggle('on', i < litCount); });
}


const how = $('#how');
const steps = $$('.how__step', how);
const panes = $$('.pane', how);
const progressBar = $('#how-bar');
let currentStep = -1;

function setStep(i) {
  if (i === currentStep) return;
  currentStep = i;
  steps.forEach(function (step, k) {
    step.classList.toggle('is-active', k === i);
    step.classList.toggle('is-done', k < i);
  });
  panes.forEach(function (pane, k) { pane.classList.toggle('is-active', k === i); });
  $('#stage-wave').classList.toggle('is-live', i === 2 && !reduceMotion);
}

function paintHow() {
  if (!isWide()) return;
  const box = how.getBoundingClientRect();
  const scrollable = box.height - window.innerHeight;
  const progress = scrollable > 0 ? clamp(-box.top / scrollable, 0, 1) : 0;
  setStep(Math.min(steps.length - 1, Math.floor(Math.min(progress, 0.9999) * steps.length)));
  progressBar.style.transform = 'scaleX(' + progress.toFixed(3) + ')';
}

steps.forEach(function (step) {
  step.addEventListener('click', function () { if (!isWide()) setStep(Number(step.dataset.i)); });
});
if ('IntersectionObserver' in window) {
  const watcher = new IntersectionObserver(function (entries) {
    if (isWide()) return;
    entries.forEach(function (entry) { if (entry.isIntersecting) setStep(Number(entry.target.dataset.i)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(function (step) { watcher.observe(step); });
}
setStep(0);


const header = $('.site-header');
const scrollBar = $('.scrollProgress i');
const shapes = $$('[data-parallax]');
let lastY = window.scrollY;
let waiting = false;

function onScroll() {
  const y = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.transform = 'scaleX(' + (maxScroll > 0 ? clamp(y / maxScroll, 0, 1) : 0).toFixed(4) + ')';

  header.classList.toggle('is-solid', y > 40);
  const menuOpen = document.body.classList.contains('menu-open');
  header.classList.toggle('is-hidden', !menuOpen && y > lastY + 4 && y > 400);
  if (y < lastY - 4) header.classList.remove('is-hidden');
  lastY = y;

  if (!reduceMotion && y < window.innerHeight * 1.2) {
    shapes.forEach(function (shape) {
      const rotate = shape.classList.contains('barShape') ? ' rotate(-24deg)' : '';
      shape.style.transform = 'translate3d(0,' + (y * parseFloat(shape.dataset.parallax)).toFixed(1) + 'px,0)' + rotate;
    });
  }

  paintManifesto();
  paintHow();
  waiting = false;
}

window.addEventListener('scroll', function () {
  if (!waiting) { waiting = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
