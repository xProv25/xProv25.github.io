(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- scroll progress ---------- */
  const progress = document.getElementById("scrollProgress");
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = scrolled + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- navbar state ---------- */
  const nav = document.getElementById("nav");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("burger");
  const links = document.querySelector(".links");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- active nav link ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = Array.from(links.querySelectorAll("a"));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- skill bars ---------- */
  const skillBars = document.querySelectorAll(".skill-fill");
  const barObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width + "%";
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  skillBars.forEach((b) => barObserver.observe(b));

  /* ---------- counters ---------- */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion || isNaN(target)) return el.firstChild.nodeValue = target;
    const dur = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => countObserver.observe(c));

  /* ---------- typed effect ---------- */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const words = [
      "Independent Developer.",
      "Minecraft Plugin & Mod Maker.",
      "Web & Game Dev.",
      "Bug Hunter.",
      "Coffee Powered.",
    ];
    let wi = 0, ci = 0, deleting = false;
    const speed = 70, pause = 1600;

    const type = () => {
      const word = words[wi];
      typedEl.textContent = word.slice(0, ci);
      if (!deleting) {
        if (ci < word.length) { ci++; setTimeout(type, speed); }
        else { deleting = true; setTimeout(type, pause); }
      } else {
        if (ci > 0) { ci--; setTimeout(type, speed / 2); }
        else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 250); }
      }
    };
    reduceMotion ? (typedEl.textContent = words[0]) : setTimeout(type, 400);
  }

  /* ---------- cursor glow ---------- */
  const glow = document.getElementById("cursorGlow");
  let gx = innerWidth / 2, gy = innerHeight / 3, cx = gx, cy = gy;
  const moveGlow = (e) => { gx = e.clientX; gy = e.clientY; };
  const lerpGlow = () => {
    cx += (gx - cx) * 0.1;
    cy += (gy - cy) * 0.1;
    glow.style.transform = `translate(${cx - 210}px, ${cy - 210}px)`;
    requestAnimationFrame(lerpGlow);
  };
  if (!reduceMotion) {
    window.addEventListener("mousemove", moveGlow, { passive: true });
    requestAnimationFrame(lerpGlow);
  } else {
    glow.style.display = "none";
  }

  /* ---------- particles network ---------- */
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let pts = [], W, H, raf;

  const palette = ["rgba(56,189,248,", "rgba(129,140,248,", "rgba(232,121,249,"];

  const resize = () => {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    const count = Math.min(90, Math.floor((W * H) / 16000));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.6,
      c: palette[Math.floor(Math.random() * palette.length)],
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + "0.55)";
      ctx.fill();
    }
    const linkDist = 130;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = "rgba(100,140,255," + (1 - d / linkDist) * 0.12 + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };

  if (reduceMotion) {
    canvas.style.display = "none";
  } else {
    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
  }

  /* cleanup on unload */
  window.addEventListener("beforeunload", () => cancelAnimationFrame(raf));
})();