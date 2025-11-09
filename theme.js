// === BOREL THEME MANAGER ===
// Přepínání světlý/tmavý režim + neonové body v pozadí

(function() {
  const STORAGE_KEY = "borel-theme";
  const root = document.documentElement;
  const btn = document.querySelector(".theme-toggle");
  const canvas = document.getElementById("particles");
  const ctx = canvas?.getContext("2d");
  let W, H, dots = [];

  // --- Inicializace tématu ---
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || "light";
  setTheme(initial);

  if (btn) {
    btn.addEventListener("click", () => {
      const next = root.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      resize(); // přepočítat barvy neonů
    });
  }

  function setTheme(mode) {
    root.classList.toggle("theme-dark", mode === "dark");
    if (btn) {
      btn.querySelector(".icon").textContent = mode === "dark" ? "☀️" : "🌙";
    }
  }

  // --- Fade-in efekt ---
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
  });

  // === Neonové body ===
  if (canvas && ctx) {
    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  function getParticleColors() {
    const dark = root.classList.contains("theme-dark");
    return dark
      ? ["rgba(255,0,200,0.6)", "rgba(0,255,255,0.5)"]   // dark barvy
      : ["rgba(229,0,106,0.4)", "rgba(0,180,255,0.3)"];  // light barvy
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    dots.length = 0;
    const colors = getParticleColors();
    for (let i = 0; i < 80; i++) {
      dots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.2 + 0.5,
        c: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }
  }

  function draw() {
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
    requestAnimationFrame(draw);
  }
})();

// === Hamburger menu s přepínáním a animací ✕ ===
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
