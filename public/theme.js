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
// FADE TITLE + SMART HEADER HIDE
//  – funguje s window i .gallery-wrapper
// ===============================================
(function () {
  const header = document.querySelector("header");
  const title  = document.querySelector(".site-title");
  if (!header || !title) return;

  // vybereme správný scroll kontejner:
  //  - na desktopu galerie → .gallery-wrapper
  //  - jinde → window
  function getScrollContainer() {
    const gallery = document.querySelector(".gallery-wrapper");
    const isDesktop = window.matchMedia("(min-width: 1101px)").matches;
    if (gallery && isDesktop) return gallery;
    return window;
  }

  let container = getScrollContainer();
  let lastScroll = 0;

  function handleScroll() {
    const current =
      container === window ? window.scrollY : container.scrollTop;

    const fadeRange = 250;
    const fade = Math.max(0, 1 - current / fadeRange);

    // průhlednost titulku
    title.style.opacity = fade;

    // jemné vyblednutí headeru
    header.style.opacity = fade > 0.2 ? 1 : fade + 0.2;

    // zmenšení loga “BOREL”
    if (current > 40) {
      title.classList.add("shrunk");
    } else {
      title.classList.remove("shrunk");
    }

    // chytré schování headeru při scrollu dolů
    if (current > fadeRange && current > lastScroll) {
      header.style.opacity = "0";
      header.style.transform = "translateY(-20px)";
    }

    // a zase zobrazení, když scrolluješ nahoru
    if (current < lastScroll) {
      header.style.opacity = "1";
      header.style.transform = "translateY(0)";
    }

    lastScroll = current;
  }

  // posloucháme scroll správného kontejneru
  container.addEventListener("scroll", handleScroll);

  // při změně velikosti okna přepneme, pokud se změní layout
  window.addEventListener("resize", () => {
    const newContainer = getScrollContainer();
    if (newContainer !== container) {
      container.removeEventListener("scroll", handleScroll);
      container = newContainer;
      lastScroll = 0;
      handleScroll();
      container.addEventListener("scroll", handleScroll);
    }
  });

  // počáteční stav
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