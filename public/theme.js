// ===============================================
// SELECTORY
// ===============================================
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle?.querySelector(".icon");

const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const modeIndicator = document.querySelector(".mode-indicator");

// ===============================================
// DETEKCE SYSTÉMOVÉHO TÉMATU
// ===============================================
function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ===============================================
// NASTAVENÍ TÉMATU (hlavní funkce)
// ===============================================
function applyTheme(mode, save = false) {
  const html = document.documentElement;

  // Přepnout dark/light class
  if (mode === "dark") {
    html.classList.add("theme-dark");
    if (themeIcon) animateIcon("🌞");
  } else {
    html.classList.remove("theme-dark");
    if (themeIcon) animateIcon("🌙");
  }

  // Uložit manuální volbu (pokud save = true)
  if (save) {
    localStorage.setItem("theme-mode", "manual");
    localStorage.setItem("theme", mode);
  }

  // Nastavení indikátoru AUTO / MANUAL
  const isManual = localStorage.getItem("theme-mode") === "manual";

  if (themeToggle) {
    if (isManual) {
      themeToggle.classList.remove("auto-mode");
      themeToggle.classList.add("manual-mode");
    } else {
      themeToggle.classList.remove("manual-mode");
      themeToggle.classList.add("auto-mode");
    }
  }
}

// ===============================================
// ANIMACE IKONY (fade + scale)
// ===============================================
function animateIcon(newIcon) {
  themeIcon.style.opacity = 0;
  themeIcon.style.transform = "scale(0.5)";

  setTimeout(() => {
    themeIcon.textContent = newIcon;
    themeIcon.style.opacity = 1;
    themeIcon.style.transform = "scale(1)";
  }, 150);
}

// ===============================================
// INIT (při načtení)
// ===============================================
(function initTheme() {
  const mode = localStorage.getItem("theme-mode"); // "manual" / null
  const saved = localStorage.getItem("theme");

  if (mode === "manual" && saved) {
    applyTheme(saved);  // preferuje manuální
  } else {
    // systémová detekce (auto)
    applyTheme(systemPrefersDark() ? "dark" : "light");
  }
  if (mode === "manual") {
  themeToggle.classList.add("manual-mode");
} else {
  themeToggle.classList.add("auto-mode");
}
})();

// ===============================================
// PŘEPÍNÁNÍ TÉMATU RUČNĚ
// ===============================================
if (themeToggle) {
  themeToggle.addEventListener("click", () => {

    // manuální přepnutí vypíná auto-scroll mód
    autoScrollMode = false;
    localStorage.setItem("theme-mode", "manual");

    // přepnout class theme-dark
    const dark = document.documentElement.classList.toggle("theme-dark");

    // uložit výsledek
    localStorage.setItem("theme", dark ? "dark" : "light");

    // aktualizace ikonky
    if (themeIcon) animateIcon(dark ? "🌞" : "🌙");

    // indikátor MANUAL mode
    themeToggle.classList.remove("auto-mode");
    themeToggle.classList.add("manual-mode");

  });
}

// ===============================================
// MOBILE MENU
// ===============================================
if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
    menuBtn.classList.toggle("active");
  });
}

document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("show");
    menuBtn.classList.remove("active");
  });
});

// ===============================================
// SCROLL-BASED THEME (auto mód)
// ===============================================
let autoScrollMode = localStorage.getItem("theme-mode") !== "manual";

window.addEventListener("scroll", () => {
  if (!autoScrollMode) return;

  const scrollY = window.scrollY;

  // 0–150px = světlý, >150px = tmavý
  if (scrollY > 150) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }
});

// ===============================================
// SYSTÉMOVÁ ZMĚNA (uživatel změní OS téma)
// ===============================================
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  const mode = localStorage.getItem("theme-mode");

  // pokud používá manuální mód → ignorujeme systém
  if (mode === "manual") return;

  applyTheme(e.matches ? "dark" : "light");
});
window.addEventListener("scroll", () => {
  
  // Zeslabuje BOREL od 0 do 120px
  const y = Math.min(window.scrollY, 120);
  const opacity = 1 - (y / 120);
  
  document.querySelector(".site-title").style.opacity = opacity;
});
const siteTitle = document.querySelector(".site-title");

window.addEventListener("scroll", () => {

  if (window.scrollY > 40) {
    siteTitle.classList.add("shrunk");
  } else {
    siteTitle.classList.remove("shrunk");
  }

});
