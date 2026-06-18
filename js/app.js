/* ============================================================
   CHRONOSCOPY — motion layer
   GSAP + ScrollTrigger + Lenis. Respects reduced-motion.
   ============================================================ */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll, tied to GSAP ticker ---------- */
  let lenis;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: 0 }); }
      });
    });
  }

  /* ---------- split CHRONOSCOPY into chars ---------- */
  const word = document.querySelector('.hero__title .word');
  if (word) {
    const txt = word.textContent.trim();
    word.textContent = '';
    word.setAttribute('aria-hidden', 'true');
    [...txt].forEach((c) => {
      const s = document.createElement('span');
      s.className = 'char'; s.textContent = c;
      word.appendChild(s);
    });
  }

  /* ---------- loader, then orchestrate hero entrance ---------- */
  const loader = document.getElementById('loader');
  const fill = document.querySelector('[data-ld-fill]');
  const pct = document.querySelector('[data-ld-pct]');
  let p = 0;

  function startHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__img', { scale: 1.35, duration: 1.8, ease: 'power2.out' }, 0)
      .from('.hero__meta', { y: 20, opacity: 0, duration: 0.8 }, 0.2)
      .from('.hero__title .char', {
        yPercent: 120, opacity: 0, rotateX: -40, stagger: 0.045, duration: 1.1,
        ease: 'power4.out'
      }, 0.3)
      .from('.hero__tag .clip span', { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.7)
      .from('.hero__actions', { y: 20, opacity: 0, duration: 0.8 }, 1.0)
      .from('.hero__orb', { opacity: 0, duration: 1.4, ease: 'power2.out' }, 0.5)
      .from('.hero__orb img', { scale: 0.4, duration: 1.4, ease: 'power2.out' }, 0.5)
      .from('.hero__scroll', { opacity: 0, duration: 0.8 }, 1.2);
  }

  function revealSite() {
    if (loader) {
      gsap.to(loader, {
        opacity: 0, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => { loader.style.display = 'none'; }
      });
    }
    startHero();
  }

  if (reduce) {
    if (loader) loader.style.display = 'none';
    gsap.set('.reveal-up', { opacity: 1, y: 0 });
  } else {
    const tick = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) { p = 100; clearInterval(tick); setTimeout(revealSite, 320); }
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = String(Math.floor(p)).padStart(2, '0');
    }, 130);
  }

  /* ---------- generic reveal-up on scroll ---------- */
  if (!reduce) {
    gsap.utils.toArray('.reveal-up').forEach((el) => {
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    /* image clip reveal */
    gsap.utils.toArray('[data-reveal-img]').forEach((el) => {
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });

    /* logline word-by-word colour scrub */
    const big = document.querySelector('.logline__big');
    if (big) {
      const nodes = [];
      big.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (tok.trim()) { const s = document.createElement('span'); s.className = 'w'; s.style.color = 'var(--ink-faint)'; s.textContent = tok; frag.appendChild(s); nodes.push(s); }
            else frag.appendChild(document.createTextNode(tok));
          });
          big.replaceChild(frag, n);
        } else if (n.nodeType === 1) { nodes.push(n); }
      });
      gsap.to(nodes, {
        color: 'var(--ink)', stagger: 1, ease: 'none',
        scrollTrigger: { trigger: big, start: 'top 70%', end: 'bottom 65%', scrub: 0.6 }
      });
    }

    /* paradox line: flicker-in like a faulty signal */
    const para = document.querySelector('[data-glitch]');
    if (para) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: para, start: 'top 78%' } });
      tl.from(para, { opacity: 0, duration: 0.1 })
        .to(para, { opacity: 0.3, duration: 0.06 }).to(para, { opacity: 1, duration: 0.06 })
        .to(para, { opacity: 0.5, duration: 0.05 }).to(para, { opacity: 1, duration: 0.4 })
        .from(para.querySelector('strong'), { color: 'var(--ink-dim)', duration: 0.6 }, '-=0.2');
    }

    /* parallax layers — centered & clamped so they never expose an edge */
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const depth = parseFloat(el.dataset.parallax) || 0.1;
      const amt = Math.min(depth, 0.18) * 55; // half-travel, max ~5% each way
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* gallery items rise + fade */
    gsap.utils.toArray('.gallery .g').forEach((g, i) => {
      gsap.from(g, {
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: g, start: 'top 90%' }, delay: (i % 4) * 0.06
      });
    });

    /* number counters */
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suf = el.dataset.suffix || '';
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(obj, {
          v: end, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suf; }
        })
      });
    });

    /* hero subtle pin / fade as you leave */
    gsap.to('.hero__content', {
      yPercent: -18, opacity: 0.4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- running timecode in HUD ---------- */
  const clock = document.getElementById('clock');
  if (clock) {
    let f = 0;
    setInterval(() => {
      f++;
      const total = f;
      const ff = String(total % 24).padStart(2, '0');
      const ss = String(Math.floor(total / 24) % 60).padStart(2, '0');
      const mm = String(Math.floor(total / 1440) % 60).padStart(2, '0');
      const hh = String(Math.floor(total / 86400) % 100).padStart(2, '0');
      clock.textContent = `T—${hh}:${mm}:${ss}:${ff}`;
    }, 1000 / 24);
  }

  /* ---------- custom cursor ---------- */
  const cur = document.getElementById('cursor');
  if (cur && window.matchMedia('(hover:hover)').matches && !reduce) {
    const xT = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    const yT = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { xT(e.clientX); yT(e.clientY); cur.style.opacity = 1; });
    document.querySelectorAll('[data-cursor], a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-active'));
    });
  }

  /* ---------- magnetic contact button ---------- */
  const mag = document.getElementById('magnetic');
  if (mag && window.matchMedia('(hover:hover)').matches && !reduce) {
    const xT = gsap.quickTo(mag, 'x', { duration: 0.5, ease: 'power3' });
    const yT = gsap.quickTo(mag, 'y', { duration: 0.5, ease: 'power3' });
    mag.addEventListener('mousemove', (e) => {
      const r = mag.getBoundingClientRect();
      xT((e.clientX - (r.left + r.width / 2)) * 0.4);
      yT((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    mag.addEventListener('mouseleave', () => { xT(0); yT(0); });
  }

  /* ---------- trailer lightbox ---------- */
  const lb = document.getElementById('lb');
  const lbEmbed = document.getElementById('lbEmbed');
  const lbClose = document.getElementById('lbClose');
  const YT = 'https://www.youtube.com/embed/JggJjsnJ3w4?autoplay=1&rel=0';
  function openLB() {
    lbEmbed.innerHTML = `<iframe src="${YT}" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>`;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  }
  function closeLB() {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    lbEmbed.innerHTML = ''; if (lenis) lenis.start();
  }
  document.querySelectorAll('[data-trailer]').forEach((b) => b.addEventListener('click', openLB));
  if (lbClose) lbClose.addEventListener('click', closeLB);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });

  ScrollTrigger.refresh();
})();
