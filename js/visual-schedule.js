document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".visual-schedule-card");

  if (!card) return;

  const rowsContainer = document.getElementById("scheduleRows");
  const addRowBtn = document.getElementById("addScheduleRowBtn");
  const scheduleList = document.getElementById("visualScheduleList");
  const currentActivityBox = document.getElementById("currentActivityBox");

  const previousBtn = document.getElementById("previousActivityBtn");
  const nextBtn = document.getElementById("nextActivityBtn");
  const resetBtn = document.getElementById("resetScheduleBtn");

  const EMPTY_MESSAGE =
    card.dataset.emptyMessage || "Please add at least one activity.";

  const CURRENT_LABEL =
    card.dataset.currentLabel || "Current Activity";

  const COMPLETED_LABEL =
    card.dataset.completedLabel || "Completed";

  const UPCOMING_LABEL =
    card.dataset.upcomingLabel || "Upcoming";

  const NO_TIME_LABEL =
    card.dataset.noTimeLabel || "No time";

  const ACTIVITY_PLACEHOLDER =
    card.dataset.activityPlaceholder || "Activity";

  const TIME_PLACEHOLDER =
    card.dataset.timePlaceholder || "Start time";

  const CURRENT_TIME_LABEL =
    card.dataset.currentTimeLabel || "Now";

  const UPDATE_INTERVAL = 30000;

  let manualIndex = null;
  let autoTimer = null;
  const VISUAL_SCHEDULE_STORAGE_KEY = document.documentElement.lang && document.documentElement.lang.toLowerCase().startsWith("es") ? "helpingTeachers.visualSchedule.es" : "helpingTeachers.visualSchedule.en";
  let saveTimer = null;
  let cloudLoaded = false;

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function includesAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  function escapeHTML(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getActivityIcon(activity) {
    const text = normalizeText(activity);

    if (
      includesAny(text, [
        "morning",
        "meeting",
        "circle",
        "calendar",
        "arrival",
        "welcome",
        "manana",
        "reunion",
        "circulo",
        "calendario",
        "bienvenida",
        "llegada"
      ])
    ) {
      return "☀️";
    }

    if (
      includesAny(text, [
        "math",
        "number",
        "count",
        "addition",
        "subtraction",
        "multiplication",
        "division",
        "geometry",
        "algebra",
        "matematica",
        "matematicas",
        "numero",
        "numeros",
        "conteo",
        "contar",
        "suma",
        "resta",
        "multiplicacion",
        "division",
        "geometria",
        "algebra"
      ])
    ) {
      return "➕";
    }

    if (
      includesAny(text, [
        "reading",
        "read",
        "book",
        "library",
        "story",
        "phonics",
        "vocabulary",
        "language",
        "grammar",
        "lectura",
        "leer",
        "libro",
        "biblioteca",
        "cuento",
        "fonetica",
        "vocabulario",
        "lenguaje",
        "gramatica",
        "espanol",
        "comprension"
      ])
    ) {
      return "📚";
    }

    if (
      includesAny(text, [
        "writing",
        "journal",
        "sentence",
        "letters",
        "handwriting",
        "escritura",
        "escribir",
        "diario",
        "oracion",
        "letras",
        "caligrafia"
      ])
    ) {
      return "✏️";
    }

    if (
      includesAny(text, [
        "science",
        "experiment",
        "lab",
        "nature",
        "stem",
        "biology",
        "chemistry",
        "physics",
        "ciencia",
        "ciencias",
        "experimento",
        "laboratorio",
        "naturaleza",
        "biologia",
        "quimica",
        "fisica"
      ])
    ) {
      return "🔬";
    }

    if (
      includesAny(text, [
        "social studies",
        "history",
        "geography",
        "map",
        "culture",
        "government",
        "estudios sociales",
        "historia",
        "geografia",
        "mapa",
        "mapas",
        "cultura",
        "gobierno"
      ])
    ) {
      return "🌎";
    }

    if (
      includesAny(text, [
        "art",
        "draw",
        "paint",
        "color",
        "craft",
        "arte",
        "dibujar",
        "pintar",
        "colorear",
        "manualidad",
        "manualidades"
      ])
    ) {
      return "🎨";
    }

    if (
      includesAny(text, [
        "music",
        "song",
        "sing",
        "dance",
        "choir",
        "instrument",
        "musica",
        "cancion",
        "cantar",
        "baile",
        "bailar",
        "coro",
        "instrumento",
        "guitarra",
        "piano"
      ])
    ) {
      return "🎵";
    }

    if (
      includesAny(text, [
        "recess",
        "playground",
        "play ground",
        "outside",
        "outdoor",
        "park",
        "free play",
        "recreo",
        "patio",
        "afuera",
        "parque",
        "juego libre"
      ])
    ) {
      return "🛝";
    }

    if (
      includesAny(text, [
        "lunch",
        "snack",
        "breakfast",
        "eat",
        "meal",
        "food",
        "almuerzo",
        "merienda",
        "desayuno",
        "comer",
        "comida"
      ])
    ) {
      return "🍎";
    }

    if (
      includesAny(text, [
        "computer",
        "tablet",
        "technology",
        "screen",
        "coding",
        "robotics",
        "media",
        "computadora",
        "computador",
        "tableta",
        "tecnologia",
        "pantalla",
        "programacion",
        "robotica"
      ])
    ) {
      return "💻";
    }

    if (
      includesAny(text, [
        "gym",
        "pe",
        "physical",
        "exercise",
        "movement",
        "sports",
        "gimnasio",
        "educacion fisica",
        "ejercicio",
        "movimiento",
        "deporte",
        "deportes"
      ])
    ) {
      return "🏃";
    }

    if (
      includesAny(text, [
        "dismissal",
        "home",
        "bus",
        "pickup",
        "pack up",
        "salida",
        "casa",
        "autobus",
        "recogida",
        "despedida",
        "mochila"
      ])
    ) {
      return "🏠";
    }

    if (
      includesAny(text, [
        "rest",
        "nap",
        "quiet",
        "relax",
        "calm",
        "descanso",
        "siesta",
        "silencio",
        "relajacion",
        "calma"
      ])
    ) {
      return "😴";
    }

    if (
      includesAny(text, [
        "centers",
        "center",
        "stations",
        "groups",
        "small group",
        "centros",
        "centro",
        "estaciones",
        "grupos",
        "grupo pequeno",
        "grupo pequeño"
      ])
    ) {
      return "🧩";
    }

    if (
      includesAny(text, [
        "test",
        "quiz",
        "exam",
        "assessment",
        "prueba",
        "examen",
        "evaluacion",
        "quiz"
      ])
    ) {
      return "📝";
    }

    return "📌";
  }

  function createRow(activity = "", time = "") {
    const row = document.createElement("div");
    row.className = "schedule-row";

    const activityInput = document.createElement("input");
    activityInput.type = "text";
    activityInput.className = "schedule-activity-input";
    activityInput.value = activity;
    activityInput.placeholder = ACTIVITY_PLACEHOLDER;

    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.className = "schedule-time-input";
    timeInput.value = time;
    timeInput.setAttribute("aria-label", TIME_PLACEHOLDER);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "schedule-remove-btn";
    removeBtn.setAttribute("aria-label", "Remove activity");
    removeBtn.textContent = "×";

    row.appendChild(activityInput);
    row.appendChild(timeInput);
    row.appendChild(removeBtn);

    return row;
  }

  function getActivities() {
    const rows = [...rowsContainer.querySelectorAll(".schedule-row")];

    return rows
      .map(row => {
        const title = row
          .querySelector(".schedule-activity-input")
          .value.trim();

        const time = row.querySelector(".schedule-time-input").value;

        return { title, time };
      })
      .filter(activity => activity.title.length > 0);
  }

  function getCurrentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  function getCurrentIndexByTime(activities) {
    const timedActivities = activities
      .map((activity, index) => ({ ...activity, index }))
      .filter(activity => activity.time);

    if (timedActivities.length === 0) return 0;

    const currentMinutes = getCurrentMinutes();
    let currentIndex = timedActivities[0].index;

    timedActivities.forEach(activity => {
      const [hours, minutes] = activity.time.split(":").map(Number);
      const activityMinutes = hours * 60 + minutes;

      if (activityMinutes <= currentMinutes) {
        currentIndex = activity.index;
      }
    });

    return currentIndex;
  }

  function getActiveIndex(activities) {
    if (activities.length === 0) return 0;

    if (manualIndex !== null) {
      return Math.min(Math.max(manualIndex, 0), activities.length - 1);
    }

    return getCurrentIndexByTime(activities);
  }

  function formatTime(time) {
    if (!time) return NO_TIME_LABEL;

    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getCurrentTimeLabel() {
    const now = new Date();

    return now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function ensureEmptyRow() {
    const rows = [...rowsContainer.querySelectorAll(".schedule-row")];

    if (rows.length === 0) {
      rowsContainer.appendChild(createRow());
      return;
    }

    const lastRow = rows[rows.length - 1];

    const lastTitle = lastRow
      .querySelector(".schedule-activity-input")
      .value.trim();

    const lastTime = lastRow.querySelector(".schedule-time-input").value;

    if (lastTitle || lastTime) {
      rowsContainer.appendChild(createRow());
    }
  }

  function updateCurrentActivity(activities, activeIndex) {
    if (activities.length === 0) {
      currentActivityBox.textContent = EMPTY_MESSAGE;
      return;
    }

    const activity = activities[activeIndex];
    const icon = getActivityIcon(activity.title);
    const currentTime = getCurrentTimeLabel();

    currentActivityBox.textContent =
      `${CURRENT_LABEL}: ${icon} ${activity.title} • ${CURRENT_TIME_LABEL}: ${currentTime}`;
  }

  function renderSchedule() {
    const activities = getActivities();

    ensureEmptyRow();

    if (activities.length === 0) {
      scheduleList.innerHTML = `
        <div class="visual-schedule-empty">
          ${escapeHTML(EMPTY_MESSAGE)}
        </div>
      `;

      updateCurrentActivity(activities, 0);
      return;
    }

    const activeIndex = getActiveIndex(activities);

    scheduleList.innerHTML = activities
      .map((activity, index) => {
        const icon = getActivityIcon(activity.title);
        const number = index + 1;

        let statusClass = "upcoming";
        let statusText = UPCOMING_LABEL;

        if (index < activeIndex) {
          statusClass = "completed";
          statusText = COMPLETED_LABEL;
        }

        if (index === activeIndex) {
          statusClass = "current";
          statusText = CURRENT_LABEL;
        }

        return `
          <div class="visual-schedule-item ${statusClass}">
            <div class="schedule-card-number">${number}</div>
            <div class="schedule-card-icon">${icon}</div>
            <div class="schedule-card-title">${escapeHTML(activity.title)}</div>
            <div class="schedule-card-time">${escapeHTML(formatTime(activity.time))}</div>
            <span class="schedule-card-badge">${escapeHTML(statusText)}</span>
          </div>
        `;
      })
      .join("");

    updateCurrentActivity(activities, activeIndex);
  }


  function saveLocalSchedule() {
    localStorage.setItem(VISUAL_SCHEDULE_STORAGE_KEY, JSON.stringify({ activities: getActivities() }));
  }

  function scheduleSave() {
    saveLocalSchedule();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      if (window.HelpingTeachersAuth && window.HelpingTeachersAuth.isSignedIn()) {
        window.HelpingTeachersAuth.saveToolSetting("visual-schedule", "activities", { activities: getActivities() });
      }
    }, 700);
  }

  function applyScheduleState(state) {
    if (!state || !Array.isArray(state.activities) || state.activities.length === 0) return false;
    rowsContainer.innerHTML = "";
    state.activities.forEach(activity => rowsContainer.appendChild(createRow(activity.title || "", activity.time || "")));
    ensureEmptyRow();
    manualIndex = null;
    renderSchedule();
    return true;
  }

  function loadLocalSchedule() {
    try {
      return JSON.parse(localStorage.getItem(VISUAL_SCHEDULE_STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  async function loadCloudSchedule() {
    if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn() || cloudLoaded) return;
    cloudLoaded = true;
    const { data, error } = await window.HelpingTeachersAuth.getToolSetting("visual-schedule", "activities");
    if (!error && data && applyScheduleState(data)) saveLocalSchedule();
  }
  function removeRow(row) {
    const rows = rowsContainer.querySelectorAll(".schedule-row");

    if (rows.length <= 1) {
      row.querySelector(".schedule-activity-input").value = "";
      row.querySelector(".schedule-time-input").value = "";
    } else {
      row.remove();
    }

    manualIndex = null;
    renderSchedule();
    scheduleSave();
  }

  function handleRowsInput(event) {
    const isActivityInput =
      event.target.classList.contains("schedule-activity-input");

    const isTimeInput =
      event.target.classList.contains("schedule-time-input");

    if (!isActivityInput && !isTimeInput) return;

    manualIndex = null;
    renderSchedule();
    scheduleSave();
  }

  function handleRowsClick(event) {
    if (!event.target.classList.contains("schedule-remove-btn")) return;

    const row = event.target.closest(".schedule-row");

    if (row) {
      removeRow(row);
    }
  }

  function addRow() {
    rowsContainer.appendChild(createRow());

    const newRow = rowsContainer.lastElementChild;
    const activityInput = newRow.querySelector(".schedule-activity-input");

    activityInput.focus();
    scheduleSave();
  }

  function goToPreviousActivity() {
    const activities = getActivities();

    if (activities.length === 0) return;

    const activeIndex = getActiveIndex(activities);

    manualIndex = Math.max(activeIndex - 1, 0);
    renderSchedule();
  }

  function goToNextActivity() {
    const activities = getActivities();

    if (activities.length === 0) return;

    const activeIndex = getActiveIndex(activities);

    manualIndex = Math.min(activeIndex + 1, activities.length - 1);
    renderSchedule();
  }

  function resetSchedule() {
    manualIndex = null;
    renderSchedule();
  }

  rowsContainer.addEventListener("input", handleRowsInput);
  rowsContainer.addEventListener("click", handleRowsClick);

  addRowBtn.addEventListener("click", addRow);
  previousBtn.addEventListener("click", goToPreviousActivity);
  nextBtn.addEventListener("click", goToNextActivity);
  resetBtn.addEventListener("click", resetSchedule);

  autoTimer = setInterval(() => {
    if (manualIndex === null) {
      renderSchedule();
    } else {
      const activities = getActivities();
      const activeIndex = getActiveIndex(activities);
      updateCurrentActivity(activities, activeIndex);
    }
  }, UPDATE_INTERVAL);

  window.addEventListener("beforeunload", () => {
    clearInterval(autoTimer);
  });

  applyScheduleState(loadLocalSchedule());
  if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
    window.HelpingTeachersAuth.onReady(loadCloudSchedule);
  }
  renderSchedule();
});