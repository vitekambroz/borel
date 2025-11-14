// ===============================================
// SELECTORY
// ===============================================
const themeToggle = document.querySelector(".theme-toggle");
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const siteTitle = document.querySelector(".site-title");

// ===============================================
// SYSTÉMOVÉ TÉMA
// ===============================================
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function systemPrefersDark() {
  return prefersDark.matches;
}

// ===============================================
// ULOŽENÍ MANUÁLNÍHO TÉMA
// ===============================================
function saveManualTheme(mode) {
  localStorage.setItem("theme-mode", "manual");
  localStorage.setItem("theme", mode);
}

// ===============================================
// APLIKACE TÉMATU
// ===============================================
function applyTheme(mode, save = false) {
  const html = document.documentElement;
  const isDark = mode === "dark";

  html.classList.toggle("theme-dark", isDark);
  html.classList.toggle("theme-light", !isDark);

  // Neon glow (dark mode)
  html.style.setProperty("--glow",
    isDark ? "0 0 18px rgba(255,0,255,0.7)" : "none"
  );

  if (save) saveManualTheme(mode);
}

// ===============================================
// INIT
// ===============================================
(function initTheme() {
  const savedMode = localStorage.getItem("theme-mode");
  const savedTheme = localStorage.getItem("theme");

  if (savedMode === "manual" && savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme(systemPrefersDark() ? "dark" : "light");
  }
})();

// ===============================================
// SYSTÉMOVÁ ZMĚNA
// ===============================================
prefersDark.addEventListener("change", (e) => {
  const manual = localStorage.getItem("theme-mode") === "manual";
  if (manual) return;

  applyTheme(e.matches ? "dark" : "light");
});

// ===============================================
// PŘEPÍNAČ TÉMATU (iOS switch)
// ===============================================
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");
    applyTheme(nowDark ? "dark" : "light", true);

    // Bounce animace tečky (bez vibrace a zvuku)
    const thumb = document.querySelector(".theme-toggle .thumb");
    if (thumb) {
      thumb.classList.remove("bounce");
      void thumb.offsetWidth; // force reflow
      thumb.classList.add("bounce");
    }
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
// SCROLL EFFECT – FADE & SHRINK TITLE
// ===============================================
window.addEventListener("scroll", () => {
  const y = Math.min(window.scrollY, 120);

  if (siteTitle) {
    siteTitle.style.opacity = 1 - y / 120;
  }

  if (window.scrollY > 40) siteTitle.classList.add("shrunk");
  else siteTitle.classList.remove("shrunk");
});