// ===============================================
// QUERY SELECTORS
// ===============================================
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle?.querySelector(".icon");
const modeIndicator = document.querySelector(".mode-indicator");

const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const siteTitle = document.querySelector(".site-title");

// ===============================================
// ANIMACE IKONY (fade + scale)
// ===============================================
function animateIcon(newIcon) {
  if (!themeIcon) return;
  themeIcon.style.opacity = 0;
  themeIcon.style.transform = "scale(0.5)";
  
  setTimeout(() => {
    themeIcon.textContent = newIcon;
    themeIcon.style.opacity = 1;
    themeIcon.style.transform = "scale(1)";
  }, 150);
}

// ===============================================
// DETEKCE TÉMATU V SYSTÉMU (iOS, Android, Windows, macOS)
// ===============================================
function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ===============================================
// NASTAVENÍ TÉMATU
// ===============================================
function applyTheme(mode, save = false) {
  const html = document.documentElement;

  if (mode === "dark") {
    html.classList.add("theme-dark");
    animateIcon("🌞");
  } else {
    html.classList.remove("theme-dark");
    animateIcon("🌙");
  }

  // uložit manuální volbu
  if (save) {
    localStorage.setItem("theme-mode", "manual");
    localStorage.setItem("theme", mode);
  }

  // indikátor AUTO vs MANUAL
  const isManual = localStorage.getItem("theme-mode") === "manual";

  if (themeToggle) {
    themeToggle.classList.toggle("manual-mode", isManual);
    themeToggle.classList.toggle("auto-mode", !isManual);
  }
}

// ===============================================
// INIT — PŘI NAČTENÍ STRÁNKY
// ===============================================
(function initTheme() {
  const savedMode = localStorage.getItem("theme-mode"); // "manual" / null
  const savedTheme = localStorage.getItem("theme");

  if (savedMode === "manual" && savedTheme) {
    // ruční režim → použij uložené téma
    applyTheme(savedTheme);
  } else {
    // AUTO režim → použij systémový režim
    applyTheme(systemPrefersDark() ? "dark" : "light");
  }

  // indikátor přepínače
  themeToggle?.classList.add(savedMode === "manual" ? "manual-mode" : "auto-mode");
})();

// ===============================================
// SYSTEM EVENT — změna systému (iOS/Android/Windows/macOS)
// ===============================================
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  const mode = localStorage.getItem("theme-mode");

  if (mode === "manual") return;  // ruční režim → ignorovat změny systému

  applyTheme(e.matches ? "dark" : "light");
});

// ===============================================
// PŘEPÍNAČ TÉMATU → MANUAL MODE
// ===============================================
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("theme-dark");
    const newMode = dark ? "dark" : "light";

    applyTheme(newMode, true); // true = uložit manuální volbu
  });
}

// ===============================================
// MOBILE NAV MENU
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
// APPLE TITLE FADE + SHRINK (NE theme!)
// ===============================================
window.addEventListener("scroll", () => {
  const y = Math.min(window.scrollY, 120);

  // Fade efekt
  if (siteTitle) {
    siteTitle.style.opacity = 1 - y / 120;
  }

  // Shrink efekt
  if (window.scrollY > 40) {
    siteTitle.classList.add("shrunk");
  } else {
    siteTitle.classList.remove("shrunk");
  }
});