(() => {
  "use strict";

  const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* year */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* scroll progress */
  const bar = document.getElementById("scrollProgress");
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.width = ((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100).toFixed(2) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const burger = document.getElementById("burger");
  const links = document.getElementById("links");
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

  /* active nav link */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = Array.from(links.querySelectorAll("a"));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* reveal */
  const reveals = document.querySelectorAll(".reveal");
  if (rm) {
    reveals.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* skill bars */
  const fills = document.querySelectorAll(".skill-fill");
  const bars = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.width + "%"; obs.unobserve(e.target); }
      });
    },
    { threshold: 0.4 }
  );
  fills.forEach((f) => bars.observe(f));

  /* counters */
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (rm || isNaN(target)) { el.firstChild.nodeValue = target; return; }
    const start = performance.now();
    const dur = 1100;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.firstChild.nodeValue = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll("[data-count]");
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => countObs.observe(c));

  /* typing */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const words = [
      "Plugin & mod per Minecraft.",
      "Piccoli giochi, browser e codice.",
      "Strumenti che servono davvero.",
      "Sviluppatore indipendente.",
    ];
    let wi = 0, ci = 0, del = false;
    const draw = () => {
      const word = words[wi];
      typedEl.textContent = word.slice(0, ci);
      if (!del) {
        if (ci < word.length) { ci++; setTimeout(draw, 65); }
        else { del = true; setTimeout(draw, 1500); }
      } else {
        if (ci > 0) { ci--; setTimeout(draw, 32); }
        else { del = false; wi = (wi + 1) % words.length; setTimeout(draw, 300); }
      }
    };
    rm ? (typedEl.textContent = words[0]) : setTimeout(draw, 350);
  }

  /* custom cursor */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!rm && matchMedia("(pointer: fine)").matches) {
    let mx = innerWidth / 2, my = innerHeight / 3, rx = mx, ry = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; });
    const lerp = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(lerp);
    };
    requestAnimationFrame(lerp);
    document.querySelectorAll("a, .btn, .tilt").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  } else {
    dot.style.display = "none";
    ring.style.display = "none";
  }

  /* parallax blobs */
  const blobs = Array.from(document.querySelectorAll(".blob"));
  if (!rm && blobs.length) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("mousemove", (e) => {
      tx = (e.clientX / innerWidth - 0.5);
      ty = (e.clientY / innerHeight - 0.5);
    });
    const drift = () => {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      const a = blobs[0], b = blobs[1], c = blobs[2];
      a.style.transform = `translate(${cx * -46}px, ${cy * -46}px)`;
      b.style.transform = `translate(${cx * 34}px, ${cy * 34}px)`;
      c.style.transform = `translate(${cx * -22}px, ${cy * -22}px)`;
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  }

  /* 3D tilt cards */
  const cards = document.querySelectorAll(".tilt");
  if (!rm && matchMedia("(pointer: fine)").matches) {
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 9;
        const ry = (px - 0.5) * 9;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  } else {
    cards.forEach((c) => c.classList.add("no-tilt"));
  }
})();