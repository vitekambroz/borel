// ===============================================
// SELECTORY
// ===============================================
const toggles = document.querySelectorAll(".theme-toggle");
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
toggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const html = document.documentElement;
    const nowDark = !html.classList.contains("theme-dark");

    applyTheme(nowDark ? "dark" : "light", true);

    // bounce efekt tečky
    const thumb = toggle.querySelector(".thumb");
    if (thumb) {
      thumb.classList.remove("bounce");
      void thumb.offsetWidth;
      thumb.classList.add("bounce");
    }
  });
});


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
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const current = window.scrollY;

  const header = document.querySelector("header");
  const title = document.querySelector(".site-title");

  /* -------------------------------
     1) Plynulý fade-out + shrink
     ------------------------------- */
  const fadeRange = 250; 
  const fade = Math.max(0, 1 - current / fadeRange);

  title.style.opacity = fade;
  header.style.opacity = fade > 0.2 ? 1 : fade + 0.2; // header nezmizí hned

  // Zmenšování loga při scrollu
  if (current > 40) {
    title.classList.add("shrunk");
  } else {
    title.classList.remove("shrunk");
  }

  /* -------------------------------
     2) Smart hide (až po fade)
     ------------------------------- */
  if (current > fadeRange) {
    if (current > lastScroll) {
      // Scroll dolů – schovat
      header.style.opacity = "0";
      header.style.transform = "translateY(-20px)";
    }
  }

  /* -------------------------------
     3) Smart show (okamžitě)
     ------------------------------- */
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