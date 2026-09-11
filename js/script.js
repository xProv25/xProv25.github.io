(() => {
  "use strict";

  const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* year */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* to-top + scroll progress */
  const toTop = document.getElementById("toTop");
  const bar = document.getElementById("scrollProgress");
  const upd = () => {
    const h = document.documentElement;
    bar.style.width = ((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100).toFixed(2) + "%";
    toTop.classList.toggle("show", h.scrollTop > 600);
  };
  addEventListener("scroll", upd, { passive: true });
  upd();

  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: rm ? "auto" : "smooth" }));

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

  /* active link */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = Array.from(links.querySelectorAll("a"));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
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
  const fobs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.width + "%"; obs.unobserve(e.target); }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".skill-fill").forEach((f) => fobs.observe(f));

  /* counters */
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const next = (el.textContent = String(target));
    if (rm || isNaN(target)) return;
    const start = performance.now();
    const dur = 1100;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    void next; requestAnimationFrame(step);
  };
  const cobs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((c) => cobs.observe(c));

  /* typing */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const words = [
      "Plugin e mod per Minecraft.",
      "Piccoli giochi e siti nel browser.",
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
    rm ? (typedEl.textContent = words[0]) : setTimeout(draw, 300);
  }

  /* terminal typing */
  const termBody = document.getElementById("termBody");
  if (termBody && !rm) {
    const lines = [
      { type: "cmd", v: "status" },
      { type: "out", v: "building plugins · coffee: 6/10" },
      { type: "cmd", v: "stack --used" },
      { type: "out", v: "java · paper · spigot · fabric · js" },
      { type: "cmd", v: "uptime" },
      { type: "out", v: "on github since 2025 ✦" },
      { type: "cmd", v: "ping --dev" },
      { type: "out", v: "available for feedback & ideas" },
    ];
    let li = 0, ci = 0, running = true;
    const caretEl = document.createElement("span");
    caretEl.className = "term-caret";
    termBody.appendChild(caretEl);

    const renderLine = () => {
      if (lines[li].type === "out") {
        const p = document.createElement("p");
        p.className = "t-out";
        p.textContent = lines[li].v;
        termBody.insertBefore(p, caretEl);
        li++;
        if (li >= lines.length) { li = 0; setTimeout(clearAll, 3800); }
        else setTimeout(renderLine, 420);
      } else {
        const p = document.createElement("p");
        p.innerHTML = '<span class="t-prompt">➜</span> ';
        const cmd = document.createElement("span");
        cmd.className = "t-cmd";
        p.appendChild(cmd);
        termBody.insertBefore(p, caretEl);
        const typeC = () => {
          if (ci < lines[li].v.length) {
            cmd.textContent = lines[li].v.slice(0, ++ci);
            setTimeout(typeC, 26);
          } else {
            ci = 0; li++;
            if (li >= lines.length) { li = 0; setTimeout(clearAll, 3800); }
            else setTimeout(renderLine, 500);
          }
        };
        typeC();
      }
    };

    const clearAll = () => {
      const existing = termBody.querySelectorAll("p");
      existing.forEach((p) => p.remove());
      li = 0; ci = 0;
      if (running) setTimeout(renderLine, 700);
    };

    setTimeout(renderLine, 900);
    document.addEventListener("visibilitychange", () => {
      running = document.visibilityState === "visible";
    });
  }

  /* custom cursor */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!rm && fine) {
    let mx = innerWidth / 2, my = innerHeight / 3, rx = mx, ry = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
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

  /* blob parallax */
  const blobs = Array.from(document.querySelectorAll(".blob"));
  if (!rm && blobs.length === 3) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener("mousemove", (e) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
    });
    const drift = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      blobs[0].style.transform = `translate(${cx * -46}px, ${cy * -46}px)`;
      blobs[1].style.transform = `translate(${cx * 34}px, ${cy * 34}px)`;
      blobs[2].style.transform = `translate(${cx * -22}px, ${cy * -22}px)`;
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  }

  /* 3D tilt */
  if (!rm && fine) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-4px)`;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }
})();