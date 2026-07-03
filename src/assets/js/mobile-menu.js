(function () {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const panel = document.querySelector(".mobile-menu-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", function () {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!isExpanded));
    panel.hidden = isExpanded;
  });
})();
