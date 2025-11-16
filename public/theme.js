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
// HEADER SHRINK – DESKTOP + MOBIL (JEDNODUCHÁ CLASS VERZE)
// ======================================================
(function () {
  const header = document.querySelector("header");
  if (!header) return;

  function getScrollY() {
    const scroller = document.scrollingElement || document.documentElement || document.body;
    return scroller.scrollTop || 0;
  }

  function handleScroll() {
    const y = getScrollY();
    // jakmile jsi víc než 10px dole, přidáme class
    header.classList.toggle("header-small", y > 10);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);

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