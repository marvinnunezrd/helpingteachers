document.addEventListener("DOMContentLoaded", () => {
  const isSpanish =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("es");

  const text = isSpanish
    ? {
        all: "Todas",
        brainBreak: "Pausa Activa",
        favoriteSaved: "Guardada",
        noFavorites: "Todavía no tienes pausas favoritas.",
        removeFavorite: "Eliminar favorita",
        savedFavorites: "Pausas Favoritas",
        duplicateFavorite: "Ya está en favoritas"
      }
    : {
        all: "All",
        brainBreak: "Brain Break",
        favoriteSaved: "Saved",
        noFavorites: "No favorite brain breaks yet.",
        removeFavorite: "Remove favorite",
        savedFavorites: "Favorite Brain Breaks",
        duplicateFavorite: "Already saved"
      };

  const brainBreaks = [
    {
      id: "jump-10-times",
      category: "movement",
      emoji: "🦘",
      title: isSpanish ? "Salta 10 Veces" : "Jump 10 Times",
      description: isSpanish
        ? "Ponte de pie y salta suavemente 10 veces en tu lugar."
        : "Stand up and do 10 gentle jumps in place."
    },
    {
      id: "run-in-place",
      category: "movement",
      emoji: "🏃",
      title: isSpanish ? "Corre en tu Lugar" : "Run in Place",
      description: isSpanish
        ? "Corre suavemente en tu lugar durante 20 segundos."
        : "Run gently in place for 20 seconds."
    },
    {
      id: "march-like-soldier",
      category: "movement",
      emoji: "🥁",
      title: isSpanish ? "Marcha Como un Soldado" : "March Like a Soldier",
      description: isSpanish
        ? "Levanta las rodillas y marcha en tu lugar por 20 segundos."
        : "Lift your knees and march in place for 20 seconds."
    },
    {
      id: "jumping-jacks",
      category: "movement",
      emoji: "⭐",
      title: isSpanish ? "Haz 15 Saltos de Estrella" : "Do 15 Jumping Jacks",
      description: isSpanish
        ? "Haz 15 saltos de estrella con cuidado y energía."
        : "Do 15 jumping jacks with care and energy."
    },
    {
      id: "hop-one-foot",
      category: "movement",
      emoji: "🦶",
      title: isSpanish ? "Salta en un Pie" : "Hop on One Foot",
      description: isSpanish
        ? "Salta 5 veces en un pie y luego cambia al otro."
        : "Hop 5 times on one foot, then switch to the other."
    },

    {
      id: "deep-breaths",
      category: "mindfulness",
      emoji: "🧘",
      title: isSpanish
        ? "Respira Profundamente 3 Veces"
        : "Take 3 Deep Breaths",
      description: isSpanish
        ? "Inhala lentamente, exhala con calma y repite 3 veces."
        : "Breathe in slowly, breathe out calmly, and repeat 3 times."
    },
    {
      id: "eyes-closed",
      category: "mindfulness",
      emoji: "😌",
      title: isSpanish
        ? "Cierra los Ojos por 20 Segundos"
        : "Close Your Eyes for 20 Seconds",
      description: isSpanish
        ? "Cierra los ojos, quédate quieto y escucha en silencio."
        : "Close your eyes, stay still, and listen quietly."
    },
    {
      id: "gratitude-thought",
      category: "mindfulness",
      emoji: "💛",
      title: isSpanish
        ? "Piensa en Algo que Agradeces"
        : "Think of Something You Are Grateful For",
      description: isSpanish
        ? "Piensa en una cosa buena por la que puedes dar gracias hoy."
        : "Think of one good thing you can be thankful for today."
    },
    {
      id: "quiet-listening",
      category: "mindfulness",
      emoji: "👂",
      title: isSpanish
        ? "Escucha con Atención"
        : "Listen Carefully for 10 Seconds",
      description: isSpanish
        ? "Quédate en silencio y escucha todos los sonidos a tu alrededor."
        : "Stay quiet and notice all the sounds around you."
    },

    {
      id: "reach-sky",
      category: "stretching",
      emoji: "🙌",
      title: isSpanish ? "Alcanza el Cielo" : "Reach for the Sky",
      description: isSpanish
        ? "Levanta los brazos lo más alto que puedas y estírate."
        : "Raise your arms as high as you can and stretch."
    },
    {
      id: "touch-toes",
      category: "stretching",
      emoji: "🤸",
      title: isSpanish ? "Toca tus Pies" : "Touch Your Toes",
      description: isSpanish
        ? "Inclínate suavemente hacia adelante e intenta tocar tus pies."
        : "Bend forward gently and try to touch your toes."
    },
    {
      id: "stretch-arms",
      category: "stretching",
      emoji: "💪",
      title: isSpanish ? "Estira los Brazos" : "Stretch Your Arms",
      description: isSpanish
        ? "Estira ambos brazos hacia los lados y respira profundo."
        : "Stretch both arms out to the sides and take a deep breath."
    },
    {
      id: "roll-shoulders",
      category: "stretching",
      emoji: "🔄",
      title: isSpanish ? "Rueda los Hombros" : "Roll Your Shoulders",
      description: isSpanish
        ? "Haz círculos suaves con los hombros hacia adelante y hacia atrás."
        : "Roll your shoulders gently forward and backward."
    },

    {
      id: "silly-face",
      category: "classroom-fun",
      emoji: "😜",
      title: isSpanish ? "Haz una Cara Divertida" : "Make a Silly Face",
      description: isSpanish
        ? "Haz tu cara más divertida por 5 segundos."
        : "Make your silliest face for 5 seconds."
    },
    {
      id: "robot",
      category: "classroom-fun",
      emoji: "🤖",
      title: isSpanish ? "Actúa Como un Robot" : "Pretend You Are a Robot",
      description: isSpanish
        ? "Muévete como un robot por 15 segundos."
        : "Move like a robot for 15 seconds."
    },
    {
      id: "cat",
      category: "classroom-fun",
      emoji: "🐱",
      title: isSpanish ? "Actúa Como un Gato" : "Act Like a Cat",
      description: isSpanish
        ? "Estírate, maúlla suavemente y camina como un gato."
        : "Stretch, meow softly, and walk like a cat."
    },
    {
      id: "freeze-statue",
      category: "classroom-fun",
      emoji: "🗿",
      title: isSpanish ? "Congélate Como Estatua" : "Freeze Like a Statue",
      description: isSpanish
        ? "Quédate completamente quieto como una estatua por 10 segundos."
        : "Stay completely still like a statue for 10 seconds."
    }
  ];

  const categoryLabels = isSpanish
    ? {
        all: "Todas",
        movement: "Movimiento",
        mindfulness: "Atención Plena",
        stretching: "Estiramiento",
        "classroom-fun": "Diversión"
      }
    : {
        all: "All",
        movement: "Movement",
        mindfulness: "Mindfulness",
        stretching: "Stretching",
        "classroom-fun": "Classroom Fun"
      };

  const storageKey = isSpanish
    ? "helpingTeachersBrainBreakFavoritesEs"
    : "helpingTeachersBrainBreakFavoritesEn";

  const card = document.querySelector(".brain-breaks-card");

  const categoryButtons = document.querySelectorAll(
    ".brain-break-category-btn"
  );

  const newBrainBreakBtn = document.getElementById("newBrainBreakBtn");
  const anotherBrainBreakBtn = document.getElementById("anotherBrainBreakBtn");

  const saveBrainBreakBtn = document.getElementById("saveBrainBreakBtn");
  const saveBrainBreakBtnBottom = document.getElementById(
    "saveBrainBreakBtnBottom"
  );

  const fullscreenBtn = document.getElementById("brainBreaksFullscreenBtn");
  const exitFullscreenBtn = document.getElementById(
    "exitBrainBreaksFullscreenBtn"
  );

  const clearFavoritesBtn = document.getElementById(
    "clearBrainBreakFavoritesBtn"
  );

  const categoryBadge = document.getElementById("brainBreakCategoryBadge");
  const counter = document.getElementById("brainBreakCounter");

  const emojiEl = document.getElementById("brainBreakEmoji");
  const titleEl = document.getElementById("brainBreakTitle");
  const descriptionEl = document.getElementById("brainBreakDescription");

  const favoritesList = document.getElementById("brainBreakFavoritesList");

  let currentCategory = "all";
  let currentBrainBreak = brainBreaks[0];
  let favorites = loadFavorites();

  function getFilteredBrainBreaks() {
    if (currentCategory === "all") {
      return brainBreaks;
    }

    return brainBreaks.filter(
      item => item.category === currentCategory
    );
  }

  function getRandomBrainBreak() {
    const filtered = getFilteredBrainBreaks();

    if (!filtered.length) {
      return brainBreaks[0];
    }

    if (filtered.length === 1) {
      return filtered[0];
    }

    let next = filtered[
      Math.floor(Math.random() * filtered.length)
    ];

    while (
      currentBrainBreak &&
      next.id === currentBrainBreak.id
    ) {
      next = filtered[
        Math.floor(Math.random() * filtered.length)
      ];
    }

    return next;
  }

  function renderBrainBreak(item) {
    currentBrainBreak = item;

    emojiEl.textContent = item.emoji;
    titleEl.textContent = item.title;
    descriptionEl.textContent = item.description;

    categoryBadge.textContent =
      categoryLabels[item.category] || categoryLabels.all;

    counter.textContent = text.brainBreak;
  }

  function generateBrainBreak() {
    renderBrainBreak(getRandomBrainBreak());
  }

  function setCategory(category) {
    currentCategory = category;

    categoryButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === category
      );
    });

    categoryBadge.textContent =
      categoryLabels[category] || categoryLabels.all;

    generateBrainBreak();
  }

  function loadFavorites() {
    try {
      const saved = localStorage.getItem(storageKey);

      if (!saved) {
        return [];
      }

      return JSON.parse(saved);
    } catch (error) {
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem(
      storageKey,
      JSON.stringify(favorites)
    );
  }

  function isFavorite(id) {
    return favorites.some(item => item.id === id);
  }

  function saveCurrentFavorite() {
    if (!currentBrainBreak) return;

    if (isFavorite(currentBrainBreak.id)) {
      showSaveFeedback(text.duplicateFavorite);
      return;
    }

    favorites.push(currentBrainBreak);
    saveFavorites();
    renderFavorites();
    showSaveFeedback(text.favoriteSaved);
  }

  function removeFavorite(id) {
    favorites = favorites.filter(item => item.id !== id);
    saveFavorites();
    renderFavorites();
  }

  function clearFavorites() {
    favorites = [];
    saveFavorites();
    renderFavorites();
  }

  function showSaveFeedback(message) {
    const originalTopText = saveBrainBreakBtn.textContent;
    const originalBottomText = saveBrainBreakBtnBottom.textContent;

    saveBrainBreakBtn.textContent = message;
    saveBrainBreakBtnBottom.textContent = message;

    setTimeout(() => {
      saveBrainBreakBtn.textContent = originalTopText;
      saveBrainBreakBtnBottom.textContent = originalBottomText;
    }, 900);
  }

  function renderFavorites() {
    favoritesList.innerHTML = "";

    if (!favorites.length) {
      const empty = document.createElement("p");
      empty.className = "tool-small-note";
      empty.textContent = text.noFavorites;
      favoritesList.appendChild(empty);
      return;
    }

    favorites.forEach(item => {
      const favoriteItem = document.createElement("div");
      favoriteItem.className = "brain-break-favorite-item";

      favoriteItem.innerHTML = `
        <button
          type="button"
          class="brain-break-favorite-main"
          aria-label="${item.title}"
        >
          <span>${item.emoji}</span>

          <strong>${item.title}</strong>
        </button>

        <button
          type="button"
          class="brain-break-favorite-remove"
          aria-label="${text.removeFavorite}"
        >
          ×
        </button>
      `;

      const mainButton = favoriteItem.querySelector(
        ".brain-break-favorite-main"
      );

      const removeButton = favoriteItem.querySelector(
        ".brain-break-favorite-remove"
      );

      mainButton.addEventListener("click", () => {
        renderBrainBreak(item);
      });

      removeButton.addEventListener("click", () => {
        removeFavorite(item.id);
      });

      favoritesList.appendChild(favoriteItem);
    });
  }

  function enterFullscreenMode() {
    card.classList.add("brain-breaks-fullscreen-mode");
    document.body.classList.add("brain-breaks-body-fullscreen");
  }

  function exitFullscreenMode() {
    card.classList.remove("brain-breaks-fullscreen-mode");
    document.body.classList.remove("brain-breaks-body-fullscreen");
  }

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.category);
    });
  });

  newBrainBreakBtn.addEventListener(
    "click",
    generateBrainBreak
  );

  anotherBrainBreakBtn.addEventListener(
    "click",
    generateBrainBreak
  );

  saveBrainBreakBtn.addEventListener(
    "click",
    saveCurrentFavorite
  );

  saveBrainBreakBtnBottom.addEventListener(
    "click",
    saveCurrentFavorite
  );

  fullscreenBtn.addEventListener(
    "click",
    enterFullscreenMode
  );

  exitFullscreenBtn.addEventListener(
    "click",
    exitFullscreenMode
  );

  clearFavoritesBtn.addEventListener(
    "click",
    clearFavorites
  );

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      exitFullscreenMode();
    }

    if (event.key === "ArrowRight" || event.key === "Enter") {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
          document.activeElement.tagName
        )
      ) {
        return;
      }

      generateBrainBreak();
    }

    if (event.key === "f" || event.key === "F") {
      saveCurrentFavorite();
    }
  });

  renderBrainBreak(currentBrainBreak);
  renderFavorites();
});