document.addEventListener("DOMContentLoaded", function () {
  const diceType = document.getElementById("diceType");
  const diceCount = document.getElementById("diceCount");
  const showTotal = document.getElementById("showTotal");
  const rollBtn = document.getElementById("rollBtn");
  const clearBtn = document.getElementById("clearBtn");
  const result = document.getElementById("result");

  if (!diceType || !diceCount || !showTotal || !rollBtn || !clearBtn || !result) {
    return;
  }

  let rolling = false;
  let lastRolls = [];

  const readyMessage =
    diceCount.dataset.readyMessage || "🎲 Ready to roll...";

  function rollDie(maxValue) {
    return Math.floor(Math.random() * maxValue) + 1;
  }

  function rollDice(maxValue, totalDice) {
    const rolls = [];

    for (let i = 0; i < totalDice; i++) {
      rolls.push(rollDie(maxValue));
    }

    return rolls;
  }

  function getTotal(rolls) {
    return rolls.reduce(function (sum, value) {
      return sum + value;
    }, 0);
  }

  function showMessage(message) {
    result.classList.remove("winner");
    result.innerHTML = "";
    result.textContent = message;
  }

  function renderDiceResults(rolls, animate) {
    result.innerHTML = "";

    const diceList = document.createElement("div");
    diceList.className = "dice-result-list";

    rolls.forEach(function (value) {
      const diceItem = document.createElement("div");
      diceItem.className = "dice-result-item";
      diceItem.textContent = "🎲 " + value;

      diceList.appendChild(diceItem);
    });

    result.appendChild(diceList);

    if (showTotal.checked && rolls.length > 1) {
      const totalBox = document.createElement("div");
      totalBox.className = "dice-total";
      totalBox.textContent = "Total: " + getTotal(rolls);

      result.appendChild(totalBox);
    }

    result.classList.remove("winner");

    if (animate) {
      void result.offsetWidth;
      result.classList.add("winner");
    }
  }

  function setControlsDisabled(disabled) {
    rollBtn.disabled = disabled;
    clearBtn.disabled = disabled;
    diceType.disabled = disabled;
    diceCount.disabled = disabled;
  }

  rollBtn.addEventListener("click", function () {
    if (rolling) {
      return;
    }

    rolling = true;
    setControlsDisabled(true);

    const maxValue = Number(diceType.value);
    const totalDice = Number(diceCount.value);

    let counter = 0;
    const maxRolls = 20;

    const rollingAnimation = setInterval(function () {
      const previewRolls = rollDice(maxValue, totalDice);

      renderDiceResults(previewRolls, false);

      counter++;

      if (counter >= maxRolls) {
        clearInterval(rollingAnimation);

        lastRolls = rollDice(maxValue, totalDice);

        renderDiceResults(lastRolls, true);

        rolling = false;
        setControlsDisabled(false);
      }
    }, 80);
  });

  showTotal.addEventListener("change", function () {
    if (rolling || lastRolls.length === 0) {
      return;
    }

    renderDiceResults(lastRolls, false);
  });

  clearBtn.addEventListener("click", function () {
    if (rolling) {
      return;
    }

    diceType.value = "6";
    diceCount.value = "1";
    showTotal.checked = false;
    lastRolls = [];

    showMessage(readyMessage);
  });

  showMessage(readyMessage);
});