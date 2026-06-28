document.addEventListener("DOMContentLoaded", () => {
  const isSpanish =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("es");

  const text = isSpanish
    ? {
        noCards: "Sin tarjetas",
        card: "Tarjeta",
        of: "de",
        front: "Frente",
        back: "Reverso",
        frontPlaceholder: "Frente",
        backPlaceholder: "Reverso",
        createFirst: "Crea tus primeras tarjetas",
        clickToFlip: "Haz clic para voltear",
        vocabulary: "Vocabulario",
        removeCard: "Eliminar tarjeta",
        flashcardFront: "Frente de la tarjeta",
        flashcardBack: "Reverso de la tarjeta",
        goToCard: "Ir a la tarjeta"
      }
    : {
        noCards: "No Cards",
        card: "Card",
        of: "of",
        front: "Front",
        back: "Back",
        frontPlaceholder: "Front",
        backPlaceholder: "Back",
        createFirst: "Create your first flashcards",
        clickToFlip: "Click to flip",
        vocabulary: "Vocabulary",
        removeCard: "Remove card",
        flashcardFront: "Flashcard front",
        flashcardBack: "Flashcard back",
        goToCard: "Go to card"
      };

  const rowsContainer = document.getElementById("flashcardsRows");
  const categorySelect = document.getElementById("flashcardsCategory");

  const addRowBtn = document.getElementById("addFlashcardRowBtn");
  const generateBtn = document.getElementById("generateFlashcardsBtn");
  const clearBtn = document.getElementById("clearFlashcardsBtn");

  const previousBtn = document.getElementById("previousFlashcardBtn");
  const nextBtn = document.getElementById("nextFlashcardBtn");
  const flipBtn = document.getElementById("flipFlashcardBtn");
  const shuffleBtn = document.getElementById("shuffleFlashcardsBtn");
  const fullscreenBtn = document.getElementById("fullscreenFlashcardsBtn");
  const exitFullscreenBtn = document.getElementById("exitFullscreenFlashcardsBtn");

  const flashcardsCard = document.querySelector(".flashcards-card");
  const flashcardDisplay = document.getElementById("flashcardDisplay");

  const flashcardText = document.getElementById("flashcardText");
  const flashcardSideLabel = document.getElementById("flashcardSideLabel");
  const flashcardHint = document.getElementById("flashcardHint");

  const counter = document.getElementById("flashcardsCounter");
  const categoryBadge = document.getElementById("flashcardsCategoryBadge");

  const previewList = document.getElementById("flashcardsPreviewList");
  const modeButtons = document.querySelectorAll(".flashcards-mode-btn");

  let cards = [];
  let currentIndex = 0;
  let showingFront = true;
  let currentMode = "presentation";
  const FLASHCARDS_STORAGE_KEY = isSpanish ? "helpingTeachers.flashcards.es" : "helpingTeachers.flashcards.en";
  let saveTimer = null;
  let cloudLoaded = false;

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function getRows() {
    return Array.from(
      rowsContainer.querySelectorAll(".flashcards-row")
    );
  }

  function createRow(frontValue = "", backValue = "") {
    const row = document.createElement("div");
    row.className = "flashcards-row";

    row.innerHTML = `
      <input
        type="text"
        class="flashcard-front-input"
        placeholder="${text.frontPlaceholder}"
        aria-label="${text.flashcardFront}"
        value="${escapeAttribute(frontValue)}"
      />

      <input
        type="text"
        class="flashcard-back-input"
        placeholder="${text.backPlaceholder}"
        aria-label="${text.flashcardBack}"
        value="${escapeAttribute(backValue)}"
      />

      <button
        type="button"
        class="flashcard-remove-btn"
        aria-label="${text.removeCard}"
      >
        ×
      </button>
    `;

    return row;
  }

  function renumberRows() {
    getRows().forEach((row, index) => {
      const frontInput = row.querySelector(".flashcard-front-input");
      const backInput = row.querySelector(".flashcard-back-input");

      frontInput.setAttribute(
        "aria-label",
        `${text.flashcardFront} ${index + 1}`
      );

      backInput.setAttribute(
        "aria-label",
        `${text.flashcardBack} ${index + 1}`
      );
    });
  }

  function isRowFilled(row) {
    const frontInput = row.querySelector(".flashcard-front-input");
    const backInput = row.querySelector(".flashcard-back-input");

    return (
      frontInput.value.trim() !== "" ||
      backInput.value.trim() !== ""
    );
  }

  function ensureEmptyRowAtEnd() {
    const rows = getRows();
    const lastRow = rows[rows.length - 1];

    if (!lastRow || isRowFilled(lastRow)) {
      rowsContainer.appendChild(createRow());
      renumberRows();
    }
  }

  function addRow(frontValue = "", backValue = "") {
    rowsContainer.appendChild(
      createRow(frontValue, backValue)
    );

    renumberRows();
  }

  function clearRows() {
    rowsContainer.innerHTML = "";

    addRow();
    addRow();
    addRow();

    renumberRows();
  }

  function parseCards() {
    const parsed = [];

    getRows().forEach(row => {
      const frontInput = row.querySelector(".flashcard-front-input");
      const backInput = row.querySelector(".flashcard-back-input");

      const front = frontInput.value.trim();
      const back = backInput.value.trim();

      if (!front || !back) return;

      parsed.push({
        front,
        back
      });
    });

    return parsed;
  }


  function getFlashcardsState() {
    return {
      category: categorySelect.value,
      mode: currentMode,
      rows: getRows()
        .map(row => ({
          front: row.querySelector(".flashcard-front-input").value.trim(),
          back: row.querySelector(".flashcard-back-input").value.trim()
        }))
        .filter(card => card.front || card.back)
    };
  }

  function applyFlashcardsState(state) {
    if (!state || !Array.isArray(state.rows) || state.rows.length === 0) return false;

    rowsContainer.innerHTML = "";
    state.rows.forEach(card => addRow(card.front || "", card.back || ""));
    ensureEmptyRowAtEnd();

    if (state.category) categorySelect.value = state.category;
    if (state.mode) currentMode = state.mode;

    renumberRows();
    generateCards();
    setMode(currentMode);
    return true;
  }

  function saveLocalState() {
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(getFlashcardsState()));
  }

  function scheduleSave() {
    saveLocalState();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      if (window.HelpingTeachersAuth && window.HelpingTeachersAuth.isSignedIn()) {
        window.HelpingTeachersAuth.saveToolSetting("flashcards", "cards", getFlashcardsState());
      }
    }, 700);
  }

  function loadLocalState() {
    try {
      return JSON.parse(localStorage.getItem(FLASHCARDS_STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  async function loadCloudState() {
    if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn() || cloudLoaded) return;
    cloudLoaded = true;
    const { data, error } = await window.HelpingTeachersAuth.getToolSetting("flashcards", "cards");
    if (!error && data && applyFlashcardsState(data)) saveLocalState();
  }
  function updateCounter() {
    if (!cards.length) {
      counter.textContent = text.noCards;
      return;
    }

    counter.textContent =
      `${text.card} ${currentIndex + 1} ${text.of} ${cards.length}`;
  }

  function updateCategory() {
    categoryBadge.textContent =
      categorySelect.value || text.vocabulary;
  }

  function updateCardStateClass() {
    flashcardDisplay.classList.toggle(
      "showing-back",
      !showingFront
    );
  }

  function updateActivePreview() {
    const previewItems = previewList.querySelectorAll(
      ".flashcard-preview-item"
    );

    previewItems.forEach((item, index) => {
      item.classList.toggle(
        "active",
        index === currentIndex
      );
    });
  }

  function renderCard() {
    if (!cards.length) {
      flashcardText.textContent = text.createFirst;
      flashcardSideLabel.textContent = "";
      flashcardHint.textContent = "";

      updateCounter();
      updateCardStateClass();
      updateActivePreview();

      return;
    }

    const card = cards[currentIndex];

    if (showingFront) {
      flashcardText.textContent = card.front;
      flashcardSideLabel.textContent = text.front;
    } else {
      flashcardText.textContent = card.back;
      flashcardSideLabel.textContent = text.back;
    }

    flashcardHint.textContent =
      currentMode === "student"
        ? text.clickToFlip
        : "";

    updateCounter();
    updateCardStateClass();
    updateActivePreview();
  }

  function renderPreview() {
    previewList.innerHTML = "";

    cards.forEach((card, index) => {
      const item = document.createElement("button");

      item.type = "button";
      item.className = "flashcard-preview-item";
      item.setAttribute(
        "aria-label",
        `${text.goToCard} ${index + 1}`
      );

      item.innerHTML = `
        <span class="flashcard-preview-number">
          ${index + 1}
        </span>

        <div class="flashcard-preview-content">
          <strong>${card.front}</strong>
          <small>${card.back}</small>
        </div>
      `;

      item.addEventListener("click", () => {
        currentIndex = index;
        showingFront = true;
        renderCard();
      });

      previewList.appendChild(item);
    });

    updateActivePreview();
  }

  function generateCards() {
    cards = parseCards();

    currentIndex = 0;
    showingFront = true;

    updateCategory();
    renderPreview();
    renderCard();
  }

  function nextCard() {
    if (!cards.length) return;

    currentIndex++;

    if (currentIndex >= cards.length) {
      currentIndex = 0;
    }

    showingFront = true;

    renderCard();
  }

  function previousCard() {
    if (!cards.length) return;

    currentIndex--;

    if (currentIndex < 0) {
      currentIndex = cards.length - 1;
    }

    showingFront = true;

    renderCard();
  }

  function flipCard() {
    if (!cards.length) return;

    showingFront = !showingFront;

    renderCard();
  }

  function shuffleCards() {
    if (cards.length < 2) return;

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(
        Math.random() * (i + 1)
      );

      [cards[i], cards[j]] =
        [cards[j], cards[i]];
    }

    currentIndex = 0;
    showingFront = true;

    renderPreview();
    renderCard();
  }

  function setMode(mode) {
    currentMode = mode;

    modeButtons.forEach(btn => {
      btn.classList.remove("active");

      if (btn.dataset.mode === mode) {
        btn.classList.add("active");
      }
    });

    if (mode === "presentation") {
      showingFront = true;
    }

    renderCard();
  }

  function enterFullscreenMode() {
    generateCards();

    flashcardsCard.classList.add("flashcards-fullscreen-mode");
    document.body.classList.add("flashcards-body-fullscreen");
  }

  function exitFullscreenMode() {
    flashcardsCard.classList.remove("flashcards-fullscreen-mode");
    document.body.classList.remove("flashcards-body-fullscreen");
  }

  rowsContainer.addEventListener("input", event => {
    if (
      event.target.classList.contains("flashcard-front-input") ||
      event.target.classList.contains("flashcard-back-input")
    ) {
      ensureEmptyRowAtEnd();
      scheduleSave();
    }
  });

  rowsContainer.addEventListener("click", event => {
    if (!event.target.classList.contains("flashcard-remove-btn")) {
      return;
    }

    const row = event.target.closest(".flashcards-row");

    if (!row) return;

    row.remove();

    if (!getRows().length) {
      addRow();
    }

    ensureEmptyRowAtEnd();
    renumberRows();
    generateCards();
    scheduleSave();
  });

  addRowBtn.addEventListener("click", () => {
    addRow();

    const rows = getRows();
    const lastRow = rows[rows.length - 1];
    const firstInput = lastRow.querySelector(".flashcard-front-input");

    firstInput.focus();
  });

  generateBtn.addEventListener("click", () => {
    generateCards();
    scheduleSave();
  });

  clearBtn.addEventListener("click", () => {
    clearRows();

    cards = [];
    currentIndex = 0;
    showingFront = true;

    renderPreview();
    renderCard();
  });

  nextBtn.addEventListener("click", nextCard);
  previousBtn.addEventListener("click", previousCard);
  flipBtn.addEventListener("click", flipCard);
  shuffleBtn.addEventListener("click", shuffleCards);
  fullscreenBtn.addEventListener("click", enterFullscreenMode);
  exitFullscreenBtn.addEventListener("click", exitFullscreenMode);

  flashcardDisplay.addEventListener("click", () => {
    if (currentMode === "student") {
      flipCard();
    }
  });

  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      setMode(btn.dataset.mode);
      scheduleSave();
    });
  });

  categorySelect.addEventListener("change", () => {
    updateCategory();
    scheduleSave();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      exitFullscreenMode();
    }

    if (event.key === "ArrowRight") {
      nextCard();
    }

    if (event.key === "ArrowLeft") {
      previousCard();
    }

    if (event.key === " " || event.key === "Enter") {
      if (
        document.activeElement &&
        ["TEXTAREA", "INPUT", "SELECT", "BUTTON"].includes(
          document.activeElement.tagName
        )
      ) {
        return;
      }

      event.preventDefault();
      flipCard();
    }
  });

  applyFlashcardsState(loadLocalState());
  if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
    window.HelpingTeachersAuth.onReady(loadCloudState);
  }
  renumberRows();
  ensureEmptyRowAtEnd();
  generateCards();
});