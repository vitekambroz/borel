// =============================================
//   BOREL THEME MANAGER — A1 Cute Pastel Edition
//   ✔ stabilní pozice slunce/měsíce
//   ✔ plynulá cute spin animace
//   ✔ žádné particles (nový styl)
//   ✔ animace BOREL názvu při načtení
//   ✔ jeden click handler, žádné duplikace
// =============================================

(function () {
  const STORAGE_KEY = "borel-theme";
  const root = document.documentElement;
  const toggleBtn = document.querySelector(".theme-toggle");
  const toggleIcon = toggleBtn?.querySelector(".icon");

  // =============================================
  // 1) LOAD SAVED THEME OR DEFAULT
  // =============================================

  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || "light";
  applyTheme(initial);

  // =============================================
  // 2) CUTE SPIN THEME BUTTON (one handler)
  // =============================================

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      toggleBtn.classList.add("switching");

      setTimeout(() => toggleBtn.classList.remove("switching"), 400);

      // switch
      const dark = !root.classList.contains("theme-dark");
      root.classList.toggle("theme-dark", dark);

      // SET correct icon
      if (toggleIcon) {
        toggleIcon.textContent = dark ? "🌙" : "🌞";
      }

      // save
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");

      flashBackground();
    };
  }

  // =============================================
  // 3) APPLY THEME ON LOAD
  // =============================================

  function applyTheme(mode) {
    const dark = mode === "dark";
    root.classList.toggle("theme-dark", dark);

    if (toggleIcon) {
      toggleIcon.textContent = dark ? "🌙" : "🌞";
    }
  }

  // =============================================
  // 4) BACKGROUND FLASH (cute pastel pulse)
  // =============================================

  function flashBackground() {
    document.body.classList.add("theme-flash");
    setTimeout(() => document.body.classList.remove("theme-flash"), 450);
  }

  // =============================================
  // 5) BOREL TEXT ANIMATION WHEN PAGE LOADS
  // =============================================

  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("animate-title");
  });
})();


// =============================================
//  HAMBURGER MENU — unchanged, optimized
// =============================================

/*const menuBtn = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");

    if (!nav.classList.contains("show")) {
      nav.classList.remove("hide");
      nav.style.display = "flex";
      requestAnimationFrame(() => nav.classList.add("show"));
    } else {
      nav.classList.remove("show");
      nav.classList.add("hide");

      nav.addEventListener("animationend", function hideAfter() {
        nav.style.display = "none";
        nav.classList.remove("hide");
        nav.removeEventListener("animationend", hideAfter);
      });
    }
  });
}*/
const mobileNav = document.querySelector(".mobile-nav");
menuBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("show");
});