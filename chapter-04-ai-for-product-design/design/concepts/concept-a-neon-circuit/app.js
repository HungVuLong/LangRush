/* Concept A — Neon Circuit — app logic.
   Vanilla JS. No network, no storage. In-memory state that resets on reload. */
(function () {
  'use strict';

  const D = window.NEON;
  const $ = (id) => document.getElementById(id);

  // ---------- element refs ----------
  const screens = {
    auth: $('nc-screen-auth'),
    home: $('nc-screen-home'),
    race: $('nc-screen-race'),
    results: $('nc-screen-results')
  };

  const tabLogin = $('nc-tab-login');
  const tabRegister = $('nc-tab-register');
  const form = $('nc-authform');
  const usernameEl = $('nc-username');
  const passwordEl = $('nc-password');
  const usernameErr = $('nc-username-err');
  const passwordErr = $('nc-password-err');
  const genericErr = $('nc-auth-generic');
  const genericErrTxt = genericErr.querySelector('.nc-generic-err__txt');
  const submitBtn = $('nc-auth-submit');
  const submitLabel = submitBtn.querySelector('.nc-btn__label');
  const spinner = submitBtn.querySelector('.nc-spinner');

  const pathOverlay = $('nc-path-overlay');
  const pathModal = $('nc-path-modal');
  const qOverlay = $('nc-q-overlay');
  const qModal = $('nc-q-modal');
  const qBadge = $('nc-q-badge');
  const qTitle = $('nc-q-title');
  const qGlyph = $('nc-q-glyph');
  const qOptions = $('nc-q-options');
  const qFeedback = $('nc-q-feedback');
  const qSubmit = $('nc-q-submit');
  const qContinue = $('nc-q-continue');

  const statusEl = $('nc-status');
  const laneNodes = $('nc-lane-nodes');
  const token = $('nc-token');

  // ---------- runtime state ----------
  let mode = 'login';
  let currentUser = null;
  let race = null;
  let selectedPath = null;
  let currentQuestion = null;
  let currentSelection = -1;
  let stunTimer = null;
  let lastFocused = null;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- screen management ----------
  function show(name) {
    Object.keys(screens).forEach((k) => { screens[k].hidden = (k !== name); });
  }

  // ---------- AUTH ----------
  function setMode(next) {
    mode = next;
    const login = next === 'login';
    tabLogin.classList.toggle('is-active', login);
    tabRegister.classList.toggle('is-active', !login);
    tabLogin.setAttribute('aria-selected', String(login));
    tabRegister.setAttribute('aria-selected', String(!login));
    submitLabel.textContent = login ? 'Login' : 'Register';
    passwordEl.autocomplete = login ? 'current-password' : 'new-password';
    clearErrors();
  }

  function clearErrors() {
    [usernameErr, passwordErr].forEach((e) => { e.hidden = true; e.textContent = ''; });
    usernameEl.removeAttribute('aria-invalid');
    passwordEl.removeAttribute('aria-invalid');
    genericErr.hidden = true;
  }

  function validate() {
    let ok = true;
    const u = usernameEl.value.trim();
    const p = passwordEl.value;
    if (u.length < 3) {
      usernameErr.textContent = 'Username must be at least 3 characters.';
      usernameErr.hidden = false; usernameEl.setAttribute('aria-invalid', 'true'); ok = false;
    }
    if (p.length < 6) {
      passwordErr.textContent = 'Password must be at least 6 characters.';
      passwordErr.hidden = false; passwordEl.setAttribute('aria-invalid', 'true'); ok = false;
    }
    return ok;
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    spinner.hidden = !on;
    submitLabel.textContent = on ? 'Working…' : (mode === 'login' ? 'Login' : 'Register');
  }

  function showGeneric() {
    // Single generic message — never reveals which field/account failed.
    genericErrTxt.textContent = 'Login failed. Check your details and try again.';
    genericErr.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;
    const u = usernameEl.value.trim();
    const p = passwordEl.value;
    setLoading(true);
    // SIMULATED auth via setTimeout — purely in-memory, no network.
    setTimeout(function () {
      setLoading(false);
      if (mode === 'register') {
        if (D.accounts[u]) { showGeneric(); return; } // do not enumerate; generic message
        D.accounts[u] = { password: p };
        currentUser = u;
        enterHome();
      } else {
        const acct = D.accounts[u];
        if (!acct || acct.password !== p) { showGeneric(); return; }
        currentUser = u;
        enterHome();
      }
    }, 650);
  });

  tabLogin.addEventListener('click', () => setMode('login'));
  tabRegister.addEventListener('click', () => setMode('register'));

  // ---------- HOME ----------
  function enterHome() {
    $('nc-home-user').textContent = currentUser;
    form.reset(); clearErrors();
    show('home');
    $('nc-start-solo').focus();
  }

  $('nc-logout').addEventListener('click', function () {
    currentUser = null; race = null;
    show('auth'); usernameEl.focus();
  });

  $('nc-start-solo').addEventListener('click', startRace);
  $('nc-play-again').addEventListener('click', startRace);
  $('nc-to-home').addEventListener('click', () => { show('home'); $('nc-start-solo').focus(); });

  // ---------- RACE ----------
  function startRace() {
    race = { checkpoint: 0, position: 0, correct: 0, wrong: 0, steps: 0, vocab: [] };
    buildLane();
    updateStatus();
    show('race');
    $('nc-approach').focus();
  }

  function buildLane() {
    laneNodes.innerHTML = '';
    for (let i = 0; i < D.CHECKPOINTS; i++) {
      const n = document.createElement('span');
      n.className = 'nc-node';
      n.dataset.index = String(i);
      laneNodes.appendChild(n);
    }
    positionToken();
  }

  function positionToken() {
    const maxSteps = D.CHECKPOINTS * 4; // max step total to scale token travel
    const pct = Math.max(0, Math.min(1, race.position / maxSteps));
    token.style.left = (4 + pct * 92) + '%';
    [...laneNodes.children].forEach((n, i) => {
      n.classList.toggle('is-done', i < race.checkpoint);
    });
  }

  function updateStatus() {
    statusEl.textContent =
      'Checkpoint ' + Math.min(race.checkpoint + 1, D.CHECKPOINTS) + ' of ' + D.CHECKPOINTS +
      ' · Position ' + race.position + ' steps · ✓ ' + race.correct + ' · ✗ ' + race.wrong;
  }

  $('nc-approach').addEventListener('click', openPathModal);

  $('nc-quit').addEventListener('click', function () {
    if (window.confirm('Quit this run? Your progress will be lost.')) {
      show('home'); $('nc-start-solo').focus();
    }
  });

  // ---------- MODAL focus trap ----------
  function focusablesIn(el) {
    return [...el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((n) => !n.disabled && n.offsetParent !== null);
  }
  function trap(e, modal) {
    if (e.key !== 'Tab') return;
    const f = focusablesIn(modal);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ---------- PATH MODAL ----------
  function openPathModal() {
    lastFocused = document.activeElement;
    pathOverlay.hidden = false;
    const first = pathModal.querySelector('.nc-path');
    if (first) first.focus();
  }
  function closePathModal() { pathOverlay.hidden = true; }

  pathModal.querySelectorAll('.nc-path').forEach((btn) => {
    btn.addEventListener('click', () => choosePath(btn.dataset.path));
  });

  pathOverlay.addEventListener('keydown', function (e) {
    trap(e, pathModal);
    const k = e.key.toLowerCase();
    if (k === 'e') choosePath('easy');
    else if (k === 'm') choosePath('medium');
    else if (k === 'h') choosePath('hard');
  });

  function choosePath(key) {
    selectedPath = D.PATHS[key];
    closePathModal();
    openQuestion();
  }

  // ---------- QUESTION MODAL ----------
  function openQuestion() {
    const bank = D.BANK[selectedPath.key];
    currentQuestion = bank[Math.floor(Math.random() * bank.length)];
    currentSelection = -1;

    qBadge.textContent = selectedPath.label + ' Path · ' + selectedPath.type;
    qTitle.textContent = currentQuestion.ask;

    if (currentQuestion.glyph) {
      qGlyph.hidden = false; qGlyph.textContent = currentQuestion.glyph;
      qGlyph.setAttribute('role', 'img');
      qGlyph.setAttribute('aria-label', 'Picture clue');
    } else {
      qGlyph.hidden = true; qGlyph.textContent = '';
    }

    // build options
    qOptions.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    currentQuestion.choices.forEach((choice, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nc-option';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      b.dataset.index = String(i);
      b.innerHTML = '<span class="nc-option__key" aria-hidden="true">' + letters[i] +
        '</span><span class="nc-option__txt"></span>';
      b.querySelector('.nc-option__txt').textContent = choice;
      b.addEventListener('click', () => selectOption(i));
      qOptions.appendChild(b);
    });

    qFeedback.hidden = true; qFeedback.className = 'nc-feedback';
    qFeedback.textContent = '';
    qSubmit.hidden = false; qSubmit.disabled = true;
    qContinue.hidden = true;

    lastFocused = document.activeElement;
    qOverlay.hidden = false;
    const first = qOptions.querySelector('.nc-option');
    if (first) first.focus();
  }

  function selectOption(i) {
    if (qSubmit.hidden) return; // locked after submit
    currentSelection = i;
    [...qOptions.children].forEach((b, idx) => {
      b.setAttribute('aria-checked', String(idx === i));
    });
    qSubmit.disabled = false;
  }

  qOptions.addEventListener('keydown', function (e) {
    const map = { a: 0, b: 1, c: 2, d: 3 };
    const k = e.key.toLowerCase();
    if (k in map && !qSubmit.hidden) {
      const idx = map[k];
      if (idx < currentQuestion.choices.length) {
        selectOption(idx);
        qOptions.children[idx].focus();
      }
    }
  });

  qOverlay.addEventListener('keydown', function (e) {
    trap(e, qModal);
    if (e.key === 'Enter' && !qSubmit.hidden && !qSubmit.disabled) {
      e.preventDefault(); submitAnswer();
    }
  });

  qSubmit.addEventListener('click', submitAnswer);

  function submitAnswer() {
    if (currentSelection < 0) return;
    const correct = currentSelection === currentQuestion.answer;

    // lock options
    [...qOptions.children].forEach((b, idx) => {
      b.disabled = true;
      if (idx === currentQuestion.answer) b.classList.add('is-correct');
      else if (idx === currentSelection) b.classList.add('is-wrong');
    });
    qSubmit.hidden = true;

    // record vocab touched
    if (currentQuestion.vocab && !race.vocab.includes(currentQuestion.vocab)) {
      race.vocab.push(currentQuestion.vocab);
    }

    if (correct) {
      race.correct++;
      race.position += selectedPath.step;
      race.steps += selectedPath.step;
      positionToken();
      qFeedback.className = 'nc-feedback is-correct';
      qFeedback.textContent = '✓ Correct! Boost +' + selectedPath.step + ' steps.';
      qFeedback.hidden = false;
      qContinue.hidden = false; qContinue.disabled = false; qContinue.textContent = 'Continue';
      qContinue.focus();
    } else {
      race.wrong++;
      if (selectedPath.back > 0) {
        race.position = Math.max(0, race.position - selectedPath.back);
        positionToken();
      }
      qFeedback.className = 'nc-feedback is-wrong';
      qContinue.hidden = false; qContinue.disabled = true;
      startStun();
    }
  }

  function startStun() {
    const total = selectedPath.stunMs;
    document.body.classList.add('is-stunned');
    const backTxt = selectedPath.back > 0 ? ' ↩ Moved back ' + selectedPath.back + ' step.' : '';
    let remaining = total;
    function render() {
      qFeedback.textContent = '✗ Wrong — Stunned.' + backTxt +
        ' Continue in ' + (remaining / 1000).toFixed(1) + 's';
      qFeedback.hidden = false;
    }
    render();
    stunTimer = setInterval(function () {
      remaining -= 100;
      if (remaining <= 0) {
        clearInterval(stunTimer); stunTimer = null;
        document.body.classList.remove('is-stunned');
        qFeedback.textContent = '✗ Wrong — Stun over.' + backTxt + ' You may continue.';
        qContinue.disabled = false;
        qContinue.focus();
      } else {
        render();
      }
    }, 100);
  }

  qContinue.addEventListener('click', function () {
    qOverlay.hidden = true;
    race.checkpoint++;
    updateStatus();
    positionToken();
    if (race.checkpoint >= D.CHECKPOINTS) {
      showResults();
    } else {
      show('race');
      $('nc-approach').focus();
    }
  });

  // ---------- RESULTS ----------
  function showResults() {
    $('nc-res-correct').textContent = race.correct;
    $('nc-res-wrong').textContent = race.wrong;
    $('nc-res-steps').textContent = race.steps;
    const list = $('nc-res-vocab');
    list.innerHTML = '';
    if (!race.vocab.length) {
      const li = document.createElement('li'); li.textContent = '(none)'; list.appendChild(li);
    } else {
      race.vocab.forEach((v) => {
        const li = document.createElement('li'); li.textContent = v; list.appendChild(li);
      });
    }
    show('results');
    $('nc-play-again').focus();
  }

  // ---------- Escape closes modals back to a safe state ----------
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!pathOverlay.hidden) { closePathModal(); show('race'); $('nc-approach').focus(); }
    }
  });

  // ---------- init ----------
  setMode('login');
  show('auth');
})();
