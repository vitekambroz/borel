// =====================================================
//  Modernizovaná minihra – 3 obtížnosti, fixní fyzika,
//  agresivní pipe systém (Rage mód), ukládání zvuku
// =====================================================

const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");

let W = cvs.width;
let H = cvs.height;

// =====================================================
//  Dynamické měnění velikosti canvasu
// =====================================================
function resizeCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const rect = cvs.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  cvs.width = rect.width * dpr;
  cvs.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  W = rect.width;
  H = rect.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// =====================================================
//  Obrázky
// =====================================================
const birdImgAlive = new Image();
birdImgAlive.src = "foto/bird.png";

const birdImgDead = new Image();
birdImgDead.src = "foto/bird_dead.png";

let birdImg = birdImgAlive;

// =====================================================
//  Zvuky
// =====================================================
const deathSound = new Audio("sounds/dead.mp3");
deathSound.volume = 0.8;

const levelUpSound = new Audio("sounds/levelup.mp3");
levelUpSound.volume = 0.7;

// =====================================================
//  UI
// =====================================================
const scoreBox = document.getElementById("score");
const difficultyBox = document.getElementById("difficulty");
const msgBox = document.getElementById("centerMsg");
const restartBtn = document.getElementById("restart");

const muteBtn = document.getElementById("mute");
const soundOnIcon = document.getElementById("soundOn");
const soundOffIcon = document.getElementById("soundOff");

// =====================================================
//  Ukládání mute stavu
// =====================================================
let isMuted = localStorage.getItem("muteState") === "1";

function applyMuteState() {
  if (soundOnIcon && soundOffIcon) {
    soundOnIcon.style.display = isMuted ? "none" : "block";
    soundOffIcon.style.display = isMuted ? "block" : "none";
  } else {
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  }
}
applyMuteState();

if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    localStorage.setItem("muteState", isMuted ? "1" : "0");
    applyMuteState();
  });
}

// =====================================================
//  Herní proměnné
// =====================================================
let bird;

const GRAVITY = 0.55;
const JUMP_VELOCITY = -9.8;
const MAX_FALL_SPEED = 14;

const PIPE_WIDTH = 70;
const BASE_SPEED = 2.4;

let pipes = [];
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

let running = false;
let gameOver = false;

let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60;

let level = 1;
let distanceSinceLastPipe = 0;

// ✓ tvoje volba – 3 obtížnosti
// -----------------------------------------
// Easy   = 0
// Normal = 1
// Rage   = 2
// -----------------------------------------
const DIFFICULTY_MODE = 2;

// =====================================================
//  Pipe parametry podle obtížnosti
// =====================================================
function currentPipeSettings() {
  const capped = Math.min(score, 100);

  const presets = [
    // EASY
    { baseGap: 200, minGap: 150, baseSpacing: 300, minSpacing: 220 },
    // NORMAL
    { baseGap: 170, minGap: 120, baseSpacing: 260, minSpacing: 190 },
    // RAGE 😈
    { baseGap: 160, minGap: 100, baseSpacing: 240, minSpacing: 150 },
  ];

  const p = presets[DIFFICULTY_MODE];

  const gap = p.baseGap - (p.baseGap - p.minGap) * (capped / 100);
  const spacing =
    p.baseSpacing - (p.baseSpacing - p.minSpacing) * (capped / 100);

  return { gap, spacing };
}

function spawnPipe() {
  const { gap } = currentPipeSettings();
  const margin = 60;

  const maxTop = H - margin - gap;
  const top = margin + Math.random() * (maxTop - margin);

  pipes.push({ x: W + 10, top, bottom: top + gap, scored: false });
}

// =====================================================
//  Ovládání – flap + restart
// =====================================================
function flapOrRestart() {
  if (gameOver) {
    reset();
    return;
  }
  if (!running) {
    running = true;
    msgBox.style.display = "none";
  }
  bird.vy = JUMP_VELOCITY;
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flapOrRestart();
  }
});
cvs.addEventListener("mousedown", flapOrRestart);
cvs.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    flapOrRestart();
  },
  { passive: false }
);

// =====================================================
//  Auto-pause
// =====================================================
let paused = false;
window.addEventListener("blur", () => (paused = true));
window.addEventListener("focus", () => {
  if (!gameOver) {
    paused = false;
    lastTime = performance.now();
  }
});

// =====================================================
//  Kolize
// =====================================================
function intersect(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

// =====================================================
//  FIXNÍ UPDATE – fyzika, trubky, skóre
// =====================================================
function update() {
  if (running && !gameOver) {
    const speed = BASE_SPEED + Math.min(score, 120) * 0.07;

    // pohyb ptáka
    bird.vy += GRAVITY;
    if (bird.vy > MAX_FALL_SPEED) bird.vy = MAX_FALL_SPEED;
    bird.y += bird.vy;

    // spawn trubek podle uražené vzdálenosti
    const { spacing } = currentPipeSettings();
    distanceSinceLastPipe += speed;
    if (distanceSinceLastPipe >= spacing) {
      spawnPipe();
      distanceSinceLastPipe = 0;
    }

    // trubky
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= speed;

      if (!p.scored && p.x + PIPE_WIDTH < bird.x) {
        p.scored = true;
        score++;

        const newLevel = Math.min(score + 1, 200);
        if (newLevel !== level) {
          level = newLevel;

          if (!isMuted) {
            levelUpSound.currentTime = 0;
            levelUpSound.play();
          }

          difficultyBox.textContent = `Obtížnost: ${level}`;
          difficultyBox.style.color =
            level <= 30
              ? "#3eea3e"
              : level <= 60
              ? "#f39c12"
              : "#e74c3c";

          const pill = difficultyBox.parentElement || difficultyBox;
          pill.classList.remove("difficultyPulse");
          void pill.offsetWidth;
          pill.classList.add("difficultyPulse");
        }

        scoreBox.textContent = `Skóre: ${score} | Nejlepší: ${bestScore}`;
      }

      if (p.x + PIPE_WIDTH < -20) pipes.splice(i, 1);
    }

    // kolize se zemí/stropem
    if (bird.y + bird.h / 2 > H || bird.y - bird.h / 2 < 0) {
      endGame();
      return;
    }

    // kolize s trubkami
    for (const p of pipes) {
      const br = {
        x: bird.x - bird.w / 2 + 6,
        y: bird.y - bird.h / 2 + 6,
        w: bird.w - 12,
        h: bird.h - 12,
      };
      if (
        intersect(br, { x: p.x, y: 0, w: PIPE_WIDTH, h: p.top }) ||
        intersect(br, {
          x: p.x,
          y: p.bottom,
          w: PIPE_WIDTH,
          h: H - p.bottom,
        })
      ) {
        endGame();
        break;
      }
    }
  } else if (gameOver) {
    bird.vy += GRAVITY * 0.6;
    bird.y += bird.vy;
  }
}

// =====================================================
//  Konec hry
// =====================================================
function endGame() {
  if (gameOver) return;

  gameOver = true;
  running = false;
  birdImg = birdImgDead;
  bird.rotation = Math.PI;

  if (!isMuted) {
    deathSound.currentTime = 0;
    deathSound.play();
  }

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  msgBox.style.display = "block";
  msgBox.innerHTML = `
    💀 Prohrál/a jsi<br>
    Skóre: <b>${score}</b><br>
    Nejlepší: <b>${bestScore}</b><br>
    <small>Klikni / mezerník pro restart</small>
  `;

  scoreBox.textContent = `Skóre: ${score} | Nejlepší: ${bestScore}`;
}

// =====================================================
//  Reset
// =====================================================
function reset() {
  birdImg = birdImgAlive;
  bird = { x: 100, y: H / 2, w: 48, h: 48, vy: 0, rotation: 0 };

  pipes = [];
  score = 0;
  running = false;
  gameOver = false;
  accumulator = 0;
  distanceSinceLastPipe = 0;
  lastTime = 0;
  level = 1;

  scoreBox.textContent = `Skóre: 0 | Nejlepší: ${bestScore}`;
  difficultyBox.textContent = "Obtížnost: 1";
  difficultyBox.style.color = "#3eea3e";

  msgBox.style.display = "block";
  msgBox.textContent = "Stiskni mezerník nebo klikni pro start";
}

// =====================================================
//  Kreslení
// =====================================================
function draw() {
  ctx.clearRect(0, 0, W, H);

  // pozadí
  const prog = level / 100;
  const topColor = `hsl(${200 + prog * 150},70%,${60 - prog * 35}%)`;
  const bottomColor = `hsl(${180 + prog * 160},70%,${55 - prog * 40}%)`;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, topColor);
  bg.addColorStop(1, bottomColor);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // země
  const groundH = 80;
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, H - groundH, W, groundH);
  ctx.fillStyle = "#3ec73e";
  ctx.fillRect(0, H - groundH, W, 20);

  // trubky
  for (const p of pipes) {
    ctx.fillStyle = "#3bb300";
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, H - p.bottom);

    ctx.strokeStyle = "#2a8c00";
    ctx.lineWidth = 4;
    ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.strokeRect(p.x, p.bottom, PIPE_WIDTH, H - p.bottom);

    ctx.fillStyle = "#4cff4c";
    ctx.fillRect(p.x - 3, p.top - 20, PIPE_WIDTH + 6, 20);
    ctx.fillRect(p.x - 3, p.bottom, PIPE_WIDTH + 6, 20);
  }

  // pták
  ctx.save();
  let angle = Math.max(-0.4, Math.min(0.4, bird.vy / 18));
  if (gameOver) angle = bird.rotation;

  ctx.translate(bird.x, bird.y);
  ctx.rotate(angle);
  ctx.drawImage(birdImg, -bird.w / 2, -bird.h / 2, bird.w, bird.h);
  ctx.restore();
}

// =====================================================
//  Loop – fixní fyzika + plynulé vykreslování
// =====================================================
function loop(timestamp) {
  if (paused) return requestAnimationFrame(loop);

  if (!lastTime) lastTime = timestamp;
  let delta = timestamp - lastTime;
  lastTime = timestamp;

  if (delta > 120) delta = 120;

  accumulator += delta;

  while (accumulator >= FIXED_STEP) {
    update();
    accumulator -= FIXED_STEP;
  }

  draw();
  requestAnimationFrame(loop);
}

// restart tlačítko navíc
if (restartBtn) restartBtn.addEventListener("click", reset);

// start
birdImg.onload = () => {
  reset();
  requestAnimationFrame(loop);
};