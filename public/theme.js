/* ============================================================
   SVG NAV / UI ICON LOADER (externí soubory + cache)
============================================================ */
const ICON_PATHS = {
  home:      "/icons/home.svg",
  gallery:   "/icons/gallery.svg",
  game:      "/icons/game.svg",
  close:     "/icons/close.svg",
  arrow:     "/icons/arrow.svg",      // základní šipka (doprava)

  // nové ikonky pro hru:
  "sound-on": "/icons/sound-on.svg",
  "sound-off": "/icons/sound-off.svg",
  "vib-on": "/icons/vib-on.svg",
  "vib-off": "/icons/vib-off.svg"
};

const svgCache = {};

async function loadSvgIcon(name) {
  if (svgCache[name]) return svgCache[name].cloneNode(true);

  const cached = sessionStorage.getItem("svg-" + name);
  if (cached) {
    const tmp = document.createElement("div");
    tmp.innerHTML = cached.trim();
    const svg = tmp.firstElementChild;
    svgCache[name] = svg;
    return svg.cloneNode(true);
  }

  const path = ICON_PATHS[name];
  if (!path) return null;

  const resp = await fetch(path);
  if (!resp.ok) return null;

  const text = await resp.text();
  const wrap = document.createElement("div");
  wrap.innerHTML = text.trim();
  const svg = wrap.firstElementChild;

  svgCache[name] = svg;
  sessionStorage.setItem("svg-" + name, svg.outerHTML);

  return svg.cloneNode(true);
}

async function injectAllIcons() {
  const targets = document.querySelectorAll("[data-icon]");

  for (const t of targets) {
    const requested = t.dataset.icon; // např. "home", "arrow-left", "sound-on"...
    if (!requested) continue;

    // aliasy → šipky se kreslí z jednoho arrow.svg
    let baseName = requested;
    if (requested === "arrow-left" || requested === "arrow-right") {
      baseName = "arrow";
    }

    const svg = await loadSvgIcon(baseName);
    if (!svg) continue;

    svg.classList.add("icon", `icon--${requested}`);

    t.innerHTML = "";
    t.appendChild(svg);
  }
}


/* ============================================================
   THEME TOGGLE ICONS (externí soubory + cache)
============================================================ */
const THEME_ICON_PATHS = {
  sun:  "/icons/sun.svg",
  moon: "/icons/moon.svg"
};

const themeSvgCache = {};

async function loadThemeIcon(name) {
  if (themeSvgCache[name]) return themeSvgCache[name].cloneNode(true);

  const cached = sessionStorage.getItem("themeicon-" + name);
  if (cached) {
    const wrap = document.createElement("div");
    wrap.innerHTML = cached.trim();
    const svg = wrap.firstElementChild;
    themeSvgCache[name] = svg;
    return svg.cloneNode(true);
  }

  const resp = await fetch(THEME_ICON_PATHS[name]);
  if (!resp.ok) return null;

  const text = await resp.text();
  const wrap = document.createElement("div");
  wrap.innerHTML = text.trim();
  const svg = wrap.firstElementChild;

  themeSvgCache[name] = svg;
  sessionStorage.setItem("themeicon-" + name, svg.outerHTML);

  return svg.cloneNode(true);
}

async function injectThemeToggleIcons() {
  const toggles = document.querySelectorAll(".theme-toggle");
  if (!toggles.length) return;

  const [sun, moon] = await Promise.all([
    loadThemeIcon("sun"),
    loadThemeIcon("moon")
  ]);

  toggles.forEach(btn => {
    // už inicializováno
    if (btn.querySelector(".theme-toggle__thumb")) return;

    const switchEl = document.createElement("div");
    switchEl.className = "theme-toggle__switch";

    const thumb = document.createElement("div");
    thumb.className = "theme-toggle__thumb";

    if (sun) {
      const s = sun.cloneNode(true);
      s.classList.add("theme-toggle__icon", "theme-toggle__icon--sun");
      thumb.appendChild(s);
    }

    if (moon) {
      const m = moon.cloneNode(true);
      m.classList.add("theme-toggle__icon", "theme-toggle__icon--moon");
      thumb.appendChild(m);
    }

    switchEl.appendChild(thumb);
    btn.textContent = "";
    btn.appendChild(switchEl);
  });
}


/* ============================================================
   SELECTORY
============================================================ */
const menuBtn   = document.querySelector(".header__menu-toggle");
const mobileNav = document.querySelector(".header__nav--mobile");
const toggles   = document.querySelectorAll(".theme-toggle");


/* ============================================================
   iOS height fix
============================================================ */
function setVh() {
  document.documentElement
    .style
    .setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
window.addEventListener("resize", setVh);
setVh();


/* ============================================================
   LOCK BODY SCROLL (fotogalerie desktop)
============================================================ */
(function () {
  const path = window.location.pathname;

  if (path === "/fotogalerie" && window.innerWidth > 1100) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
})();


/* ============================================================
   TÉMA – LOGIKA
============================================================ */
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
  const savedMode  = localStorage.getItem("theme-mode");
  const savedTheme = localStorage.getItem("theme");

  if (savedMode === "manual" && savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  applyTheme(prefersDarkQuery().matches ? "dark" : "light");
}

prefersDarkQuery().addEventListener("change", e => {
  if (localStorage.getItem("theme-mode") === "manual") return;
  applyTheme(e.matches ? "dark" : "light");
});

/* Kliknutí na přepínač motivu */
toggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");

    applyTheme(nowDark ? "dark" : "light", true);

    const thumb = toggle.querySelector(".theme-toggle__thumb");
    if (thumb) {
      thumb.classList.remove("bounce");
      void thumb.offsetWidth;
      thumb.classList.add("bounce");
    }
  });
});


/* ============================================================
   GAME – PERSISTENT SOUND / VIBRATION
============================================================ */
function updateGameIconVisibility(btn, onSelector, offSelector, isOn) {
  if (!btn) return;
  const onEl  = btn.querySelector(onSelector);
  const offEl = btn.querySelector(offSelector);

  if (onEl)  onEl.style.display  = isOn ? "block" : "none";
  if (offEl) offEl.style.display = isOn ? "none"  : "block";
}

function initGameToggles() {
  const soundBtn = document.querySelector(".game__button--mute");
  const vibBtn   = document.querySelector(".game__button--vibrate");

  // ===== SOUND =====
  if (soundBtn) {
    let soundOn = localStorage.getItem("game-sound") !== "off"; // default ON

    soundBtn.dataset.state = soundOn ? "on" : "off";
    updateGameIconVisibility(
      soundBtn,
      ".game__icon--sound-on",
      ".game__icon--sound-off",
      soundOn
    );

    soundBtn.addEventListener("click", () => {
      soundOn = !soundOn;
      soundBtn.dataset.state = soundOn ? "on" : "off";
      localStorage.setItem("game-sound", soundOn ? "on" : "off");
      updateGameIconVisibility(
        soundBtn,
        ".game__icon--sound-on",
        ".game__icon--sound-off",
        soundOn
      );

      // Notifikace pro minihra.js (pokud chceš reagovat)
      soundBtn.dispatchEvent(new CustomEvent("game-sound-toggle", {
        detail: { enabled: soundOn },
        bubbles: true
      }));
    });
  }

  // ===== VIBRATION =====
  if (vibBtn) {
    let vibOn = localStorage.getItem("game-vibrate") !== "off"; // default ON

    vibBtn.dataset.state = vibOn ? "on" : "off";
    updateGameIconVisibility(
      vibBtn,
      ".game__icon--vib-on",
      ".game__icon--vib-off",
      vibOn
    );

    vibBtn.addEventListener("click", () => {
      vibOn = !vibOn;
      vibBtn.dataset.state = vibOn ? "on" : "off";
      localStorage.setItem("game-vibrate", vibOn ? "on" : "off");
      updateGameIconVisibility(
        vibBtn,
        ".game__icon--vib-on",
        ".game__icon--vib-off",
        vibOn
      );

      vibBtn.dispatchEvent(new CustomEvent("game-vibrate-toggle", {
        detail: { enabled: vibOn },
        bubbles: true
      }));
    });
  }
}


/* ============================================================
   MOBILE NAV
============================================================ */
if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
    menuBtn.classList.toggle("active");
  });

  mobileNav.querySelectorAll(".header__nav-link").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("show");
      menuBtn.classList.remove("active");
    });
  });
}


/* ============================================================
   HEADER SHRINK SYSTEM (BEM)
============================================================ */
(function () {
  const header        = document.querySelector(".header");
  const title         = document.querySelector(".header__title");
  const desktopNav    = document.querySelector(".header__nav--desktop");
  const desktopToggle = document.querySelector(".theme-toggle--desktop");
  const burger        = document.querySelector(".header__menu-toggle");
  const galleryScroll = document.querySelector(".page__gallery-wrapper");
  const galleryTitle  = document.querySelector(".gallery__title");

  if (!header || !title) return;

  const maxHeader = 58;
  const minHeader = 48;
  const maxFont   = 2.2;
  const minFont   = 1.4;

  let lastY = 0;
  let bouncing = false;

  function getScrollY() {
    const desktop = window.innerWidth > 1100;

    if (desktop && galleryScroll) {
      return galleryScroll.scrollTop;
    }

    const scroller = document.scrollingElement ||
                     document.documentElement ||
                     document.body;
    return scroller.scrollTop || 0;
  }

  function handleScroll() {
    const y = getScrollY();
    const t = Math.min(y / 120, 1);
    const desktop = window.innerWidth > 1100;
    const scale = 1 - t * 0.20;

    header.style.height =
      `${maxHeader - (maxHeader - minHeader) * t}px`;
    title.style.fontSize =
      `${maxFont - (maxFont - minFont) * t}rem`;
    title.style.opacity  = `${1 - t * 0.08}`;

    if (desktop) {
      if (desktopNav) {
        desktopNav.style.transform = `scale(${scale})`;
        desktopNav.style.transformOrigin = "right center";
      }
      if (desktopToggle) {
        desktopToggle.style.transform =
          `translateY(-50%) scale(${scale})`;
      }
      if (burger) burger.style.transform = "";
    } else {
      if (burger) {
        burger.style.transform = `scale(${scale})`;
        burger.style.transformOrigin = "left center";
      }
      if (desktopNav)    desktopNav.style.transform = "";
      if (desktopToggle) desktopToggle.style.transform = "";
    }

    if (galleryTitle) {
      if (y > 10) {
        galleryTitle.style.opacity   = (1 - t * 1.4).toString();
        galleryTitle.style.transform = `translateY(${-20 * t}px)`;
      } else {
        galleryTitle.style.opacity   = "1";
        galleryTitle.style.transform = "translateY(0)";
      }
    }

    if (!bouncing && y === 0 && lastY > 5) {
      bouncing = true;
      header.style.transition =
        "transform .25s cubic-bezier(.25,1.7,.45,1)";
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

  window.addEventListener("scroll", handleScroll, { passive: true });
  if (galleryScroll) {
    galleryScroll.addEventListener("scroll", handleScroll, { passive: true });
  }
  window.addEventListener("resize", handleScroll);

  handleScroll();
})();


/* ============================================================
   ACTIVE LINK
============================================================ */
(function setActiveLink() {
  let page = window.location.pathname.replace(/\/+$/, "").replace("/", "");
  if (page === "") page = "/";

  document.querySelectorAll(".header__nav-link[data-page]")
    .forEach(a => {
      if (a.dataset.page === page) a.classList.add("active");
    });
})();


/* ============================================================
   START – DOMContentLoaded
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  injectAllIcons();
  injectThemeToggleIcons();
  initTheme();
  initGameToggles();      // <– tady se načte stav mute / vibrací
});