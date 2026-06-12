document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".yes-no-card");

  if (!card) return;

  const resultEl = document.getElementById("yesNoResult");
  const historyEl = document.getElementById("yesNoHistory");

  const pickBtn = document.getElementById("pickAnswerBtn");
  const clearBtn = document.getElementById("clearYesNoBtn");

  const modeSelect = document.getElementById("pickerMode");

  const THINKING_MESSAGE = card.dataset.thinkingMessage || "Thinking...";
  const READY_MESSAGE = card.dataset.readyMessage || "Ready to pick...";
  const EMPTY_HISTORY = card.dataset.emptyHistory || "No answers picked yet.";

  const SIMPLE_YES = card.dataset.simpleYes || "YES";
  const SIMPLE_NO = card.dataset.simpleNo || "NO";

  const FUN_OPTIONS = card.dataset.funOptions
    ? card.dataset.funOptions.split(",").map(option => option.trim())
    : [
        "Absolutely!",
        "Go for it!",
        "Definitely!",
        "Sounds good!",
        "Not today.",
        "Maybe next time.",
        "Try again!",
        "Ask again later."
      ];

  const POSITIVE_ANSWERS = [
    "YES",
    "SÍ",
    "Absolutely!",
    "Go for it!",
    "Definitely!",
    "Sounds good!",
    "¡Claro que sí!",
    "¡Hazlo!",
    "¡Definitivamente!",
    "¡Suena bien!",
    "¿Por qué no?"
  ];

  const NEGATIVE_ANSWERS = [
    "NO",
    "Not today.",
    "Maybe next time.",
    "Try again!",
    "Ask again later.",
    "Hoy no.",
    "Tal vez después.",
    "¡Inténtalo otra vez!",
    "Pregunta más tarde."
  ];

  let history = [];

  function isPositiveAnswer(answer) {
    const cleanAnswer = answer
      .replace("✅", "")
      .replace("❌", "")
      .trim();

    return POSITIVE_ANSWERS.includes(cleanAnswer);
  }

  function renderHistory() {
    if (history.length === 0) {
      historyEl.textContent = EMPTY_HISTORY;
      return;
    }

    historyEl.innerHTML = history
      .slice()
      .reverse()
      .map(answer => {
        const isPositive = isPositiveAnswer(answer);

        return `
          <span class="history-chip ${isPositive ? "yes-chip" : "no-chip"}">
            ${answer}
          </span>
        `;
      })
      .join("");
  }

  function animateResult(content) {
    resultEl.classList.remove("yes-no-animate");

    void resultEl.offsetWidth;

    resultEl.innerHTML = content;
    resultEl.classList.add("yes-no-animate");
  }

  function getSimpleAnswer() {
    return Math.random() < 0.5
      ? `✅ ${SIMPLE_YES}`
      : `❌ ${SIMPLE_NO}`;
  }

  function getFunAnswer() {
    const randomIndex = Math.floor(Math.random() * FUN_OPTIONS.length);
    const answer = FUN_OPTIONS[randomIndex];

    const icon = POSITIVE_ANSWERS.includes(answer) ? "✅" : "❌";

    return `${icon} ${answer}`;
  }

  function pickAnswer() {
    resultEl.textContent = THINKING_MESSAGE;

    setTimeout(() => {
      const mode = modeSelect.value;

      const answer = mode === "fun"
        ? getFunAnswer()
        : getSimpleAnswer();

      history.push(answer);

      animateResult(answer);
      renderHistory();
    }, 700);
  }

  function clearAll() {
    history = [];

    resultEl.textContent = READY_MESSAGE;
    resultEl.classList.remove("yes-no-animate");

    renderHistory();
  }

  pickBtn.addEventListener("click", pickAnswer);
  clearBtn.addEventListener("click", clearAll);

  renderHistory();
});