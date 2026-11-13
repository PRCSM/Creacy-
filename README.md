# Creacy — Cinematic Photography Portfolio

A dark, editorial multi-page photography studio website: GSAP + ScrollTrigger reveals, Lenis smooth scrolling, a custom cursor and scrollbar, draggable galleries, a full-screen lightbox, a pinned horizontal series section and cinematic page transitions.

It is a static site (no build step). Routing is hash-based (`#portfolio`, `#project-mountain-light`, …).

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Shell: header, menu, lightbox, cursor, scrollbar, scripts |
| `styles.css` | Design tokens, components, responsive rules |
| `data.js` | All content: projects, categories, series, services, awards, journal, config |
| `views.js` | Page templates for every route |
| `app.js` | Router, motion system, galleries, lightbox, cursor, forms |
| `img/` | Images (`name.jpg` 1600px + `name-sm.jpg` 800px) |
| `tools/scenes.py` | Generator for the placeholder images |

## Before going live

- **Images** are generated placeholders. Replace files in `img/` keeping the same names (or edit names in `data.js`), then update `img-manifest.js` with width, height and a fallback colour.
- **Forms**: set `CONFIG.formEndpoint` in `data.js` to a form backend (Formspree, Basin, your API). Without it, forms validate and offer an email draft — they never pretend to send.
- **Content**: studio, people, clients and awards are fictional demo content.

## Deploy

Static hosting — Vercel deploys it as-is (Framework preset: *Other*, no build command, output directory `.`).
