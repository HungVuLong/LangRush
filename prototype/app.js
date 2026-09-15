/* LangRush — Solo prototype controller. Vanilla JS. No network/DB/storage. State resets on reload. */
(function () {
  'use strict';
  var cfg = LR.config, QB = LR.questions;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var state = { screen: 'auth', user: null, race: null };
  var authMode = 'login';
  var lastFocused = null;
  var screensList = ['auth', 'home', 'race', 'results'];

  /* ---------- screens ---------- */
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

  /* ---------- auth (FR-1, FR-2, FR-5, FR-31; US-1, US-2) ---------- */
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
    btn.disabled = true; btn.textContent = 'Please wait\u2026'; // loading state
    window.setTimeout(function () {          // simulated auth
      btn.disabled = false; btn.textContent = orig;
      if (authMode === 'register') {
        if (LR.accounts[u]) { setFormError('Could not complete registration. Please try again.'); return; } // generic, no enumeration
        LR.accounts[u] = { password: p };
        state.user = { username: u }; toHome();
      } else {
        var acc = LR.accounts[u];
        if (!acc || acc.password !== p) { setFormError('Invalid credentials.'); return; } // single generic message
        state.user = { username: u }; toHome();
      }
    }, 600);
  }
  function toHome() { $('#home-user').textContent = state.user.username; show('home'); }

  /* ---------- race (FR-6, FR-7, FR-12) ---------- */
  function startRace() {
    state.race = { checkpoint: 0, total: cfg.checkpoints, position: 0, correct: 0, incorrect: 0, vocab: [], current: null };
    renderRace(); show('race');
  }
  function renderRace() {
    var r = state.race;
    $('#race-progress').innerHTML = '<strong>Checkpoint ' + Math.min(r.checkpoint + 1, r.total) + ' of ' + r.total + '</strong>';
    $('#race-position').textContent = 'Position: ' + r.position + ' steps';
    // P2-R2: update labelled score spans so screen readers get "Correct: N" / "Wrong: N"
    var sc = $('#race-score-correct'), sw = $('#race-score-wrong');
    if (sc) { sc.textContent = '\u2713 ' + r.correct; sc.setAttribute('aria-label', 'Correct: ' + r.correct); }
    if (sw) { sw.textContent = '\u2717 ' + r.incorrect; sw.setAttribute('aria-label', 'Wrong: ' + r.incorrect); }
    var pct = Math.max(0, Math.min(100, (r.position / cfg.maxSteps) * 100));
    var token = $('#track-token');
    if (reduceMotion) token.style.transition = 'none';
    token.style.left = pct + '%';
    var approach = $('#race-approach');
    if (r.checkpoint >= r.total) { approach.hidden = true; }
    else { approach.hidden = false; approach.textContent = 'Approach checkpoint ' + (r.checkpoint + 1); }
  }
  function quitRace() { // destructive action -> intentional confirmation (feature-spec §7)
    if (window.confirm('Quit this race? Your progress in this run will be lost.')) {
      state.race = null; show('home');
    }
  }

  /* ---------- checkpoint + question (FR-8..FR-11, FR-13) ---------- */
  function openCheckpoint() { openModal('#modal-checkpoint'); }
  function choosePath(pathId) {
    closeModal('#modal-checkpoint');
    var path = cfg.paths[pathId];
    var pool = QB[pathId];
    var q = pool[Math.floor(Math.random() * pool.length)];
    state.race.current = { path: path, q: q, selected: null };
    openQuestion(path, q);
  }
  function openQuestion(path, q) {
    $('#q-path').textContent = path.label + ' path \u2014 ' + path.icon;
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
    if (!state.race || !state.race.current) return;
    state.race.current.selected = i;
    $all('#q-options .option').forEach(function (b) {
      if (b.disabled) return;
      var on = Number(b.getAttribute('data-index')) === i;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('#q-submit').disabled = false;
  }
  function submitAnswer() {
    var cur = state.race.current; if (!cur || cur.selected == null) return;
    var correct = cur.selected === cur.q.correct;
    $all('#q-options .option').forEach(function (b) {
      var idx = Number(b.getAttribute('data-index'));
      b.disabled = true;
      if (idx === cur.q.correct) b.classList.add('is-correct');
      if (idx === cur.selected && !correct) b.classList.add('is-wrong');
    });
    $('#q-submit').hidden = true;
    var r = state.race, fb = $('#q-feedback');
    if (r.vocab.indexOf(cur.q.vocab) === -1) r.vocab.push(cur.q.vocab);
    if (correct) { // simulated speed boost
      r.correct++; r.position += cur.path.step;
      fb.className = 'q-feedback ok';
      fb.innerHTML = '<span class="fb-icon">\u2713</span> Correct \u2014 advance ' + cur.path.step + ' step' + (cur.path.step > 1 ? 's' : '');
      announce('Correct. Advancing ' + cur.path.step + ' steps.');
      enableContinue(reduceMotion ? 0 : 450);
    } else { // penalty-then-continue (default)
      r.incorrect++;
      if (cur.path.back) r.position = Math.max(0, r.position - cur.path.back);
      fb.className = 'q-feedback bad';
      fb.innerHTML = '<span class="fb-icon">\u2717</span> Wrong \u2014 stunned ' + (cur.path.stun / 1000) + 's' + (cur.path.back ? ', back ' + cur.path.back : '');
      announce('Wrong. Stunned for ' + (cur.path.stun / 1000) + ' seconds.');
      startStun(cur.path.stun);
    }
  }
  function enableContinue(delay) {
    var c = $('#q-continue'); c.hidden = false; c.disabled = true; c.textContent = '\u2026';
    window.setTimeout(function () { c.disabled = false; c.textContent = 'Continue'; c.focus(); }, delay);
  }
  function startStun(ms) { // simulated stun: block Continue for the duration
    var c = $('#q-continue'); c.hidden = false; c.disabled = true;
    var modal = $('#modal-question');
    if (!reduceMotion) modal.classList.add('shake');
    var remaining = ms;
    function label() { c.textContent = 'Stunned\u2026 ' + (remaining / 1000).toFixed(1) + 's'; }
    label();
    var iv = window.setInterval(function () {
      remaining -= 100;
      if (remaining <= 0) {
        window.clearInterval(iv);
        modal.classList.remove('shake');
        c.disabled = false; c.textContent = 'Continue'; c.focus();
        announce('Stun ended. Continue available.'); // P1-Q2: notify AT when stun expires
      } else { label(); }
    }, 100);
  }
  function continueRace() {
    closeModal('#modal-question');
    var r = state.race; r.checkpoint++;
    renderRace();
    if (r.checkpoint >= r.total) finishRace();
    else $('#race-approach').focus();
  }
  function finishRace() { // FR-13 results summary
    var r = state.race;
    $('#res-correct').textContent = r.correct;
    $('#res-incorrect').textContent = r.incorrect;
    $('#res-position').textContent = r.position;
    var vl = $('#res-vocab'); vl.innerHTML = '';
    if (!r.vocab.length) { var li0 = document.createElement('li'); li0.textContent = '\u2014'; vl.appendChild(li0); }
    else r.vocab.forEach(function (v) { var li = document.createElement('li'); li.textContent = v; vl.appendChild(li); });
    show('results');
  }

  /* ---------- modals + focus trap ---------- */
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

  /* ---------- global keyboard (A/B/C/D answers; E/M/H paths) ---------- */
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

  /* ---------- init ---------- */
  function init() {
    $('#tab-login').addEventListener('click', function () { setAuthMode('login'); });
    $('#tab-register').addEventListener('click', function () { setAuthMode('register'); });
    $('#auth-form').addEventListener('submit', handleAuthSubmit);
    $('#home-start').addEventListener('click', startRace);
    $('#home-logout').addEventListener('click', function () { state.user = null; show('auth'); });
    $('#race-approach').addEventListener('click', openCheckpoint);
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
