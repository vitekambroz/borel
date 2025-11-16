// ===============================================
// SELECTORY
// ===============================================
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
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
// HEADER: Smooth shrink + fade + auto-hide + iOS bounce feel
// ===============================================
(function () {
  const header = document.querySelector("header");
  const title  = document.querySelector(".site-title");
  if (!header || !title) return;

  const maxHeader = 58;   // výchozí výška (CSS var --header-max)
  const minHeader = 38;   // minimální při scrollu
  const maxFont   = 2.2;  // rem
  const minFont   = 1.4;  // rem

  // Který container se má scrollovat (window nebo galerie)
  function getScrollContainer() {
    const gallery = document.querySelector(".gallery-wrapper");
    const desktop = window.matchMedia("(min-width: 1101px)").matches;
    return (gallery && desktop) ? gallery : window;
  }

  let container = getScrollContainer();
  let lastY = 0;
  let bouncing = false;

  function handleScroll() {
    let y = container === window ? window.scrollY : container.scrollTop;

    // --- 1) SMOOTH SHRINK ---
    let t = Math.min(y / 120, 1);

    let newHeight = maxHeader - (maxHeader - minHeader) * t;
    header.style.height = `${newHeight}px`;

    let newFont = maxFont - (maxFont - minFont) * t;
    title.style.fontSize = `${newFont}rem`;

    // jemný posun nahoru → Apple feel
    title.style.transform = `translateY(${t * -6}px)`;

    // malé vyblednutí titulku
    title.style.opacity = `${1 - t * 0.08}`;


    // --- 2) SMART AUTO-HIDE HEADER ---
    if (y > 80 && y > lastY) {
      header.style.opacity = "0";
      header.style.transform = "translateY(-32px)";
    } else if (y < lastY) {
      header.style.opacity = "1";
      header.style.transform = "translateY(0)";
    }


    // --- 3) iOS BOUNCE FEEL ---
    // (jen vizuální pružení, Apple blok skutečný overscroll)
    if (!bouncing && y === 0 && lastY > 4) {
      bouncing = true;
      header.style.transition = "transform .25s cubic-bezier(.25,1.7,.45,1)";
      header.style.transform = "translateY(12px)";

      setTimeout(() => {
        header.style.transform = "translateY(0)";
        setTimeout(() => {
          header.style.transition = "height .18s linear, opacity .18s, transform .18s ease";
          bouncing = false;
        }, 250);
      }, 10);
    }

    lastY = y;
  }


  // posloucháme správný scroll kontejner
  container.addEventListener("scroll", handleScroll);

  // při resize přepínáme window/galerie
  window.addEventListener("resize", () => {
    const newC = getScrollContainer();
    if (newC !== container) {
      container.removeEventListener("scroll", handleScroll);
      container = newC;
      lastY = 0;
      handleScroll();
      container.addEventListener("scroll", handleScroll);
    }
  });

  handleScroll();
})();


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
   NEON SCROLLBAR + FADE — JEN PRO GALERII
================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery-wrapper");
    if (!gallery) return;

    let scrollTimeout;

    const updateFade = () => {
        const scrollTop = gallery.scrollTop;
        const maxScroll = gallery.scrollHeight - gallery.clientHeight;

        gallery.classList.toggle("at-top", scrollTop <= 2);
        gallery.classList.toggle("at-bottom", maxScroll - scrollTop <= 2);
    };

    updateFade();

    gallery.addEventListener("scroll", () => {
        gallery.classList.add("scrolling");

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            gallery.classList.remove("scrolling");
        }, 500);

        updateFade();
    });
});