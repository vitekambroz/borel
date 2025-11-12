// =============================================
//  BOREL THEME MANAGER – 2025 SUPER CLEAN EDITION
// =============================================

(function() {
  const STORAGE_KEY = "borel-theme";
  const root = document.documentElement;
  const toggleBtn = document.querySelector(".theme-toggle");
  const toggleIcon = toggleBtn?.querySelector(".icon");
  const canvas = document.getElementById("particles");

  // =============================================
  //   1) Initial Theme Setup
  // =============================================

  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || "light";
  applyTheme(initial);


  // =============================================
  //   2) Theme Toggle Button (Click)
  // =============================================

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      startToggleAnimation();

      const next = root.classList.contains("theme-dark") ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);

      resizeParticles();
      flashBackground();
    });
  }


  // =============================================
  //   3) Apply Light / Dark Theme
  // =============================================

  function applyTheme(mode) {
    const dark = mode === "dark";
    root.classList.toggle("theme-dark", dark);

    // change icon
    if (toggleIcon) {
      toggleIcon.textContent = dark ? "🌙" : "🌞";
    }
  }


  // =============================================
  //   4) Cute Icon Spin Animation Handler
  // =============================================

  function startToggleAnimation() {
    if (!toggleBtn) return;

    toggleBtn.classList.add("switching");
    setTimeout(() => toggleBtn.classList.remove("switching"), 450); 
  }


  // =============================================
  //   5) Flash Effect (Background Pulse)
  // =============================================

  function flashBackground() {
    document.body.classList.add("theme-flash");
    setTimeout(() => document.body.classList.remove("theme-flash"), 500);
  }


  // =============================================
  //   6) Fade-in for Text After Load (BOREL letters)
  // =============================================

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("animate-title");
});


  // =============================================
  //   7) PARTICLES BACKGROUND (Neon floating dots)
  // =============================================

  let ctx = null;
  let W = 0, H = 0;
  let dots = [];

  if (canvas) {
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", resizeParticles);
    resizeParticles();
    drawParticles();
  }


  function getParticleColors() {
    return root.classList.contains("theme-dark")
      ? ["rgba(255,80,200,0.7)", "rgba(150,70,255,0.65)"]
      : ["rgba(229,0,106,0.6)", "rgba(255,150,255,0.55)"];
  }


  function resizeParticles() {
    if (!canvas || !ctx) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;

    const colors = getParticleColors();
    dots = [];

    for (let i = 0; i < 80; i++) {
      dots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.2 + 0.5,
        c: colors[Math.random() < 0.5 ? 0 : 1],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }
  }


  function drawParticles() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, W, H);

    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.c;
      ctx.shadowBlur = 12;
      ctx.shadowColor = d.c;
      ctx.fill();

      d.x += d.vx;
      d.y += d.vy;

      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
    }

    requestAnimationFrame(drawParticles);
  }

})();


// =============================================
//  HAMBURGER MENU – CLEAN REDESIGN
// =============================================

const menuBtn = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");

    if (!nav.classList.contains("show")) {
      nav.classList.remove("hide");
      nav.style.display = "flex";
      requestAnimationFrame(() => nav.classList.add("show"));
    } else {
      nav.classList.remove("show");
      nav.classList.add("hide");

      nav.addEventListener("animationend", function handler() {
        nav.style.display = "none";
        nav.classList.remove("hide");
        nav.removeEventListener("animationend", handler);
      });
    }
  });
}