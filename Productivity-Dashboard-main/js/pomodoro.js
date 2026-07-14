// ==========================================
// POMODORO TIMER MANAGER
// ==========================================
function initPomodoro() {
  elements.pomodoroModesBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.pomodoroModesBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const mode = btn.getAttribute("data-mode");
      setPomodoroMode(mode);
    });
  });

  elements.pomodoroPresetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.pomodoroPresetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const minutes = parseInt(btn.getAttribute("data-time"));
      elements.customTimeVal.value = "";
      setCustomTimerMinutes(minutes);
    });
  });

  elements.timerStartBtn.addEventListener("click", startTimer);
  elements.timerPauseBtn.addEventListener("click", pauseTimer);
  elements.timerResetBtn.addEventListener("click", resetTimer);

  elements.miniTimerStartBtn.addEventListener("click", () => {
    if (AppState.pomodoro.timerId) {
      pauseTimer();
    } else {
      startTimer();
    }
  });
  elements.miniTimerResetBtn.addEventListener("click", resetTimer);

  elements.applyCustomTimeBtn.addEventListener("click", () => {
    const value = parseInt(elements.customTimeVal.value);
    if (value && value > 0 && value <= 180) {
      elements.pomodoroPresetBtns.forEach(b => b.classList.remove("active"));
      setCustomTimerMinutes(value);
    }
  });

  elements.sessionsCountStrong.textContent = AppState.pomodoro.sessionsCompleted;
  updateTimerDisplay();
}

function setPomodoroMode(mode) {
  pauseTimer();
  AppState.pomodoro.currentMode = mode;

  if (mode === "focus") {
    elements.timerLabel.textContent = "Focus session";
    setCustomTimerMinutes(AppState.pomodoro.customFocus);
  } else if (mode === "short") {
    elements.timerLabel.textContent = "Short break";
    setCustomTimerMinutes(AppState.pomodoro.customShort);
  } else if (mode === "long") {
    elements.timerLabel.textContent = "Long break";
    setCustomTimerMinutes(AppState.pomodoro.customLong);
  }
}

function setCustomTimerMinutes(minutes) {
  const seconds = minutes * 60;
  AppState.pomodoro.duration = seconds;
  AppState.pomodoro.timeLeft = seconds;

  if (AppState.pomodoro.currentMode === "focus") {
    AppState.pomodoro.customFocus = minutes;
  } else if (AppState.pomodoro.currentMode === "short") {
    AppState.pomodoro.customShort = minutes;
  } else if (AppState.pomodoro.currentMode === "long") {
    AppState.pomodoro.customLong = minutes;
  }

  updateTimerDisplay();
}

function startTimer() {
  if (AppState.pomodoro.timerId) return;

  elements.timerStartBtn.classList.add("hidden");
  elements.timerPauseBtn.classList.remove("hidden");
  elements.miniTimerStartBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;

  AppState.pomodoro.timerId = setInterval(() => {
    AppState.pomodoro.timeLeft--;
    updateTimerDisplay();

    if (AppState.pomodoro.timeLeft <= 0) {
      clearInterval(AppState.pomodoro.timerId);
      AppState.pomodoro.timerId = null;

      playChimeAlert();

      if (AppState.pomodoro.currentMode === "focus") {
        AppState.pomodoro.sessionsCompleted++;
        localStorage.setItem("pomodoroSessions", AppState.pomodoro.sessionsCompleted);
        elements.sessionsCountStrong.textContent = AppState.pomodoro.sessionsCompleted;

        elements.pomodoroModesBtns.forEach(b => b.classList.remove("active"));
        document.querySelector("#mode-short").classList.add("active");
        setPomodoroMode("short");
      } else {
        elements.pomodoroModesBtns.forEach(b => b.classList.remove("active"));
        document.querySelector("#mode-focus").classList.add("active");
        setPomodoroMode("focus");
      }

      elements.timerStartBtn.classList.remove("hidden");
      elements.timerPauseBtn.classList.add("hidden");
      elements.miniTimerStartBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
    }
  }, 1000);
}

function pauseTimer() {
  if (!AppState.pomodoro.timerId) return;

  clearInterval(AppState.pomodoro.timerId);
  AppState.pomodoro.timerId = null;

  elements.timerStartBtn.classList.remove("hidden");
  elements.timerPauseBtn.classList.add("hidden");
  elements.miniTimerStartBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
}

function resetTimer() {
  pauseTimer();
  AppState.pomodoro.timeLeft = AppState.pomodoro.duration;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(AppState.pomodoro.timeLeft / 60);
  const seconds = AppState.pomodoro.timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  elements.timerCountdown.textContent = timeFormatted;
  elements.miniTimerDisplay.textContent = timeFormatted;
  elements.miniTimerMode.textContent = AppState.pomodoro.currentMode === "focus" ? "Focus session" : "Break";

  const progressPercent = AppState.pomodoro.timeLeft / AppState.pomodoro.duration;
  const circumference = 2 * Math.PI * 100;
  const offset = circumference - (progressPercent * circumference);
  elements.timerProgressCircle.style.strokeDashoffset = offset;
}

function playChimeAlert() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.4);

    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.5);
    }, 150);
  } catch (e) {
    console.warn("Audio Context alert failed to execute:", e);
  }
}