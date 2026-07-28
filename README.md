# Gallery — «Онлайн-кинотеатр Иви»

React + Vite implementation of Figma node `1:29`, with the vertical-poster hover
card from node `10:417`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # → dist/
npm run preview  # serve dist/ locally to check the production build
```

Requires Node 18+ (developed on Node 22).

## Deployment

`npm run build` emits a fully static `dist/` — no server, no env vars, no API.
`vite.config.js` sets `base: "./"`, so `dist/` works at a domain root *and* in a
subfolder (GitHub Pages project sites, S3 prefixes) without changes.

| Host | Setting |
| --- | --- |
| Vercel / Netlify / Cloudflare Pages | build `npm run build`, output `dist` |
| GitHub Pages | push `dist/` (or use an action); `base: "./"` already handles the subpath |
| Any static server / nginx / S3 | upload the contents of `dist/` |

There is no client-side router, so no SPA rewrite rule is needed.

## Structure

```
index.html              Vite entry
vite.config.js
src/
  main.jsx              React root
  App.jsx               renders <Gallery />
  index.css             page baseline (black bg, font stack)
  components/
    Gallery.jsx/.css          the section: header + <PosterGrid />
    PosterGrid.jsx/.css       both rows + the one hover card they all share
    PosterHorizontal.jsx/.css landscape poster (presentational only)
    PosterVertical.jsx/.css   portrait poster (presentational only)
    PosterHover.jsx/.css      the contents of the hover card
  data/
    postersData.js      content of every poster — this is the file you edit
```

## Hover behaviour
- **One card for the whole section, not one per poster.** `PosterGrid` owns a
  single `<PosterHover>` instance, positions it over the active poster and slides
  it when you move to another one. Switching posters is a content swap plus a
  `transform` animation — the card is never unmounted and remounted, so there's
  no flicker. Because the card lives at *grid* level (not row level), moving
  from a vertical poster to a horizontal one is the same smooth slide.
- Hovering a poster for **500 ms** (`HOVER_DELAY` in `PosterGrid.jsx`) opens the
  card. That delay applies **only to opening from scratch** — while the card is
  up, moving to another poster switches instantly.
- The card closes when the pointer leaves the grid. The card is a DOM descendant
  of the grid, so moving onto the card itself never counts as leaving.
- **Enter**: fade + scale in over 220 ms, `cubic-bezier(.16,1,.3,1)`
  (`@keyframes poster-hover-in`). **Slide** between posters: 320 ms, same curve.
  **Exit**: opacity 1 → 0 and `blur(0)` → `blur(40px)` over 240 ms `ease-in`; the
  card stays mounted for that long (`EXIT_DURATION`), then unmounts. Coming back
  mid-fade just drops the class, so the transition reverses instead of
  restarting. All respect `prefers-reduced-motion`.
- **Size**: `CARD_RATIOS` in `PosterGrid.jsx` gives the card's size as a multiple
  of the poster it covers.
  - `vertical` — the Figma ratios (380 ÷ 222.667 and 388 ÷ 337) scaled by **0.9**
    so the card covers less of its neighbours. Both scale together, so the card
    keeps its 380:388 shape — change the single `0.9` to retune.
  - `horizontal` — `1 × 1`: the card is exactly the poster's size. The landscape
    poster is already big enough to hold the trailer, text and actions.
- The card is centred on its poster, then clamped to the grid's horizontal
  bounds, so the first and last posters of a row can't push it off the page.
- Switching posters resets the card to the «Инфо» tab.
- **Horizontal variant** (`.poster-hover--horizontal`): same card, but the
  trailer is 2/3 of the card width with gradients fading its left and right edges
  into the background, and everything is centred — the tags + description within
  that same 2/3 column, the season tabs, the episode list and reviews, and the
  action bar (the watch button is fixed at 160px there so the group centres as
  one block). Episode rows keep their own left-to-right rhythm (still, then
  title); it's the list as a block that is centred.
- Tabs **Инфо / Сезоны / Отзывы** switch the body only; the bottom action bar
  (tabs + В избранное + red Смотреть) never moves. Under «Сезоны», a second row
  of season tabs appears when the show has more than one season.
- The red Смотреть button still fills the leftover row width, but is capped at
  `max-width: 160px`.

## Content
Every poster renders **its own** payload — nothing is hard-coded in the
component. See the shape documented at the top of `src/data/postersData.js`:
`meta`, `description`, `trailer`, `still`, `seasons[].episodes[]`, `reviews[]`.

- **Trailer**: set `trailer` to a video URL and it autoplays muted/looped inside
  the card (`<video autoplay muted loop playsinline>`). Without it the card falls
  back to the still frame (`still`, else the poster art) — the sample data has no
  trailer URLs, so add yours to see the video path.
- **Отзывы** has no Figma variant; it reuses the episode-list styling. Adjust
  `.poster-hover__review*` once the design lands.
- **Images** point to temporary Figma asset URLs that expire ~7 days after they
  were generated — swap in your own CDN sources before deploying. The four
  episode stills are reused across shows for the demo.
- **Font**: the design uses `iviSans Base`. Load it in your app (`@font-face` or
  your font pipeline); `src/index.css` falls back to the system sans-serif.

## Layout
- Page has 32px side padding, so the grid spans `100vw − 32px` on each side.
- Both rows are flex; each poster is `flex: 1 1 0` so they split the row width evenly.
- Row gaps: 8px. Radii: 32px (horizontal), 24px (vertical), 28px (hover card).
- The hover card is absolutely positioned inside `.poster-row`, which is the
  only positioned ancestor — that's what makes its `offsetLeft`-based placement
  and the row-bounds clamping work.
