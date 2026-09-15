/* LangRush — Solo prototype controller with Phaser integration. Vanilla JS. */
(function () {
  'use strict';

  var LR = window.LR;
  LR.accounts = LR.accounts || Object.create(null);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var state = { screen: 'auth', user: null, race: null };
  var authMode = 'login';
  var lastFocused = null;
  var screensList = ['auth', 'home', 'race', 'results'];
  var game = null;
  var scene = null;
  var sceneReady = false;
  var logicInstance = null;

  function show(screen) {
    state.screen = screen;
    screensList.forEach(function (s) { $('#screen-' + s).hidden = (s !== screen); });
    var el = $('#screen-' + screen);
    var f = el.querySelector('h1, input, button');
    if (f) f.focus();
  }

  function announce(msg) {
    var l = $('#live'); l.textContent = '';
    window.setTimeout(function () { l.textContent = msg; }, 30);
  }

  function setAuthMode(m) {
    authMode = m;
    $('#tab-login').classList.toggle('active', m === 'login');
    $('#tab-register').classList.toggle('active', m === 'register');
    $('#tab-login').setAttribute('aria-selected', m === 'login');
    $('#tab-register').setAttribute('aria-selected', m === 'register');
    $('#auth-title').textContent = m === 'login' ? 'Log in' : 'Create your account';
    $('#auth-submit').textContent = m === 'login' ? 'Log in' : 'Create account';
    setFieldError('username', ''); setFieldError('password', ''); setFormError('');
  }

  function setFieldError(field, msg) {
    $('#err-' + field).textContent = msg;
    $('#auth-' + field).setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function setFormError(msg) { $('#auth-error').textContent = msg; }

  function handleAuthSubmit(e) {
    e.preventDefault();
    var u = $('#auth-username').value.trim();
    var p = $('#auth-password').value;
    setFieldError('username', ''); setFieldError('password', ''); setFormError('');
    var bad = false;
    if (u.length < 3) { setFieldError('username', 'Enter at least 3 characters.'); bad = true; }
    if (p.length < 6) { setFieldError('password', 'Enter at least 6 characters.'); bad = true; }
    if (bad) return;

    var btn = $('#auth-submit'), orig = btn.textContent;
    btn.disabled = true; btn.textContent = 'Please wait…';
    window.setTimeout(function () {
      btn.disabled = false; btn.textContent = orig;
      if (authMode === 'register') {
        if (LR.accounts[u]) { setFormError('Could not complete registration. Please try again.'); return; }
        LR.accounts[u] = { password: p };
        state.user = { username: u }; toHome();
      } else {
        var acc = LR.accounts[u];
        if (!acc || acc.password !== p) { setFormError('Invalid credentials.'); return; }
        state.user = { username: u }; toHome();
      }
    }, 600);
  }

  function toHome() { $('#home-user').textContent = state.user.username; show('home'); }

  function initPhaser() {
    var config = {
      type: Phaser.AUTO,
      parent: 'phaser-game',
      width: 640,
      height: 300,
      backgroundColor: '#f4f5f7',
      scene: LR.Game.RaceScene,
      render: { antialias: true }
    };
    game = new Phaser.Game(config);

    game.events.once('ready', function () {
      scene = game.scene.getScene('RaceScene');
      if (scene) {
        sceneReady = true;
        bindSceneCallbacks();
      }
    });
  }

  function bindSceneCallbacks() {
    if (!scene) return;
    scene.onCheckpointReached = onCheckpointReached;
    scene.onQuestionAnswered = onQuestionAnswered;
    scene.onRaceFinished = onRaceFinished;
  }

  function startRace() {
    if (!logicInstance) {
      logicInstance = new LR.Logic.LangRushLogic(LR.dataset);
    }
    if (!game) {
      initPhaser();
      var checkReady = setInterval(function () {
        if (sceneReady) {
          clearInterval(checkReady);
          scene.setLogic(logicInstance);
          beginRace();
        }
      }, 50);
    } else if (scene) {
      scene.setLogic(logicInstance);
      beginRace();
    }
  }

  function beginRace() {
    scene.resetRace();
    state.race = logicInstance.getState();
    show('race');
  }

  function onCheckpointReached(data) {
    if (!state.race) return;
    state.race = data;

    renderRace();

    if (data.showChoice) {
      openCheckpoint();
    }
  }

  function onQuestionAnswered(data) {
    if (!state.race) return;
    if (data.showQuestion) {
      openQuestion(data.path, data.question);
    } else if (data.showFeedback) {
      showQuestionFeedback(data);
    } else if (data.stunEnded) {
      enableContinue(0);
    }
  }

  function onRaceFinished(data) {
    if (!state.race) return;
    state.race = data;
    finishRace();
  }

  function renderRace() {
    var r = state.race;
    $('#race-progress').innerHTML = '<strong>Checkpoint ' + Math.min(r.checkpoint + 1, r.totalCheckpoints) + ' of ' + r.totalCheckpoints + '</strong>';
    $('#race-position').textContent = 'Position: ' + r.position + ' steps';
    var sc = $('#race-score-correct'), sw = $('#race-score-wrong');
    if (sc) { sc.textContent = '\u2713 ' + r.correct; sc.setAttribute('aria-label', 'Correct: ' + r.correct); }
    if (sw) { sw.textContent = '\u2717 ' + r.incorrect; sw.setAttribute('aria-label', 'Wrong: ' + r.incorrect); }
    var approach = $('#race-approach');
    if (r.isFinished) { approach.hidden = true; }
    else { approach.hidden = false; approach.textContent = 'Approach checkpoint ' + (r.checkpoint + 1); }
  }

  function quitRace() {
    if (window.confirm('Quit this race? Your progress in this run will be lost.')) {
      state.race = null; show('home');
    }
  }

  function openCheckpoint() { openModal('#modal-checkpoint'); }

  function choosePath(pathId) {
    closeModal('#modal-checkpoint');
    if (scene) scene.choosePath(pathId);
  }

  function openQuestion(path, q) {
    $('#q-path').textContent = path.label + ' path — ' + path.icon;
    $('#q-prompt').textContent = q.prompt;
    var img = $('#q-image');
    if (q.image) { img.hidden = false; img.textContent = q.image; img.setAttribute('role', 'img'); img.setAttribute('aria-label', 'Image clue'); }
    else { img.hidden = true; img.textContent = ''; }
    var letters = ['A', 'B', 'C', 'D'];
    var opts = $('#q-options'); opts.innerHTML = '';
    q.options.forEach(function (text, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'option'; b.setAttribute('data-index', i);
      b.setAttribute('aria-pressed', 'false');
      var key = document.createElement('span'); key.className = 'opt-key'; key.textContent = letters[i];
      var txt = document.createElement('span'); txt.className = 'opt-text'; txt.textContent = text;
      b.appendChild(key); b.appendChild(txt);
      b.addEventListener('click', function () { selectOption(i); });
      li.appendChild(b); opts.appendChild(li);
    });
    var fb = $('#q-feedback'); fb.textContent = ''; fb.className = 'q-feedback';
    var submit = $('#q-submit'); submit.hidden = false; submit.disabled = true;
    $('#q-continue').hidden = true;
    openModal('#modal-question');
  }

  function selectOption(i) {
    $all('#q-options .option').forEach(function (b) {
      if (b.disabled) return;
      var on = Number(b.getAttribute('data-index')) === i;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('#q-submit').disabled = false;
  }

  function submitAnswer() {
    var selectedBtn = $('#q-options .option.selected');
    if (!selectedBtn) return;
    var selectedIndex = Number(selectedBtn.getAttribute('data-index'));
    if (scene) scene.submitAnswer(selectedIndex);
  }

  function showQuestionFeedback(data) {
    var correct = data.correct;
    var path = data.path;
    var question = data.question;

    $all('#q-options .option').forEach(function (b) {
      var idx = Number(b.getAttribute('data-index'));
      b.disabled = true;
      if (idx === question.correct) b.classList.add('is-correct');
      if (idx === data.selectedIndex && !correct) b.classList.add('is-wrong');
    });

    $('#q-submit').hidden = true;
    var fb = $('#q-feedback');

    if (correct) {
      fb.className = 'q-feedback ok';
      fb.innerHTML = '<span class="fb-icon">\u2713</span> Correct — advance ' + path.step + ' step' + (path.step > 1 ? 's' : '');
      announce('Correct. Advancing ' + path.step + ' steps.');
      enableContinue(reduceMotion ? 0 : 450);
    } else {
      fb.className = 'q-feedback bad';
      fb.innerHTML = '<span class="fb-icon">\u2717</span> Wrong — stunned ' + (path.stun / 1000) + 's' + (path.back ? ', back ' + path.back : '');
      announce('Wrong. Stunned for ' + (path.stun / 1000) + ' seconds.');
    }
  }

  function enableContinue(delay) {
    var c = $('#q-continue'); c.hidden = false; c.disabled = true; c.textContent = '…';
    window.setTimeout(function () { c.disabled = false; c.textContent = 'Continue'; c.focus(); }, delay);
  }

  function continueRace() {
    closeModal('#modal-question');
    if (scene) scene.continueRace();
  }

  function finishRace() {
    var r = state.race;
    $('#res-correct').textContent = r.correct;
    $('#res-incorrect').textContent = r.incorrect;
    $('#res-position').textContent = r.position;
    var vl = $('#res-vocab'); vl.innerHTML = '';
    if (!r.vocab.length) { var li0 = document.createElement('li'); li0.textContent = '—'; vl.appendChild(li0); }
    else r.vocab.forEach(function (v) { var li = document.createElement('li'); li.textContent = v; vl.appendChild(li); });
    show('results');
  }

  function openModal(sel) {
    var m = $(sel); lastFocused = document.activeElement;
    m.hidden = false; document.body.classList.add('modal-open');
    var f = m.querySelector('button:not([disabled]), input, [tabindex]');
    if (f) f.focus();
    m._trap = function (e) { trapKeys(e, m); };
    m.addEventListener('keydown', m._trap);
  }

  function closeModal(sel) {
    var m = $(sel); m.hidden = true; document.body.classList.remove('modal-open');
    if (m._trap) m.removeEventListener('keydown', m._trap);
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  function trapKeys(e, m) {
    if (e.key !== 'Tab') return;
    var items = $all('button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', m).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  document.addEventListener('keydown', function (e) {
    if (!$('#modal-question').hidden) {
      var map = { a: 0, b: 1, c: 2, d: 3 }, k = e.key.toLowerCase();
      if (map[k] != null) {
        var btn = $('#q-options .option[data-index="' + map[k] + '"]');
        if (btn && !btn.disabled) { selectOption(map[k]); btn.focus(); e.preventDefault(); }
      } else if (e.key === 'Enter') {
        var s = $('#q-submit'), c = $('#q-continue');
        if (!s.hidden && !s.disabled) { submitAnswer(); e.preventDefault(); }
        else if (!c.hidden && !c.disabled) { continueRace(); e.preventDefault(); }
      }
      return;
    }
    if (!$('#modal-checkpoint').hidden) {
      var pm = { e: 'easy', m: 'medium', h: 'hard' }, kk = e.key.toLowerCase();
      if (pm[kk]) { choosePath(pm[kk]); e.preventDefault(); }
      else if (e.key === 'Escape') { closeModal('#modal-checkpoint'); }
    }
  });

  function init() {
    $('#tab-login').addEventListener('click', function () { setAuthMode('login'); });
    $('#tab-register').addEventListener('click', function () { setAuthMode('register'); });
    $('#auth-form').addEventListener('submit', handleAuthSubmit);
    $('#home-start').addEventListener('click', startRace);
    $('#home-logout').addEventListener('click', function () { state.user = null; show('auth'); });
    $('#race-approach').addEventListener('click', function () { if (scene) scene.approachCheckpoint(); });
    $('#race-quit').addEventListener('click', quitRace);
    $all('#modal-checkpoint .path-card').forEach(function (b) {
      b.addEventListener('click', function () { choosePath(b.getAttribute('data-path')); });
    });
    $('#cp-cancel').addEventListener('click', function () { closeModal('#modal-checkpoint'); });
    $('#q-submit').addEventListener('click', submitAnswer);
    $('#q-continue').addEventListener('click', continueRace);
    $('#res-again').addEventListener('click', startRace);
    $('#res-home').addEventListener('click', function () { show('home'); });
    setAuthMode('login'); show('auth');

    initPhaser();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();