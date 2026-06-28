document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".random-number-card");

  if (!card) return;

  const minimumInput = document.getElementById("minimumNumber");
  const maximumInput = document.getElementById("maximumNumber");

  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearRandomBtn");

  const resultEl = document.getElementById("randomResult");
  const rangeEl = document.getElementById("randomRange");
  const historyEl = document.getElementById("randomHistory");

  const excludeRepeatsCheckbox =
    document.getElementById("excludeRepeats");

  const READY_MESSAGE =
    card.dataset.readyMessage || "Ready to generate...";

  const GENERATING_MESSAGE =
    card.dataset.generatingMessage || "Generating...";

  const RANGE_LABEL =
    card.dataset.rangeLabel || "Range";

  const HISTORY_LABEL =
    card.dataset.historyLabel || "History";

  const EMPTY_HISTORY =
    card.dataset.emptyHistory || "No numbers generated yet.";

  const ERROR_RANGE =
    card.dataset.errorRange ||
    "Minimum number cannot be greater than maximum number.";

  const ERROR_EMPTY =
    card.dataset.errorEmpty ||
    "Please enter both a minimum and maximum number.";

  const ERROR_EXHAUSTED =
    card.dataset.errorExhausted ||
    "All numbers in this range have already been generated.";

  let history = [];
  let usedNumbers = new Set();
  const RANDOM_STORAGE_KEY = "helpingTeachers.randomNumber.settings";
  let randomSaveTimer = null;


  function getRandomSettings() {
    return {
      min: minimumInput.value,
      max: maximumInput.value,
      excludeRepeats: Boolean(excludeRepeatsCheckbox && excludeRepeatsCheckbox.checked)
    };
  }

  function applyRandomSettings(settings) {
    if (!settings) return false;
    if (settings.min !== undefined) minimumInput.value = settings.min;
    if (settings.max !== undefined) maximumInput.value = settings.max;
    if (excludeRepeatsCheckbox && settings.excludeRepeats !== undefined) excludeRepeatsCheckbox.checked = Boolean(settings.excludeRepeats);
    updateRangeLabel();
    return true;
  }

  function saveRandomSettings() {
    const settings = getRandomSettings();
    localStorage.setItem(RANDOM_STORAGE_KEY, JSON.stringify(settings));
    window.clearTimeout(randomSaveTimer);
    randomSaveTimer = window.setTimeout(() => {
      if (window.HelpingTeachersAuth && window.HelpingTeachersAuth.isSignedIn()) {
        window.HelpingTeachersAuth.saveToolSetting("random-number", "settings", settings);
      }
    }, 700);
  }

  function loadLocalRandomSettings() {
    try {
      return JSON.parse(localStorage.getItem(RANDOM_STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  async function loadCloudRandomSettings() {
    if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn()) return;
    const { data, error } = await window.HelpingTeachersAuth.getToolSetting("random-number", "settings");
    if (!error && data && applyRandomSettings(data)) localStorage.setItem(RANDOM_STORAGE_KEY, JSON.stringify(data));
  }
  function updateRangeLabel() {
    const min = minimumInput.value;
    const max = maximumInput.value;

    rangeEl.textContent = `${RANGE_LABEL}: ${min}–${max}`;
  }

  function renderHistory() {
    if (history.length === 0) {
      historyEl.textContent = EMPTY_HISTORY;
      return;
    }

    historyEl.innerHTML = history
      .slice()
      .reverse()
      .map((number) => `<span class="history-chip">${number}</span>`)
      .join("");
  }

  function showError(message) {
    resultEl.textContent = message;
    resultEl.classList.remove("random-animate");
  }

  function animateResult(number) {
    resultEl.classList.remove("random-animate");

    void resultEl.offsetWidth;

    resultEl.textContent = number;
    resultEl.classList.add("random-animate");
  }

  function generateNumber() {
    const min = parseInt(minimumInput.value, 10);
    const max = parseInt(maximumInput.value, 10);

    if (
      minimumInput.value.trim() === "" ||
      maximumInput.value.trim() === ""
    ) {
      showError(ERROR_EMPTY);
      return;
    }

    if (isNaN(min) || isNaN(max)) {
      showError(ERROR_EMPTY);
      return;
    }

    if (min > max) {
      showError(ERROR_RANGE);
      return;
    }

    updateRangeLabel();

    const excludeRepeats = excludeRepeatsCheckbox.checked;

    if (excludeRepeats) {
      const totalPossibleNumbers = max - min + 1;

      if (usedNumbers.size >= totalPossibleNumbers) {
        showError(ERROR_EXHAUSTED);
        return;
      }
    }

    resultEl.textContent = GENERATING_MESSAGE;

    setTimeout(() => {
      let generatedNumber;

      if (excludeRepeats) {
        do {
          generatedNumber =
            Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers.has(generatedNumber));

        usedNumbers.add(generatedNumber);
      } else {
        generatedNumber =
          Math.floor(Math.random() * (max - min + 1)) + min;
      }

      history.push(generatedNumber);

      animateResult(generatedNumber);
      renderHistory();
    }, 500);
  }

  function clearAll() {
    history = [];
    usedNumbers.clear();

    resultEl.textContent = READY_MESSAGE;
    resultEl.classList.remove("random-animate");

    renderHistory();
    updateRangeLabel();
  }

  generateBtn.addEventListener("click", generateNumber);

  clearBtn.addEventListener("click", clearAll);

  minimumInput.addEventListener("input", () => {
    updateRangeLabel();
    saveRandomSettings();
  });
  maximumInput.addEventListener("input", () => {
    updateRangeLabel();
    saveRandomSettings();
  });
  if (excludeRepeatsCheckbox) excludeRepeatsCheckbox.addEventListener("change", saveRandomSettings);

  applyRandomSettings(loadLocalRandomSettings());
  if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
    window.HelpingTeachersAuth.onReady(loadCloudRandomSettings);
  }
  updateRangeLabel();
  renderHistory();
});