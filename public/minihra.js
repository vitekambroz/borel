// =====================================================
//  Minihra.js – BEM verze (bez ID) + napojení na
//  game-sound-toggle / game-vibrate-toggle
// =====================================================

(function () {
  // Root prvky
  const gameEl = document.querySelector('.game');
  if (!gameEl) return;

  // plátno – vezmeme .game__canvas, nebo fallback na první <canvas> uvnitř .game
  const cvs =
    gameEl.querySelector('.game__canvas') ||
    gameEl.querySelector('canvas');
  if (!cvs) return;

  const ctx = cvs.getContext('2d');

  // UI prvky
  const scoreValueEl      = gameEl.querySelector('.game__score-value');
  const difficultyValueEl = gameEl.querySelector('.game__difficulty-value');
  const difficultyPillEl  = gameEl.querySelector('.game__difficulty');
  const msgBox            = gameEl.querySelector('.game__center-message');

  const muteBtn = gameEl.querySelector('.game__button--mute');
  const vibBtn  = gameEl.querySelector('.game__button--vibrate');

  let W, H;

  // =====================================================
  //  Dynamický canvas
  // =====================================================
  function resizeCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const rect = cvs.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;

    cvs.width  = rect.width * dpr;
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
  birdImgAlive.src = 'foto/bird.png';       // relativní cesta jako dřív

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
  //  Herní proměnné
  // =====================================================
  let bird;

  const GRAVITY        = 0.55;
  const JUMP_VELOCITY  = -9.8;
  const MAX_FALL_SPEED = 14;
  const MAX_RISE_SPEED = -12;

  const PIPE_WIDTH      = 70;
  const BASE_PIPE_SPEED = 2.4;

  const GROUND_HEIGHT = 80;

  let pipes = [];
  let score = 0;
  let bestScore = Number(localStorage.getItem('bestScore')) || 0;

  let running   = false;
  let gameOver  = false;
  let paused    = false;
  let level     = 1;
  let distanceSinceLastPipe = 0;

  let lastTime    = 0;
  let accumulator = 0;
  const FIXED_STEP = 1000 / 60;

  // =====================================================
  //  Persistentní stav zvuku / vibrací
  // =====================================================
  let isMuted;
  let hapticsEnabled;

  function initSoundAndHapticsState() {
    const btnSoundState = muteBtn?.dataset.state; // "on" / "off"
    const btnVibState   = vibBtn?.dataset.state;  // "on" / "off"

    // SOUND
    if (btnSoundState === 'on' || btnSoundState === 'off') {
      isMuted = (btnSoundState === 'off');
    } else {
      const storedSound = localStorage.getItem('game-sound'); // "on" / "off"
      isMuted = (storedSound === 'off');
    }

    // VIBRACE
    if (btnVibState === 'on' || btnVibState === 'off') {
      hapticsEnabled = (btnVibState === 'on');
    } else {
      const storedVib = localStorage.getItem('game-vibrate'); // "on" / "off"
      hapticsEnabled = (storedVib !== 'off'); // default ON
    }
  }

  initSoundAndHapticsState();

  // posluchače na custom eventy z theme.js
  document.addEventListener('game-sound-toggle', (e) => {
    if (!e.detail) return;
    // enabled true => zvuk zap → isMuted false
    isMuted = !e.detail.enabled;
  });

  document.addEventListener('game-vibrate-toggle', (e) => {
    if (!e.detail) return;
    hapticsEnabled = !!e.detail.enabled;
  });

  // =====================================================
  //  Vibrace helper – zpátky „původní“ verze
  // =====================================================
  function doHaptic(msOrPattern) {
    if (!hapticsEnabled) return;
    if (!('vibrate' in navigator)) return;
    if (!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;
    navigator.vibrate(msOrPattern);
  }

  // =====================================================
  //  Start / skok / restart
  // =====================================================
  function flapOrRestart() {
    if (gameOver) {
      reset();
      return;
    }

    if (!running) {
      running = true;
      if (msgBox) msgBox.style.display = 'none';
    }

    bird.vy = JUMP_VELOCITY;
    doHaptic(25);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flapOrRestart();
    }
  });

  cvs.addEventListener('mousedown', flapOrRestart);
  cvs.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      flapOrRestart();
    },
    { passive: false }
  );

  // =====================================================
  //  Auto-pause
  // =====================================================
  window.addEventListener('blur', () => (paused = true));
  window.addEventListener('focus', () => {
    if (!gameOver) {
      paused = false;
      lastTime = performance.now();
    }
  });

  // =====================================================
  //  Trubky
  // =====================================================
  function currentPipeSettings() {
    const capped = Math.min(score, 80);
    return {
      gap:     170 - (170 - 110) * (capped / 80),
      spacing: 260 - (260 - 160) * (capped / 80),
    };
  }

  function spawnPipe() {
    const { gap } = currentPipeSettings();
    const margin = 60;

    const maxTop = H - GROUND_HEIGHT - gap - 20;
    const top    = margin + Math.random() * (maxTop - margin);
    const bottom = Math.min(top + gap, H - GROUND_HEIGHT - 20);

    pipes.push({
      x: W + 10,
      top,
      bottom,
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
  //  Update
  // =====================================================
  function update() {
    if (running && !gameOver) {
      const capped     = Math.min(score, 120);
      const pipeSpeed  = BASE_PIPE_SPEED + capped * 0.07;

      bird.vy += GRAVITY;
      bird.vy = Math.max(MAX_RISE_SPEED, Math.min(MAX_FALL_SPEED, bird.vy));
      bird.y += bird.vy;

      const { spacing } = currentPipeSettings();
      distanceSinceLastPipe += pipeSpeed;
      if (distanceSinceLastPipe >= spacing) {
        spawnPipe();
        distanceSinceLastPipe = 0;
      }

      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= pipeSpeed;

        // skóre
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

            doHaptic([30, 60, 30]);

            if (difficultyValueEl) {
              difficultyValueEl.textContent = `Obtížnost: ${level}`;

              if (level <= 30) difficultyValueEl.style.color = '#3eea3e';
              else if (level <= 60) difficultyValueEl.style.color = '#f39c12';
              else difficultyValueEl.style.color = '#e74c3c';
            }

            const pill = difficultyPillEl || difficultyValueEl?.parentElement;
            if (pill) {
              pill.classList.remove('difficultyPulse');
              void pill.offsetWidth;
              pill.classList.add('difficultyPulse');
            }
          }

          if (scoreValueEl) {
            scoreValueEl.textContent = `Skóre: ${score} | Nejlepší: ${bestScore}`;
          }
        }

        if (p.x + PIPE_WIDTH < -20) pipes.splice(i, 1);
      }

      // sražka se zemí / stropem
      if (bird.y + bird.h / 2 > H || bird.y - bird.h / 2 < 0) {
        endGame();
        doHaptic([80, 80, 80]);
        return;
      }

      // kolize s trubkami
      for (const p of pipes) {
        const topRect = { x: p.x, y: 0, w: PIPE_WIDTH, h: p.top };
        const botRect = {
          x: p.x,
          y: p.bottom,
          w: PIPE_WIDTH,
          h: H - GROUND_HEIGHT - p.bottom,
        };

        const inset = 6;
        const b = {
          x: bird.x - bird.w / 2 + inset,
          y: bird.y - bird.h / 2 + inset,
          w: bird.w - inset * 2,
          h: bird.h - inset * 2,
        };

        if (intersect(b, topRect) || intersect(b, botRect)) {
          endGame();
          doHaptic([100, 70, 100]);
          break;
        }
      }
    } else if (gameOver) {
      if (bird.y + bird.h / 2 < H - 30) {
        bird.vy += GRAVITY * 0.6;
        bird.y  += bird.vy;
      }
    }
  }

  // =====================================================
  //  Konec hry
  // =====================================================
  function endGame() {
    if (gameOver) return;
    gameOver = true;
    running  = false;

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

    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.innerHTML = `
        💀 Prohrál/a jsi<br>
        Skóre: <b>${score}</b><br>
        Nejlepší: <b>${bestScore}</b><br>
        <small>Klikni / mezerník pro restart</small>
      `;
    }
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
    accumulator = 0;
    distanceSinceLastPipe = 0;
    level = 1;

    if (scoreValueEl) {
      scoreValueEl.textContent = `Skóre: 0 | Nejlepší: ${bestScore}`;
    }
    if (difficultyValueEl) {
      difficultyValueEl.textContent = 'Obtížnost: 1';
      difficultyValueEl.style.color = '#3eea3e';
    }

    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.textContent = 'Stiskni mezerník nebo klikni pro start';
    }
  }

  // =====================================================
  //  Vykreslování
  // =====================================================
  function draw() {
    ctx.clearRect(0, 0, W, H);

    const progress = level / 100;
    let topColor, bottomColor;

    if (progress < 0.1) {
      topColor    = `hsl(330,70%,${70 - progress * 50}%)`;
      bottomColor = `hsl(200,80%,${85 - progress * 30}%)`;
    } else if (progress < 0.3) {
      topColor    = `hsl(195,80%,${75 - (progress - 0.1) * 50}%)`;
      bottomColor = `hsl(210,90%,${90 - (progress - 0.1) * 30}%)`;
    } else if (progress < 0.6) {
      topColor    = `hsl(200,90%,${85 - (progress - 0.3) * 20}%)`;
      bottomColor = `hsl(210,95%,${95 - (progress - 0.3) * 10}%)`;
    } else if (progress < 0.8) {
      topColor    = `hsl(${30 + (progress - 0.6) * 150},80%,${70 -
        (progress - 0.6) * 20}%)`;
      bottomColor = `hsl(${10 + (progress - 0.6) * 150},80%,${60 -
        (progress - 0.6) * 20}%)`;
    } else {
      topColor    = `hsl(240,60%,${20 + (progress - 0.8) * 5}%)`;
      bottomColor = `hsl(260,70%,${15 + (progress - 0.8) * 10}%)`;
    }

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, topColor);
    bg.addColorStop(1, bottomColor);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, H - GROUND_HEIGHT, W, GROUND_HEIGHT);
    ctx.fillStyle = '#3ec73e';
    ctx.fillRect(0, H - GROUND_HEIGHT, W, 20);

    for (const p of pipes) {
      ctx.fillStyle = '#3bb300';
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);

      ctx.strokeStyle = '#2a8c00';
      ctx.lineWidth = 4;
      ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.top);

      ctx.fillRect(p.x, p.bottom, PIPE_WIDTH, H - GROUND_HEIGHT - p.bottom);
      ctx.strokeRect(p.x, p.bottom, PIPE_WIDTH, H - GROUND_HEIGHT - p.bottom);

      ctx.fillStyle = '#4cff4c';
      ctx.fillRect(p.x - 3, p.top - 20, PIPE_WIDTH + 6, 20);
      ctx.fillRect(p.x - 3, p.bottom, PIPE_WIDTH + 6, 20);
    }

    if (birdImg && birdImg.complete) {
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
  //  Loop
  // =====================================================
  function loop(timestamp) {
    if (paused) {
      requestAnimationFrame(loop);
      return;
    }

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

  // =====================================================
  //  Start hry – bez čekání na sprite
  // =====================================================
  function startGame() {
    reset();
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  startGame();
})();