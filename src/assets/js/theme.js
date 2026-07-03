(function () {
  const storageKey = "theme";
  const toggle = document.querySelector("[data-theme-toggle]");

  function getPreferredTheme() {
    try {
      const savedTheme = localStorage.getItem(storageKey);

      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function setTheme(theme, shouldSave) {
    document.documentElement.dataset.theme = theme;

    if (toggle) {
      const nextLabel = theme === "dark" ? toggle.dataset.lightLabel : toggle.dataset.darkLabel;
      const nextIcon = theme === "dark" ? "☀️" : "🌙";

      toggle.textContent = nextIcon;
      toggle.setAttribute("aria-label", nextLabel || "");
    }

    if (shouldSave) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Ignore storage errors so the toggle still works for the current page.
      }
    }
  }

  setTheme(getPreferredTheme(), false);

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark", true);
  });
})();
