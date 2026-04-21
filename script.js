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
      { el: document.querySelector(".orb-1"), x0: -14, y0: -14, rx: 18, ry: 22, sx: 0.00023, sy: 0.00031 },
      { el: document.querySelector(".orb-2"), x0: 72, y0: 68, rx: 20, ry: 16, sx: 0.00019, sy: 0.00027 },
      { el: document.querySelector(".orb-3"), x0: 55, y0: 30, rx: 24, ry: 20, sx: 0.00015, sy: 0.00021 },
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
        c.el.style.top  = `${cy}px`;
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
      `Hi Yash,\n\nYou have a new message from your portfolio.\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`
    );
    const mailto = `mailto:sk5109@columbia.edu?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    showFormStatus("your email app should open now — thanks for reaching out!", "success");
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
