# CHRONOSCOPY — film presentation site

Single-page animated microsite for the sci-fi thriller *Chronoscopy* (dir. Stanislav Tiunov).

## Run
Any static server, e.g.:
    python3 -m http.server 8777
then open http://localhost:8777

Or just open `index.html` (needs internet for fonts + GSAP/Lenis CDNs + the YouTube teaser embed).

## Structure
- `index.html` — markup / content
- `css/styles.css` — OKLCH design tokens, layout, type
- `js/app.js` — GSAP + ScrollTrigger + Lenis motion, loader, cursor, magnetic CTA, teaser lightbox
- `assets/img/` — stills pulled & graded from the official teaser

## Stack
Vanilla HTML/CSS/JS · GSAP 3.12 + ScrollTrigger · Lenis smooth-scroll · Google Fonts
(Bricolage Grotesque / Newsreader / Space Mono). Respects `prefers-reduced-motion`.

## Deploy
Drop the folder on Netlify / Vercel / Cloudflare Pages / GitHub Pages as-is (fully static).
