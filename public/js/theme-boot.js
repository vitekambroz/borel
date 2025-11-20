(function () {
  try {
    var mode  = localStorage.getItem("theme-mode");
    var theme = localStorage.getItem("theme");
    var finalTheme;

    if (mode === "manual" && theme) {
      // uživatel si ručně přepnul (dark / light)
      finalTheme = theme;
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      // žádné nastavení -> bereme systém (dark)
      finalTheme = "dark";
    } else {
      // fallback = light
      finalTheme = "light";
    }

    var html = document.documentElement;
    html.classList.remove("theme-dark", "theme-light");
    html.classList.add(finalTheme === "dark" ? "theme-dark" : "theme-light");
  } catch (e) {
    // když něco zdechne, nevadí – stránka prostě pojede v default light
  }
})();
