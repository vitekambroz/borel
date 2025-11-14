// =====================================================
//  Připravená a modernizovaná verze – minihra.js
// =====================================================

const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');

let W = cvs.width, H = cvs.height;

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
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// =====================================================
//  Obrázky
// =====================================================
const birdImgAlive = new Image();
birdImgAlive.src = 'foto/bird.png';
const birdImgDead = new Image();
birdImgDead.src = 'foto/bird_dead.png';
let birdImg = birdImgAlive;

// =====================================================
//  Zvuky
// =====================================================
const deathSound = new Audio('sounds/dead.mp3');
deathSound.volume = 0.8;

const levelUpSound = new Audio('sounds/levelup.mp3');
levelUpSound.volume = 0.7;

// =====================================================
//  UI prvky
// =====================================================
const scoreBox = document.getElementById('score');
const difficultyBox = document.getElementById('difficulty');
const msgBox = document.getElementById('centerMsg');
const restartBtn = document.getElementById('restart');
const muteBtn = document.getElementById('mute');

// =====================================================
//  Herní proměnné
// =====================================================
let bird = { x: 100, y: H / 2, w: 48, h: 48, vy: 0, rotation: 0 };

const gravity = 0.6;
const jump = -10.5;
const pipeWidth = 70;

let pipes = [];
let score = 0;
let bestScore = Number(localStorage.getItem('bestScore')) || 0;
let running = false;
let gameOver = false;
let lastTime = 0;
let spawnTimer = 0;

let level = 1;
let levelPulse = 0;
let flashTimer = 0;

let isMuted = false;

// =====================================================
//  Inicializace po načtení obrázku
// =====================================================
birdImg.onload = () => {
  reset();
  requestAnimationFrame(loop);
};

// =====================================================
//  Mute tlačítko
// =====================================================
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  });
}

// =====================================================
//  Ovládání – skok
// =====================================================
function flap() {
  if (!running && !gameOver) {
    running = true;
    msgBox.style.display = 'none';
  }
  if (gameOver) return;
  bird.vy = jump;
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    flap();
  }
});
cvs.addEventListener('mousedown', flap);
cvs.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });

// =====================================================
//  Auto-pause při ztrátě focusu
// =====================================================
let paused = false;

window.addEventListener('blur', () => {
  paused = true;
});
window.addEventListener('focus', () => {
  if (!gameOver) {
    paused = false;
    lastTime = performance.now();
  }
});

// =====================================================
//  Spawn trubek
// =====================================================
function spawnPipe() {
  const minMargin = 80;
  const baseGap = 170;
  const gap = Math.max(baseGap, Math.floor(H * 0.26));
  const randomFactor = 0.4;

  const maxTop = H - minMargin - gap;
  const midTop = (minMargin + maxTop) / 2;
  const range = (maxTop - minMargin) * randomFactor;

  const topH = Math.floor(midTop + (Math.random() - 0.5) * range);

  pipes.push({
    x: W,
    top: topH,
    bottom: topH + gap,
    scored: false
  });
}

// =====================================================
//  Kolize
// =====================================================
function intersect(a, b) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

// =====================================================
//  Update logika
// =====================================================
const SPAWN_EVERY_MS = 1200;
const PIPE_SPEED = 2;

function update(dt, deltaMs) {
  if (running && !gameOver) {
    // pohyb ptáka
    bird.vy += gravity * dt;
    bird.y += bird.vy * dt;

    // spawn trubek
    spawnTimer += deltaMs;
    if (spawnTimer >= SPAWN_EVERY_MS) {
      spawnPipe();
      spawnTimer = 0;
    }

    // obtížnost
    const maxLevel = 200;
    const levelProgress = Math.min(score, maxLevel);

    const speed = levelProgress <= 100
      ? PIPE_SPEED + (levelProgress / 100) * 6
      : PIPE_SPEED + 6 + ((levelProgress - 100) / 100) * 6;

    // trubky
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= speed * dt;

      // zisk bodu
      if (!pipes[i].scored && pipes[i].x + pipeWidth < bird.x) {
        pipes[i].scored = true;
        score++;

        const newLevel = Math.min(score + 1, maxLevel);
        if (newLevel !== level) {
          level = newLevel;
          flashTimer = 300;

          if (!isMuted) {
            levelUpSound.currentTime = 0;
            levelUpSound.play();
          }

          // UI – update obtížnosti
          difficultyBox.textContent = `Obtížnost: ${level}`;

          if (level <= 30) difficultyBox.style.color = "#3eea3e";
          else if (level <= 60) difficultyBox.style.color = "#f39c12";
          else difficultyBox.style.color = "#e74c3c";

          // jemná animovaná záře
          difficultyBox.classList.add("glowPulse");
          setTimeout(() => difficultyBox.classList.remove("glowPulse"), 350);
        }

        scoreBox.textContent = `Skóre: ${score} | Nejlepší: ${bestScore}`;
      }

      if (pipes[i].x + pipeWidth < -10) pipes.splice(i, 1);
    }

    // kolize se zemí
    if (bird.y + bird.h / 2 > H || bird.y - bird.h / 2 < 0) endGame();

    // kolize s trubkami
    for (const p of pipes) {
      const topRect = { x: p.x, y: 0, w: pipeWidth, h: p.top };
      const botRect = { x: p.x, y: p.bottom, w: pipeWidth, h: H - p.bottom };

      const inset = 6;
      const birdRect = {
        x: bird.x - bird.w / 2 + inset,
        y: bird.y - bird.h / 2 + inset,
        w: bird.w - inset * 2,
        h: bird.h - inset * 2
      };

      if (intersect(birdRect, topRect) || intersect(birdRect, botRect))
        endGame();
    }

    if (flashTimer > 0) flashTimer -= deltaMs;

  } else if (gameOver) {
    // pád dolů
    if (bird.y + bird.h / 2 < H - 30) {
      bird.vy += gravity * 0.4 * dt;
      bird.y += bird.vy * dt;
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
    localStorage.setItem('bestScore', bestScore);
  }

  msgBox.style.display = 'block';
  msgBox.innerHTML = `
    💀 Prohrál/a jsi<br>
    Skóre: <b>${score}</b><br>
    Nejlepší: <b>${bestScore}</b><br>
    <small>Klikni Restart</small>
  `;

  scoreBox.textContent = `Skóre: ${score} | Nejlepší: ${bestScore}`;
}

// =====================================================
//  Reset hry
// =====================================================
function reset() {
  birdImg = birdImgAlive;
  bird = { x: 100, y: H / 2, w: 48, h: 48, vy: 0, rotation: 0 };
  pipes = [];
  score = 0;
  running = false;
  gameOver = false;
  lastTime = 0;
  spawnTimer = 0;
  level = 1;
  flashTimer = 0;

  scoreBox.textContent = `Skóre: 0 | Nejlepší: ${bestScore}`;
  difficultyBox.textContent = `Obtížnost: 1`;
  difficultyBox.style.color = "#3eea3e";

  msgBox.style.display = 'block';
  msgBox.textContent = 'Stiskni mezerník nebo klikni pro start';
}

// =====================================================
//  Kreslení
// =====================================================
function draw() {
  ctx.clearRect(0, 0, W, H);

  // záblesk při zvýšení levelu
  if (flashTimer > 0) {
    const alpha = Math.min(0.6, flashTimer / 300);
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, `rgba(255,255,0,${alpha})`);
    gradient.addColorStop(1, `rgba(255,105,180,${alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  // -----------------------------------------------------
  //  Grafika pozadí + země
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
    topColor = `hsl(${30 + (progress - 0.6) * 150},80%,${70 - (progress - 0.6) * 20}%)`;
    bottomColor = `hsl(${10 + (progress - 0.6) * 150},80%,${60 - (progress - 0.6) * 20}%)`;
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
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, H - groundHeight, W, groundHeight);
  ctx.fillStyle = '#3ec73e';
  ctx.fillRect(0, H - groundHeight, W, 20);

  // -----------------------------------------------------
  //  Trubky
  // -----------------------------------------------------
  for (const p of pipes) {
    const color = '#3bb300';
    const border = '#2a8c00';

    ctx.fillStyle = color;
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    ctx.strokeStyle = border;
    ctx.lineWidth = 4;
    ctx.strokeRect(p.x, 0, pipeWidth, p.top);

    ctx.fillRect(p.x, p.bottom, pipeWidth, H - p.bottom);
    ctx.strokeRect(p.x, p.bottom, pipeWidth, H - p.bottom);

    ctx.fillStyle = '#4cff4c';
    ctx.fillRect(p.x - 3, p.top - 20, pipeWidth + 6, 20);
    ctx.fillRect(p.x - 3, p.bottom, pipeWidth + 6, 20);
  }

  // -----------------------------------------------------
  //  Pták
  // -----------------------------------------------------
  if (birdImg.complete && birdImg.naturalWidth !== 0) {
    ctx.save();
    let angle = Math.max(-0.3, Math.min(0.3, bird.vy / 20));
    if (gameOver) angle = bird.rotation;

    ctx.translate(bird.x, bird.y);
    ctx.rotate(angle);
    ctx.drawImage(birdImg, -bird.w / 2, -bird.h / 2, bird.w, bird.h);

    ctx.restore();
  }
}

// =====================================================
//  Loop
// =====================================================
function loop(timestamp) {
  if (paused) {
    requestAnimationFrame(loop);
    return;
  }

  if (!lastTime) lastTime = timestamp;
  let deltaMs = timestamp - lastTime;

  if (deltaMs > 50) deltaMs = 50;

  const dt = deltaMs / 16.67;
  lastTime = timestamp;

  update(dt, deltaMs);
  draw();

  requestAnimationFrame(loop);
}

// =====================================================
//  Restart tlačítko
// =====================================================
restartBtn.addEventListener('click', reset);