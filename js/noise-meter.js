document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".noise-meter-card");

  if (!card) return;

  const toggleBtn = document.getElementById("toggleNoiseBtn");
  const alertToggle = document.getElementById("noiseAlertToggle");

  const noiseEmoji = document.getElementById("noiseEmoji");
  const noiseStatus = document.getElementById("noiseStatus");
  const noiseValue = document.getElementById("noiseValue");
  const noiseMeterBar = document.getElementById("noiseMeterBar");

  const START_MESSAGE = card.dataset.startMessage || "Start Monitoring";
  const STOP_MESSAGE = card.dataset.stopMessage || "Stop Monitoring";
  const READY_MESSAGE =
    card.dataset.readyMessage || "Waiting for microphone...";

  const QUIET_MESSAGE = card.dataset.quietMessage || "Quiet";
  const MEDIUM_MESSAGE = card.dataset.mediumMessage || "Getting Loud";
  const LOUD_MESSAGE = card.dataset.loudMessage || "Too Loud";
  const MIC_ERROR_MESSAGE =
    card.dataset.micErrorMessage || "Microphone access is needed.";

  const LOW_THRESHOLD = 30;
  const HIGH_THRESHOLD = 65;
  const ALERT_COOLDOWN = 5000;

  let audioContext = null;
  let analyser = null;
  let microphone = null;
  let dataArray = null;
  let animationId = null;
  let stream = null;
  let isMonitoring = false;
  let lastAlertTime = 0;
  const NOISE_STORAGE_KEY = "helpingTeachers.noiseMeter.settings";


  function getNoiseSettings() {
    return { alertEnabled: Boolean(alertToggle && alertToggle.checked) };
  }

  function applyNoiseSettings(settings) {
    if (!settings || !alertToggle) return false;
    alertToggle.checked = Boolean(settings.alertEnabled);
    return true;
  }

  function saveNoiseSettings() {
    const settings = getNoiseSettings();
    localStorage.setItem(NOISE_STORAGE_KEY, JSON.stringify(settings));
    if (window.HelpingTeachersAuth && window.HelpingTeachersAuth.isSignedIn()) {
      window.HelpingTeachersAuth.saveToolSetting("noise-meter", "settings", settings);
    }
  }

  function loadLocalNoiseSettings() {
    try {
      return JSON.parse(localStorage.getItem(NOISE_STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  async function loadCloudNoiseSettings() {
    if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn()) return;
    const { data, error } = await window.HelpingTeachersAuth.getToolSetting("noise-meter", "settings");
    if (!error && data && applyNoiseSettings(data)) localStorage.setItem(NOISE_STORAGE_KEY, JSON.stringify(data));
  }
  function setStatus(emoji, status, value, levelClass) {
    noiseEmoji.textContent = emoji;
    noiseStatus.textContent = status;
    noiseValue.textContent = `${value}%`;

    noiseMeterBar.style.width = `${value}%`;

    noiseMeterBar.classList.remove(
      "noise-low",
      "noise-medium",
      "noise-high"
    );

    if (levelClass) {
      noiseMeterBar.classList.add(levelClass);
    }
  }

  function getNoiseLevel() {
    if (!analyser || !dataArray) return 0;

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i] - 128;
      sum += value * value;
    }

    const rms = Math.sqrt(sum / dataArray.length);

    return Math.min(100, Math.round(rms * 3));
  }

  function playGentleAlert() {
    const AlertAudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AlertAudioContext) return;

    const alertContext = new AlertAudioContext();
    const oscillator = alertContext.createOscillator();
    const gain = alertContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      880,
      alertContext.currentTime
    );

    gain.gain.setValueAtTime(0.04, alertContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      alertContext.currentTime + 0.4
    );

    oscillator.connect(gain);
    gain.connect(alertContext.destination);

    oscillator.start();
    oscillator.stop(alertContext.currentTime + 0.4);

    oscillator.onended = () => {
      alertContext.close();
    };
  }

  function maybePlayAlert(level) {
    const alertEnabled = alertToggle && alertToggle.checked;
    const now = Date.now();

    if (
      alertEnabled &&
      level >= HIGH_THRESHOLD &&
      now - lastAlertTime >= ALERT_COOLDOWN
    ) {
      playGentleAlert();
      lastAlertTime = now;
    }
  }

  function updateMeter() {
    const level = getNoiseLevel();

    if (level < LOW_THRESHOLD) {
      setStatus("🟢", QUIET_MESSAGE, level, "noise-low");
    } else if (level < HIGH_THRESHOLD) {
      setStatus("🟡", MEDIUM_MESSAGE, level, "noise-medium");
    } else {
      setStatus("🔴", LOUD_MESSAGE, level, "noise-high");
      maybePlayAlert(level);
    }

    animationId = requestAnimationFrame(updateMeter);
  }

  async function startMonitoring() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();

      analyser.fftSize = 1024;

      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      dataArray = new Uint8Array(analyser.fftSize);

      isMonitoring = true;
      toggleBtn.textContent = STOP_MESSAGE;

      updateMeter();
    } catch (error) {
      setStatus("⚠️", MIC_ERROR_MESSAGE, 0, "");
      console.error("Microphone error:", error);
    }
  }

  function stopMonitoring() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (audioContext) {
      audioContext.close();
    }

    audioContext = null;
    analyser = null;
    microphone = null;
    dataArray = null;
    animationId = null;
    stream = null;
    isMonitoring = false;
    lastAlertTime = 0;

    toggleBtn.textContent = START_MESSAGE;
    setStatus("🎤", READY_MESSAGE, 0, "");
  }

  if (alertToggle) alertToggle.addEventListener("change", saveNoiseSettings);
  applyNoiseSettings(loadLocalNoiseSettings());
  if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
    window.HelpingTeachersAuth.onReady(loadCloudNoiseSettings);
  }

  toggleBtn.addEventListener("click", () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  });

  setStatus("🎤", READY_MESSAGE, 0, "");
});