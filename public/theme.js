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
// HEADER SHRINK – DESKTOP + MOBIL (JEDNODUCHÁ VERZE)
// ======================================================
(function () {

  const header = document.querySelector("header");
  const title  = document.querySelector(".site-title");
  const nav    = document.querySelector(".desktop-nav");
  const toggle = document.querySelector(".theme-toggle.desktop-toggle");
  const burger = document.querySelector(".menu-toggle");

  if (!header || !title) return;

  const maxHeader = 58;
  const minHeader = 48;
  const maxFont   = 2.2;
  const minFont   = 1.4;

  let lastY = 0;
  let bouncing = false;

  // Vrací scroll – mobil i desktop
  function getScrollY() {
    const desktop = window.innerWidth > 1100;
    let y = 0;

    // 1) normální scroll stránky
    const doc = document.scrollingElement || document.documentElement;
    y = doc.scrollTop || window.pageYOffset || window.scrollY || 0;

    // 2) navíc desktop fotogalerie – vnitřní scroll galerie
    if (desktop) {
      const galleryEl = document.querySelector(".gallery-wrapper");
      if (galleryEl) y += galleryEl.scrollTop;
    }

    return y;
  }

  function handleScroll() {
    const y = getScrollY();
    const t = Math.min(y / 120, 1);
    const desktop = window.innerWidth > 1100;
    const scale   = 1 - t * 0.20;

    // výška headeru
    header.style.height = `${maxHeader - (maxHeader - minHeader) * t}px`;

    // nápis BOREL
    title.style.fontSize = `${maxFont - (maxFont - minFont) * t}rem`;
    title.style.opacity  = `${1 - t * 0.08}`;

    if (desktop) {
      // DESKTOP → zmenšuj NAV + theme-toggle
      if (nav) {
        nav.style.transform = `scale(${scale})`;
        nav.style.transformOrigin = "right center";
      }
      if (toggle) {
        toggle.style.transform = `translateY(-50%) scale(${scale})`;
      }
      if (burger) burger.style.transform = "";
    } else {
      // MOBIL → zmenšuj jen hamburger
      if (burger) {
        burger.style.transform = `scale(${scale})`;
        burger.style.transformOrigin = "left center";
      }
      if (nav)    nav.style.transform = "";
      if (toggle) toggle.style.transform = "";
    }

    // bounce efekt nahoře
    if (!bouncing && y === 0 && lastY > 5) {
      bouncing = true;
      header.style.transition = "transform .25s cubic-bezier(.25,1.7,.45,1)";
      header.style.transform = "translateY(12px)";

      setTimeout(() => {
        header.style.transform = "translateY(0)";
        setTimeout(() => {
          header.style.transition =
            "height .18s linear, opacity .18s, transform .18s ease";
          bouncing = false;
        }, 250);
      }, 10);
    }

    lastY = y;
  }

  // posluchače
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("scroll", handleScroll, { passive: true });

  window.addEventListener("resize", handleScroll);

  // kdyby byla galerie s vlastním scrollem, taky ji napojíme
  const galleryEl = document.querySelector(".gallery-wrapper");
  if (galleryEl) {
    galleryEl.addEventListener("scroll", handleScroll, { passive: true });
  }

  // první přepočet
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