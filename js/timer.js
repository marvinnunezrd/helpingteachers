const timerDisplay = document.getElementById("timerDisplay");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const timerCard = document.getElementById("timerCard");
const presetButtons = document.querySelectorAll("[data-minutes]");

const TIMER_STORAGE_KEY = "helpingTeachers.timer.settings";

let totalSeconds = 300;
let remainingSeconds = 300;
let timerInterval = null;
let isRunning = false;
let timerSaveTimer = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getTimerSettings() {
  return {
    minutes: Number(minutesInput.value) || 0,
    seconds: Number(secondsInput.value) || 0
  };
}

function saveTimerSettings() {
  const settings = getTimerSettings();
  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(settings));

  window.clearTimeout(timerSaveTimer);
  timerSaveTimer = window.setTimeout(() => {
    if (window.HelpingTeachersAuth && window.HelpingTeachersAuth.isSignedIn()) {
      window.HelpingTeachersAuth.saveToolSetting("timer", "settings", settings);
    }
  }, 700);
}

function applyTimerSettings(settings) {
  if (!settings) return false;

  minutesInput.value = Math.max(0, Number(settings.minutes) || 0);
  secondsInput.value = Math.min(59, Math.max(0, Number(settings.seconds) || 0));

  totalSeconds = (Number(minutesInput.value) || 0) * 60 + (Number(secondsInput.value) || 0);
  remainingSeconds = totalSeconds;
  updateDisplay();
  return true;
}

function loadLocalTimerSettings() {
  try {
    return JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

async function loadCloudTimerSettings() {
  if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn()) return;

  const { data, error } = await window.HelpingTeachersAuth.getToolSetting("timer", "settings");
  if (!error && data && applyTimerSettings(data)) {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
  }
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);

  timerCard.classList.remove("timer-warning", "timer-finished");

  if (remainingSeconds === 0) {
    timerCard.classList.add("timer-finished");
  } else if (remainingSeconds <= 60 && isRunning) {
    timerCard.classList.add("timer-warning");
  }
}

function readInputs() {
  const minutes = Math.max(0, Number(minutesInput.value) || 0);
  const seconds = Math.min(59, Math.max(0, Number(secondsInput.value) || 0));

  totalSeconds = minutes * 60 + seconds;
  remainingSeconds = totalSeconds;

  updateDisplay();
  saveTimerSettings();
}

function startTimer() {
  if (isRunning) return;

  if (remainingSeconds <= 0) {
    readInputs();
  }

  if (remainingSeconds <= 0) return;

  isRunning = true;
  updateDisplay();

  timerInterval = setInterval(() => {
    remainingSeconds -= 1;
    updateDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      playFinishSound();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  updateDisplay();
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = totalSeconds;
  updateDisplay();
}

function setPreset(minutes) {
  pauseTimer();

  minutesInput.value = minutes;
  secondsInput.value = 0;

  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;

  updateDisplay();
  saveTimerSettings();
}

function playFinishSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  } catch (error) {
    console.log("Audio notification not available.");
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    timerCard.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

minutesInput.addEventListener("change", readInputs);
secondsInput.addEventListener("change", readInputs);

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
fullscreenBtn.addEventListener("click", toggleFullscreen);

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPreset(Number(button.dataset.minutes));
  });
});

applyTimerSettings(loadLocalTimerSettings());
if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
  window.HelpingTeachersAuth.onReady(loadCloudTimerSettings);
}
updateDisplay();