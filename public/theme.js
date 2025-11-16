// ===============================================
// SELECTORY
// ===============================================
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const toggles = document.querySelectorAll(".theme-toggle");


// ===============================================
// iOS height fix
// ===============================================
function setVh() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
window.addEventListener("resize", setVh);
setVh();


// ===============================================
// LOCK/UNLOCK BODY SCROLL (opravena galerie)
// ===============================================
(function () {
  const path = window.location.pathname;

  if (path === "/fotogalerie" && window.innerWidth > 1100) {
    // DESKTOP = scroll jen v galerii
    document.body.style.overflow = "hidden";
  } else {
    // MOBILE = scroll vždy window
    document.body.style.overflow = "auto";
  }
})();


// ===============================================
// THEMA
// ===============================================
function prefersDarkQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

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

function initTheme() {
  const savedMode = localStorage.getItem("theme-mode");
  const savedTheme = localStorage.getItem("theme");

  if (savedMode === "manual" && savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  applyTheme(prefersDarkQuery().matches ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", initTheme);

prefersDarkQuery().addEventListener("change", e => {
  if (localStorage.getItem("theme-mode") === "manual") return;
  applyTheme(e.matches ? "dark" : "light");
});


// ===============================================
// TEMA – kliknutí
// ===============================================
toggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");

    applyTheme(nowDark ? "dark" : "light", true);

    const thumb = toggle.querySelector(".thumb");
    if (thumb) {
      thumb.classList.remove("bounce");
      void thumb.offsetWidth;
      thumb.classList.add("bounce");
    }
  });
});


// ===============================================
// MOBILE NAV
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


// ======================================================
// HEADER SHRINK – DESKTOP + MOBIL (CLASS VERZE)
// ======================================================
(function () {
  const header = document.querySelector("header");
  const title  = document.querySelector(".site-title");
  const nav    = document.querySelector(".desktop-nav");
  const toggle = document.querySelector(".theme-toggle.desktop-toggle");
  const burger = document.querySelector(".menu-toggle");
  const gallery = document.querySelector(".gallery-wrapper");

  if (!header || !title) return;

  let isSmall = false;

  function getScrollY() {
    const desktop = window.innerWidth > 1100;

    // Na desktopu ve fotogalerii scrolluje galerie
    if (desktop && gallery) {
      return gallery.scrollTop;
    }

    // Jinak normální scroll stránky (mobil + ostatní stránky)
    const doc = document.scrollingElement || document.documentElement;
    return window.scrollY || doc.scrollTop || 0;
  }

  function applyShrink(small) {
    if (small === isSmall) return;
    isSmall = small;

    // přepneme class na headeru
    header.classList.toggle("header-small", small);
  }

  function handleScroll() {
    const y = getScrollY();
    applyShrink(y > 10); // od 10px scrollu zmenšit
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  if (gallery) {
    gallery.addEventListener("scroll", handleScroll, { passive: true });
  }
  window.addEventListener("resize", handleScroll);

  // první nastavení
  handleScroll();
})();

// ===============================================
// ACTIVE LINK
// ===============================================
(function setActiveLink() {
  let page = window.location.pathname.replace(/\/+$/, "").replace("/", "");
  if (page === "") page = "/";

  document.querySelectorAll("a[data-page]").forEach(a => {
    if (a.dataset.page === page) a.classList.add("active");
  });
})();