document.addEventListener("DOMContentLoaded", function () {
  const rowsContainer = document.getElementById("teamNameRows");
  const addStudentBtn = document.getElementById("teamAddStudentBtn");
  const pasteListToggleBtn = document.getElementById("teamPasteListToggleBtn");
  const pasteListPanel = document.getElementById("teamPasteListPanel");
  const pasteNamesInput = document.getElementById("teamPasteNames");
  const importNamesBtn = document.getElementById("teamImportNamesBtn");
  const cancelPasteBtn = document.getElementById("teamCancelPasteBtn");
  const teamCountSelect = document.getElementById("teamCount");
  const teamCountHint = document.getElementById("teamCountHint");
  const teamNameModeSelect = document.getElementById("teamNameMode");
  const customTeamNamesPanel = document.getElementById("customTeamNamesPanel");
  const customTeamNamesInput = document.getElementById("customTeamNames");
  const generateBtn = document.getElementById("generateBtn");
  const fullscreenBtn = document.getElementById("teamFullscreenBtn");
  const clearBtn = document.getElementById("clearBtn");
  const result = document.getElementById("result");
  const studentCountBadge = document.getElementById("teamStudentCountBadge");
  const card = document.querySelector(".team-generator-card");

  if (
    !rowsContainer ||
    !addStudentBtn ||
    !pasteListToggleBtn ||
    !pasteListPanel ||
    !pasteNamesInput ||
    !importNamesBtn ||
    !cancelPasteBtn ||
    !teamCountSelect ||
    !teamCountHint ||
    !teamNameModeSelect ||
    !customTeamNamesPanel ||
    !customTeamNamesInput ||
    !generateBtn ||
    !fullscreenBtn ||
    !clearBtn ||
    !result ||
    !studentCountBadge ||
    !card
  ) {
    return;
  }

  const isSpanish =
    document.documentElement.lang &&
    document.documentElement.lang.toLowerCase().startsWith("es");

  const text = isSpanish
    ? {
        studentName: "Nombre del estudiante",
        removeStudent: "Eliminar estudiante",
        students: "Estudiantes",
        student: "Estudiante",
        empty: "Agrega al menos 3 estudiantes para generar equipos.",
        ready: "Los equipos apareceran aqui...",
        team: "Equipo",
        teams: "equipos",
        teamSingular: "equipo",
        maxTeamsPrefix: "Con esta lista puedes crear hasta",
        maxTeamsSuffix: "manteniendo equipos de 2 o mas cuando sea posible.",
        needsMore: "Agrega al menos 3 estudiantes para activar los equipos.",
        enterFullscreen: "Pantalla Completa",
        exitFullscreen: "Salir de Pantalla Completa"
      }
    : {
        studentName: "Student name",
        removeStudent: "Remove student",
        students: "Students",
        student: "Student",
        empty: "Add at least 3 students to generate teams.",
        ready: "Teams will appear here...",
        team: "Team",
        teams: "teams",
        teamSingular: "team",
        maxTeamsPrefix: "This list can create up to",
        maxTeamsSuffix: "while keeping teams of 2 or more when possible.",
        needsMore: "Add at least 3 students to activate team options.",
        enterFullscreen: "Fullscreen Mode",
        exitFullscreen: "Exit Fullscreen"
      };

  const colorTeams = [
    { name: isSpanish ? "Rojo" : "Red", color: "#ef4444", soft: "#fee2e2" },
    { name: isSpanish ? "Azul" : "Blue", color: "#2563eb", soft: "#dbeafe" },
    { name: isSpanish ? "Verde" : "Green", color: "#16a34a", soft: "#dcfce7" },
    { name: isSpanish ? "Amarillo" : "Yellow", color: "#ca8a04", soft: "#fef9c3" },
    { name: isSpanish ? "Morado" : "Purple", color: "#7c3aed", soft: "#ede9fe" },
    { name: isSpanish ? "Naranja" : "Orange", color: "#ea580c", soft: "#ffedd5" },
    { name: isSpanish ? "Rosado" : "Pink", color: "#db2777", soft: "#fce7f3" },
    { name: isSpanish ? "Turquesa" : "Teal", color: "#0f766e", soft: "#ccfbf1" },
    { name: isSpanish ? "Gris" : "Gray", color: "#475569", soft: "#e2e8f0" },
    { name: isSpanish ? "Negro" : "Black", color: "#111827", soft: "#e5e7eb" }
  ];

  const CLASS_LIST_STORAGE_KEY = "helpingTeachers.classList";
  const TEAM_GENERATOR_STORAGE_KEY = "helpingTeachers.teamGenerator";

  let saveTimer = null;
  let cloudLoaded = false;
  let lastTeams = null;

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function getRows() {
    return Array.from(rowsContainer.querySelectorAll(".name-list-row"));
  }

  function createRow(value = "") {
    const row = document.createElement("div");
    row.className = "name-list-row";
    row.innerHTML = `
      <input
        type="text"
        class="student-name-input"
        aria-label="${text.studentName}"
        placeholder="${text.studentName}"
        value="${escapeAttribute(value)}"
      />
      <button type="button" class="student-remove-btn" aria-label="${text.removeStudent}">x</button>
    `;
    return row;
  }

  function renumberRows() {
    getRows().forEach(function (row, index) {
      const input = row.querySelector(".student-name-input");
      input.setAttribute("aria-label", `${text.studentName} ${index + 1}`);
    });
  }

  function isRowFilled(row) {
    const input = row.querySelector(".student-name-input");
    return input.value.trim() !== "";
  }

  function ensureEmptyRowAtEnd() {
    const rows = getRows();
    const lastRow = rows[rows.length - 1];
    if (!lastRow || isRowFilled(lastRow)) {
      rowsContainer.appendChild(createRow());
      renumberRows();
    }
  }

  function addRow(value = "") {
    rowsContainer.appendChild(createRow(value));
    renumberRows();
    updateTeamOptions();
  }

  function getNames() {
    return getRows()
      .map(function (row) {
        const input = row.querySelector(".student-name-input");
        return input.value.trim();
      })
      .filter(function (name) {
        return name.length > 0;
      });
  }

  function getCustomTeamNames() {
    return customTeamNamesInput.value
      .split("\n")
      .map(function (name) {
        return name.trim();
      })
      .filter(function (name) {
        return name.length > 0;
      });
  }

  function getMaxTeamCount(studentCount) {
    if (studentCount < 3) return 0;
    if (studentCount === 3) return 2;
    return Math.floor(studentCount / 2);
  }

  function getTeamState() {
    return {
      teamCount: teamCountSelect.value,
      teamNameMode: teamNameModeSelect.value,
      customTeamNames: customTeamNamesInput.value
    };
  }

  function getClassListState() {
    return { names: getNames() };
  }

  function updateStudentCount() {
    const count = getNames().length;
    studentCountBadge.textContent =
      count === 1 ? `1 ${text.student}` : `${count} ${text.students}`;
  }

  function updateTeamOptions() {
    const names = getNames();
    const maxTeams = getMaxTeamCount(names.length);
    const previousValue = Number(teamCountSelect.value) || 2;

    updateStudentCount();
    teamCountSelect.innerHTML = "";

    if (maxTeams < 2) {
      const option = document.createElement("option");
      option.value = "2";
      option.textContent = isSpanish ? "2 equipos" : "2 Teams";
      teamCountSelect.appendChild(option);
      teamCountSelect.disabled = true;
      generateBtn.disabled = true;
      fullscreenBtn.disabled = true;
      teamCountHint.textContent = text.needsMore;
      return;
    }

    for (let count = 2; count <= maxTeams; count++) {
      const option = document.createElement("option");
      option.value = String(count);
      option.textContent = isSpanish ? `${count} equipos` : `${count} Teams`;
      teamCountSelect.appendChild(option);
    }

    teamCountSelect.value = String(Math.min(Math.max(previousValue, 2), maxTeams));
    teamCountSelect.disabled = false;
    generateBtn.disabled = false;
    fullscreenBtn.disabled = false;

    const label = maxTeams === 1 ? text.teamSingular : text.teams;
    teamCountHint.textContent = `${text.maxTeamsPrefix} ${maxTeams} ${label}, ${text.maxTeamsSuffix}`;
  }

  function updateTeamNameMode() {
    customTeamNamesPanel.hidden = teamNameModeSelect.value !== "custom";
  }

  function applyClassList(state) {
    if (!state || !Array.isArray(state.names) || state.names.length === 0) return false;
    rowsContainer.innerHTML = "";
    state.names.forEach(function (name) {
      addRow(name);
    });
    ensureEmptyRowAtEnd();
    updateTeamOptions();
    return true;
  }

  function applyTeamState(state) {
    if (!state) return false;
    if (state.teamNameMode !== undefined) teamNameModeSelect.value = state.teamNameMode;
    if (state.customTeamNames !== undefined) customTeamNamesInput.value = state.customTeamNames;
    updateTeamNameMode();
    updateTeamOptions();
    if (state.teamCount !== undefined) {
      const maxTeams = getMaxTeamCount(getNames().length);
      if (maxTeams >= 2) teamCountSelect.value = String(Math.min(Number(state.teamCount) || 2, maxTeams));
    }
    return true;
  }

  function saveState() {
    const classListState = getClassListState();
    const teamState = getTeamState();
    localStorage.setItem(CLASS_LIST_STORAGE_KEY, JSON.stringify(classListState));
    localStorage.setItem(TEAM_GENERATOR_STORAGE_KEY, JSON.stringify(teamState));

    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      if (window.HelpingTeachersAuth && window.HelpingTeachersAuth.isSignedIn()) {
        window.HelpingTeachersAuth.saveToolSetting("class-list", "names", classListState);
        window.HelpingTeachersAuth.saveToolSetting("team-generator", "settings", teamState);
      }
    }, 700);
  }

  function loadJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  }

  function loadLocalState() {
    const classListLoaded = applyClassList(loadJson(CLASS_LIST_STORAGE_KEY));
    const oldTeamState = loadJson(TEAM_GENERATOR_STORAGE_KEY);
    if (!classListLoaded && oldTeamState && typeof oldTeamState.names === "string") {
      const names = oldTeamState.names.split("\n").map(name => name.trim()).filter(Boolean);
      applyClassList({ names });
    }
    applyTeamState(oldTeamState);
  }

  async function loadCloudState() {
    if (!window.HelpingTeachersAuth || !window.HelpingTeachersAuth.isSignedIn() || cloudLoaded) return;
    cloudLoaded = true;

    let classListResult = await window.HelpingTeachersAuth.getToolSetting("class-list", "names");
    const teamResult = await window.HelpingTeachersAuth.getToolSetting("team-generator", "settings");

    if (!classListResult.error && (!classListResult.data || !Array.isArray(classListResult.data.names)) && teamResult.data && typeof teamResult.data.names === "string") {
      const migratedNames = teamResult.data.names.split("\n").map(name => name.trim()).filter(Boolean);
      classListResult = { error: null, data: { names: migratedNames } };
    }

    if (!classListResult.error && classListResult.data && applyClassList(classListResult.data)) {
      localStorage.setItem(CLASS_LIST_STORAGE_KEY, JSON.stringify(classListResult.data));
      window.HelpingTeachersAuth.saveToolSetting("class-list", "names", classListResult.data);
    }

    if (!teamResult.error && teamResult.data && applyTeamState(teamResult.data)) {
      localStorage.setItem(TEAM_GENERATOR_STORAGE_KEY, JSON.stringify(getTeamState()));
    }
  }

  function shuffleNames(names) {
    const shuffledNames = names.slice();
    for (let i = shuffledNames.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const temp = shuffledNames[i];
      shuffledNames[i] = shuffledNames[randomIndex];
      shuffledNames[randomIndex] = temp;
    }
    return shuffledNames;
  }

  function createTeams(names, teamCount) {
    const teams = [];
    for (let i = 0; i < teamCount; i++) teams.push([]);
    names.forEach(function (name, index) {
      teams[index % teamCount].push(name);
    });
    return teams;
  }

  function getTeamDisplay(index) {
    const mode = teamNameModeSelect.value;
    if (mode === "color") {
      return colorTeams[index % colorTeams.length];
    }
    if (mode === "custom") {
      const customNames = getCustomTeamNames();
      return {
        name: customNames[index] || `${text.team} ${index + 1}`,
        color: "#2563eb",
        soft: "#dbeafe"
      };
    }
    return {
      name: `${text.team} ${index + 1}`,
      color: "#2563eb",
      soft: "#dbeafe"
    };
  }

  function renderTeams(teams) {
    lastTeams = teams;
    result.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "team-grid";

    teams.forEach(function (team, index) {
      const display = getTeamDisplay(index);
      const teamCard = document.createElement("div");
      teamCard.className = "team-card";
      teamCard.style.setProperty("--team-color", display.color);
      teamCard.style.setProperty("--team-soft", display.soft);

      const teamTitle = document.createElement("h3");
      teamTitle.textContent = display.name;

      const teamList = document.createElement("ul");
      team.forEach(function (student) {
        const listItem = document.createElement("li");
        listItem.textContent = student;
        teamList.appendChild(listItem);
      });

      teamCard.appendChild(teamTitle);
      teamCard.appendChild(teamList);
      wrapper.appendChild(teamCard);
    });

    result.appendChild(wrapper);
  }

  function showMessage(message) {
    lastTeams = null;
    result.innerHTML = "";
    result.textContent = message;
  }

  function generateTeams() {
    const names = getNames();
    const teamCount = Number(teamCountSelect.value);
    const maxTeams = getMaxTeamCount(names.length);

    if (maxTeams < 2) {
      showMessage(text.empty);
      const firstInput = rowsContainer.querySelector(".student-name-input");
      if (firstInput) firstInput.focus();
      return false;
    }

    renderTeams(createTeams(shuffleNames(names), Math.min(teamCount, maxTeams)));
    saveState();
    return true;
  }

  function importNames() {
    const names = pasteNamesInput.value.split("\n").map(name => name.trim()).filter(Boolean);
    if (!names.length) {
      pasteNamesInput.focus();
      return;
    }
    applyClassList({ names });
    pasteNamesInput.value = "";
    pasteListPanel.hidden = true;
    showMessage(text.ready);
    saveState();
  }

  function isFullscreenActive() {
    return document.fullscreenElement === card;
  }

  function updateFullscreenButton() {
    fullscreenBtn.textContent = isFullscreenActive() ? text.exitFullscreen : text.enterFullscreen;
  }

  function toggleFullscreen() {
    if (!document.fullscreenEnabled) {
      fullscreenBtn.hidden = true;
      return;
    }
    if (!lastTeams) generateTeams();
    if (isFullscreenActive()) {
      document.exitFullscreen?.();
      return;
    }
    card.requestFullscreen?.();
  }

  rowsContainer.addEventListener("input", function (event) {
    if (event.target.classList.contains("student-name-input")) {
      ensureEmptyRowAtEnd();
      updateTeamOptions();
      saveState();
    }
  });

  rowsContainer.addEventListener("click", function (event) {
    if (!event.target.classList.contains("student-remove-btn")) return;
    const row = event.target.closest(".name-list-row");
    if (!row) return;
    row.remove();
    if (!getRows().length) addRow();
    ensureEmptyRowAtEnd();
    renumberRows();
    updateTeamOptions();
    saveState();
  });

  addStudentBtn.addEventListener("click", function () {
    addRow();
    const rows = getRows();
    rows[rows.length - 1].querySelector(".student-name-input").focus();
  });

  pasteListToggleBtn.addEventListener("click", function () {
    pasteListPanel.hidden = !pasteListPanel.hidden;
    if (!pasteListPanel.hidden) pasteNamesInput.focus();
  });

  cancelPasteBtn.addEventListener("click", function () {
    pasteListPanel.hidden = true;
    pasteNamesInput.value = "";
  });

  importNamesBtn.addEventListener("click", importNames);
  teamCountSelect.addEventListener("change", saveState);
  teamNameModeSelect.addEventListener("change", function () {
    updateTeamNameMode();
    if (lastTeams) renderTeams(lastTeams);
    saveState();
  });
  customTeamNamesInput.addEventListener("input", function () {
    if (lastTeams) renderTeams(lastTeams);
    saveState();
  });

  generateBtn.addEventListener("click", generateTeams);
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  clearBtn.addEventListener("click", function () {
    rowsContainer.innerHTML = "";
    addRow();
    addRow();
    addRow();
    ensureEmptyRowAtEnd();
    teamCountSelect.value = "2";
    showMessage(text.ready);
    updateTeamOptions();
    saveState();
    const firstInput = rowsContainer.querySelector(".student-name-input");
    if (firstInput) firstInput.focus();
  });

  document.addEventListener("fullscreenchange", updateFullscreenButton);

  loadLocalState();
  if (window.HelpingTeachersAuth && typeof window.HelpingTeachersAuth.onReady === "function") {
    window.HelpingTeachersAuth.onReady(loadCloudState);
  }

  ensureEmptyRowAtEnd();
  renumberRows();
  updateTeamNameMode();
  updateTeamOptions();
  updateFullscreenButton();
  if (!document.fullscreenEnabled) fullscreenBtn.hidden = true;
});