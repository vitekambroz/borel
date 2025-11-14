// ===============================================
// SELECTORY
// ===============================================
const themeToggle = document.querySelector(".theme-toggle");
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileToggleSlot = document.querySelector(".mobile-toggle-slot");
const siteTitle = document.querySelector(".site-title");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");


// ===============================================
// SYSTÉMOVÉ TÉMA
// ===============================================
function systemPrefersDark() {
  return prefersDark.matches;
}


// ===============================================
// ULOŽENÍ MANUÁLNÍHO TÉMATA
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

  html.style.setProperty("--glow",
    isDark ? "0 0 18px rgba(255,0,255,0.7)" : "none"
  );

  if (save) saveManualTheme(mode);
}


// ===============================================
// INIT — první načtení
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
prefersDark.addEventListener("change", e => {
  if (localStorage.getItem("theme-mode") === "manual") return;
  applyTheme(e.matches ? "dark" : "light");
});


// ===============================================
// PŘEPÍNAČ TÉMATA
// ===============================================
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");

    applyTheme(nowDark ? "dark" : "light", true);

    const thumb = document.querySelector(".theme-toggle .thumb");
    if (thumb) {
      thumb.classList.remove("bounce");
      void thumb.offsetWidth;
      thumb.classList.add("bounce");
    }
  });
}


// ===============================================
// MOBILE NAV MENU + PŘESUN TOGGLE
// ===============================================
if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
    menuBtn.classList.toggle("active");

    const isOpen = mobileNav.classList.contains("show");

    if (window.innerWidth <= 1100) {
      if (isOpen) {
        // přesunout toggle do mobilního menu
        mobileToggleSlot.appendChild(themeToggle);
        themeToggle.style.display = "flex";
        themeToggle.style.position = "relative";
        themeToggle.style.top = "0";
        themeToggle.style.right = "0";
        themeToggle.style.transform = "none";
      } else {
        // vrátit toggle zpět do headeru
        document.querySelector("header").appendChild(themeToggle);
        themeToggle.style.display = "";
        themeToggle.style.position = "";
        themeToggle.style.top = "";
        themeToggle.style.right = "";
        themeToggle.style.transform = "";
      }
    }
  });
}


// zavření menu kliknutím na odkaz
document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("show");
    menuBtn.classList.remove("active");
  });
});


// ===============================================
// FADE TITLE
// ===============================================
window.addEventListener("scroll", () => {
  const y = Math.min(window.scrollY, 120);

  if (siteTitle) {
    siteTitle.style.opacity = 1 - y / 120;
    if (y > 40) siteTitle.classList.add("shrunk");
    else siteTitle.classList.remove("shrunk");
  }
});


// ===============================================
// ACTIVE NAV
// ===============================================
(function setActiveLink() {
  let page = window.location.pathname;

  page = page.replace(/\/+$/, "").replace("/", "");
  if (page === "") page = "/";

  document.querySelectorAll("a[data-page]").forEach(a => {
    if (a.dataset.page === page) {
      a.classList.add("active");
    }
  });
})();


// ===============================================
// VÝŠKA NAVU → CSS VARIABLE (ponechávám)
// ===============================================
const nav = document.querySelector("nav");
if (nav) {
  const height = nav.offsetHeight;
  document.documentElement.style.setProperty("--nav-height-mobile", `${height}px`);
}