/* Creacy — page templates. Each view returns { title, html, lb? } */
(() => {
  const IMG = window.IMG, C = window.CONFIG;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");

  const ICON = {
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>',
    right: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2.5 8h11M9 3.5L13.5 8 9 12.5"/></svg>',
    left: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M13.5 8h-11M7 3.5L2.5 8 7 12.5"/></svg>',
    chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
    menu: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 5.5h12M2 10.5h12"/></svg>',
    expand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>'
  };
  const LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 2h7.5A2.5 2.5 0 0 1 12 4.5V12H4.5A2.5 2.5 0 0 1 2 9.5zM22 2v7.5A2.5 2.5 0 0 1 19.5 12H12V4.5A2.5 2.5 0 0 1 14.5 2zM22 22h-7.5a2.5 2.5 0 0 1-2.5-2.5V12h7.5a2.5 2.5 0 0 1 2.5 2.5zM2 22v-7.5A2.5 2.5 0 0 1 4.5 12H12v7.5A2.5 2.5 0 0 1 9.5 22z"/><circle cx="12" cy="12" r="3.2" fill="#1c191f"/></svg>';

  const img = (name, alt, o = {}) => {
    const m = IMG[name] || [1600, 1067, "#333"];
    const [w, h, c] = m;
    return `<img src="img/${name}-sm.jpg" srcset="img/${name}-sm.jpg ${w / 2}w, img/${name}.jpg ${w}w" sizes="${o.sizes || "(max-width: 768px) 100vw, 50vw"}" width="${w}" height="${h}" alt="${esc(alt)}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" style="background:${c}">`;
  };
  const btn = (text, href, o = {}) => `<a class="btn ${o.cls || ""}" href="${href}" data-magnetic ${o.attr || ""}><span class="btn__text">${text}</span><span class="btn__icon">${ICON.arrow}</span></a>`;
  const label = (n, t) => `<div class="label">${n ? `<span>(${pad(n)})</span>` : '<span>(—)</span>'}<span>${t}</span></div>`;
  const P = (slug) => window.PROJECTS.find((p) => p.slug === slug);
  const cat = (slug) => window.CATEGORIES.find((c) => c.slug === slug);
  const imgMeta = (() => {
    const map = {};
    window.CATEGORIES.forEach((c) => c.images.forEach(([n, t, l]) => (map[n] = { title: t, loc: l, cat: c.name })));
    return (n) => map[n] || { title: n, loc: "", cat: "" };
  })();
  const lbItem = (n) => ({ img: n, title: imgMeta(n).title, sub: imgMeta(n).loc });
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const pcard = (p, o = {}) => `
    <a class="pcard ${o.cls || ""}" href="#project-${p.slug}" data-cursor="explore" data-reveal="image" ${o.delay ? `data-delay="${o.delay}"` : ""}>
      <div class="media">${img(p.hero, `${p.title} — ${cat(p.category).name.toLowerCase()} photography`, { sizes: o.sizes || "(max-width: 768px) 100vw, 40vw" })}</div>
      ${o.tags ? `<div class="pcard__tags">${p.tags.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>` : ""}
      <div class="pcard__body">
        ${o.meta ? `<div class="pcard__meta"><span>${cat(p.category).name}</span><span>${p.year}</span><span>${esc(p.location)}</span></div>` : ""}
        <h3 class="pcard__title">${esc(o.long ? p.long : p.title)}</h3>
        ${o.sub ? `<p class="pcard__sub">${esc(p.excerpt)}</p>` : ""}
        <span class="pcard__cta ${o.solid ? "pcard__cta--solid" : ""}">More details ${ICON.chev}</span>
      </div>
    </a>`;

  const lbButton = (group, i, name, alt, o = {}) => `<button class="media ${o.cls || ""}" data-lb="${group}" data-lb-index="${i}" data-cursor="view" aria-label="Open image: ${esc(alt)}" ${o.reveal === false ? "" : 'data-reveal="image"'} ${o.style ? `style="${o.style}"` : ""}>${img(name, alt, { sizes: o.sizes })}</button>`;

  const masonry = (group, names) => `<div class="masonry">${names.map((n, i) => {
    const m = imgMeta(n);
    return `<figure>${lbButton(group, i, n, m.title, { sizes: "(max-width: 768px) 100vw, 33vw" })}<figcaption><span>${esc(m.title)}</span><span>${esc(m.loc)}</span></figcaption></figure>`;
  }).join("")}</div>`;

  /* ---------------- shared sections ---------------- */
  const awardsBlock = (n = 4, withHead = true) => `
    <section class="section wrap" aria-labelledby="awards-h">
      ${withHead ? `<div class="awards__head">
        ${label(n, "Awards")}
        <h2 class="h2" id="awards-h" data-reveal="lines"><strong>Award</strong> is a pixel that <strong>reflecting</strong> our ongoing <strong>dedication</strong> to innovation and excellence</h2>
      </div>` : `<h2 class="sr-only" id="awards-h">Awards</h2>`}
      <div class="awards__grid" data-awards>
        <div>
          <div class="alist" role="list">
            ${window.AWARDS.slice(0, withHead ? 4 : 99).map((a, i) => `
              <button class="arow ${i === 0 ? "is-active" : ""}" role="listitem" data-award="${i}" aria-pressed="${i === 0}" data-reveal="up" data-delay="${i * 0.06}">
                <span class="arow__year">${a.year}</span>
                <span class="arow__title">${esc(a.title)}<small>${esc(a.note)}</small></span>
                <span class="circle">${ICON.arrow}</span>
              </button>`).join("")}
          </div>
          <p class="demo-note">Illustrative entries for this demo portfolio — replace with genuine recognition.</p>
        </div>
        <div class="apreview" data-reveal="up">
          <div class="media">${window.AWARDS.map((a, i) => img(a.img, a.cap, { sizes: "(max-width: 1024px) 100vw, 35vw" }).replace("<img ", `<img data-award-img="${i}" class="${i === 0 ? "is-active" : ""}" `)).join("")}</div>
          <div class="apreview__cap" aria-live="polite"><strong data-award-cap>${esc(window.AWARDS[0].cap)}</strong><p data-award-text>${esc(window.AWARDS[0].capText)}</p></div>
        </div>
      </div>
    </section>`;

  const formBlock = (kind) => {
    const svc = window.SERVICES.map((s) => `<option value="${s.slug}">${esc(s.title)}</option>`).join("");
    const budgets = ["Under $2k", "$2k – $5k", "$5k – $10k", "$10k +"];
    if (kind === "contact") return `
      <form class="form" data-form="contact" novalidate>
        <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" autocomplete="name" required placeholder="Your full name"><span class="field__err" id="c-name-err"></span></div>
        <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required placeholder="you@company.com"><span class="field__err" id="c-email-err"></span></div>
        <div class="field field--full"><label for="c-topic">Topic</label><select id="c-topic" name="topic" required><option value="">Select a topic</option><option>General enquiry</option><option>Commission or booking</option><option>Prints & licensing</option><option>Press</option></select><span class="field__err" id="c-topic-err"></span></div>
        <div class="field field--full"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required minlength="20" placeholder="Tell us a little about what you have in mind"></textarea><span class="field__err" id="c-msg-err"></span></div>
        <div class="form__status" data-form-status role="status" aria-live="polite"></div>
        <div class="form__foot"><span class="micro">We reply within two working days.</span><button type="submit" class="btn btn--solid" data-magnetic><span class="btn__text">Send message</span><span class="btn__icon">${ICON.arrow}</span></button></div>
      </form>`;
    return `
      <form class="form" data-form="booking" novalidate>
        <div class="field"><label for="b-name">Name</label><input id="b-name" name="name" autocomplete="name" required placeholder="Your full name"><span class="field__err" id="b-name-err"></span></div>
        <div class="field"><label for="b-email">Email</label><input id="b-email" name="email" type="email" autocomplete="email" required placeholder="you@company.com"><span class="field__err" id="b-email-err"></span></div>
        <div class="field"><label for="b-company">Company <i>(optional)</i></label><input id="b-company" name="company" autocomplete="organization" placeholder="Studio or brand"><span class="field__err"></span></div>
        <div class="field"><label for="b-service">Photography type</label><select id="b-service" name="service" required><option value="">Select a service</option>${svc}</select><span class="field__err" id="b-service-err"></span></div>
        <div class="field"><label for="b-location">Location</label><input id="b-location" name="location" required placeholder="City, region or 'flexible'"><span class="field__err" id="b-location-err"></span></div>
        <div class="field"><label for="b-date">Preferred date</label><input id="b-date" name="date" type="date" required><span class="field__err" id="b-date-err"></span></div>
        <fieldset class="field field--full" style="border:0;padding:0;margin:0"><legend class="micro" style="margin-bottom:10px;color:var(--soft)">Budget range</legend>
          <div class="chips">${budgets.map((b, i) => `<label><input type="radio" name="budget" value="${b}" ${i === 1 ? "checked" : ""}><span>${b}</span></label>`).join("")}</div></fieldset>
        <div class="field field--full"><label for="b-brief">Project brief</label><textarea id="b-brief" name="brief" required minlength="30" placeholder="What are the images for, where will they live, and what should they feel like?"></textarea><span class="field__err" id="b-brief-err"></span></div>
        <div class="form__status" data-form-status role="status" aria-live="polite"></div>
        <div class="form__foot"><span class="micro">No commitment — we'll reply with availability and a proposal.</span><button type="submit" class="btn btn--solid" data-magnetic><span class="btn__text">Request a shoot</span><span class="btn__icon">${ICON.arrow}</span></button></div>
      </form>`;
  };

  const bookBlock = (n) => `
    <section class="section wrap" aria-labelledby="book-h">
      <div class="panel book" style="background:var(--surface)">
        <div style="display:flex;flex-direction:column;justify-content:space-between;gap:30px">
          <div>${label(n, "Book a Shoot")}<h2 class="h2 h2--white" id="book-h" style="margin-top:18px" data-reveal="lines">Tell us about the <strong>story</strong> you want to tell.</h2></div>
          <p class="small" style="max-width:36ch" data-reveal="up">Commissions, editorial assignments and portrait sittings. Share a few details and we'll come back with dates, an approach and a proposal.</p>
        </div>
        ${formBlock("booking")}
      </div>
    </section>`;

  const footer = () => `
    <footer class="site-foot" aria-label="Contact and footer">
      <div class="panel cta">
        ${label(5, "Contact Us")}
        <div class="cta__top">
          <h2 class="cta__title" data-reveal="lines">Let's <strong>discuss</strong> your<br>vision <a class="btn cta__inline" href="#contact" data-magnetic><span class="btn__text">Let's talk</span><span class="btn__icon">${ICON.arrow}</span></a> <strong>with us</strong></h2>
          <address class="cta__addr">${C.address.join("<br>")}<br><a href="tel:${C.phone.replace(/[^+\d]/g, "")}">${C.phone}</a><br><a href="mailto:${C.email}">${C.email}</a></address>
        </div>
        <div class="footer">
          <a class="logo" href="#home" aria-label="Creacy home">${LOGO}<span>Creacy</span></a>
          <nav aria-label="Footer"><a href="#about">About Us</a><a href="#portfolio">Project</a><a href="#services">Service</a><a href="#categories">Categories</a><a href="#series">Series</a><a href="#awards">Awards</a><a href="#journal">Journal</a><a href="#contact">Contact</a><a href="#terms">Terms &amp; Condition</a><a href="#privacy">Privacy</a></nav>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end" class="footer__end">
            <div class="footer__social">${C.socials.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join("")}</div>
            <span class="footer__copy">©Creacy ${new Date().getFullYear()}. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>`;

  const cover = (name, alt, h1, meta, crumbs) => `
    <section class="cover">
      <div class="cover__frame">
        <div class="cover__img" data-parallax="8">${img(name, alt, { eager: true, sizes: "100vw" })}</div>
        <div class="cover__body">
          <div>${crumbs ? `<div class="crumbs">${crumbs}</div>` : ""}<h1 class="display" data-reveal="lines">${h1}</h1></div>
          ${meta ? `<dl class="cover__meta" data-reveal="up">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        </div>
      </div>
    </section>`;

  const phead = (n, lab, h1, side, crumbs) => `
    <header class="phead">
      <div>${crumbs ? `<div class="crumbs">${crumbs}</div>` : ""}${label(n, lab)}<h1 class="display" data-reveal="lines">${h1}</h1></div>
      ${side ? `<div class="phead__side" data-reveal="up">${side}</div>` : ""}
    </header>`;

  /* ================================================================= VIEWS */
  const V = {};

  V.home = () => {
    const slides = window.HERO_SLIDES;
    const xpCats = window.CATEGORIES;
    const w = [P("majestic-creatures"), P("beyond-the-horizon"), P("the-human-condition")];
    const lb = { journalHome: [] };
    return {
      title: "Creacy — Cinematic Photography Studio",
      lb,
      html: `
      <section class="hero" aria-label="Introduction">
        <div class="hero__frame" data-hero>
          <div class="hero__slides" data-hero-media>
            ${slides.map((s, i) => `<div class="hero__slide ${i === 0 ? "is-active" : ""}" data-hero-slide="${i}">${img(s.img, `${s.title}, ${s.sub}`, { eager: i === 0, sizes: "100vw" })}</div>`).join("")}
          </div>
          <h1 class="display hero__title" data-reveal="lines" data-manual>Capturing beautiful<br> moments inside lens and<br> shutterspeed</h1>
          <div class="hero__bottom">
            <div class="hero__tags" data-hero-tags>
              ${[["landscape", "Landscape"], ["wildlife", "Wildlife"], ["architecture", "Architectural"], ["travel", "Travel"], ["portrait", "Portrait"]].map(([s, n]) => `<a class="pill" href="#category-${s}">${n}</a>`).join("")}
            </div>
            <div class="hero__previews">
              <div class="hero__progress" aria-hidden="true"><span data-hero-cur>01</span><i><b data-hero-bar></b></i><span>${pad(slides.length)}</span></div>
              <div class="hero__track" role="group" aria-label="Featured stories">
                ${slides.map((s, i) => `<button class="hcard ${i === 0 ? "is-active" : ""}" data-hero-go="${i}" aria-label="Show ${esc(s.title)}" aria-pressed="${i === 0}">
                  <span class="hcard__img">${img(s.img, "", { sizes: "120px", eager: true })}</span>
                  <span class="hcard__txt"><strong>${esc(s.title)}</strong><span>${esc(s.sub)}</span></span>
                </button>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section wrap" aria-labelledby="about-h">
        <div class="about">
          <div class="about__left">
            <div data-reveal="up">${label(1, "About Us")}</div>
            <p data-reveal="up">We Ardently Strive To Encapsulate Life's Most Precious Moments, Weaving A Tapestry Of Artistry And A Hint Of Enchanting Magic. With The Timeless Essence Of The Human Experience.</p>
          </div>
          <div class="about__right">
            <h2 class="h2" id="about-h" data-reveal="lines"><strong>Photography</strong> is driven by a deep passion for <strong>capturing life's</strong> most <strong>precious moments</strong> with artistry and a touch of magic</h2>
            <div data-reveal="up">${btn("Learn more", "#about")}</div>
          </div>
        </div>
      </section>

      <section class="wrap" aria-labelledby="xp-h">
        <div class="panel xp" data-xp>
          <div class="xp__head">
            <div>${label(2, "Our Expertise")}<h2 class="h2" id="xp-h" data-reveal="lines">When moments captured every dream crafted into beautiful reality</h2></div>
            <div class="xp__cats" role="group" aria-label="Photography categories">
              ${xpCats.map((c, i) => `<button type="button" data-xp-cat="${i}" aria-pressed="${i === 0}">${c.name}</button>`).join("")}
            </div>
          </div>
          <div class="xp__info">
            <div class="xp__cap" aria-live="polite"><strong data-xp-title></strong><span data-xp-loc></span></div>
            <div class="xp__nav">
              <button class="circle" data-xp-prev aria-label="Previous image" data-cursor-none>${ICON.left}</button>
              <button class="circle circle--fill" data-xp-next aria-label="Next image">${ICON.right}</button>
              <span class="xp__count" data-xp-count></span>
            </div>
            <div class="xp__bar" aria-hidden="true"><b data-xp-bar></b></div>
            <a class="link-line" href="#category-landscape" data-xp-all>See all ${ICON.right.replace("<svg", '<svg width="14" height="14"')}</a>
          </div>
          <div class="xp__viewport" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Category gallery — use arrow keys or drag" data-cursor="drag" data-xp-viewport>
            <div class="xp__track" data-xp-track></div>
          </div>
        </div>
      </section>

      <section class="section wrap" aria-labelledby="work-h">
        <div class="work__head">
          <div>${label(3, "Our Work")}<h2 class="h2" id="work-h" data-reveal="lines"><strong>Explore</strong> the artistry and precision behind <strong>our portfolio</strong> of timeless photography</h2></div>
          <div class="work__aside" data-reveal="up">
            <p>Embark On A Visual Journey Through Our Cherished Moments Captured With Creativity And Precision. Each Image In Our Portfolio Reflects Our Dedication To Preserving Life's Beauty And Significance.</p>
            ${btn("Explore more", "#portfolio")}
          </div>
        </div>
        <div class="work__grid">
          ${pcard(w[0], { tags: true, sub: true, solid: true, long: true, sizes: "(max-width: 768px) 100vw, 50vw" })}
          ${pcard(w[1], { long: true, delay: 0.12, sizes: "(max-width: 768px) 100vw, 25vw" })}
          ${pcard(w[2], { long: true, delay: 0.24, sizes: "(max-width: 768px) 100vw, 25vw" })}
        </div>
      </section>

      ${awardsBlock(4)}

      <section class="wrap" aria-labelledby="philo-h">
        <div class="philo">
          <div class="philo__img" data-parallax="10">${img("mirror-lake", "A still lake reflecting mountains at dawn", { sizes: "100vw" })}</div>
          <div class="philo__body">
            <div>${label(0, "Visual Philosophy")}<h2 class="display" id="philo-h" style="margin-top:18px" data-reveal="lines">Every frame has a story.<br>Every story deserves to be felt.</h2></div>
            <dl class="philo__meta" data-reveal="up"><dt>Frame</dt><dd>A Lake That Holds the Sky</dd><dt>Place</dt><dd>Lake Bohinj, Slovenia</dd><dt>Light</dt><dd>06:12, windless dawn</dd></dl>
          </div>
        </div>
      </section>

      <section class="section hseries" data-hseries aria-labelledby="series-h">
        <div class="wrap hseries__head">
          <div>${label(0, "Selected Series")}<h2 class="h2" id="series-h" style="margin-top:14px" data-reveal="lines">Curated <strong>series</strong>, built over years</h2></div>
          ${btn("All series", "#series")}
        </div>
        <div class="hseries__viewport" data-hseries-viewport data-cursor="drag">
          <div class="hseries__track" data-hseries-track>
            ${window.SERIES.map((s, i) => `
              <a class="scard" href="#series-${s.slug}" data-cursor="explore" aria-label="${esc(s.title)} series">
                <span class="scard__num">${pad(i + 1)} / ${pad(window.SERIES.length)} — ${s.years}</span>
                ${s.images.slice(0, 3).map((n, k) => `<div class="media">${img(n, imgMeta(n).title, { sizes: k ? "25vw" : "45vw" }).replace('loading="lazy"', "")}${k === 0 ? '<div class="media__shade"></div>' : ""}</div>`).join("")}
                <span class="scard__info"><span class="h3">${esc(s.title)}</span><span class="small" style="color:rgba(255,255,255,.75)">${esc(s.text)}</span></span>
              </a>`).join("")}
          </div>
        </div>
        <div class="hseries__bar" aria-hidden="true"><b data-hseries-bar></b></div>
      </section>

      <section class="section wrap" aria-labelledby="process-h">
        <div class="process">
          <div class="process__sticky">
            ${label(0, "Behind the Frame")}
            <h2 class="h2" id="process-h" style="margin-top:18px" data-reveal="lines">How a photograph <strong>comes to be</strong></h2>
            <div class="media process__img" data-reveal="image">${img("night-cabin", "A cabin with one window lit at night", { sizes: "30vw" })}</div>
          </div>
          <ol class="steps">
            ${window.PROCESS.map(([t, d], i) => `<li data-reveal="up"><span class="n">${pad(i + 1)}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="section--tight wrap" aria-labelledby="clients-h">
        <div class="section-head"><div>${label(0, "Clients & Collaborations")}<h2 class="h2" id="clients-h" style="margin-top:14px" data-reveal="lines">Trusted by <strong>quiet brands</strong> and bold editors</h2></div><p class="micro" style="max-width:30ch">Fictional demonstration clients — replace with real collaborators.</p></div>
        <ul class="clients">${window.CLIENTS.map((c) => { const [a, ...b] = c.split(" "); return `<li data-reveal="up"><span>${esc(a)}</span>&nbsp;${esc(b.join(" "))}</li>`; }).join("")}</ul>
      </section>

      <section class="section wrap" aria-labelledby="journal-h">
        <div class="section-head"><div>${label(0, "Journal")}<h2 class="h2" id="journal-h" style="margin-top:14px" data-reveal="lines">Stories from <strong>the field</strong></h2></div>${btn("Read the journal", "#journal")}</div>
        <div class="jgrid">${window.ARTICLES.slice(0, 3).map((a, i) => jcard(a, i)).join("")}</div>
      </section>

      ${bookBlock(0)}
      ${footer()}`
    };
  };

  const jcard = (a, i = 0) => `
    <a class="jcard" href="#journal-${a.slug}" data-reveal="up" data-delay="${i * 0.08}">
      <div class="media media--zoom" data-cursor="view">${img(a.img, a.title, { sizes: "(max-width: 768px) 100vw, 33vw" })}</div>
      <div class="jcard__meta"><span>${a.cat}</span><span>${fmtDate(a.date)}</span><span>${a.read} min read</span></div>
      <div class="jcard__row"><h3>${esc(a.title)}</h3><span class="circle">${ICON.arrow}</span></div>
    </a>`;

  V.about = () => {
    const bts = ["night-cabin", "fog-pines", "portrait-noir", "storm-ridge", "facade-dusk", "golden-dunes"];
    return {
      title: "About — Creacy",
      lb: { bts: bts.map(lbItem) },
      html: `
      ${cover("fog-pines", "Pine forest layered in fog", "An independent studio for <strong>slow</strong> photography", [["Founded", "2013"], ["Studio", "Lisbon"], ["Team", "4 people"]])}
      <section class="section wrap">
        <div class="split split--wide">
          ${label(1, "Introduction")}
          <div>
            <h2 class="h2" data-reveal="lines">Creacy is a small studio making <strong>landscape, architecture and portrait</strong> photography for people who still print their pictures.</h2>
            <div class="prose" style="margin-top:32px" data-reveal="up">
              <p>We work slowly and on purpose: long scouting days, few frames, and an edit that keeps only what is necessary. Our clients include architects, editors, hotels and outdoor brands who want images that last longer than a campaign.</p>
              <p>This website is a demonstration portfolio. The studio, its people, clients and awards are fictional, and every photograph is a placeholder render awaiting real work.</p>
            </div>
          </div>
        </div>
        <div class="stat" style="margin-top:clamp(50px,7vw,110px)">
          ${[["12", "Years in practice"], ["140+", "Commissions delivered"], ["31", "Countries photographed"], ["6", "Exhibitions"]].map(([a, b]) => `<div data-reveal="up"><b>${a}</b><span>${b}</span></div>`).join("")}
        </div>
      </section>
      <section class="wrap">
        <div class="philo" style="height:clamp(460px,72vh,760px)">
          <div class="philo__img" data-parallax="10">${img("golden-ridges", "Layered hills at first light", { sizes: "100vw" })}</div>
          <div class="philo__body"><div>${label(2, "Philosophy")}<h2 class="display" style="margin-top:18px" data-reveal="lines">We wait for the light.<br>Then we wait a little longer.</h2></div></div>
        </div>
      </section>
      <section class="section wrap">
        <div class="split">
          <div>
            ${label(3, "The Photographer")}
            <h2 class="h2" style="margin:18px 0 28px" data-reveal="lines"><strong>Arlo Venn</strong>, founder and lead photographer</h2>
            <div class="prose" data-reveal="up">
              <p>Arlo trained as an architect before swapping drawings for a large-format camera. That background still shows: a love of straight lines, honest materials and the way light describes a space.</p>
              <p>He shoots most commissions himself, with a small team handling production, post and print. Outside of work he walks — usually up something, usually too early.</p>
              <p class="micro">Fictional photographer for demonstration purposes.</p>
            </div>
            <div class="tags" style="margin-top:28px" data-reveal="up">${["Landscape", "Architecture", "Portraiture", "Large-format", "Fine-art printing", "Creative direction", "Colour grading"].map((t) => `<span class="pill">${t}</span>`).join("")}</div>
          </div>
          <div class="media" style="aspect-ratio:4/5" data-reveal="image"><div data-parallax="6" style="height:100%">${img("portrait-sky", "Portrait of the photographer in profile against a pale sky", { sizes: "(max-width:1024px) 100vw, 45vw" })}</div></div>
        </div>
      </section>
      <section class="section wrap">
        <div class="split split--wide">
          ${label(4, "Studio History")}
          <ol class="timeline">
            ${[["2013", "Studio founded in a shared darkroom in Lisbon, shooting architecture for local practices."], ["2016", "First long-form travel commission — six weeks in Japan for a hospitality group."], ["2019", "Moved into a daylight studio and started the Human Expressions portrait series."], ["2022", "Opened print production in-house with archival pigment printing."], ["2025", "Mountain Light exhibited as a limited print edition."]].map(([y, t]) => `<li data-reveal="up"><b>${y}</b><p>${t}</p></li>`).join("")}
          </ol>
        </div>
      </section>
      <section class="section--tight wrap">
        <div class="section-head"><div>${label(5, "Behind the Scenes")}<h2 class="h2" style="margin-top:14px" data-reveal="lines">Notes, scouting and <strong>the in-between</strong></h2></div></div>
        ${masonry("bts", bts)}
      </section>
      ${awardsBlock(6)}
      ${footer()}`
    };
  };

  V.portfolio = () => {
    const all = window.PROJECTS;
    const cats = [...new Set(all.map((p) => p.category))];
    const allImgs = [];
    all.forEach((p) => p.blocks.forEach((b) => { const m = b.split(":")[1]; if (m) m.split("|").forEach((n) => { if (!allImgs.includes(n)) allImgs.push(n); }); }));
    return {
      title: "Portfolio — Creacy",
      lb: { all: allImgs.map(lbItem) },
      html: `
      ${phead(0, "Portfolio", "Selected <strong>work</strong>, 2023 — 2025", `<p>Eight projects across wildlife, landscape, architecture, street, travel and portrait. Filter by discipline or open every frame in the full-screen viewer.</p><button class="btn" data-lb-open="all" data-magnetic><span class="btn__text">View all frames</span><span class="btn__icon">${ICON.expand}</span></button>`)}
      <section class="wrap">
        <div class="feature">
          ${pcard(all[0], { tags: true, sub: true, solid: true, meta: true, sizes: "(max-width:1024px) 100vw, 60vw" })}
          <div class="panel feature__txt">
            <div>${label(0, "Featured")}<h2 class="h2 h2--white" style="margin-top:16px">${esc(all[0].long)}</h2></div>
            <p class="small">${esc(all[0].intent)}</p>
            ${btn("Open case study", `#project-${all[0].slug}`)}
          </div>
        </div>
        <div class="filters" role="group" aria-label="Filter projects" data-filters>
          <button class="pill" aria-pressed="true" data-filter="all">All<span class="count">${all.length}</span></button>
          ${cats.map((c) => `<button class="pill" aria-pressed="false" data-filter="${c}">${cat(c).name}<span class="count">${all.filter((p) => p.category === c).length}</span></button>`).join("")}
        </div>
        <div class="pgrid" data-pgrid>
          ${all.map((p, i) => pcard(p, { meta: true, sub: true, cls: i >= 6 ? "is-hidden is-more" : "" }).replace('class="pcard', `data-cat="${p.category}" class="pcard`)).join("")}
        </div>
        <div class="load-more"><button class="btn" data-load-more data-magnetic><span class="btn__text">Load more</span><span class="btn__icon">${ICON.right}</span></button></div>
      </section>
      <div class="section"></div>
      ${footer()}`
    };
  };

  V.project = (slug) => {
    const p = P(slug);
    if (!p) return null;
    const idx = window.PROJECTS.indexOf(p);
    const next = window.PROJECTS[(idx + 1) % window.PROJECTS.length];
    const imgs = [];
    p.blocks.forEach((b) => { const m = b.split(":")[1]; if (m) m.split("|").forEach((n) => { if (!imgs.includes(n)) imgs.push(n); }); });
    const at = (n) => imgs.indexOf(n);
    const odd = idx % 2 === 1;
    const blocks = p.blocks.map((b) => {
      const [type, arg] = b.split(":");
      if (type === "full") return `<figure class="pblock pblock--full">${lbButton("proj", at(arg), arg, imgMeta(arg).title, { sizes: "100vw" })}</figure>`;
      if (type === "pair") {
        const [a, c] = arg.split("|");
        const land = IMG[a][0] > IMG[a][1] && IMG[c][0] > IMG[c][1];
        return `<div class="pblock pblock--pair ${land ? "is-landscape" : ""} ${odd || !land ? "offset" : ""}">${[a, c].map((n, k) => `<figure>${lbButton("proj", at(n), n, imgMeta(n).title, { sizes: "(max-width:768px) 100vw, 50vw" })}<figcaption class="micro" style="margin-top:10px">${esc(imgMeta(n).title)} — ${esc(imgMeta(n).loc)}</figcaption></figure>`).join("")}</div>`;
      }
      if (type === "stack") {
        const [a, c] = arg.split("|");
        return `<div class="pblock pblock--stack">${lbButton("proj", at(a), a, imgMeta(a).title, { sizes: "45vw" })}<div><p class="small" style="max-width:40ch;margin-bottom:24px" data-reveal="up">${esc(p.approach)}</p>${lbButton("proj", at(c), c, imgMeta(c).title, { sizes: "55vw" })}</div></div>`;
      }
      if (type === "text") return `<section class="ptext"><div>${label(0, "Narrative")}</div><div><h2 class="h2" style="margin-bottom:32px" data-reveal="lines">${esc(p.intent)}</h2><div class="ptext__cols" data-reveal="up">${p.narrative.map((t) => `<p>${esc(t)}</p>`).join("")}</div></div></section>`;
      if (type === "quote") return `<section class="pquote"><div>${label(0, "Photographer's note")}</div><blockquote><p data-reveal="lines">“${esc(p.quote)}”</p><cite>— Arlo Venn, Creacy (fictional)</cite></blockquote></section>`;
      return "";
    }).join("");
    const related = window.PROJECTS.filter((x) => x !== p).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
    return {
      title: `${p.title} — Creacy`,
      lb: { proj: imgs.map(lbItem) },
      html: `
      ${cover(p.hero, imgMeta(p.hero).title, esc(p.long), [["Category", cat(p.category).name], ["Year", String(p.year)], ["Location", p.location]], `<a href="#portfolio">Portfolio</a><span>/</span><span>${esc(p.title)}</span>`)}
      <section class="section wrap">
        <div class="pintro">
          <div>
            ${label(1, "Project")}
            <p class="lede" style="margin-top:20px" data-reveal="up">${esc(p.excerpt)}</p>
            <dl class="pintro__facts" data-reveal="up"><div><dt>Category</dt><dd><a class="link-line" href="#category-${p.category}">${cat(p.category).name}</a></dd></div><div><dt>Year</dt><dd>${p.year}</dd></div><div><dt>Location</dt><dd>${esc(p.location)}</dd></div><div><dt>Frames</dt><dd>${imgs.length} in this edit</dd></div></dl>
          </div>
          <div>
            ${label(2, "Approach")}
            <h2 class="h2" style="margin-top:20px" data-reveal="lines">${esc(p.approach)}</h2>
            <div style="margin-top:28px" data-reveal="up"><button class="btn" data-lb-open="proj" data-magnetic><span class="btn__text">Full-screen gallery</span><span class="btn__icon">${ICON.expand}</span></button></div>
          </div>
        </div>
      </section>
      <div class="wrap">${blocks}</div>
      <section class="section--tight wrap">
        <div style="margin-bottom:22px">${label(3, "Technical & artistic notes")}</div>
        <dl class="notes">${p.notes.map(([k, v]) => `<div data-reveal="up"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      </section>
      <section class="section wrap">
        <div class="section-head"><div>${label(4, "Related Projects")}</div>${btn("All work", "#portfolio")}</div>
        <div class="related">${related.map((r, i) => pcard(r, { meta: true, delay: i * 0.1 })).join("")}</div>
      </section>
      <section class="wrap" style="margin-bottom:clamp(60px,8vw,120px)">
        <a class="next" href="#project-${next.slug}" data-cursor="explore">
          <div class="media">${img(next.hero, next.title, { sizes: "100vw" })}</div>
          <div class="next__body"><span class="caps">Next project</span><span class="display">${esc(next.title)}</span><span class="small" style="color:rgba(255,255,255,.8)">${cat(next.category).name} — ${next.year}</span></div>
        </a>
      </section>
      ${footer()}`
    };
  };

  V.categories = () => ({
    title: "Categories — Creacy",
    html: `
      ${phead(0, "Categories", "Six ways of <strong>looking</strong>", "<p>Every discipline is approached with the same patience. Choose one to browse its full gallery and related projects.</p>")}
      <section class="wrap">
        <div class="cgrid">
          ${window.CATEGORIES.map((c, i) => `
            <a class="ccard" href="#category-${c.slug}" data-cursor="explore" data-reveal="image" data-delay="${(i % 3) * 0.1}">
              <div class="media">${img(c.images[0][0], c.images[0][1], { sizes: "(max-width:480px) 100vw, 33vw" })}<div class="media__shade"></div></div>
              <div class="ccard__body"><div><h2>${c.name}</h2><p>${c.images.length} frames — ${esc(c.line)}</p></div><span class="circle">${ICON.arrow}</span></div>
            </a>`).join("")}
        </div>
      </section>
      <div class="section"></div>
      ${footer()}`
  });

  V.category = (slug) => {
    const c = cat(slug);
    if (!c) return null;
    const names = c.images.map((i) => i[0]);
    const projects = window.PROJECTS.filter((p) => p.category === slug);
    const others = window.CATEGORIES.filter((x) => x !== c);
    return {
      title: `${c.name} — Creacy`,
      lb: { cat: names.map(lbItem) },
      html: `
      ${phead(0, "Category", `${c.name}`, `<p>${esc(c.text)}</p><button class="btn" data-lb-open="cat" data-magnetic><span class="btn__text">View full-screen</span><span class="btn__icon">${ICON.expand}</span></button>`, `<a href="#categories">Categories</a><span>/</span><span>${c.name}</span>`)}
      <section class="wrap">${masonry("cat", names)}</section>
      ${projects.length ? `<section class="section wrap"><div class="section-head"><div>${label(0, `${c.name} projects`)}</div></div><div class="related">${projects.map((p) => pcard(p, { meta: true, sub: true })).join("")}</div></section>` : '<div class="section"></div>'}
      <section class="section--tight wrap">
        <div class="filters" style="margin:0">${others.map((o) => `<a class="pill" href="#category-${o.slug}" style="height:34px;padding:0 18px;background:transparent;border-color:var(--line-2)">${o.name}</a>`).join("")}</div>
      </section>
      ${footer()}`
    };
  };

  V.services = () => ({
    title: "Services — Creacy",
    html: `
      ${phead(0, "Services", "Commissions, built <strong>around the light</strong>", `<p>From a single portrait sitting to multi-week travel assignments. Every engagement starts with a conversation and a written treatment.</p>${btn("Book a shoot", "#booking", { cls: "btn--solid" })}`)}
      <section class="wrap">
        <div class="slist">
          ${window.SERVICES.map((s, i) => `
            <a class="srow" href="#service-${s.slug}" data-reveal="up">
              <span class="micro">${pad(i + 1)}</span>
              <h2>${esc(s.title)}</h2>
              <p>${esc(s.short)}</p>
              <span class="srow__thumb">${img(s.img, "", { sizes: "160px" })}</span>
              <span class="circle">${ICON.arrow}</span>
            </a>`).join("")}
        </div>
      </section>
      <section class="section wrap">
        <div class="process">
          <div class="process__sticky">${label(0, "How we work")}<h2 class="h2" style="margin-top:18px" data-reveal="lines">Seven steps, <strong>no shortcuts</strong></h2></div>
          <ol class="steps">${window.PROCESS.map(([t, d], i) => `<li data-reveal="up"><span class="n">${pad(i + 1)}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join("")}</ol>
        </div>
      </section>
      ${footer()}`
  });

  V.service = (slug) => {
    const s = window.SERVICES.find((x) => x.slug === slug);
    if (!s) return null;
    const others = window.SERVICES.filter((x) => x !== s).slice(0, 4);
    return {
      title: `${s.title} — Creacy`,
      html: `
      ${cover(s.img, imgMeta(s.img).title, esc(s.title), [["Timeline", s.timeline], ["Deliverables", `${s.deliverables.length} stages`], ["Availability", "Booking 2026"]], `<a href="#services">Services</a><span>/</span><span>${esc(s.title)}</span>`)}
      <section class="section wrap">
        <div class="split">
          <div>${label(1, "Overview")}<h2 class="h2" style="margin:20px 0 28px" data-reveal="lines">${esc(s.short)}</h2><div class="prose" data-reveal="up"><p>${esc(s.text)}</p></div>
            <div style="margin-top:28px" data-reveal="up"><a class="btn btn--solid" href="#booking" data-service="${s.slug}" data-magnetic><span class="btn__text">Book this service</span><span class="btn__icon">${ICON.arrow}</span></a></div></div>
          <div>${label(2, "Deliverables")}<ul class="deliv" style="margin-top:20px">${s.deliverables.map((d, i) => `<li data-reveal="up"><span>${pad(i + 1)}</span>${esc(d)}</li>`).join("")}</ul>
            <p class="micro" style="margin-top:18px">Typical timeline: ${esc(s.timeline)}. Pricing is quoted per project after a brief.</p></div>
        </div>
      </section>
      <section class="section--tight wrap">
        <div class="section-head"><div>${label(3, "Related work")}</div></div>
        <div class="related">${s.related.map((r) => pcard(P(r), { meta: true, sub: true })).join("")}</div>
      </section>
      <section class="section wrap">
        <div style="margin-bottom:22px">${label(4, "Other services")}</div>
        <div class="slist">${others.map((o, i) => `<a class="srow" href="#service-${o.slug}"><span class="micro">${pad(i + 1)}</span><h2>${esc(o.title)}</h2><p>${esc(o.short)}</p><span class="srow__thumb">${img(o.img, "", { sizes: "160px" })}</span><span class="circle">${ICON.arrow}</span></a>`).join("")}</div>
      </section>
      ${footer()}`
    };
  };

  const strip = (group, names) => `<div class="hseries__viewport" data-drag-scroll data-cursor="drag" style="overflow-x:auto;scrollbar-width:none"><div class="hseries__track" style="padding-inline:var(--pad)">${names.map((n, i) => `<div style="flex:none;width:${IMG[n][0] > IMG[n][1] ? "clamp(280px,48vw,760px)" : "clamp(220px,28vw,440px)"}">${lbButton(group, i, n, imgMeta(n).title, { sizes: "50vw", style: `aspect-ratio:${IMG[n][0]}/${IMG[n][1]};width:100%;display:block`, reveal: false })}</div>`).join("")}</div></div>`;

  V.series = () => {
    const lb = {};
    window.SERIES.forEach((s) => (lb["s-" + s.slug] = s.images.map(lbItem)));
    return {
      title: "Series — Creacy",
      lb,
      html: `
      ${phead(0, "Series", "Long projects, <strong>slowly assembled</strong>", "<p>Series are the threads that run between commissions — personal bodies of work we return to year after year.</p>")}
      ${window.SERIES.map((s, i) => `
        <section class="section--tight" aria-labelledby="s-${s.slug}">
          <div class="wrap section-head">
            <div>${label(i + 1, s.years)}<h2 class="h2 h2--white" id="s-${s.slug}" style="margin-top:14px">${esc(s.title)}</h2><p class="small" style="max-width:52ch;margin-top:10px">${esc(s.text)}</p></div>
            ${btn("Open series", `#series-${s.slug}`)}
          </div>
          ${strip("s-" + s.slug, s.images)}
        </section>`).join("")}
      <div class="section"></div>
      ${footer()}`
    };
  };

  V.seriesItem = (slug) => {
    const s = window.SERIES.find((x) => x.slug === slug);
    if (!s) return null;
    const i = window.SERIES.indexOf(s);
    const next = window.SERIES[(i + 1) % window.SERIES.length];
    return {
      title: `${s.title} — Creacy`,
      lb: { ser: s.images.map(lbItem), strip: s.images.map(lbItem) },
      html: `
      ${cover(s.images[0], imgMeta(s.images[0]).title, esc(s.title), [["Years", s.years], ["Frames", String(s.images.length)], ["Type", "Personal series"]], `<a href="#series">Series</a><span>/</span><span>${esc(s.title)}</span>`)}
      <section class="section wrap"><div class="split split--wide">${label(1, "About the series")}<h2 class="h2" data-reveal="lines">${esc(s.text)}</h2></div></section>
      <section class="section--tight">
        <div class="wrap section-head"><div>${label(2, "Drag to explore")}</div><button class="btn" data-lb-open="ser" data-magnetic><span class="btn__text">Full-screen</span><span class="btn__icon">${ICON.expand}</span></button></div>
        ${strip("strip", s.images)}
      </section>
      <section class="section wrap">${masonry("ser", s.images)}</section>
      <section class="wrap" style="margin-bottom:clamp(60px,8vw,120px)">
        <a class="next" href="#series-${next.slug}" data-cursor="explore">
          <div class="media">${img(next.images[0], next.title, { sizes: "100vw" })}</div>
          <div class="next__body"><span class="caps">Next series</span><span class="display">${esc(next.title)}</span></div>
        </a>
      </section>
      ${footer()}`
    };
  };

  V.awards = () => ({
    title: "Awards — Creacy",
    html: `
      ${phead(0, "Awards", "<strong>Recognition</strong> and exhibitions", "<p>A record of shortlists, selections and shows. All entries here are illustrative placeholders for the demo.</p>")}
      ${awardsBlock(0, false)}
      <section class="section--tight wrap"><div class="stat">${[["6", "Selections"], ["3", "Group exhibitions"], ["1", "Solo print edition"], ["2026", "Next submission"]].map(([a, b]) => `<div data-reveal="up"><b>${a}</b><span>${b}</span></div>`).join("")}</div></section>
      <div class="section"></div>
      ${footer()}`
  });

  V.journal = () => {
    const [first, ...rest] = window.ARTICLES;
    return {
      title: "Journal — Creacy",
      html: `
      ${phead(0, "Journal", "Field notes on <strong>light and patience</strong>", "<p>Essays, behind-the-scenes stories and craft notes from our commissions and personal series.</p>")}
      <section class="wrap">
        <a class="feature" href="#journal-${first.slug}" style="display:grid">
          <div class="media media--zoom" style="height:clamp(340px,42vw,640px)" data-reveal="image" data-cursor="view">${img(first.img, first.title, { sizes: "(max-width:1024px) 100vw, 60vw", eager: true })}</div>
          <div class="panel feature__txt">
            <div class="jcard__meta"><span>${first.cat}</span><span>${fmtDate(first.date)}</span><span>${first.read} min read</span></div>
            <h2 class="h2 h2--white">${esc(first.title)}</h2>
            <p class="small">${esc(first.dek)}</p>
            <span class="btn"><span class="btn__text">Read story</span><span class="btn__icon">${ICON.arrow}</span></span>
          </div>
        </a>
        <div class="jgrid">${rest.map((a, i) => jcard(a, i)).join("")}</div>
      </section>
      <div class="section"></div>
      ${footer()}`
    };
  };

  V.article = (slug) => {
    const a = window.ARTICLES.find((x) => x.slug === slug);
    if (!a) return null;
    const imgs = a.body.filter((b) => b[0] === "img").map((b) => b[1]);
    let k = 0;
    const body = a.body.map((b) => {
      if (b[0] === "p") return `<p data-reveal="up">${esc(b[1])}</p>`;
      if (b[0] === "h") return `<h2 data-reveal="up">${esc(b[1])}</h2>`;
      if (b[0] === "img") return `<figure>${lbButton("art", k++, b[1], b[2], { sizes: "(max-width:768px) 100vw, 900px" })}<figcaption>${esc(b[2])}</figcaption></figure>`;
      return "";
    }).join("");
    const more = window.ARTICLES.filter((x) => x !== a).slice(0, 3);
    return {
      title: `${a.title} — Creacy Journal`,
      lb: { art: imgs.map((n, i) => ({ img: n, title: a.body.filter((b) => b[0] === "img")[i][2], sub: imgMeta(n).loc })) },
      html: `
      ${cover(a.img, imgMeta(a.img).title, esc(a.title), [["Category", a.cat], ["Published", fmtDate(a.date)], ["Reading", `${a.read} min`]], `<a href="#journal">Journal</a><span>/</span><span>${a.cat}</span>`)}
      <section class="section wrap"><article class="article"><p class="dek" data-reveal="up">${esc(a.dek)}</p>${body}</article></section>
      <section class="section--tight wrap"><div class="section-head"><div>${label(0, "More from the journal")}</div></div><div class="jgrid">${more.map((m, i) => jcard(m, i)).join("")}</div></section>
      <div class="section"></div>
      ${footer()}`
    };
  };

  V.contact = () => ({
    title: "Contact — Creacy",
    html: `
      ${phead(0, "Contact", "Let's make something <strong>quietly remarkable</strong>", "")}
      <section class="wrap">
        <div class="panel book">
          <div style="display:flex;flex-direction:column;gap:30px">
            <div><div class="micro" style="margin-bottom:6px">Email</div><a class="h3 link-line" style="color:var(--white);font-size:var(--fs-h3)" href="mailto:${C.email}">${C.email}</a></div>
            <div><div class="micro" style="margin-bottom:6px">Phone</div><a class="link-line" style="color:var(--white)" href="tel:${C.phone.replace(/[^+\d]/g, "")}">${C.phone}</a></div>
            <div><div class="micro" style="margin-bottom:6px">Studio</div><address class="small" style="font-style:normal">${C.address.join("<br>")}</address></div>
            <div><div class="micro" style="margin-bottom:6px">Hours</div><p class="small">Mon — Fri, 09:00 — 18:00</p></div>
            <div class="footer__social">${C.socials.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join("")}</div>
          </div>
          ${formBlock("contact")}
        </div>
      </section>
      <section class="section wrap"><div class="split">${label(0, "Planning a shoot?")}<div><h2 class="h2" data-reveal="lines">For commissions, the <strong>booking form</strong> gathers everything we need to send a proposal.</h2><div style="margin-top:26px">${btn("Go to booking", "#booking", { cls: "btn--solid" })}</div></div></div></section>
      ${footer()}`
  });

  V.booking = () => ({
    title: "Book a Shoot — Creacy",
    html: `
      ${phead(0, "Booking", "Book a <strong>shoot</strong>", "<p>Tell us about the project and we'll reply within two working days with availability, an approach and a proposal.</p>")}
      <section class="wrap"><div class="panel book" style="background:var(--surface)">
        <ol class="steps">${[["Brief", "You share the essentials using this form."], ["Call", "A 30-minute call to understand the story and constraints."], ["Proposal", "A written treatment, schedule and quote."], ["Shoot", "Scouting, capture, edit and delivery."]].map(([t, d], i) => `<li><span class="n">${pad(i + 1)}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join("")}</ol>
        ${formBlock("booking")}
      </div></section>
      <div class="section"></div>
      ${footer()}`
  });

  const legal = (title, sections) => ({
    title: `${title} — Creacy`,
    html: `${phead(0, "Legal", title, "<p>Template text for a demonstration site. Have it reviewed before publishing a real studio website.</p>")}
      <section class="wrap"><div class="legal">${sections.map(([h, ps]) => `<h2>${h}</h2>${ps.map((p) => (Array.isArray(p) ? `<ul>${p.map((li) => `<li>${li}</li>`).join("")}</ul>` : `<p>${p}</p>`)).join("")}`).join("")}<p class="micro" style="margin-top:3em">Last updated: November 2026.</p></div></section>
      <div class="section"></div>${footer()}`
  });

  V.privacy = () => legal("Privacy Policy", [
    ["What we collect", ["When you send an enquiry we receive the details you enter — typically your name, email address, company, project location, dates, budget range and brief.", "This demo site does not set analytics or advertising cookies."]],
    ["How we use it", [["To reply to your enquiry and prepare a proposal.", "To manage a commission if you go ahead.", "We never sell or share your details for marketing."]]],
    ["Retention", ["Enquiries that don't lead to a project are deleted after 12 months. Client records are kept for as long as required for accounting."]],
    ["Your rights", [`You can ask to see, correct or delete the information we hold about you by writing to ${C.email}.`]]
  ]);

  V.terms = () => legal("Terms & Conditions", [
    ["Use of images", ["All photographs on this site are protected by copyright. Please do not download, reproduce or use them without written permission."]],
    ["Commissions", [["Bookings are confirmed by a signed agreement and deposit.", "Usage rights are defined per project in the licence.", "Weather-dependent shoots include agreed backup dates."]]],
    ["Cancellations", ["Cancellation terms are set out in each project agreement. Deposits cover scouting and preparation already completed."]],
    ["Liability", ["The studio is not liable for indirect losses arising from the use of this website or its content."]]
  ]);

  V.notFound = () => ({
    title: "Not found — Creacy",
    html: `<section class="nf"><div class="nf__img">${img("blue-dunes", "Dunes after sunset", { sizes: "100vw", eager: true })}</div><div><h1><b>404</b><span class="sr-only">Page not found</span></h1><p class="lede" style="margin:10px auto 28px">This frame didn't make the edit. The page you were looking for doesn't exist.</p>${btn("Back to home", "#home", { cls: "btn--solid" })}</div></section>`
  });

  window.VIEWS = V;
  window.UI = { ICON, LOGO, img, esc, pad, imgMeta, lbItem };
})();
