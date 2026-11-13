/* Creacy — runtime: routing, motion (GSAP + ScrollTrigger + Lenis with fallbacks), gallery, lightbox, cursor, forms */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const { ICON, LOGO, esc, pad } = window.UI;
  const root = document.documentElement;
  const main = $("[data-view]");

  const S = {
    gsap: !!(window.gsap && window.ScrollTrigger),
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    fine: matchMedia("(hover: hover) and (pointer: fine)").matches,
    lenis: null,
    cleanups: [],
    lb: {},
    first: true,
    prefService: null,
    suppressClick: 0
  };
  const gsap = window.gsap;
  if (S.gsap) gsap.registerPlugin(window.ScrollTrigger);
  root.classList.toggle("no-gsap", !S.gsap || S.reduced);
  root.classList.toggle("reduced", S.reduced);
  const motion = S.gsap && !S.reduced;
  const onCleanup = (fn) => S.cleanups.push(fn);
  const listen = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); onCleanup(() => el.removeEventListener(ev, fn, opt)); };

  // static icons
  $$("[data-logo]").forEach((a) => (a.innerHTML = `${LOGO}<span>Creacy</span>`));
  $$("[data-arrow]").forEach((s) => (s.innerHTML = ICON.arrow));
  $("[data-burger]").innerHTML = ICON.menu;
  $("[data-menu-close]").innerHTML = ICON.close;
  $("[data-lb-closebtn]").innerHTML = ICON.close;
  $("[data-lb-prev]").innerHTML = ICON.left;
  $("[data-lb-next]").innerHTML = ICON.right;

  /* =========================================================== SMOOTH SCROLL */
  const scrollY = () => (S.lenis ? S.lenis.scroll : window.scrollY);
  const scrollTo = (y, immediate) => {
    if (S.lenis) S.lenis.scrollTo(y, { immediate: !!immediate, duration: 1.2 });
    else window.scrollTo({ top: typeof y === "number" ? y : 0, behavior: immediate || S.reduced ? "auto" : "smooth" });
  };
  const scrollListeners = new Set();
  const emitScroll = () => scrollListeners.forEach((fn) => fn(scrollY()));

  if (window.Lenis && !S.reduced) {
    try {
      S.lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
      root.classList.add("has-lenis");
      S.lenis.on("scroll", () => { if (S.gsap) window.ScrollTrigger.update(); emitScroll(); });
      if (S.gsap) {
        gsap.ticker.add((t) => S.lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (t) => { S.lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    } catch (e) { S.lenis = null; }
  }
  if (!S.lenis) window.addEventListener("scroll", emitScroll, { passive: true });

  /* =========================================================== HEADER */
  const header = $("[data-header]");
  let lastY = 0;
  scrollListeners.add((y) => {
    header.classList.toggle("is-scrolled", y > 40);
    const menuOpen = $("[data-menu]").classList.contains("is-open");
    if (!menuOpen && y > 400 && y > lastY + 1) header.classList.add("is-hidden");
    else if (y < lastY - 1 || y < 400) header.classList.remove("is-hidden");
    lastY = y;
  });

  /* mobile menu */
  const menu = $("[data-menu]"), burger = $("[data-burger]");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (open) { S.lenis && S.lenis.stop(); setTimeout(() => $("[data-menu-close]").focus(), 50); }
    else { S.lenis && S.lenis.start(); }
  };
  burger.addEventListener("click", () => setMenu(true));
  $("[data-menu-close]").addEventListener("click", () => { setMenu(false); burger.focus(); });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); burger.focus(); } });

  $("[data-skip]").addEventListener("click", (e) => { e.preventDefault(); main.focus(); });

  /* =========================================================== CURSOR */
  const cursor = $("[data-cursor-el]"), cLabel = $("[data-cursor-label]");
  const LABELS = { view: "VIEW", explore: "EXPLORE", drag: "DRAG", close: "CLOSE", prev: "PREV", next: "NEXT" };
  if (S.fine) {
    root.classList.add("has-cursor");
    const ring = $(".cursor__ring", cursor), dot = $(".cursor__dot", cursor);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    let setRing, setDot;
    if (S.gsap) {
      const rX = gsap.quickTo(ring, "x", { duration: S.reduced ? 0 : 0.45, ease: "power3" });
      const rY = gsap.quickTo(ring, "y", { duration: S.reduced ? 0 : 0.45, ease: "power3" });
      setRing = (x, y) => { rX(x); rY(y); };
      setDot = (x, y) => gsap.set(dot, { x, y });
    } else {
      setDot = (x, y) => (dot.style.transform = `translate3d(${x}px,${y}px,0)`);
      setRing = (x, y) => { mx = x; my = y; };
      const loop = () => { rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    window.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; setDot(e.clientX, e.clientY); setRing(e.clientX, e.clientY); cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      const key = t && t.dataset.cursor;
      const lab = key && LABELS[key];
      cursor.classList.toggle("is-label", !!lab);
      if (lab) cLabel.textContent = lab;
      cursor.classList.toggle("is-link", !lab && !!e.target.closest("a, button, label, select, [role='button']"));
    });
  }

  /* =========================================================== SCROLLBAR */
  const sbar = $("[data-sbar]"), thumb = $("[data-sbar-thumb]");
  if (S.fine) {
    root.classList.add("custom-scroll");
    const update = () => {
      const docH = document.documentElement.scrollHeight, vh = innerHeight, trackH = sbar.clientHeight;
      if (docH <= vh + 2) { sbar.style.opacity = 0; return; }
      sbar.style.opacity = 1;
      const th = Math.max(40, (vh / docH) * trackH);
      const p = Math.min(1, Math.max(0, scrollY() / (docH - vh)));
      thumb.style.height = th + "px";
      thumb.style.transform = `translateY(${p * (trackH - th)}px)`;
    };
    scrollListeners.add(update);
    window.addEventListener("resize", update);
    S.updateScrollbar = update;
    let drag = null;
    thumb.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      thumb.setPointerCapture(e.pointerId);
      drag = { y: e.clientY, s: scrollY() };
      thumb.classList.add("is-drag");
    });
    thumb.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const docH = document.documentElement.scrollHeight, vh = innerHeight, trackH = sbar.clientHeight;
      const th = thumb.offsetHeight;
      const y = drag.s + ((e.clientY - drag.y) / (trackH - th)) * (docH - vh);
      if (S.lenis) S.lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
    });
    const end = () => { drag = null; thumb.classList.remove("is-drag"); };
    thumb.addEventListener("pointerup", end);
    thumb.addEventListener("pointercancel", end);
    $(".sbar__track", sbar).addEventListener("click", (e) => {
      const r = sbar.getBoundingClientRect();
      const p = (e.clientY - r.top) / r.height;
      scrollTo(p * (document.documentElement.scrollHeight - innerHeight));
    });
  }

  /* =========================================================== MAGNETIC */
  const magnet = (el) => {
    if (!S.fine || S.reduced || el.dataset.magBound) return;
    el.dataset.magBound = 1;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.35;
      if (S.gsap) gsap.to(el, { x, y, duration: 0.5, ease: "power3.out" }); else el.style.transform = `translate(${x}px,${y}px)`;
    };
    const leave = () => { if (S.gsap) gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" }); else el.style.transform = ""; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
  };
  $$("[data-magnetic]").forEach(magnet);

  /* =========================================================== TEXT SPLIT */
  const splitWords = (el) => {
    if (el.dataset.split) return;
    el.dataset.split = 1;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(" "));
            else { const o = document.createElement("span"); o.className = "wm"; const i = document.createElement("span"); i.className = "wi"; i.textContent = p; o.appendChild(i); frag.appendChild(o); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("btn") && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
  };
  const lineIndex = (words) => {
    let line = -1, top = null;
    return words.map((w) => { const t = Math.round(w.getBoundingClientRect().top); if (top === null || Math.abs(t - top) > 4) { line++; top = t; } return line; });
  };

  /* =========================================================== REVEALS */
  let io = null;
  const initReveals = (scope) => {
    $$("[data-reveal='lines']", scope).forEach(splitWords);
    if (S.reduced) return;
    if (motion) {
      const ST = window.ScrollTrigger;
      $$("[data-reveal]", scope).forEach((el) => {
        if (el.hasAttribute("data-manual")) return;
        const type = el.dataset.reveal, delay = parseFloat(el.dataset.delay || 0);
        const st = { trigger: el, start: "top 90%", once: true };
        if (type === "lines") {
          const words = $$(".wi", el), lines = lineIndex(words);
          gsap.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.15, ease: "power4.out", delay, stagger: (i) => lines[i] * 0.09 + (i % 8) * 0.004, scrollTrigger: st });
        } else if (type === "up") {
          gsap.fromTo(el, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, delay, ease: "power3.out", scrollTrigger: st, clearProps: "transform" });
        } else if (type === "image") {
          const im = $("img", el);
          gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, delay, ease: "expo.out", scrollTrigger: { ...st, start: "top 94%" }, clearProps: "clipPath" });
          if (im && !el.closest("[data-parallax]") && !$("[data-parallax]", el)) gsap.fromTo(im, { scale: 1.22 }, { scale: 1, duration: 1.9, delay, ease: "expo.out", scrollTrigger: { ...st, start: "top 94%" }, clearProps: "transform" });
        }
      });
      $$("[data-parallax]", scope).forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || 10);
        gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      ST.refresh();
    } else {
      if (io) io.disconnect();
      io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
      $$("[data-reveal]", scope).forEach((el) => {
        if (el.dataset.reveal === "lines") { const words = $$(".wi", el), lines = lineIndex(words); words.forEach((w, i) => w.style.setProperty("--i", lines[i])); }
        if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + "s";
        if (el.hasAttribute("data-manual")) return;
        io.observe(el);
      });
    }
  };

  /* =========================================================== LIGHTBOX */
  const LB = (() => {
    const el = $("[data-lb-root]"), imgEl = $("[data-lb-img]"), stage = $("[data-lb-stage]");
    const count = $("[data-lb-count]"), title = $("[data-lb-title]"), sub = $("[data-lb-sub]"), thumbs = $("[data-lb-thumbs]");
    let list = [], i = 0, open = false, returnFocus = null, zoom = false;
    const src = (n) => `img/${n}.jpg`;
    const preload = (n) => { if (n) { const p = new Image(); p.src = src(n); } };
    const setZoom = (on, e) => {
      zoom = on;
      imgEl.classList.toggle("is-zoomed", on);
      if (on && e) { const r = imgEl.getBoundingClientRect(); imgEl.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; }
      imgEl.style.transform = on ? "scale(2)" : "";
    };
    const show = (k, dir = 0) => {
      i = (k + list.length) % list.length;
      const it = list[i];
      setZoom(false);
      const m = window.IMG[it.img];
      imgEl.style.background = m ? m[2] : "";
      imgEl.src = src(it.img);
      imgEl.alt = it.title;
      if (m) { imgEl.width = m[0]; imgEl.height = m[1]; }
      title.textContent = it.title;
      sub.textContent = it.sub || "";
      count.textContent = `${pad(i + 1)} / ${pad(list.length)}`;
      $$("button", thumbs).forEach((b, k2) => { b.classList.toggle("is-active", k2 === i); b.setAttribute("aria-current", k2 === i ? "true" : "false"); });
      const at = $$("button", thumbs)[i];
      if (at) at.scrollIntoView({ block: "nearest", inline: "center" });
      if (!S.reduced && imgEl.animate) imgEl.animate([{ opacity: 0, transform: `translateX(${dir * 40}px) scale(.98)` }, { opacity: 1, transform: "none" }], { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" });
      preload(list[(i + 1) % list.length]?.img);
      preload(list[(i - 1 + list.length) % list.length]?.img);
    };
    const openLB = (items, k, from) => {
      if (!items || !items.length) return;
      list = items; returnFocus = from || document.activeElement;
      thumbs.innerHTML = list.map((it, k2) => `<button aria-label="Show image ${k2 + 1}: ${esc(it.title)}"><img src="img/${it.img}-sm.jpg" alt="" loading="lazy"></button>`).join("");
      $$("button", thumbs).forEach((b, k2) => b.addEventListener("click", () => show(k2, k2 > i ? 1 : -1)));
      el.classList.add("is-open");
      el.setAttribute("aria-hidden", "false");
      open = true;
      S.lenis && S.lenis.stop();
      document.body.style.overflow = "hidden";
      show(k);
      if (from && !S.reduced && imgEl.animate) {
        const r = from.getBoundingClientRect();
        requestAnimationFrame(() => {
          const t = imgEl.getBoundingClientRect();
          if (!t.width) return;
          const sx = r.width / t.width, dx = r.left + r.width / 2 - (t.left + t.width / 2), dy = r.top + r.height / 2 - (t.top + t.height / 2);
          imgEl.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sx})`, opacity: 0.6 }, { transform: "none", opacity: 1 }], { duration: 750, easing: "cubic-bezier(.22,1,.36,1)" });
        });
      }
      setTimeout(() => $("[data-lb-closebtn]").focus(), 30);
    };
    const close = () => {
      if (!open) return;
      open = false;
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
      S.lenis && S.lenis.start();
      document.body.style.overflow = "";
      setZoom(false);
      if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
    };
    $$("[data-lb-close]", el).forEach((b) => b.addEventListener("click", close));
    $("[data-lb-prev]").addEventListener("click", () => show(i - 1, -1));
    $("[data-lb-next]").addEventListener("click", () => show(i + 1, 1));
    document.addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(i + 1, 1);
      else if (e.key === "ArrowLeft") show(i - 1, -1);
      else if (e.key === "Tab") {
        const f = $$("button", el).filter((b) => b.offsetParent !== null);
        const a = f.indexOf(document.activeElement);
        if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    // zoom + swipe
    let sx = null, sy = 0, moved = false;
    stage.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; sx = e.clientX; sy = e.clientY; moved = false; });
    stage.addEventListener("pointermove", (e) => {
      if (zoom) { const r = imgEl.getBoundingClientRect(); const ox = ((e.clientX - r.left) / r.width) * 100, oy = ((e.clientY - r.top) / r.height) * 100; imgEl.style.transformOrigin = `${Math.min(100, Math.max(0, ox))}% ${Math.min(100, Math.max(0, oy))}%`; }
      if (sx !== null && Math.abs(e.clientX - sx) > 8) moved = true;
    });
    stage.addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (!zoom && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { show(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); return; }
      if (!moved && e.target === imgEl) setZoom(!zoom, e);
      else if (!moved && e.target === stage) close();
    });
    return { open: openLB, close, isOpen: () => open };
  })();

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-lb]");
    if (t) {
      if (Date.now() - S.suppressClick < 250) { e.preventDefault(); return; }
      e.preventDefault();
      LB.open(S.lb[t.dataset.lb], parseInt(t.dataset.lbIndex, 10) || 0, t);
      return;
    }
    const o = e.target.closest("[data-lb-open]");
    if (o) { LB.open(S.lb[o.dataset.lbOpen], 0, o); return; }
    const svc = e.target.closest("[data-service]");
    if (svc) S.prefService = svc.dataset.service;
  });

  /* =========================================================== HERO */
  const initHero = (scope, intro) => {
    const hero = $("[data-hero]", scope);
    if (!hero) return;
    const slides = $$("[data-hero-slide]", hero), cards = $$("[data-hero-go]", hero);
    const bar = $("[data-hero-bar]", hero), cur = $("[data-hero-cur]", hero);
    let i = 0, timer = null;
    const go = (k) => {
      i = (k + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-active", n === i));
      cards.forEach((c, n) => { c.classList.toggle("is-active", n === i); c.setAttribute("aria-pressed", String(n === i)); });
      bar.style.transform = `scaleX(${(i + 1) / slides.length})`;
      cur.textContent = pad(i + 1);
      if (motion) gsap.fromTo($("img", slides[i]), { scale: 1.08 }, { scale: 1, duration: 2.4, ease: "power2.out" });
    };
    const play = () => { if (S.reduced) return; stop(); timer = setInterval(() => go(i + 1), 7000); };
    const stop = () => clearInterval(timer);
    cards.forEach((c) => c.addEventListener("click", () => { go(+c.dataset.heroGo); play(); }));
    listen(hero, "pointerenter", stop);
    listen(hero, "pointerleave", play);
    listen(hero, "focusin", stop);
    go(0); play();
    onCleanup(stop);

    const title = $(".hero__title", hero);
    if (motion) {
      const words = $$(".wi", title), lines = lineIndex(words);
      const tl = gsap.timeline({ delay: intro ? 0.15 : 0.05 });
      if (intro) tl.fromTo(hero, { clipPath: "inset(6% 6% 6% 6% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.6, ease: "expo.inOut", clearProps: "clipPath" }, 0);
      tl.fromTo("[data-hero-media]", { scale: 1.08, autoAlpha: 0.2 }, { scale: 1, autoAlpha: 1, duration: 2.4, ease: "power3.out" }, 0)
        .fromTo(header, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", clearProps: "transform,opacity,visibility" }, intro ? 0.9 : 0.2)
        .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: (k) => lines[k] * 0.12 }, intro ? 0.85 : 0.25)
        .fromTo($$(".pill", hero), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: "power3.out" }, "-=0.7")
        .fromTo(".hero__progress", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "<")
        .fromTo(cards, { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1, ease: "power3.out", clearProps: "transform" }, "<");
      gsap.to("[data-hero-media]", { yPercent: 10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    } else {
      title.classList.add("is-in");
    }
  };

  /* =========================================================== EXPERTISE GALLERY */
  const initXP = (scope) => {
    const box = $("[data-xp]", scope);
    if (!box) return;
    const vp = $("[data-xp-viewport]", box), track = $("[data-xp-track]", box);
    const tTitle = $("[data-xp-title]", box), tLoc = $("[data-xp-loc]", box), cnt = $("[data-xp-count]", box), bar = $("[data-xp-bar]", box);
    const prev = $("[data-xp-prev]", box), next = $("[data-xp-next]", box), all = $("[data-xp-all]", box);
    const catBtns = $$("[data-xp-cat]", box);
    let c = 0, i = 0, x = 0, busy = false;
    const items = () => window.CATEGORIES[c].images;
    const slides = () => $$(".xp__slide", track);
    const maxX = () => Math.max(0, track.scrollWidth - vp.clientWidth);
    const setX = (v, animate = true) => {
      x = v;
      if (S.gsap) gsap.to(track, { x: v, duration: animate && !S.reduced ? 0.95 : 0, ease: "power3.out", overwrite: true });
      else { track.style.transition = animate && !S.reduced ? "transform .95s cubic-bezier(.22,1,.36,1)" : "none"; track.style.transform = `translate3d(${v}px,0,0)`; }
    };
    const info = () => {
      const [, t, l] = items()[i];
      tTitle.textContent = t; tLoc.textContent = l;
      cnt.textContent = `${pad(i + 1)} / ${pad(items().length)}`;
      bar.style.transform = `scaleX(${(i + 1) / items().length})`;
      prev.disabled = i === 0; next.disabled = i === items().length - 1;
      if (motion) gsap.fromTo([tTitle, tLoc], { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: "power3.out" });
    };
    const go = (k, animate = true) => {
      const ss = slides();
      i = Math.max(0, Math.min(ss.length - 1, k));
      setX(-Math.min(ss[i].offsetLeft, maxX()), animate);
      info();
    };
    const render = () => {
      const cat = window.CATEGORIES[c];
      S.lb.xp = cat.images.map(([n, t, l]) => ({ img: n, title: t, sub: l }));
      track.innerHTML = cat.images.map(([n, t], k) => `<button class="media xp__slide" data-lb="xp" data-lb-index="${k}" data-cursor="view" aria-label="Open image: ${esc(t)}">${window.UI.img(n, t, { sizes: "(max-width:1024px) 64vw, 42vw" })}<span class="media__over"><span>${esc(t)}</span></span></button>`).join("");
      all.href = `#category-${cat.slug}`;
      catBtns.forEach((b, k) => b.setAttribute("aria-pressed", String(k === c)));
      i = 0; setX(0, false); info();
      if (motion) {
        gsap.fromTo(slides(), { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, stagger: 0.09, ease: "expo.out", clearProps: "clipPath" });
        gsap.fromTo($$(".xp__slide img", track), { scale: 1.25 }, { scale: 1, duration: 1.6, stagger: 0.09, ease: "expo.out", clearProps: "transform" });
      }
    };
    const switchCat = (k) => {
      if (k === c || busy) return;
      c = k;
      if (motion) {
        busy = true;
        gsap.to(slides(), { clipPath: "inset(0% 100% 0% 0%)", duration: 0.55, stagger: 0.05, ease: "power3.in", onComplete: () => { busy = false; render(); } });
      } else render();
    };
    catBtns.forEach((b) => b.addEventListener("click", () => switchCat(+b.dataset.xpCat)));
    prev.addEventListener("click", () => go(i - 1));
    next.addEventListener("click", () => go(i + 1));
    vp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    });
    // pointer drag / touch swipe
    let d = null;
    vp.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      d = { sx: e.clientX, sy: e.clientY, x0: x, moved: false, id: e.pointerId, axis: null };
      if (S.gsap) gsap.killTweensOf(track);
    });
    vp.addEventListener("pointermove", (e) => {
      if (!d) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (!d.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis !== "x") return;
      if (!d.moved) { d.moved = true; vp.classList.add("is-dragging"); try { vp.setPointerCapture(d.id); } catch (_) {} }
      let v = d.x0 + dx;
      const m = -maxX();
      if (v > 0) v *= 0.35; else if (v < m) v = m + (v - m) * 0.35;
      setX(v, false);
    });
    const up = (e) => {
      if (!d) return;
      const was = d; d = null;
      vp.classList.remove("is-dragging");
      if (!was.moved) return;
      S.suppressClick = Date.now();
      const dx = e.clientX - was.sx;
      const ss = slides();
      let best = 0, bd = Infinity;
      ss.forEach((s, k) => { const dd = Math.abs(-Math.min(s.offsetLeft, maxX()) - x); if (dd < bd) { bd = dd; best = k; } });
      if (best === i && Math.abs(dx) > 40) best = i + (dx < 0 ? 1 : -1);
      go(best);
    };
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointercancel", up);
    const onResize = () => go(i, false);
    listen(window, "resize", onResize);
    render();
  };

  /* =========================================================== AWARDS */
  const initAwards = (scope) => {
    $$("[data-awards]", scope).forEach((box) => {
      const rows = $$("[data-award]", box), imgs = $$("[data-award-img]", box);
      const cap = $("[data-award-cap]", box), txt = $("[data-award-text]", box);
      let cur = 0;
      imgs.forEach((im, k) => { im.style.position = "absolute"; im.style.inset = "0"; im.style.opacity = k === 0 ? 1 : 0; });
      const set = (k) => {
        if (k === cur) return;
        const a = window.AWARDS[k];
        rows.forEach((r, n) => { r.classList.toggle("is-active", n === k); r.setAttribute("aria-pressed", String(n === k)); });
        const prevImg = imgs[cur], im = imgs[k];
        cur = k;
        imgs.forEach((x) => (x.style.zIndex = 0));
        prevImg.style.zIndex = 1; im.style.zIndex = 2;
        if (motion) {
          gsap.fromTo(im, { opacity: 1, clipPath: "inset(0% 0% 100% 0%)", scale: 1.12 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "expo.out", overwrite: true, onComplete: () => imgs.forEach((x, n) => { if (n !== cur) x.style.opacity = 0; }) });
          gsap.fromTo([cap, txt], { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" });
        } else {
          im.style.transition = "opacity .6s"; im.style.opacity = 1;
          setTimeout(() => imgs.forEach((x, n) => { if (n !== cur) x.style.opacity = 0; }), 600);
        }
        cap.textContent = a.cap; txt.textContent = a.capText;
      };
      rows.forEach((r) => {
        const k = +r.dataset.award;
        r.addEventListener("click", () => set(k));
        r.addEventListener("focus", () => set(k));
        if (S.fine) r.addEventListener("pointerenter", () => set(k));
      });
    });
  };

  /* =========================================================== DRAG SCROLL (strips) */
  const dragScroll = (vp, onScroll) => {
    let d = null;
    vp.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || e.button !== 0) return; d = { x: e.clientX, s: vp.scrollLeft, moved: false }; });
    vp.addEventListener("pointermove", (e) => {
      if (!d) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 5) d.moved = true;
      vp.scrollLeft = d.s - dx;
    });
    const up = () => { if (d && d.moved) S.suppressClick = Date.now(); d = null; };
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointerleave", up);
    vp.addEventListener("click", (e) => { if (Date.now() - S.suppressClick < 250) { e.preventDefault(); e.stopPropagation(); } }, true);
    vp.addEventListener("dragstart", (e) => e.preventDefault());
    if (onScroll) vp.addEventListener("scroll", onScroll, { passive: true });
    vp.setAttribute("tabindex", "0");
    vp.setAttribute("role", "region");
    vp.setAttribute("aria-label", "Horizontal gallery — scroll sideways or drag");
  };

  const initHSeries = (scope) => {
    const sec = $("[data-hseries]", scope);
    if (!sec) return;
    const track = $("[data-hseries-track]", sec), bar = $("[data-hseries-bar]", sec), vp = $("[data-hseries-viewport]", sec);
    if (motion && innerWidth > 900) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (s) => (bar.style.transform = `scaleX(${s.progress})`) }
      });
      vp.removeAttribute("data-cursor");
    } else {
      sec.classList.add("no-pin");
      dragScroll(vp, () => { const m = vp.scrollWidth - vp.clientWidth; bar.style.transform = `scaleX(${m > 0 ? vp.scrollLeft / m : 0})`; });
    }
  };

  /* =========================================================== PORTFOLIO FILTER */
  const initPortfolio = (scope) => {
    const grid = $("[data-pgrid]", scope);
    if (!grid) return;
    const cards = $$(".pcard", grid), more = $("[data-load-more]", scope);
    let filter = "all", expanded = false;
    const apply = () => {
      let shown = 0;
      cards.forEach((c) => {
        const ok = filter === "all" || c.dataset.cat === filter;
        const vis = ok && (expanded || filter !== "all" || !c.classList.contains("is-more"));
        c.classList.toggle("is-hidden", !vis);
        if (vis) shown++;
      });
      more.parentElement.style.display = filter === "all" && !expanded ? "" : "none";
      const vis = cards.filter((c) => !c.classList.contains("is-hidden"));
      if (motion) gsap.fromTo(vis, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: "power3.out", clearProps: "transform,opacity,visibility,clipPath" });
      if (S.gsap) window.ScrollTrigger.refresh();
      S.updateScrollbar && S.updateScrollbar();
      return shown;
    };
    $$("[data-filter]", scope).forEach((b) => b.addEventListener("click", () => {
      filter = b.dataset.filter;
      $$("[data-filter]", scope).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      apply();
    }));
    more.addEventListener("click", () => { expanded = true; apply(); });
  };

  /* =========================================================== FORMS */
  const toast = (msg) => { const t = $("[data-toast]"); t.textContent = msg; t.classList.add("is-on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("is-on"), 2600); };
  const initForms = (scope) => {
    $$("[data-form]", scope).forEach((form) => {
      const kind = form.dataset.form;
      const status = $("[data-form-status]", form);
      const svc = $("select[name='service']", form);
      if (svc && S.prefService) { svc.value = S.prefService; S.prefService = null; }
      const date = $("input[type='date']", form);
      if (date) date.min = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
      const setErr = (field, msg) => {
        const wrap = field.closest(".field"), err = wrap && $(".field__err", wrap);
        wrap && wrap.classList.toggle("is-invalid", !!msg);
        field.setAttribute("aria-invalid", msg ? "true" : "false");
        if (err) { err.textContent = msg || ""; if (err.id) field.setAttribute("aria-describedby", err.id); }
      };
      const check = (f) => {
        const v = f.value.trim();
        if (f.required && !v) return "This field is required.";
        if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Please enter a valid email address.";
        if (f.minLength > 0 && v && v.length < f.minLength) return `Please add a little more detail (at least ${f.minLength} characters).`;
        if (f.type === "date" && v && v < f.min) return "Please choose a date from tomorrow onwards.";
        return "";
      };
      $$("input, select, textarea", form).forEach((f) => {
        f.addEventListener("blur", () => { if (f.value) setErr(f, check(f)); });
        f.addEventListener("input", () => { if (f.getAttribute("aria-invalid") === "true") setErr(f, check(f)); });
      });
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let first = null;
        $$("input:not([type=radio]), select, textarea", form).forEach((f) => { const m = check(f); setErr(f, m); if (m && !first) first = f; });
        if (first) { first.focus(); status.classList.remove("is-visible"); return; }
        const data = Object.fromEntries(new FormData(form).entries());
        data.form = kind;
        const subject = kind === "booking" ? `Shoot request — ${data.service || "photography"} — ${data.name}` : `${data.topic} — ${data.name}`;
        const lines = Object.entries(data).filter(([k]) => k !== "form").map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}: ${v}`);
        const mail = `mailto:${window.CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
        const btnEl = $("button[type=submit]", form);
        const fallback = (lead) => {
          status.innerHTML = `<strong>${lead}</strong>Your details are still here. You can send them as an email to <code>${esc(window.CONFIG.email)}</code> instead.<div class="row"><a class="btn btn--sm btn--solid" href="${mail}"><span class="btn__text">Open email draft</span><span class="btn__icon">${ICON.arrow}</span></a><button type="button" class="btn btn--sm" data-copy><span class="btn__text">Copy inquiry</span><span class="btn__icon">${ICON.arrow}</span></button></div>`;
          status.classList.add("is-visible");
          $("[data-copy]", status).addEventListener("click", async () => {
            try { await navigator.clipboard.writeText(`${subject}\n\n${lines.join("\n")}`); toast("Inquiry copied to clipboard"); }
            catch (_) { toast("Copy isn't available here — please select the text manually"); }
          });
        };
        const endpoint = window.CONFIG.formEndpoint;
        if (!endpoint) { fallback("Online submissions aren't connected on this demo yet — nothing has been sent."); return; }
        btnEl.setAttribute("aria-busy", "true");
        try {
          const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(res.status);
          status.innerHTML = `<strong>Thank you, ${esc(data.name)}.</strong>Your ${kind === "booking" ? "request" : "message"} was received. We'll reply to ${esc(data.email)} within two working days.`;
          status.classList.add("is-visible");
          form.reset();
        } catch (err) {
          fallback("We couldn't reach the form service, so your message was not sent.");
        } finally { btnEl.removeAttribute("aria-busy"); }
      });
    });
  };

  /* =========================================================== ROUTER */
  const routes = {
    "": "home", home: "home", about: "about", portfolio: "portfolio", categories: "categories", services: "services",
    series: "series", awards: "awards", journal: "journal", contact: "contact", booking: "booking", privacy: "privacy", terms: "terms"
  };
  const dyn = [["project-", "project"], ["category-", "category"], ["service-", "service"], ["series-", "seriesItem"], ["journal-", "article"]];
  const resolve = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    let view = null, key = h;
    if (h in routes) { view = window.VIEWS[routes[h]](); key = routes[h]; }
    else {
      for (const [p, fn] of dyn) if (h.startsWith(p)) { view = window.VIEWS[fn](h.slice(p.length)); key = fn; break; }
    }
    return { view: view || window.VIEWS.notFound(), key: view ? key : "404", hash: h };
  };
  const navMap = { home: "home", about: "about", services: "services", service: "services", portfolio: "portfolio", project: "portfolio", journal: "journal", article: "journal", contact: "contact" };

  const cleanup = () => {
    S.cleanups.forEach((f) => { try { f(); } catch (_) {} });
    S.cleanups = [];
    if (S.gsap) window.ScrollTrigger.getAll().forEach((t) => t.kill(true));
    if (io) { io.disconnect(); io = null; }
  };

  const curtain = $("[data-curtain]");
  const curtainIn = (label) => new Promise((res) => {
    if (S.reduced || !curtain.animate) return res();
    $("[data-curtain-label]").textContent = label || "Creacy";
    curtain.classList.add("is-on");
    curtain.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }], { duration: 650, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).onfinish = res;
    $("span", curtain).animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 250, fill: "forwards" });
  });
  const curtainOut = () => new Promise((res) => {
    if (S.reduced || !curtain.animate) { curtain.classList.remove("is-on"); return res(); }
    $("span", curtain).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" });
    curtain.animate([{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }], { duration: 750, delay: 120, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).onfinish = () => { curtain.classList.remove("is-on"); res(); };
  });

  let navToken = 0;
  const navigate = async () => {
    const token = ++navToken;
    const first = S.first;
    S.first = false;
    const { view, key } = resolve();
    if (LB.isOpen()) LB.close();
    if (!first) {
      const lab = (view.title || "").split(" — ")[0];
      await curtainIn(lab);
      if (token !== navToken) return;
    }
    cleanup();
    S.lb = view.lb || {};
    main.innerHTML = view.html;
    document.title = view.title;
    if (S.lenis) S.lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
    header.classList.remove("is-hidden");
    const navKey = navMap[key];
    $$("[data-nav] a, .menu__links a").forEach((a) => { if (a.getAttribute("href") === `#${navKey}`) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    root.dataset.page = key;
    // init page
    $$("[data-magnetic]", main).forEach(magnet);
    initReveals(main);
    initHero(main, first);
    initXP(main);
    initAwards(main);
    initHSeries(main);
    $$("[data-drag-scroll]", main).forEach((v) => dragScroll(v));
    initPortfolio(main);
    initForms(main);
    if (S.gsap) { requestAnimationFrame(() => window.ScrollTrigger.refresh()); }
    S.updateScrollbar && S.updateScrollbar();
    if (!first) { await curtainOut(); main.focus({ preventScroll: true }); }
  };
  window.addEventListener("hashchange", navigate);
  window.addEventListener("load", () => { if (S.gsap) window.ScrollTrigger.refresh(); S.updateScrollbar && S.updateScrollbar(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => S.gsap && window.ScrollTrigger.refresh());
  // keep ScrollTrigger in sync when lazy images settle
  document.addEventListener("load", (e) => { if (e.target.tagName === "IMG" && S.gsap) { clearTimeout(S._rf); S._rf = setTimeout(() => window.ScrollTrigger.refresh(), 200); } }, true);

  navigate();
  window.__creacy = { S, navigate, LB };
})();
