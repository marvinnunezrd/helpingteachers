document.addEventListener("DOMContentLoaded", function () {
  const rowsContainer = document.getElementById("nameRows");
  const addStudentBtn = document.getElementById("addStudentBtn");
  const pasteListToggleBtn = document.getElementById("pasteListToggleBtn");
  const pasteListPanel = document.getElementById("pasteListPanel");
  const pasteNamesInput = document.getElementById("pasteNames");
  const importNamesBtn = document.getElementById("importNamesBtn");
  const cancelPasteBtn = document.getElementById("cancelPasteBtn");

  const spinBtn = document.getElementById("spinBtn");
  const clearBtn = document.getElementById("clearBtn");
  const result = document.getElementById("result");
  const studentCountBadge = document.getElementById("studentCountBadge");
  const recentPicksList = document.getElementById("recentPicksList");

  const card = document.querySelector(".name-spinner-card");

  if (
    !rowsContainer ||
    !addStudentBtn ||
    !pasteListToggleBtn ||
    !pasteListPanel ||
    !pasteNamesInput ||
    !importNamesBtn ||
    !cancelPasteBtn ||
    !spinBtn ||
    !clearBtn ||
    !result ||
    !studentCountBadge ||
    !recentPicksList ||
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
        fairPick: "Selección justa",
        empty: "Agrega al menos un nombre.",
        ready: "Listo para girar...",
        choosing: "Eligiendo...",
        recentPicks: "Seleccionados Recientes"
      }
    : {
        studentName: "Student name",
        removeStudent: "Remove student",
        students: "Students",
        student: "Student",
        fairPick: "Fair Pick",
        empty: "Please enter at least one name.",
        ready: "Ready to spin...",
        choosing: "Choosing...",
        recentPicks: "Recent Picks"
      };

  let spinning = false;
  let recentPicks = [];

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function getRows() {
    return Array.from(
      rowsContainer.querySelectorAll(".name-list-row")
    );
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

      <button
        type="button"
        class="student-remove-btn"
        aria-label="${text.removeStudent}"
      >
        ×
      </button>
    `;

    return row;
  }

  function renumberRows() {
    getRows().forEach(function (row, index) {
      const input = row.querySelector(".student-name-input");

      input.setAttribute(
        "aria-label",
        `${text.studentName} ${index + 1}`
      );
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
    updateStudentCount();
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

  function updateStudentCount() {
    const count = getNames().length;

    studentCountBadge.textContent =
      count === 1
        ? `1 ${text.student}`
        : `${count} ${text.students}`;
  }

  function pickRandomName(names) {
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  }

  function showMessage(message) {
    result.textContent = message;
  }

  function showWinner(name) {
    result.classList.remove("winner");

    void result.offsetWidth;

    result.classList.add("winner");

    showMessage("🎉 " + name);

    addRecentPick(name);
  }

  function addRecentPick(name) {
    recentPicks = recentPicks.filter(function (item) {
      return item !== name;
    });

    recentPicks.unshift(name);

    if (recentPicks.length > 5) {
      recentPicks = recentPicks.slice(0, 5);
    }

    renderRecentPicks();
  }

  function renderRecentPicks() {
    recentPicksList.innerHTML = "";

    recentPicks.forEach(function (name) {
      const item = document.createElement("span");
      item.className = "recent-pick-item";
      item.textContent = name;
      recentPicksList.appendChild(item);
    });
  }

  function setInputsDisabled(disabled) {
    getRows().forEach(function (row) {
      const input = row.querySelector(".student-name-input");
      const removeBtn = row.querySelector(".student-remove-btn");

      input.disabled = disabled;
      removeBtn.disabled = disabled;
    });

    addStudentBtn.disabled = disabled;
    pasteListToggleBtn.disabled = disabled;
    clearBtn.disabled = disabled;
  }

  function spin() {
    if (spinning) {
      return;
    }

    const names = getNames();

    if (names.length === 0) {
      showMessage(text.empty);

      const firstInput = rowsContainer.querySelector(
        ".student-name-input"
      );

      if (firstInput) {
        firstInput.focus();
      }

      return;
    }

    spinning = true;
    spinBtn.disabled = true;
    setInputsDisabled(true);

    result.classList.remove("winner");
    showMessage(text.choosing);

    let counter = 0;
    const maxSpins = 28;

    const spinInterval = setInterval(function () {
      showMessage(pickRandomName(names));
      counter++;

      if (counter >= maxSpins) {
        clearInterval(spinInterval);

        const selectedName = pickRandomName(names);

        showWinner(selectedName);

        spinning = false;
        spinBtn.disabled = false;
        setInputsDisabled(false);
      }
    }, 75);
  }

  function clearAll() {
    if (spinning) {
      return;
    }

    rowsContainer.innerHTML = "";
    recentPicks = [];

    addRow();
    addRow();
    addRow();

    ensureEmptyRowAtEnd();
    updateStudentCount();
    renderRecentPicks();

    result.classList.remove("winner");
    showMessage(text.ready);

    const firstInput = rowsContainer.querySelector(
      ".student-name-input"
    );

    if (firstInput) {
      firstInput.focus();
    }
  }

  function importNames() {
    const names = pasteNamesInput.value
      .split("\n")
      .map(function (name) {
        return name.trim();
      })
      .filter(function (name) {
        return name.length > 0;
      });

    if (!names.length) {
      pasteNamesInput.focus();
      return;
    }

    rowsContainer.innerHTML = "";

    names.forEach(function (name) {
      addRow(name);
    });

    ensureEmptyRowAtEnd();
    updateStudentCount();

    pasteNamesInput.value = "";
    pasteListPanel.hidden = true;

    result.classList.remove("winner");
    showMessage(text.ready);
  }

  rowsContainer.addEventListener("input", function (event) {
    if (event.target.classList.contains("student-name-input")) {
      ensureEmptyRowAtEnd();
      updateStudentCount();
    }
  });

  rowsContainer.addEventListener("click", function (event) {
    if (!event.target.classList.contains("student-remove-btn")) {
      return;
    }

    const row = event.target.closest(".name-list-row");

    if (!row) {
      return;
    }

    row.remove();

    if (!getRows().length) {
      addRow();
    }

    ensureEmptyRowAtEnd();
    renumberRows();
    updateStudentCount();
  });

  addStudentBtn.addEventListener("click", function () {
    addRow();

    const rows = getRows();
    const lastRow = rows[rows.length - 1];
    const input = lastRow.querySelector(".student-name-input");

    input.focus();
  });

  pasteListToggleBtn.addEventListener("click", function () {
    pasteListPanel.hidden = !pasteListPanel.hidden;

    if (!pasteListPanel.hidden) {
      pasteNamesInput.focus();
    }
  });

  cancelPasteBtn.addEventListener("click", function () {
    pasteListPanel.hidden = true;
    pasteNamesInput.value = "";
  });

  importNamesBtn.addEventListener("click", importNames);

  spinBtn.addEventListener("click", spin);
  clearBtn.addEventListener("click", clearAll);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA", "BUTTON"].includes(
          document.activeElement.tagName
        )
      ) {
        return;
      }

      spin();
    }
  });

  renumberRows();
  ensureEmptyRowAtEnd();
  updateStudentCount();
  showMessage(text.ready);
});