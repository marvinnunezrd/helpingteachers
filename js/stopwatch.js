const stopwatchDisplay = document.getElementById("stopwatchDisplay");
const startStopwatchBtn = document.getElementById("startStopwatchBtn");
const pauseStopwatchBtn = document.getElementById("pauseStopwatchBtn");
const resetStopwatchBtn = document.getElementById("resetStopwatchBtn");
const fullscreenStopwatchBtn = document.getElementById("fullscreenStopwatchBtn");
const stopwatchCard = document.getElementById("stopwatchCard");

let stopwatchInterval = null;
let startTime = 0;
let elapsedTime = 0;
let isStopwatchRunning = false;

function formatStopwatchTime(milliseconds) {
  const totalCentiseconds = Math.floor(milliseconds / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function updateStopwatchDisplay() {
  const currentElapsed = isStopwatchRunning
    ? Date.now() - startTime + elapsedTime
    : elapsedTime;

  stopwatchDisplay.textContent = formatStopwatchTime(currentElapsed);
}

function startStopwatch() {
  if (isStopwatchRunning) return;

  startTime = Date.now();
  isStopwatchRunning = true;

  stopwatchInterval = setInterval(updateStopwatchDisplay, 10);
}

function pauseStopwatch() {
  if (!isStopwatchRunning) return;

  elapsedTime += Date.now() - startTime;
  isStopwatchRunning = false;

  clearInterval(stopwatchInterval);
  stopwatchInterval = null;

  updateStopwatchDisplay();
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);

  stopwatchInterval = null;
  startTime = 0;
  elapsedTime = 0;
  isStopwatchRunning = false;

  updateStopwatchDisplay();
}

function toggleStopwatchFullscreen() {
  if (!document.fullscreenElement) {
    stopwatchCard.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

startStopwatchBtn.addEventListener("click", startStopwatch);
pauseStopwatchBtn.addEventListener("click", pauseStopwatch);
resetStopwatchBtn.addEventListener("click", resetStopwatch);
fullscreenStopwatchBtn.addEventListener("click", toggleStopwatchFullscreen);

updateStopwatchDisplay();