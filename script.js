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

  // ===== Parallax orbs (subtle, only if motion allowed) =====
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!reduceMotion) {
    const orb1 = document.querySelector(".orb-1");
    const orb2 = document.querySelector(".orb-2");
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (orb1) orb1.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
          if (orb2) orb2.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  // ===== Form validation =====
  const form = document.querySelector(".contact-form");
  form?.addEventListener("submit", (e) => {
    const name = form.querySelector("#name")?.value.trim();
    const email = form.querySelector("#email")?.value.trim();
    const message = form.querySelector("#message")?.value.trim();
    if (!name || !email || !message) {
      e.preventDefault();
      alert("please fill in all the fields ✌️");
    }
  });

  // ===== Dynamic year =====
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
