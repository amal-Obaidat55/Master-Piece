
const questionItems = $$('#questions li');
const lobby = $('#s-lobby');
const stage = $('#s-room');
const doneBtn = $('#btn-done');
const recBtn = $('#btn-rec');

let current = 0;                
let typeMode = false;            
let recording = false;
let answerSeconds = 0;           
let timePerQuestion = 120;       
let questionTimer = null;
let clockTimer = null;
let totalSeconds = 15 * 60;      
let micStream = null;
let cameraStream = null;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}


function updateBeginButton() {
  const ready = typeMode || micStream;
  $('#btn-begin').disabled = !ready;
  $('#begin-note').textContent = ready
    ? (typeMode ? 'You will type your answers.' : 'Your microphone is ready.')
    : 'Test your microphone, or choose to type your answers.';
}

$('#btn-mic').addEventListener('click', function () {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    micStream = stream;
    $('#mic-status').textContent = 'Listening. Say a few words';
    $('#mic-pill').className = 'pill pill--brand';
    $('#mic-pill').textContent = 'Listening';
    $('#btn-mic span').textContent = 'Test again';
    showMicLevel(stream);
    updateBeginButton();
  }).catch(function () {
    $('#mic-status').textContent = 'Microphone access is blocked';
    $('#mic-pill').className = 'pill pill--bad';
    $('#mic-pill').textContent = 'Blocked';
    $('#mic-help').textContent = 'Allow microphone access in your browser, then test again. Or choose to type your answers.';
  });
});

function showMicLevel(stream) {
  const audio = new AudioContext();
  const analyser = audio.createAnalyser();
  analyser.fftSize = 1024;
  audio.createMediaStreamSource(stream).connect(analyser);
  const data = new Uint8Array(analyser.fftSize);

  (function tick() {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    data.forEach(function (v) { sum += Math.pow((v - 128) / 128, 2); });
    const level = Math.min(1, Math.sqrt(sum / data.length) * 4);
    $('#mic-level').style.width = (level * 100) + '%';
    if (level > 0.12) {
      $('#mic-status').textContent = 'We can hear you';
      $('#mic-pill').className = 'pill pill--ok';
      $('#mic-pill').textContent = 'Working';
    }
    if (!stage.hidden) { audio.close(); return; }       
    requestAnimationFrame(tick);
  })();
}

$('#btn-cam').addEventListener('click', function () {
  if (cameraStream) {                                    
    cameraStream.getTracks().forEach(function (t) { t.stop(); });
    cameraStream = null;
    $('#cam').hidden = true;
    this.setAttribute('aria-pressed', 'false');
    $('span', this).textContent = 'Show camera';
    return;
  }
  const btn = this;
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    cameraStream = stream;
    $('#cam-video').srcObject = stream;
    $('#cam').hidden = false;
    btn.setAttribute('aria-pressed', 'true');
    $('span', btn).textContent = 'Hide camera';
  }).catch(function () { showToast('We couldn’t open your camera. You can continue without it.', 'bad'); });
});

$('#opt-type').addEventListener('change', function () { typeMode = this.checked; updateBeginButton(); });


if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  $('#opt-type').checked = true;
  $('#opt-type').disabled = true;
  $('#btn-mic').disabled = true;
  $('#btn-cam').disabled = true;
  typeMode = true;
  updateBeginButton();
}



$('#btn-begin').addEventListener('click', function () {
  lobby.hidden = true;
  stage.hidden = false;
  $('#ans-voice').hidden = typeMode;
  $('#ans-type').hidden = !typeMode;
  recBtn.hidden = typeMode;
  $('#rm-clock').hidden = false;

  clockTimer = setInterval(function () {                 
    totalSeconds--;
    $('#rm-clock-t').textContent = formatTime(totalSeconds);
    $('#rm-clock').classList.toggle('is-low', totalSeconds <= 60);
    if (totalSeconds <= 0) finishInterview();
  }, 1000);

  showQuestion(0);
});



function showQuestion(i) {
  current = i;
  const item = questionItems[i];
  const total = questionItems.length;
  timePerQuestion = Number(item.dataset.time);

  $('#q-label').textContent = 'Question ' + (i + 1);
  $('#q-text').textContent = item.textContent.trim();
  $('#q-hint').textContent = item.dataset.hint;
  $('#q-hint').hidden = !item.dataset.hint;
  $('#q-count').textContent = 'Question ' + (i + 1) + ' of ' + total;
  $('#q-progress').style.width = (i / total * 100) + '%';
  $('#done-label').textContent = (i === total - 1) ? 'Finish' : 'Done';
  $('#type-input').value = '';
  $('#type-count').textContent = '';

 
  const card = $('#q-card');
  card.classList.remove('is-swapping');
  void card.offsetWidth;                                 
  card.classList.add('is-swapping');

  setRecording(false);
  recBtn.querySelector('#rec-btn-label').textContent = 'Start answering';
  doneBtn.disabled = !typeMode;

  answerSeconds = 0;
  paintTimer();
  clearInterval(questionTimer);
  questionTimer = setInterval(tickQuestion, 1000);
  speak(item.textContent.trim());
}

function paintTimer() {
  const text = formatTime(answerSeconds) + ' / ' + formatTime(timePerQuestion);
  $('#a-time').textContent = text;
  $('#a-time-t').textContent = text;
}

function tickQuestion() {
  if (typeMode || recording) answerSeconds++;           
  paintTimer();
  if (answerSeconds >= timePerQuestion) nextQuestion();  
}

$('#type-input').addEventListener('input', function () {
  const words = this.value.trim().split(/\s+/).filter(Boolean).length;
  $('#type-count').textContent = words ? words + (words === 1 ? ' word' : ' words') : '';
});


let answered = false;                                    

function setRecording(on) {
  recording = on;
  if (on) answered = true;
  $('#rec-state').classList.toggle('is-live', on);
  $('#rec-label').textContent = on ? 'Recording' : (answered ? 'Answer recorded' : 'Ready');
  recBtn.classList.toggle('is-live', on);
  $('#room-wave').classList.toggle('is-live', on);
  if (on) $('#rec-btn-label').textContent = 'Stop';
  else if (answered) $('#rec-btn-label').textContent = 'Record again';
  recBtn.setAttribute('aria-label', $('#rec-btn-label').textContent);
  if (!typeMode) doneBtn.disabled = !answered;
}

recBtn.addEventListener('click', function () {
  if (!recording && !answered) answerSeconds = 0;
  setRecording(!recording);
});



function nextQuestion() {
  answered = false;
  if (current >= questionItems.length - 1) finishInterview();
  else showQuestion(current + 1);
}

function finishInterview() {
  clearInterval(clockTimer);
  clearInterval(questionTimer);
  [micStream, cameraStream].forEach(function (s) { if (s) s.getTracks().forEach(function (t) { t.stop(); }); });
  speechSynthesis.cancel();
  location.href = 'report.html';
}

doneBtn.addEventListener('click', function () {
  if (typeMode && !$('#type-input').value.trim()) {
    showToast('Type your answer first, or skip the question.', 'bad');
    $('#type-input').focus();
    return;
  }
  nextQuestion();
});
$('#skip-confirm').addEventListener('click', nextQuestion);



function speak(text) {
  if (!('speechSynthesis' in window) || !$('#opt-read').checked) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}
$('#btn-say').addEventListener('click', function () {
  const wasOn = $('#opt-read').checked;
  $('#opt-read').checked = true;
  speak($('#q-text').textContent);
  $('#opt-read').checked = wasOn;
});
