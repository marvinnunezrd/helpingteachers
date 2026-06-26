document.addEventListener("DOMContentLoaded", () => {
  const fullscreenButtons = document.querySelectorAll("[data-fullscreen-card]");

  fullscreenButtons.forEach((button) => {
    const card = button.closest(".timer-card");

    if (!card) return;

    const enterLabel = button.dataset.fullscreenEnter || button.textContent.trim();
    const exitLabel = button.dataset.fullscreenExit || "Exit Fullscreen";

    function isActive() {
      return document.fullscreenElement === card;
    }

    function updateButton() {
      button.textContent = isActive() ? exitLabel : enterLabel;
    }

    function toggleFullscreen() {
      if (!document.fullscreenEnabled) {
        button.hidden = true;
        return;
      }

      if (isActive()) {
        document.exitFullscreen?.();
        return;
      }

      card.requestFullscreen?.();
    }

    if (!document.fullscreenEnabled) {
      button.hidden = true;
      return;
    }

    button.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateButton);
    updateButton();
  });
});