// ===============================================
// SELECTORY
// ===============================================
const menuBtn = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const toggles = document.querySelectorAll(".theme-toggle");

function prefersDarkQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

// iOS height fix
function setVh() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
window.addEventListener("resize", setVh);
setVh();


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
// INIT
// ===============================================
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
// PŘEPÍNAČ TÉMATU
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


// ===============================================
// HEADER: Smooth shrink + iOS bounce (NO auto-hide)
// ===============================================
(function () {
  const header = document.querySelector("header");
  const title  = document.querySelector(".site-title");
  if (!header || !title) return;

  const maxHeader = 58;
  const minHeader = 48;
  const maxFont   = 2.2;
  const minFont   = 1.4;

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

    // Smooth shrink
    let t = Math.min(y / 120, 1);

    header.style.height = `${maxHeader - (maxHeader - minHeader) * t}px`;
    title.style.fontSize = `${maxFont - (maxFont - minFont) * t}rem`;
    const titleWrap = document.querySelector(".title-wrap");
    titleWrap.style.transform = `translate(-50%, calc(-50% + ${t * -6}px))`;
    title.style.opacity = `${1 - t * 0.08}`;

    // !!! NO AUTO HIDE ANYMORE !!!
    header.style.opacity = "1";
    header.style.transform = "translateY(0)";

    // iOS bounce
    if (!bouncing && y === 0 && lastY > 4) {
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

  container.addEventListener("scroll", handleScroll);

  window.addEventListener("resize", () => {
    const newC = getScrollContainer();
    if (newC !== container) {
      container.removeEventListener("scroll", handleScroll);
      container = newC;
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
  let page = window.location.pathname.replace(/\/+$/, "").replace("/", "");
  if (page === "") page = "/";

  document.querySelectorAll("a[data-page]").forEach(a => {
    if (a.dataset.page === page) a.classList.add("active");
  });
})();


// ===============================================
// NEON SCROLLBAR — bez top/bottom fade
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery-wrapper");
    if (!gallery) return;

    let scrollTimeout;

    gallery.addEventListener("scroll", () => {
        gallery.classList.add("scrolling");

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            gallery.classList.remove("scrolling");
        }, 500);
    });
});