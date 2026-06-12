document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".reward-wheel-card");

  if (!card) return;

  const wheel = document.getElementById("rewardWheel");
  const optionsTextarea = document.getElementById("rewardOptions");
  const spinBtn = document.getElementById("spinRewardBtn");
  const resetBtn = document.getElementById("resetRewardBtn");
  const resultEl = document.getElementById("rewardResult");
  const historyEl = document.getElementById("rewardHistory");

  const READY_MESSAGE = card.dataset.readyMessage || "Ready to spin...";
  const SPINNING_MESSAGE = card.dataset.spinningMessage || "Spinning...";
  const EMPTY_OPTIONS =
    card.dataset.emptyOptions || "Please add at least two rewards.";
  const EMPTY_HISTORY =
    card.dataset.emptyHistory || "No rewards picked yet.";

  const COLORS = [
    "#2563EB",
    "#FBBF24",
    "#22C55E",
    "#8B5CF6",
    "#EF4444",
    "#14B8A6",
    "#F97316",
    "#EC4899"
  ];

  const FULL_SPINS = 6;
  const SPIN_DURATION = 4200;

  let currentRotation = 0;
  let history = [];
  let isSpinning = false;

  function getRewards() {
    return optionsTextarea.value
      .split("\n")
      .map(option => option.trim())
      .filter(Boolean);
  }

  function getRewardIcon(reward) {
    const text = reward.toLowerCase();

    if (
      text.includes("recess") ||
      text.includes("playground") ||
      text.includes("play ground") ||
      text.includes("park") ||
      text.includes("outside") ||
      text.includes("outdoor") ||
      text.includes("recreo") ||
      text.includes("patio") ||
      text.includes("parque") ||
      text.includes("afuera")
    ) {
      return "🛝";
    }

    if (
      text.includes("line leader") ||
      text.includes("leader") ||
      text.includes("líder") ||
      text.includes("lider") ||
      text.includes("fila") ||
      text.includes("línea") ||
      text.includes("linea")
    ) {
      return "👥";
    }

    if (
      text.includes("helper") ||
      text.includes("teacher helper") ||
      text.includes("assistant") ||
      text.includes("monitor") ||
      text.includes("ayudante") ||
      text.includes("asistente") ||
      text.includes("ayuda") ||
      text.includes("maestro") ||
      text.includes("maestra") ||
      text.includes("encargado") ||
      text.includes("encargada")
    ) {
      return "🙋";
    }

    if (
      text.includes("song") ||
      text.includes("music") ||
      text.includes("sing") ||
      text.includes("dance") ||
      text.includes("playlist") ||
      text.includes("canción") ||
      text.includes("cancion") ||
      text.includes("música") ||
      text.includes("musica") ||
      text.includes("cantar") ||
      text.includes("baile") ||
      text.includes("bailar")
    ) {
      return "🎵";
    }

    if (
      text.includes("homework") ||
      text.includes("pass") ||
      text.includes("worksheet") ||
      text.includes("paper") ||
      text.includes("assignment") ||
      text.includes("tarea") ||
      text.includes("pase") ||
      text.includes("hoja") ||
      text.includes("trabajo") ||
      text.includes("asignación") ||
      text.includes("asignacion")
    ) {
      return "📄";
    }

    if (
      text.includes("sticker") ||
      text.includes("star") ||
      text.includes("badge") ||
      text.includes("certificate") ||
      text.includes("pegatina") ||
      text.includes("calcomanía") ||
      text.includes("calcomania") ||
      text.includes("estrella") ||
      text.includes("insignia") ||
      text.includes("certificado")
    ) {
      return "⭐";
    }

    if (
      text.includes("game") ||
      text.includes("play") ||
      text.includes("choice") ||
      text.includes("activity") ||
      text.includes("juego") ||
      text.includes("jugar") ||
      text.includes("escoger") ||
      text.includes("elegir") ||
      text.includes("actividad")
    ) {
      return "🎮";
    }

    if (
      text.includes("draw") ||
      text.includes("color") ||
      text.includes("art") ||
      text.includes("paint") ||
      text.includes("craft") ||
      text.includes("dibujar") ||
      text.includes("colorear") ||
      text.includes("arte") ||
      text.includes("pintar") ||
      text.includes("manualidad")
    ) {
      return "🎨";
    }

    if (
      text.includes("dress down") ||
      text.includes("pajama") ||
      text.includes("shirt") ||
      text.includes("clothes") ||
      text.includes("uniform") ||
      text.includes("hat") ||
      text.includes("ropa") ||
      text.includes("pijama") ||
      text.includes("camisa") ||
      text.includes("uniforme") ||
      text.includes("gorra") ||
      text.includes("sombrero")
    ) {
      return "👕";
    }

    if (
      text.includes("snack") ||
      text.includes("treat") ||
      text.includes("candy") ||
      text.includes("cookie") ||
      text.includes("pizza") ||
      text.includes("popcorn") ||
      text.includes("merienda") ||
      text.includes("dulce") ||
      text.includes("galleta") ||
      text.includes("comida") ||
      text.includes("palomitas")
    ) {
      return "🍬";
    }

    if (
      text.includes("book") ||
      text.includes("read") ||
      text.includes("library") ||
      text.includes("story") ||
      text.includes("libro") ||
      text.includes("leer") ||
      text.includes("lectura") ||
      text.includes("biblioteca") ||
      text.includes("cuento")
    ) {
      return "📚";
    }

    if (
      text.includes("computer") ||
      text.includes("tablet") ||
      text.includes("technology") ||
      text.includes("screen") ||
      text.includes("video") ||
      text.includes("computadora") ||
      text.includes("tableta") ||
      text.includes("tecnología") ||
      text.includes("tecnologia") ||
      text.includes("pantalla")
    ) {
      return "💻";
    }

    if (
      text.includes("seat") ||
      text.includes("chair") ||
      text.includes("desk") ||
      text.includes("sit") ||
      text.includes("asiento") ||
      text.includes("silla") ||
      text.includes("mesa") ||
      text.includes("sentarse")
    ) {
      return "🪑";
    }

    if (
      text.includes("friend") ||
      text.includes("partner") ||
      text.includes("buddy") ||
      text.includes("team") ||
      text.includes("amigo") ||
      text.includes("pareja") ||
      text.includes("compañero") ||
      text.includes("companero") ||
      text.includes("equipo")
    ) {
      return "🤝";
    }

    if (
      text.includes("points") ||
      text.includes("bonus") ||
      text.includes("prize") ||
      text.includes("reward") ||
      text.includes("puntos") ||
      text.includes("bono") ||
      text.includes("premio") ||
      text.includes("recompensa")
    ) {
      return "🏆";
    }

    return "🎁";
  }

  function normalizeDegrees(degrees) {
    return ((degrees % 360) + 360) % 360;
  }

  function getRewardIndexFromPointer(total, rotation) {
    const angle = 360 / total;
    const pointerAngleOnWheel = normalizeDegrees(-rotation);

    return Math.floor(pointerAngleOnWheel / angle) % total;
  }

  function renderWheel() {
    const rewards = getRewards();
    const total = rewards.length;

    wheel.innerHTML = '<div class="wheel-center">HT</div>';

    if (total < 2) {
      wheel.style.background = "#dbeafe";
      return;
    }

    const angle = 360 / total;

    const gradientParts = rewards.map((_, index) => {
      const start = index * angle;
      const end = start + angle;
      const color = COLORS[index % COLORS.length];

      return `${color} ${start}deg ${end}deg`;
    });

    wheel.style.background = `conic-gradient(from -90deg, ${gradientParts.join(", ")})`;

    rewards.forEach((reward, index) => {
      const label = document.createElement("div");
      const labelAngle = index * angle + angle / 2;
      const icon = getRewardIcon(reward);

      label.className = "wheel-label";
      label.style.transform = `
        rotate(${labelAngle}deg)
        translateY(-112px)
        rotate(${-labelAngle}deg)
      `;

      label.innerHTML = `
        <span class="wheel-label-icon">${icon}</span>
        <span class="wheel-label-text">${reward}</span>
      `;

      wheel.appendChild(label);
    });
  }

  function renderHistory() {
    if (history.length === 0) {
      historyEl.textContent = EMPTY_HISTORY;
      return;
    }

    historyEl.innerHTML = history
      .slice()
      .reverse()
      .map(reward => {
        const icon = getRewardIcon(reward);
        return `<span class="history-chip">${icon} ${reward}</span>`;
      })
      .join("");
  }

  function showMessage(message) {
    resultEl.textContent = message;
    resultEl.classList.remove("reward-animate");
  }

  function animateResult(reward) {
    const icon = getRewardIcon(reward);

    resultEl.classList.remove("reward-animate");

    void resultEl.offsetWidth;

    resultEl.innerHTML = `${icon} ${reward}`;
    resultEl.classList.add("reward-animate");
  }

  function setSpinningState(state) {
    isSpinning = state;
    spinBtn.disabled = state;
  }

  function spinWheel() {
    if (isSpinning) return;

    const rewards = getRewards();
    const total = rewards.length;

    if (total < 2) {
      showMessage(EMPTY_OPTIONS);
      return;
    }

    setSpinningState(true);
    resultEl.textContent = SPINNING_MESSAGE;

    const selectedIndex = Math.floor(Math.random() * total);
    const angle = 360 / total;
    const selectedCenterAngle = selectedIndex * angle + angle / 2;
    const rotationToSelected = FULL_SPINS * 360 - selectedCenterAngle;

    currentRotation += rotationToSelected;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      const visualWinnerIndex = getRewardIndexFromPointer(
        total,
        currentRotation
      );

      const selectedReward = rewards[visualWinnerIndex];

      history.push(selectedReward);
      animateResult(selectedReward);
      renderHistory();

      setSpinningState(false);
    }, SPIN_DURATION);
  }

  function resetWheel() {
    history = [];
    currentRotation = 0;

    setSpinningState(false);

    wheel.style.transform = "rotate(0deg)";
    resultEl.textContent = READY_MESSAGE;
    resultEl.classList.remove("reward-animate");

    renderWheel();
    renderHistory();
  }

  optionsTextarea.addEventListener("input", () => {
    if (isSpinning) return;

    currentRotation = 0;
    wheel.style.transform = "rotate(0deg)";
    renderWheel();
  });

  spinBtn.addEventListener("click", spinWheel);
  resetBtn.addEventListener("click", resetWheel);

  renderWheel();
  renderHistory();
});