// ===============================================
// SELECTORY
// ===============================================
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const gallery = document.querySelector('.gallery-wrapper');
const toggles = document.querySelectorAll(".theme-toggle");


// MEDIA QUERY musí být uložený jako funkce → kvůli iOS bugům
function prefersDarkQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}


// ===============================================
// APLIKACE TÉMATU
// ===============================================
function applyTheme(mode, save = false) {
  const html = document.documentElement;
  const isDark = mode === "dark";

  html.classList.toggle("theme-dark", isDark);
  html.classList.toggle("theme-light", !isDark);

  if (save) {
    localStorage.setItem("theme-mode", "manual");
    localStorage.setItem("theme", mode);
  }
}


// ===============================================
// INIT – FUNGUJE NA IPHONE I ANDROID
// ===============================================
function initTheme() {
  const savedMode = localStorage.getItem("theme-mode");
  const savedTheme = localStorage.getItem("theme");

  // manuální mód má přednost
  if (savedMode === "manual" && savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  // správná detekce systémového tématu
  const systemDark = prefersDarkQuery().matches;
  applyTheme(systemDark ? "dark" : "light");
}

// spustíme až po načtení → iOS Safari opravuje hodnotu
document.addEventListener("DOMContentLoaded", initTheme);


// ===============================================
// SYSTÉMOVÁ ZMĚNA
// ===============================================
prefersDarkQuery().addEventListener("change", e => {
  if (localStorage.getItem("theme-mode") === "manual") return;
  applyTheme(e.matches ? "dark" : "light");
});


// ===============================================
// PŘEPÍNAČ TÉMATA (desktop + mobile)
// ===============================================
toggles.forEach(toggle => {
  toggle.addEventListener("click", () => {

    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");

    applyTheme(nowDark ? "dark" : "light", true);

    // animace tečky
    const thumb = toggle.querySelector(".thumb");
    if (thumb) {
      thumb.classList.remove("bounce");
      void thumb.offsetWidth;
      thumb.classList.add("bounce");
    }
  });
});


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
// FADE TITLE + SMART HEADER HIDE
// ===============================================
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const current = window.scrollY;
  const header = document.querySelector("header");
  const title = document.querySelector(".site-title");

  const fadeRange = 250;
  const fade = Math.max(0, 1 - current / fadeRange);

  title.style.opacity = fade;
  header.style.opacity = fade > 0.2 ? 1 : fade + 0.2;

  if (current > 40) title.classList.add("shrunk");
  else title.classList.remove("shrunk");

  if (current > fadeRange && current > lastScroll) {
    header.style.opacity = "0";
    header.style.transform = "translateY(-20px)";
  }

  if (current < lastScroll) {
    header.style.opacity = "1";
    header.style.transform = "translateY(0)";
  }

  lastScroll = current;
});


// ===============================================
// ACTIVE NAV
// ===============================================
(function setActiveLink() {
  let page = window.location.pathname;

  page = page.replace(/\/+$/, "").replace("/", "");
  if (page === "") page = "/";

  document.querySelectorAll("a[data-page]").forEach(a => {
    if (a.dataset.page === page) a.classList.add("active");
  });
})();


/* ================================================
   NEON SCROLLBAR — JEN PRO GALERII
================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery-wrapper");
    if (!gallery) return; // stránka bez galerie → ignorujeme

    let scrollTimeout;

    gallery.addEventListener("scroll", () => {
        gallery.classList.add("scrolling");

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            gallery.classList.remove("scrolling");
        }, 700); // jemnější fade-out
    });
});