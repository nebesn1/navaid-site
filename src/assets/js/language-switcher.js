(function () {
  const languageSelect = document.querySelector("#language-select");

  if (!languageSelect) {
    return;
  }

  languageSelect.addEventListener("change", function () {
    const nextUrl = languageSelect.value;

    if (nextUrl) {
      window.location.href = nextUrl;
    }
  });
})();
