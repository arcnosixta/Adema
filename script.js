(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("navMenu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Мәзірді жабу" : "Мәзірді ашу");
    });

    menu.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Мәзірді ашу");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- floating hearts ---------- */
  var heartsLayer = document.getElementById("hearts-layer");
  var HEART_SYMBOLS = ["♥", "♡", "❤"];
  var HEART_COLORS = ["#ff6fa5", "#ff3d85", "#ffb347", "#b28dff", "#ff9ec4"];

  function spawnHeart() {
    if (!heartsLayer || document.hidden) return;
    var heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    heart.style.fontSize = 14 + Math.random() * 20 + "px";
    heart.style.animationDuration = 7 + Math.random() * 7 + "s";
    heartsLayer.appendChild(heart);
    heart.addEventListener("animationend", function () { heart.remove(); });
  }

  if (!reduceMotion && heartsLayer) {
    for (var i = 0; i < 6; i++) setTimeout(spawnHeart, i * 700);
    setInterval(spawnHeart, 1400);
  }

  /* ---------- petal & flower confetti ---------- */
  var canvas = document.getElementById("confetti");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var pieces = [];
  var rafId = null;
  var PETAL_COLORS = ["#ff3d85", "#ff5d8f", "#ff8a3d", "#ffb23d", "#ffd23d", "#c04cff", "#4dc9ff", "#ff6f3d", "#ff3d94", "#e83dff"];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    if (ctx) ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function makePiece(fromTop) {
    var flower = Math.random() < 0.35;
    return {
      x: Math.random() * window.innerWidth,
      y: fromTop ? -30 - Math.random() * 80 : Math.random() * window.innerHeight,
      s: flower ? 5 + Math.random() * 4 : 4 + Math.random() * 6,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      flower: flower,
      vy: 1.1 + Math.random() * 2.6,
      vx: -1.2 + Math.random() * 2.4,
      rot: Math.random() * Math.PI * 2,
      vr: -0.06 + Math.random() * 0.12,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.04
    };
  }

  function drawPetalShape(p) {
    var base = p.s * (2 + Math.sin(p.ph) * 0.25);
    ctx.beginPath();
    ctx.moveTo(0, -base);
    ctx.bezierCurveTo(base * 0.85, -base * 0.92, base * 0.7, base * 0.25, 0, base * 0.6);
    ctx.bezierCurveTo(-base * 0.7, base * 0.25, -base * 0.85, -base * 0.92, 0, -base);
    ctx.closePath();
  }

  function drawFlower(p) {
    var r = p.s * 1.6;
    for (var i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      drawPetalShape(p);
      ctx.fillStyle = i % 2 === 0 ? p.color : lighten(p.color);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd23d";
    ctx.fill();
  }

  function lighten(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, (n >> 16) + 70);
    var g = Math.min(255, ((n >> 8) & 255) + 70);
    var b = Math.min(255, (n & 255) + 70);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function burst(count) {
    if (reduceMotion || !ctx) return;
    for (var i = 0; i < count; i++) pieces.push(makePiece(true));
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.ph = (p.sway += p.swaySpeed);
      p.x += p.vx + Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > window.innerHeight + 40 || p.x < -60 || p.x > window.innerWidth + 60) {
        pieces.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.flower) {
        drawFlower(p);
      } else {
        ctx.scale(1, 0.55 + Math.abs(Math.sin(p.sway)) * 0.45);
        drawPetalShape(p);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.96;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, p.s * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "#fff8fb";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    if (pieces.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (!reduceMotion && ctx) {
    burst(70);
    setTimeout(function () { burst(45); }, 1600);
  }

  /* ---------- birthday music (music-box) ---------- */
  var musicBtn = document.getElementById("musicBtn");
  var audioCtx = null;
  var masterGain = null;
  var musicTimer = null;
  var musicStarted = false;
  var musicOn = false;

  var NOTE = {
    G2: 98.0, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
    G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0
  };

  var MELODY = [
    ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", 0.5], ["G4", 0.5], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", 0.5], ["G4", 0.5], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
    ["F5", 0.5], ["F5", 0.5], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2]
  ];

  var CHORDS = [
    [0, ["C3", "G3", "C4", "E4"]],
    [4, ["G2", "B2", "D3", "G3"]],
    [8, ["C3", "G3", "C4", "E4"]],
    [12, ["F2", "A2", "C3", "F3"]],
    [16, ["C3", "G3", "C4", "E4"]],
    [20, ["G2", "B2", "D3", "G3"]],
    [24, ["C3", "G3", "C4", "E4"]]
  ];

  var BEAT = 0.58;
  var CYCLE = 25 * BEAT;

  function pluck(t, freq, dur, vol) {
    var osc = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    var panner = audioCtx.createPanner ? audioCtx.createPanner() : null;
    var out = masterGain;
    osc.connect(gain);
    osc2.connect(gain);
    if (panner) {
      panner.panningModel = "equalpower";
      panner.setPosition(Math.random() * 0.4 - 0.2, 0, 1.2);
      gain.connect(panner);
      panner.connect(out);
    } else {
      gain.connect(out);
    }
    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
  }

  function padChord(t, dur, notes, vol) {
    notes.forEach(function (n) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = NOTE[n];
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.6);
      gain.gain.linearRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.1);
    });
  }

  function scheduleCycle(t0) {
    var t = t0;

    MELODY.forEach(function (m) {
      pluck(t, NOTE[m[0]], Math.max(BEAT * m[1] * 1.6, 0.9), 0.16);
      t += BEAT * m[1];
    });

    for (var i = 0; i < CHORDS.length; i++) {
      var c = CHORDS[i];
      var next = i + 1 < CHORDS.length ? CHORDS[i + 1][0] : CYCLE / BEAT;
      padChord(t0 + c[0] * BEAT, (next - c[0]) * BEAT, c[1], 0.035);
    }

    var nextCycleAt = t0 + CYCLE;
    var waitMs = Math.max(150, (nextCycleAt - audioCtx.currentTime - 0.2) * 1000);
    musicTimer = setTimeout(function () {
      if (musicOn && audioCtx) scheduleCycle(nextCycleAt);
    }, waitMs);
  }

  function startMusic() {
    if (!musicBtn || musicStarted) return;
    musicStarted = true;
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.9;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    musicOn = true;
    musicBtn.setAttribute("aria-pressed", "true");
    musicBtn.setAttribute("aria-label", "Музыканы тоқтату");
    scheduleCycle(audioCtx.currentTime + 0.08);
  }

  function stopMusic() {
    musicOn = false;
    if (!audioCtx) return;
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    if (audioCtx.state === "running") audioCtx.suspend();
    if (musicBtn) {
      musicBtn.setAttribute("aria-pressed", "false");
      musicBtn.setAttribute("aria-label", "Музыканы ойнату");
    }
  }

  function toggleMusic() {
    if (musicOn) {
      stopMusic();
    } else {
      startMusic();
      if (musicOn) startBurstForMusic();
    }
  }

  function startBurstForMusic() {
    if (reduceMotion || !ctx) return;
    burst(90);
    setTimeout(function () { burst(60); }, 700);
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", toggleMusic);
  }

  function firstInteraction() {
    if (!musicStarted) startMusic();
  }
  window.addEventListener("pointerdown", firstInteraction, { once: true, passive: true });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Tab" || e.key === "Enter") return;
    firstInteraction();
  }, { once: true, passive: true });

  /* ---------- celebrate button ---------- */
  var celebrateBtn = document.getElementById("celebrateBtn");
  if (celebrateBtn) {
    celebrateBtn.addEventListener("click", function () {
      burst(200);
      for (var i = 0; i < 14; i++) setTimeout(spawnHeart, i * 120);
      if (!musicStarted) startMusic();
      celebrateBtn.textContent = "Мереке құтты! 🎀";
      setTimeout(function () {
        celebrateBtn.textContent = "Мерекені бастау 🎉";
      }, 3000);
    });
  }
})();