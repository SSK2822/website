(() => {
  "use strict";

  const root = document.documentElement;
  const STORAGE_KEY = "sk-theme";

  // ===== Safe storage helpers — iOS Safari private mode throws on localStorage access,
  // which would otherwise kill this entire IIFE and freeze the reveal observer. =====
  const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

  // ===== Theme: persist across sessions, respect OS preference on first load =====
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const stored = safeGet(STORAGE_KEY);
  const initial = stored || (prefersDark.matches ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  const themeBtn = document.querySelector(".theme-toggle");
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    safeSet(STORAGE_KEY, next);
  });

  prefersDark.addEventListener("change", (e) => {
    if (!safeGet(STORAGE_KEY)) {
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
  const showAll = () => revealEls.forEach((el) => el.classList.add("in-view"));

  if ("IntersectionObserver" in window) {
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
  } else {
    // Old browser without IntersectionObserver — just show everything.
    showAll();
  }

  // Final safety net: if anything below this point in the IIFE throws, or the
  // observer somehow never fires, force-show all sections after 2s so the page
  // is never stuck blank.
  setTimeout(showAll, 2000);

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

  // Orbs are now static via CSS — no JS animation loop.

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
