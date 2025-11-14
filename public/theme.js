// ===============================================
// SELECTORY
// ===============================================
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle?.querySelector(".icon");
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const siteTitle = document.querySelector(".site-title");

// ===============================================
// ANIMACE IKONY (fade + scale)
// ===============================================
function animateIcon(icon) {
  if (!themeIcon) return;
  themeIcon.style.opacity = "0";
  themeIcon.style.transform = "scale(0.5) rotate(-30deg)";

  setTimeout(() => {
    themeIcon.textContent = icon;
    themeIcon.style.opacity = "1";
    themeIcon.style.transform = "scale(1) rotate(0deg)";
  }, 180);
}

// ===============================================
// SYSTÉMOVÉ TÉMA
// ===============================================
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function systemPrefersDark() {
  return prefersDark.matches;
}

// ===============================================
// ULOŽIT MANUÁLNÍ TÉMA
// ===============================================
function saveManualTheme(mode) {
  localStorage.setItem("theme-mode", "manual");
  localStorage.setItem("theme", mode);
}

// ===============================================
// NASTAVIT TÉMA (HLAVNÍ FUNKCE)
// ===============================================
function applyTheme(mode, save = false) {
  const html = document.documentElement;

  const isDark = mode === "dark";
  html.classList.toggle("theme-dark", isDark);
  html.classList.toggle("theme-light", !isDark);

  // Ikona
  animateIcon(isDark ? "🌙" : "🌞");

  // Neon glow (dark only)
  if (isDark) {
    html.style.setProperty("--glow", "0 0 18px rgba(255,0,255,0.7)");
  } else {
    html.style.setProperty("--glow", "none");
  }

  // Uložení preferencí
  if (save) saveManualTheme(mode);
}

// ===============================================
// INIT PŘI STARTU
// ===============================================
(function initTheme() {
  const savedMode = localStorage.getItem("theme-mode");
  const savedTheme = localStorage.getItem("theme");

  if (savedMode === "manual" && savedTheme) {
    applyTheme(savedTheme, false);
  } else {
    applyTheme(systemPrefersDark() ? "dark" : "light", false);
  }
})();

// ===============================================
// SYSTÉMOVÉ PŘEPÍNÁNÍ
// ===============================================
prefersDark.addEventListener("change", (e) => {
  const manual = localStorage.getItem("theme-mode") === "manual";
  if (manual) return; // manuální režim → ignorovat
  applyTheme(e.matches ? "dark" : "light");
});

// ===============================================
// KLIKNUTÍ NA SWITCH → přepnutí tématu
// ===============================================
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");
    applyTheme(nowDark ? "dark" : "light", true);
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
// APPLE TITLE FADE + SHRINK
// ===============================================
window.addEventListener("scroll", () => {
  const y = Math.min(window.scrollY, 120);

  if (siteTitle) {
    siteTitle.style.opacity = 1 - y / 120;
  }

  if (window.scrollY > 40) siteTitle.classList.add("shrunk");
  else siteTitle.classList.remove("shrunk");
});