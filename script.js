(() => {
  "use strict";

  const root = document.documentElement;
  const STORAGE_KEY = "sk-theme";

  // ===== Theme: persist across sessions, respect OS preference on first load =====
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const stored = localStorage.getItem(STORAGE_KEY);
  const initial = stored || (prefersDark.matches ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  const themeBtn = document.querySelector(".theme-toggle");
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
    }
  });

  // ===== Mobile nav toggle =====
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-header nav");
  menuBtn?.addEventListener("click", () => nav?.classList.toggle("open"));

  // ===== Smooth scroll + close mobile nav on link click =====
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      nav?.classList.remove("open");
    });
  });

  // ===== Reveal on scroll =====
  const revealEls = document.querySelectorAll(".reveal");
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  revealEls.forEach((el) => revealObs.observe(el));

  // ===== Section tracking for active nav link =====
  const navLinks = Array.from(
    document.querySelectorAll('nav ul li a[href^="#"]'),
  );
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", isActive);
    });
  };

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
  );
  sections.forEach((s) => sectionObs.observe(s));

  // ===== Floating orbs — sine-wave drift, no scroll interference =====
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!reduceMotion) {
    const orbConfigs = [
      {
        el: document.querySelector(".orb-1"),
        x0: -14,
        y0: -14,
        rx: 18,
        ry: 22,
        sx: 0.00023,
        sy: 0.00031,
      },
      {
        el: document.querySelector(".orb-2"),
        x0: 72,
        y0: 68,
        rx: 20,
        ry: 16,
        sx: 0.00019,
        sy: 0.00027,
      },
      {
        el: document.querySelector(".orb-3"),
        x0: 55,
        y0: 30,
        rx: 24,
        ry: 20,
        sx: 0.00015,
        sy: 0.00021,
      },
    ];

    // x0/y0 as % of viewport, rx/ry as px radius of drift
    function tickOrbs(ts) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (const c of orbConfigs) {
        if (!c.el) continue;
        const cx = (c.x0 / 100) * vw + Math.sin(ts * c.sx) * c.rx;
        const cy = (c.y0 / 100) * vh + Math.cos(ts * c.sy) * c.ry;
        c.el.style.left = `${cx}px`;
        c.el.style.top = `${cy}px`;
      }
      requestAnimationFrame(tickOrbs);
    }
    requestAnimationFrame(tickOrbs);
  }

  // ===== Contact form — mailto-based submission =====
  const form = document.querySelector("#contact-form");
  const submitBtn = document.querySelector("#form-submit-btn");
  const statusEl = document.querySelector("#form-status");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#name")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const message = form.querySelector("#message")?.value.trim();

    if (!name || !email || !message) {
      showFormStatus("please fill in all the fields ✌️", "error");
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
      `Hi Yash,\n\nYou have a new message from your portfolio.\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
    );
    const mailto = `mailto:sk5109@columbia.edu?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    showFormStatus(
      "your email app should open now — thanks for reaching out!",
      "success",
    );
    form.reset();
  });

  function showFormStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `form-status form-status--${type}`;
  }

  // ===== Dynamic year =====
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// ===== Scroll progress =====
(() => {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
  }, { passive: true });
})();

// ===== Command Palette =====
(() => {
  const COMMANDS = [
    { group: "Go to", label: "about me",           icon: "01", type: "nav",    target: "#about" },
    { group: "Go to", label: "work experience",    icon: "02", type: "nav",    target: "#experience" },
    { group: "Go to", label: "education",          icon: "03", type: "nav",    target: "#education" },
    { group: "Go to", label: "projects",           icon: "04", type: "nav",    target: "#projects" },
    { group: "Go to", label: "leadership",         icon: "05", type: "nav",    target: "#leadership" },
    { group: "Go to", label: "skills & awards",    icon: "06", type: "nav",    target: "#skills" },
    { group: "Go to", label: "play games 🎮",      icon: "07", type: "nav",    target: "#play" },
    { group: "Go to", label: "contact",            icon: "08", type: "nav",    target: "#contact" },
    { group: "Links", label: "email yash",         icon: "✉",  type: "link",   href: "mailto:sk5109@columbia.edu" },
    { group: "Links", label: "linkedin ↗",         icon: "in", type: "link",   href: "https://www.linkedin.com/in/shreyash-kawle/" },
    { group: "Links", label: "github ↗",           icon: "gh", type: "link",   href: "https://github.com/SSK2822" },
    { group: "Actions", label: "toggle theme",     icon: "◐",  type: "action", action: "theme" },
  ];

  const palette  = document.getElementById("cmd-palette");
  const backdrop = document.getElementById("cmd-backdrop");
  const inputEl  = document.getElementById("cmd-input");
  const resultsEl = document.getElementById("cmd-results");
  if (!palette) return;

  let isOpen = false, activeIdx = 0, filtered = [];

  function open() {
    isOpen = true;
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    inputEl.value = "";
    filter();
    inputEl.focus();
  }

  function close() {
    isOpen = false;
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
  }

  function filter() {
    const q = inputEl.value.toLowerCase().trim();
    filtered = q
      ? COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
      : COMMANDS;
    activeIdx = 0;
    render();
  }

  function render() {
    const groups = {};
    filtered.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });
    resultsEl.innerHTML = "";
    let idx = 0;
    Object.entries(groups).forEach(([grp, cmds]) => {
      const lbl = document.createElement("div");
      lbl.className = "cmd-group-label";
      lbl.textContent = grp;
      resultsEl.appendChild(lbl);
      cmds.forEach(cmd => {
        const el = document.createElement("div");
        el.className = "cmd-item" + (idx === activeIdx ? " active" : "");
        el.dataset.idx = idx;
        el.innerHTML = `<span class="cmd-item-icon">${cmd.icon}</span><span class="cmd-item-label">${cmd.label}</span><span class="cmd-item-tag">${cmd.type}</span>`;
        el.addEventListener("click", () => execute(cmd));
        el.addEventListener("mouseover", () => { activeIdx = +el.dataset.idx; render(); });
        resultsEl.appendChild(el);
        idx++;
      });
    });
    const active = resultsEl.querySelector(".active");
    active?.scrollIntoView({ block: "nearest" });
  }

  function execute(cmd) {
    close();
    if (cmd.type === "nav") {
      document.querySelector(cmd.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cmd.type === "link") {
      window.open(cmd.href, "_blank", "noopener");
    } else if (cmd.type === "action" && cmd.action === "theme") {
      document.querySelector(".theme-toggle")?.click();
    }
  }

  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); isOpen ? close() : open(); return; }
    if (!isOpen) return;
    if (e.key === "Escape")    { close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, filtered.length - 1); render(); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); render(); return; }
    if (e.key === "Enter")     { e.preventDefault(); if (filtered[activeIdx]) execute(filtered[activeIdx]); return; }
  });

  inputEl.addEventListener("input", filter);
  backdrop.addEventListener("click", close);
  document.getElementById("cmd-trigger")?.addEventListener("click", open);
})();

// ===== Snake =====
(() => {
  const THEMES = {
    drift:  { head: [255,107,61],  tail: [167,139,250], food: "#2dd4bf", foodGlow: "#2dd4bf",               headGlow: "rgba(255,107,61,0.55)"  },
    matrix: { head: [0,255,65],    tail: [0,100,25],    food: "#00ff41", foodGlow: "#00ff41",               headGlow: "rgba(0,255,65,0.6)"     },
    neon:   { head: [0,212,255],   tail: [255,0,255],   food: "#ff00ff", foodGlow: "#ff00ff",               headGlow: "rgba(0,212,255,0.6)"    },
    fire:   { head: [255,200,0],   tail: [255,20,0],    food: "#ff8c00", foodGlow: "#ff8c00",               headGlow: "rgba(255,150,0,0.6)"    },
    candy:  { head: [255,105,180], tail: [199,21,133],  food: "#ff69b4", foodGlow: "#ff69b4",               headGlow: "rgba(255,105,180,0.6)"  },
    ghost:  { head: [240,240,240], tail: [80,80,80],    food: "#ffffff", foodGlow: "rgba(255,255,255,0.7)", headGlow: "rgba(220,220,220,0.5)"  },
  };
  const SPEEDS = { slow: 200, normal: 130, fast: 75 };

  let currentTheme = localStorage.getItem("sk-snake-theme") || "drift";
  let currentSpeed = localStorage.getItem("sk-snake-speed") || "normal";
  if (!THEMES[currentTheme]) currentTheme = "drift";
  if (!SPEEDS[currentSpeed]) currentSpeed = "normal";

  // ---- score history ----
  function getHistory() {
    try { return JSON.parse(localStorage.getItem("sk-snake-history") || "[]"); } catch { return []; }
  }
  function saveToHistory(s) {
    const h = getHistory();
    h.unshift(s);
    if (h.length > 8) h.length = 8;
    localStorage.setItem("sk-snake-history", JSON.stringify(h));
  }
  function renderHistory() {
    const el = document.getElementById("score-history");
    if (!el) return;
    const h = getHistory();
    el.innerHTML = h.length
      ? h.map((s, i) => `<div class="history-item"><span class="history-rank">#${i + 1}</span><span class="history-score">${s}</span></div>`).join("")
      : '<span class="history-empty">no games yet</span>';
  }
  function renderBest() {
    const el = document.getElementById("snake-best");
    if (el) el.textContent = hiScore;
  }

  const canvas       = document.getElementById("snake-canvas");
  const scoreEl      = document.getElementById("snake-score");
  const overlay      = document.getElementById("snake-overlay");
  const overlayScore = document.getElementById("snake-overlay-score");
  if (!canvas) return;

  const ctx  = canvas.getContext("2d");
  const CELL = 18;
  let cols, rows, snake, dir, nextDir, food, score, hiScore, running, rafId, lastTick, dotGrid;
  hiScore = parseInt(localStorage.getItem("sk-snake-hi") || "0");

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); }
    else {
      const rad = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + w - rad, y); ctx.arcTo(x + w, y, x + w, y + rad, rad);
      ctx.lineTo(x + w, y + h - rad); ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
      ctx.lineTo(x + rad, y + h); ctx.arcTo(x, y + h, x, y + h - rad, rad);
      ctx.lineTo(x, y + rad); ctx.arcTo(x, y, x + rad, y, rad);
      ctx.closePath();
    }
  }

  function resize() {
    const w = Math.floor((canvas.parentElement.clientWidth - 2) / CELL) * CELL;
    canvas.width = canvas.height = w;
    cols = rows = w / CELL;
    buildDotGrid();
  }

  function buildDotGrid() {
    const off = document.createElement("canvas");
    off.width = canvas.width; off.height = canvas.height;
    const oc = off.getContext("2d");
    oc.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
      oc.beginPath(); oc.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2); oc.fill();
    }
    dotGrid = off;
  }

  function reset() {
    resize();
    const mx = Math.floor(cols / 2), my = Math.floor(rows / 2);
    snake   = [{ x: mx, y: my }, { x: mx - 1, y: my }, { x: mx - 2, y: my }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;
    if (scoreEl) scoreEl.textContent = "0";
    spawnFood();
    draw();
  }

  function spawnFood() {
    let p;
    do { p = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; }
    while (snake.some(s => s.x === p.x && s.y === p.y));
    food = p;
  }

  function draw() {
    const th = THEMES[currentTheme];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // subtle dot grid (pre-rendered offscreen)
    if (dotGrid) ctx.drawImage(dotGrid, 0, 0);

    // food
    ctx.save();
    ctx.shadowColor = th.foodGlow; ctx.shadowBlur = 14;
    ctx.fillStyle = th.food;
    rrect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8, 4);
    ctx.fill();
    ctx.restore();

    // snake
    snake.forEach((seg, i) => {
      const t = i / Math.max(snake.length - 1, 1);
      const r = Math.round(th.head[0] * (1 - t) + th.tail[0] * t);
      const g = Math.round(th.head[1] * (1 - t) + th.tail[1] * t);
      const b = Math.round(th.head[2] * (1 - t) + th.tail[2] * t);
      ctx.save();
      if (i === 0) { ctx.shadowColor = th.headGlow; ctx.shadowBlur = 12; }
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      rrect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, i === 0 ? 6 : 4);
      ctx.fill();
      ctx.restore();
    });
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) {
      endGame(); return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      if (scoreEl) scoreEl.textContent = score;
      spawnFood();
    } else { snake.pop(); }
    draw();
  }

  function loop(ts) {
    if (ts - lastTick >= SPEEDS[currentSpeed]) { tick(); lastTick = ts; }
    if (running) rafId = requestAnimationFrame(loop);
  }

  function startGame() {
    reset(); running = true; lastTick = 0;
    if (overlay) overlay.style.display = "none";
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(rafId);
    hiScore = Math.max(hiScore, score);
    localStorage.setItem("sk-snake-hi", hiScore);
    saveToHistory(score);
    renderHistory();
    renderBest();
    if (overlay) {
      overlay.querySelector(".overlay-title").textContent = "game over";
      if (overlayScore) overlayScore.textContent = `score ${score} · best ${hiScore}`;
      overlay.querySelector(".overlay-hint").textContent = "tap / click to restart";
      overlay.style.display = "flex";
    }
  }

  const DIRS = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
  };

  document.addEventListener("keydown", e => {
    if (document.getElementById("cmd-palette")?.classList.contains("open")) return;
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
    if (!DIRS[e.key]) return;
    if (!running) { startGame(); return; }
    const d = DIRS[e.key];
    if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
    e.preventDefault();
  });

  let t0 = null;
  canvas.addEventListener("touchstart", e => { t0 = e.touches[0]; }, { passive: true });
  canvas.addEventListener("touchend", e => {
    if (!t0) return;
    const dx = e.changedTouches[0].clientX - t0.clientX;
    const dy = e.changedTouches[0].clientY - t0.clientY;
    if (!running) { startGame(); t0 = null; return; }
    if (Math.abs(dx) > Math.abs(dy)) { const d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 }; if (d.x !== -dir.x) nextDir = d; }
    else { const d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 }; if (d.y !== -dir.y) nextDir = d; }
    t0 = null;
  }, { passive: true });

  [canvas, overlay].forEach(el => el?.addEventListener("click", () => { if (!running) startGame(); }));
  window.addEventListener("resize", () => { if (!running) reset(); });

  // Skin picker
  document.querySelectorAll(".skin-option").forEach(btn => {
    if (btn.dataset.theme === currentTheme) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentTheme = btn.dataset.theme;
      localStorage.setItem("sk-snake-theme", currentTheme);
      document.querySelectorAll(".skin-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (!running) draw();
    });
  });

  // Speed picker
  document.querySelectorAll(".speed-btn").forEach(btn => {
    if (btn.dataset.speed === currentSpeed) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentSpeed = btn.dataset.speed;
      localStorage.setItem("sk-snake-speed", currentSpeed);
      document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  renderHistory();
  renderBest();

  // Defer init until the game section scrolls into view — avoids blocking page load
  const _obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { reset(); _obs.disconnect(); }
  }, { threshold: 0.1 });
  _obs.observe(canvas);

  // Cancel the game loop when the tab is hidden or the page is unloading
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) { running = false; cancelAnimationFrame(rafId); }
  });
  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
})();

// ===== FAQ Chatbot =====
(() => {
  const FAQ = [
    {
      q: [
        "who is shreyash",
        "who is yash",
        "tell me about yourself",
        "about shreyash",
        "who are you",
        "introduce yourself",
        "what does shreyash do",
        "what does yash do",
        "about me",
        "overview",
      ],
      a: "Shreyash (Yash) Kawle is a Software Engineer Analyst at Morgan Stanley in NYC. Columbia CS grad, he builds at the intersection of systems, data, and markets — AI/LLM tooling, backend engineering, and quantitative research. Fueled by long walks, good problems, and the occasional Celsius.",
    },
    {
      q: [
        "where does he work",
        "current job",
        "current role",
        "morgan stanley",
        "what is his job",
        "where does shreyash work",
        "employment",
        "current company",
        "what does he build at work",
      ],
      a: "Yash works at Morgan Stanley as a Software Engineer Analyst (since Aug 2025) in Institutional Securities, NYC. He builds AI/LLM-powered CRM tooling for research analysts and sales teams — conversational search, client resolution, ticker lookup, and interaction capture. He also does prompt engineering, Promptfoo evals, and CI/CD work with Jenkins.",
    },
    {
      q: [
        "where did he study",
        "education",
        "university",
        "columbia",
        "degree",
        "school",
        "college",
        "academic background",
        "cityu",
        "stanford",
        "hong kong university",
      ],
      a: "Yash has a B.A. in Computer Science from Columbia University (Class of 2025), where he was Senior Marshal and part of Upsilon Pi Epsilon and GS Honors Society. He also studied at City University of Hong Kong on a joint program with Columbia, and spent a summer at Stanford studying Mathematics & Entrepreneurship.",
    },
    {
      q: [
        "what are his skills",
        "programming languages",
        "tech stack",
        "technologies",
        "tools",
        "what can he do",
        "technical skills",
        "languages he knows",
        "what does he use",
      ],
      a: "Yash is strongest in Java, Python, and Kotlin, with SQL and MATLAB in the mix. Tech-wise: MongoDB, MySQL, Flask, Redis, Angular, Jenkins, REST APIs, Promptfoo, Mongock, MQ, and WebstaX. His focus areas span AI/LLM applications, backend engineering, quantitative research, data pipelines, search & retrieval, NLP, and statistical modeling.",
    },
    {
      q: [
        "what projects has he built",
        "projects",
        "side projects",
        "what has he built",
        "portfolio projects",
        "research projects",
        "market navigator",
        "what did he work on personally",
      ],
      a: "A few highlights: Market Navigator — a real-time equity analysis platform (Flask + Redis) for technical & fundamental stock insights. He also did NLP research on how news headlines affect tech stock prices using FinBERT and VADER. And built MATLAB-based Portfolio Optimization models using Markowitz theory for risk/return analysis.",
    },
    {
      q: [
        "how to contact him",
        "contact",
        "email",
        "reach out",
        "get in touch",
        "linkedin",
        "github",
        "how do i contact shreyash",
        "how can i reach yash",
      ],
      a: "Best way to reach Yash is email: sk5109@columbia.edu. You can also find him on LinkedIn (linkedin.com/in/shreyash-kawle) or GitHub (@SSK2822). Or just use the contact form at the bottom of this page!",
    },
    {
      q: [
        "where does he live",
        "where is he based",
        "location",
        "city",
        "where is shreyash",
        "new york",
        "nyc",
      ],
      a: "Yash is based in New York City — currently working at Morgan Stanley's NYC office.",
    },
    {
      q: [
        "previous internships",
        "past experience",
        "hsbc",
        "coinlion",
        "jockey club",
        "internship",
        "past jobs",
        "work history",
        "previous work",
        "old jobs",
      ],
      a: "Before Morgan Stanley: Crypto Quantitative Analyst intern at CoinLion (Summer 2024) — developing trading strategies across 50+ crypto assets. Data Analyst intern at HSBC Hong Kong (early 2023) — analyzing 10,000+ customer data points. And Fixed-Odds Engineering intern at The Hong Kong Jockey Club (late 2022) — working on Cash-Out Systems Integration.",
    },
    {
      q: [
        "awards",
        "achievements",
        "recognition",
        "honors",
        "accomplishments",
        "what awards did he win",
        "hackathon",
      ],
      a: "Yash has a solid list: GS Spirit Award + Senior Marshal at Columbia (Class of 2025), Multicultural Leader Award, APAC Regional Finalist at Citibank TTS Case Competition 2022, CityU Hack 2022 Finalist. On HackerRank: Top 2% Algorithms, Top 7% Python, Top 3% ProjectEuler+.",
    },
    {
      q: ["scholarships", "financial aid", "funding", "scholarship received"],
      a: "Yash received several scholarships: Anne Marie Gault Scholarship, Dr & Mrs Yeung Kin Man Scholarship, Chan Wing Fui Scholarship, HKSAR Government Scholarship, and CityU International Students Scholarship.",
    },
    {
      q: [
        "leadership",
        "volunteering",
        "community",
        "extracurricular",
        "activities",
        "what else does he do",
        "resident advisor",
        "teaching",
        "aiesec",
        "python instructor",
      ],
      a: "Beyond engineering: Yash is on Morgan Stanley's Culture Committee (co-organizing Diwali, Winter Party, CNY events) and helped run a global internal hackathon. He teaches Python to high school students in the Bronx. He was also a Resident Advisor at Columbia supporting ~600 undergrads, and managed international exchange programs at AIESEC in Hong Kong.",
    },
    {
      q: [
        "hobbies",
        "interests",
        "what does he like",
        "fun facts",
        "personal",
        "outside work",
        "free time",
        "personality",
      ],
      a: "Outside work, Yash is into long walks (great for thinking), hard problems, and runs on Celsius energy drinks. He's passionate about multicultural community-building and making tech more inclusive. He's lived across Hong Kong, California, and NYC — pretty global perspective.",
    },
    {
      q: [
        "quantitative",
        "quant",
        "finance",
        "trading",
        "crypto",
        "markets",
        "stocks",
        "investing",
        "financial engineering",
      ],
      a: "Yash has a strong quant side — crypto trading strategy research at CoinLion, NLP-based stock sentiment analysis, Markowitz portfolio optimization models, and Bloomberg certifications in Market Concepts, ESG, and Finance Fundamentals. He genuinely loves applying statistical thinking to market problems.",
    },
    {
      q: [
        "ai",
        "llm",
        "machine learning",
        "artificial intelligence",
        "nlp",
        "prompt engineering",
        "large language models",
        "gpt",
      ],
      a: "AI/LLM is a core part of Yash's current work at Morgan Stanley — he builds LLM-powered features and does prompt engineering with Promptfoo evaluations. He's also applied NLP in research (FinBERT, VADER for sentiment analysis) and productionized an AI interaction-capture pipeline end-to-end.",
    },
    {
      q: [
        "certifications",
        "bloomberg",
        "certified",
        "courses",
        "bloomberg market concepts",
      ],
      a: "Yash holds three Bloomberg certifications: Bloomberg Market Concepts, Bloomberg Finance Fundamentals, and Environmental Social Governance (ESG) — all earned in May 2025.",
    },
  ];

  if (!window.Fuse) return;

  const fuse = new Fuse(FAQ, {
    keys: ["q"],
    threshold: 0.5,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const FALLBACK =
    "hmm, not sure about that one! try asking about yash's work, skills, education, or projects — or reach him directly at sk5109@columbia.edu 👋";

  const bubble = document.getElementById("chatbot-bubble");
  const panel = document.getElementById("chatbot-panel");
  const closeBtn = document.getElementById("chatbot-close");
  const form = document.getElementById("chatbot-form");
  const inputEl = document.getElementById("chatbot-input");
  const msgsEl = document.getElementById("chatbot-messages");
  const suggestEl = document.getElementById("chatbot-suggestions");

  if (!bubble || !panel) return;

  let isOpen = false;

  function togglePanel() {
    isOpen = !isOpen;
    bubble.classList.toggle("open", isOpen);
    panel.classList.toggle("open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    bubble.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) inputEl?.focus();
  }

  bubble.addEventListener("click", togglePanel);
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePanel();
  });
  document.addEventListener("click", (e) => {
    if (isOpen && !panel.contains(e.target) && !bubble.contains(e.target))
      togglePanel();
  });

  function addMsg(text, who) {
    const row = document.createElement("div");
    row.className = `chat-msg ${who}`;
    const bub = document.createElement("div");
    bub.className = "chat-bubble";
    bub.textContent = text;
    row.appendChild(bub);
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return row;
  }

  function showTyping() {
    const row = document.createElement("div");
    row.className = "chat-msg bot chat-typing";
    row.innerHTML =
      '<div class="chat-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return row;
  }

  function getAnswer(q) {
    const cleaned = q.replace(/[^a-z0-9 ']/gi, " ").replace(/\s+/g, " ").trim();
    const results = fuse.search(cleaned);
    if (results.length && results[0].score < 0.38) return results[0].item.a;
    return FALLBACK;
  }

  async function handleQuery(q) {
    if (suggestEl) suggestEl.style.display = "none";
    addMsg(q, "user");
    if (inputEl) inputEl.value = "";
    const typing = showTyping();
    await new Promise((r) => setTimeout(r, 380 + Math.random() * 280));
    typing.remove();
    addMsg(getAnswer(q), "bot");
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = inputEl?.value.trim();
    if (q) handleQuery(q);
  });

  suggestEl?.querySelectorAll(".chat-chip").forEach((chip) => {
    chip.addEventListener("click", () => handleQuery(chip.textContent));
  });
})();
