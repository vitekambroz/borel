// === BOREL THEME MANAGER ===
// Světlý / tmavý režim + neonové body v pozadí + animovaný přepínač

(function() {
  const STORAGE_KEY = "borel-theme";
  const root = document.documentElement;
  const btn = document.querySelector(".theme-toggle");
  const icon = btn?.querySelector(".icon");
  const canvas = document.getElementById("particles");
  let ctx = null; W = 0; H = 0, dots = [];

  // === Inicializace motivu ===
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || "light";
  setTheme(initial);

  // === Kliknutí na přepínač ===
  if (btn) {
    btn.addEventListener("click", () => {
      btn.classList.add("switching"); // aktivuj animaci
      setTimeout(() => btn.classList.remove("switching"), 600);

      const next = root.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      resizeParticles(); // přepočítej barvy neonů

      // jemný blik efekt pozadí
      document.body.classList.add("theme-flash");
      setTimeout(() => document.body.classList.remove("theme-flash"), 500);
    });
  }

  // === Nastavení tématu ===
  function setTheme(mode) {
    const dark = mode === "dark";
    root.classList.toggle("theme-dark", dark);
    if (icon) icon.textContent = dark ? "🌙" : "🌞";
  }

  // === Fade-in efekt při načtení ===
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
  });

  // === Neonové body v pozadí ===
if (canvas) {
  ctx = canvas.getContext('2d');
  window.addEventListener('resize', resizeParticles);
  resizeParticles();
  drawParticles();
}

function resizeParticles() {
  if (!canvas || !ctx) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  dots = [];
  const colors = getParticleColors();
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

// === HAMBURGER MENU (✕ animace) ===
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('header nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');

    if (!nav.classList.contains('show')) {
      nav.classList.remove('hide');
      nav.style.display = 'flex';
      requestAnimationFrame(() => nav.classList.add('show'));
    } else {
      nav.classList.remove('show');
      nav.classList.add('hide');
      nav.addEventListener('animationend', function hideAfter() {
        nav.style.display = 'none';
        nav.classList.remove('hide');
        nav.removeEventListener('animationend', hideAfter);
      });
    }
  });
}
