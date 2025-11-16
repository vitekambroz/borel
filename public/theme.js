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

(function () {
    const path = window.location.pathname;

    // Desktop galerie → okno NESMÍ scrollovat
    if (path === "/fotogalerie") {
        document.body.style.overflow = "hidden";
        return;
    }

    // Ostatní stránky → povolit window scroll
    document.body.style.overflow = "auto";
})();


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
// HEADER: Smooth shrink + iOS bounce – desktop i mobil
// ===============================================
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

  // Zjistí aktuální scroll pozici – na desktopu v galerii podle .gallery-wrapper,
  // jinak podle window (mobil + ostatní stránky).
  function getScrollY() {
    const gallery = document.querySelector(".gallery-wrapper");
    const desktop = window.matchMedia("(min-width: 1101px)").matches;

    if (gallery && desktop) {
      return gallery.scrollTop || 0;
    }

    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function handleScroll() {
    const y = getScrollY();
    const t = Math.min(y / 120, 1);   // 0–1 podle toho, jak moc jsi odscrolovaný

    // Výška headeru
    const newH = maxHeader - (maxHeader - minHeader) * t;
    header.style.height = `${newH}px`;

    // Font-size „BOREL“
    const newFont = maxFont - (maxFont - minFont) * t;
    title.style.fontSize = `${newFont}rem`;
    title.style.opacity = `${1 - t * 0.08}`;

    const scale = 1 - t * 0.20; // 0–20 % zmenšení

    // Desktop → zmenšuj nav + theme toggle
    if (window.matchMedia("(min-width: 1101px)").matches) {
      if (nav) {
        nav.style.transform = `scale(${scale})`;
        nav.style.transformOrigin = "right center";
      }
      if (toggle) {
        toggle.style.transform = `translateY(-50%) scale(${scale})`;
      }
      // hamburger necháme v klidu
      if (burger) {
        burger.style.transform = ""; // jistota
      }
    } else {
      // Mobil → zmenšuj hamburger, ne desktop nav / toggle
      if (burger) {
        burger.style.transform = `scale(${scale})`;
        burger.style.transformOrigin = "left center";
      }
      if (nav)    nav.style.transform    = "";
      if (toggle) toggle.style.transform = "";
    }

    // nikdy neschovávej header
    header.style.opacity   = "1";
    header.style.transform = "translateY(0)";

    // iOS bounce efekt na vršku
    if (!bouncing && y === 0 && lastY > 5) {
      bouncing = true;
      header.style.transition = "transform .25s cubic-bezier(.25,1.7,.45,1)";
      header.style.transform  = "translateY(12px)";

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

  // Scroll na window – mobil + ostatní stránky
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Navíc posloucháme i galerii na desktopu,
  // aby shrink fungoval, když scrolluje jenom galerie
  const gallery = document.querySelector(".gallery-wrapper");
  if (gallery) {
    gallery.addEventListener("scroll", handleScroll, { passive: true });
  }

  // Reakce na otočení / resize
  window.addEventListener("resize", handleScroll);

  // Inicializace
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