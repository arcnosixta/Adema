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

  /* ---------- confetti ---------- */
  var canvas = document.getElementById("confetti");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var pieces = [];
  var rafId = null;
  var COLORS = ["#ff3d85", "#ff6fa5", "#ffb347", "#b28dff", "#8fd3ff", "#ffd700"];

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
    return {
      x: Math.random() * window.innerWidth,
      y: fromTop ? -20 - Math.random() * 60 : Math.random() * window.innerHeight,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: 1.2 + Math.random() * 2.4,
      vx: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI,
      vr: -0.08 + Math.random() * 0.16,
      sway: Math.random() * Math.PI * 2
    };
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
      p.sway += 0.03;
      p.x += p.vx + Math.sin(p.sway) * 0.7;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.y > window.innerHeight + 30) {
        pieces.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.92;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
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
    burst(90);
    setTimeout(function () { burst(60); }, 1600);
  }

  /* ---------- celebrate button ---------- */
  var celebrateBtn = document.getElementById("celebrateBtn");
  if (celebrateBtn) {
    celebrateBtn.addEventListener("click", function () {
      burst(220);
      for (var i = 0; i < 14; i++) setTimeout(spawnHeart, i * 120);
      celebrateBtn.textContent = "Мереке құтты! 🎀";
      setTimeout(function () {
        celebrateBtn.textContent = "Мерекені бастау 🎉";
      }, 3000);
    });
  }

  /* ---------- initial page burst ---------- */
  if (!reduceMotion) {
    setTimeout(function () { burst(70); }, 400);
  }
})();
