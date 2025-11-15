// =====================================================
//  Připravená a modernizovaná verze – minihra.js
//  Vyladěná fyzika, agresivnější obtížnost, rage-bait styl 😈
// =====================================================

const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");

let W = cvs.width;
let H = cvs.height;

// =====================================================
//  Dynamická velikost canvasu
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
//  UI prvky
// =====================================================
const scoreBox = document.getElementById("score");
const difficultyBox = document.getElementById("difficulty");
const msgBox = document.getElementById("centerMsg");
const restartBtn = document.getElementById("restart");
const muteBtn = document.getElementById("mute");

// SVG ikony v mute tlačítku (pokud existují)
const soundOnIcon = document.getElementById("soundOn");
const soundOffIcon = document.getElementById("soundOff");

// =====================================================
//  Herní proměnné & fyzika
// =====================================================
let bird;

const GRAVITY = 0.55;
const JUMP_VELOCITY = -9.8;
const MAX_FALL_SPEED = 14;
const MAX_RISE_SPEED = -12;

const PIPE_WIDTH = 70;
const BASE_PIPE_SPEED = 2.4;

let pipes = [];
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;
let running = false;
let gameOver = false;

let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60; // 60 FPS fixní fyzika

let level = 1;
let isMuted = false;
let paused = false;

let distanceSinceLastPipe = 0;

// =====================================================
//  Inicializace po načtení obrázku
// =====================================================
birdImg.onload = () => {
  reset();
  requestAnimationFrame(loop);
};

// =====================================================
//  Mute tlačítko – SVG verze
// =====================================================
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;

    if (soundOnIcon && soundOffIcon) {
      soundOnIcon.style.display = isMuted ? "none" : "block";
      soundOffIcon.style.display = isMuted ? "block" : "none";
    }
  });
}

// =====================================================
//  Ovládání – skok + restart po smrti
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
//  Auto-pause při ztrátě focusu
// =====================================================
window.addEventListener("blur", () => {
  paused = true;
});

window.addEventListener("focus", () => {
  if (!gameOver) {
    paused = false;
    lastTime = performance.now();
  }
});

// =====================================================
//  Spawn trubek – agresivnější, méně předvídatelné
// =====================================================
function currentPipeSettings() {
  // rage-bait nastavení: se skóre se zmenšuje mezera a rozestup
  const cappedScore = Math.min(score, 80);

  const baseGap = 170;
  const minGap = 110;
  let gap =
    baseGap -
    (baseGap - minGap) * (cappedScore / 80); // postupně k minGap

  // občas extra sviňárna – užší mezera
  if (score > 25 && Math.random() < 0.2) {
    gap -= 14;
  }

  const baseSpacing = 260;
  const minSpacing = 160;
  const spacing =
    baseSpacing -
    (baseSpacing - minSpacing) * (cappedScore / 80); // trubky blíž sobě

  return { gap, spacing };
}

function spawnPipe() {
  const { gap } = currentPipeSettings();
  const margin = 60;

  const maxTop = H - margin - gap;
  const top = margin + Math.random() * (maxTop - margin);

  pipes.push({
    x: W + 10,
    top,
    bottom: top + gap,
    scored: false,
  });
}

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
//  Update logika – fixní fyzika, agresivnější rychlost
// =====================================================
function update() {
  if (running && !gameOver) {
    const cappedScore = Math.min(score, 120);
    const pipeSpeed = BASE_PIPE_SPEED + cappedScore * 0.07; // masivní zrychlování

    // pohyb ptáka
    bird.vy += GRAVITY;
    if (bird.vy > MAX_FALL_SPEED) bird.vy = MAX_FALL_SPEED;
    if (bird.vy < MAX_RISE_SPEED) bird.vy = MAX_RISE_SPEED;
    bird.y += bird.vy;

    // spawn trubek podle uražené vzdálenosti
    const { spacing } = currentPipeSettings();
    distanceSinceLastPipe += pipeSpeed;
    if (distanceSinceLastPipe >= spacing) {
      spawnPipe();
      distanceSinceLastPipe = 0;
    }

    // trubky
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= pipeSpeed;

      // zisk bodu
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

          // UI – update obtížnosti
          difficultyBox.textContent = `Obtížnost: ${level}`;

          if (level <= 30) difficultyBox.style.color = "#3eea3e";
          else if (level <= 60) difficultyBox.style.color = "#f39c12";
          else difficultyBox.style.color = "#e74c3c";

          // neon puls pilulky
          const pill = difficultyBox.parentElement || difficultyBox;
          pill.classList.remove("difficultyPulse");
          void pill.offsetWidth; // restart animace
          pill.classList.add("difficultyPulse");
        }

        scoreBox.textContent = `Skóre: ${score} | Nejlepší: ${bestScore}`;
      }

      // odstranění trubky mimo scénu
      if (p.x + PIPE_WIDTH < -20) {
        pipes.splice(i, 1);
      }
    }

    // kolize se zemí / stropem
    if (bird.y + bird.h / 2 > H || bird.y - bird.h / 2 < 0) {
      endGame();
      return;
    }

    // kolize s trubkami
    for (const p of pipes) {
      const topRect = { x: p.x, y: 0, w: PIPE_WIDTH, h: p.top };
      const botRect = { x: p.x, y: p.bottom, w: PIPE_WIDTH, h: H - p.bottom };

      const inset = 6;
      const birdRect = {
        x: bird.x - bird.w / 2 + inset,
        y: bird.y - bird.h / 2 + inset,
        w: bird.w - inset * 2,
        h: bird.h - inset * 2,
      };

      if (intersect(birdRect, topRect) || intersect(birdRect, botRect)) {
        endGame();
        break;
      }
    }
  } else if (gameOver) {
    // pád dolů po smrti – dramatický dojezd
    if (bird.y + bird.h / 2 < H - 30) {
      bird.vy += GRAVITY * 0.6;
      if (bird.vy > MAX_FALL_SPEED + 4) bird.vy = MAX_FALL_SPEED + 4;
      bird.y += bird.vy;
    }
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
//  Reset hry
// =====================================================
function reset() {
  birdImg = birdImgAlive;
  bird = {
    x: 100,
    y: H / 2,
    w: 48,
    h: 48,
    vy: 0,
    rotation: 0,
  };

  pipes = [];
  score = 0;
  running = false;
  gameOver = false;
  lastTime = 0;
  accumulator = 0;
  distanceSinceLastPipe = 0;
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

  // -----------------------------------------------------
  //  Dynamické pozadí podle obtížnosti
  // -----------------------------------------------------
  const progress = level / 100;
  let topColor, bottomColor;

  if (progress < 0.1) {
    topColor = `hsl(330,70%,${70 - progress * 50}%)`;
    bottomColor = `hsl(200,80%,${85 - progress * 30}%)`;
  } else if (progress < 0.3) {
    topColor = `hsl(195,80%,${75 - (progress - 0.1) * 50}%)`;
    bottomColor = `hsl(210,90%,${90 - (progress - 0.1) * 30}%)`;
  } else if (progress < 0.6) {
    topColor = `hsl(200,90%,${85 - (progress - 0.3) * 20}%)`;
    bottomColor = `hsl(210,95%,${95 - (progress - 0.3) * 10}%)`;
  } else if (progress < 0.8) {
    topColor = `hsl(${30 + (progress - 0.6) * 150},80%,${
      70 - (progress - 0.6) * 20
    }%)`;
    bottomColor = `hsl(${10 + (progress - 0.6) * 150},80%,${
      60 - (progress - 0.6) * 20
    }%)`;
  } else {
    topColor = `hsl(240,60%,${20 + (progress - 0.8) * 5}%)`;
    bottomColor = `hsl(260,70%,${15 + (progress - 0.8) * 10}%)`;
  }

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, topColor);
  bg.addColorStop(1, bottomColor);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // zem
  const groundHeight = 80;
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, H - groundHeight, W, groundHeight);
  ctx.fillStyle = "#3ec73e";
  ctx.fillRect(0, H - groundHeight, W, 20);

  // -----------------------------------------------------
  //  Trubky
  // -----------------------------------------------------
  for (const p of pipes) {
    const color = "#3bb300";
    const border = "#2a8c00";

    ctx.fillStyle = color;
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.strokeStyle = border;
    ctx.lineWidth = 4;
    ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);

    ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, H - p.bottom);
    ctx.strokeRect(p.x, p.bottom, PIPE_WIDTH, H - p.bottom);

    ctx.fillStyle = "#4cff4c";
    ctx.fillRect(p.x - 3, p.top - 20, PIPE_WIDTH + 6, 20);
    ctx.fillRect(p.x - 3, p.bottom, PIPE_WIDTH + 6, 20);
  }

  // -----------------------------------------------------
  //  Pták
  // -----------------------------------------------------
  if (birdImg.complete && birdImg.naturalWidth !== 0) {
    ctx.save();
    let angle = Math.max(-0.4, Math.min(0.4, bird.vy / 18));
    if (gameOver) angle = bird.rotation;

    ctx.translate(bird.x, bird.y);
    ctx.rotate(angle);
    ctx.drawImage(birdImg, -bird.w / 2, -bird.h / 2, bird.w, bird.h);
    ctx.restore();
  }
}

// =====================================================
//  Loop – fixní fyzika, plynulé vykreslování
// =====================================================
function loop(timestamp) {
  if (paused) {
    requestAnimationFrame(loop);
    return;
  }

  if (!lastTime) lastTime = timestamp;
  let deltaMs = timestamp - lastTime;
  lastTime = timestamp;

  if (deltaMs > 120) deltaMs = 120; // ochrana při lagu

  accumulator += deltaMs;

  while (accumulator >= FIXED_STEP) {
    update();
    accumulator -= FIXED_STEP;
  }

  draw();
  requestAnimationFrame(loop);
}

// =====================================================
//  Restart tlačítko (bonus k click/space restartu)
// =====================================================
if (restartBtn) {
  restartBtn.addEventListener("click", reset);
}