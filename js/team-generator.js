document.addEventListener("DOMContentLoaded", function () {
  const namesInput = document.getElementById("names");
  const teamCountSelect = document.getElementById("teamCount");
  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const result = document.getElementById("result");

  if (!namesInput || !teamCountSelect || !generateBtn || !clearBtn || !result) {
    return;
  }

  const emptyMessage =
    namesInput.dataset.emptyMessage || "Please enter at least two names.";

  const readyMessage =
    namesInput.dataset.readyMessage || "Teams will appear here...";

  function getNames() {
    return namesInput.value
      .split("\n")
      .map(function (name) {
        return name.trim();
      })
      .filter(function (name) {
        return name.length > 0;
      });
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

    for (let i = 0; i < teamCount; i++) {
      teams.push([]);
    }

    names.forEach(function (name, index) {
      const teamIndex = index % teamCount;
      teams[teamIndex].push(name);
    });

    return teams;
  }

  function renderTeams(teams) {
    result.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "team-grid";

    teams.forEach(function (team, index) {
      const teamCard = document.createElement("div");
      teamCard.className = "team-card";

      const teamTitle = document.createElement("h3");
      teamTitle.textContent = "Team " + (index + 1);

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
    result.innerHTML = "";
    result.textContent = message;
  }

  function autoResizeTextarea() {
    namesInput.style.height = "auto";
    namesInput.style.height = namesInput.scrollHeight + "px";
  }

  namesInput.addEventListener("input", autoResizeTextarea);

  generateBtn.addEventListener("click", function () {
    const names = getNames();
    const teamCount = Number(teamCountSelect.value);

    if (names.length < 2) {
      showMessage(emptyMessage);
      namesInput.focus();
      return;
    }

    if (teamCount > names.length) {
      showMessage("Please choose fewer teams than the number of students.");
      teamCountSelect.focus();
      return;
    }

    const shuffledNames = shuffleNames(names);
    const teams = createTeams(shuffledNames, teamCount);

    renderTeams(teams);
  });

  clearBtn.addEventListener("click", function () {
    namesInput.value = "";
    teamCountSelect.value = "2";
    showMessage(readyMessage);
    autoResizeTextarea();
    namesInput.focus();
  });

  autoResizeTextarea();
});