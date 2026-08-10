# Gallery — «Онлайн-кинотеатр Иви»

React + Vite demo for trying different poster-interaction treatments. The page
renders a few galleries of posters; a fixed toggle (top right) switches the whole
page between **three** interaction variants.

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

## The three variants

Each variant is a **self-contained module** with its own components *and* its own
CSS classes — nothing is shared between them, so restyling one can never affect
another. `Gallery` picks the grid for the current `mode`.

| mode | UI label | What it does |
| --- | --- | --- |
| `hover` | **Ховер** | Pure CSS hover: the poster darkens and reveals a trailer, badge, description and actions *inside its own box*. No state. |
| `sheet` | **Шторка** | Click a poster to raise one shared panel pinned to the bottom of the screen (trailer + Инфо / Сезоны / Отзывы tabs). |
| `combined` | **Совмещённый** | Hover shows the logo/description on the poster; a click expands a full-width card inline under the row (Инфо / Сезоны / Похожее), pushing content below it down. |

## Structure

```
index.html              Vite entry
vite.config.js
src/
  main.jsx              React root
  App.jsx               mode state + <Gallery /> per gallery + <ModeToggle />
  index.css             page baseline (black bg, iviSans font faces)
  components/
    Gallery.jsx/.css          section header + the grid for the active mode
    ModeToggle.jsx/.css       fixed toggle that switches the variant
    TextBadge.jsx/.css        shared icon + label chip
    icons.jsx                 shared inline SVG icons
    hover/                    ── variant «Ховер»
      HoverGrid.jsx                   two rows, no state
      HoverPosterHorizontal.jsx/.css
      HoverPosterVertical.jsx/.css
    sheet/                    ── variant «Шторка»
      SheetGrid.jsx                   clickable posters + the bottom panel
      SheetPoster.jsx/.css            simple poster-button (shape: vertical|horizontal)
      SheetPanel.jsx/.css             the bottom sheet
    combined/                 ── variant «Совмещённый»
      CombinedGrid.jsx                clickable posters + the inline expander
      CombinedPosterHorizontal.jsx/.css
      CombinedPosterVertical.jsx/.css
      CombinedCard.jsx/.css           the inline-expanding card
  data/
    postersData.js      content of every poster + the galleries — edit this
    badges.js           the TextBadge catalog
```

Each variant's CSS classes are namespaced by variant (`.hover-*`, `.sheet-*`,
`.combined-*`), so a class only ever styles the variant it belongs to.

## How each variant works

- **Ховер** — entirely CSS `:hover`; the small JS only drives the trailer
  (play/pause on hover, mute toggle). Nothing leaves the poster's rounded box.
- **Шторка** — the panel is a page-level **singleton**: each gallery renders its
  own, and opening one closes any other still up. Clicking another poster swaps
  the panel's content instead of closing it; ✕ or a click on empty space closes.
  On open the page scrolls just enough (`revealPoster` in `SheetGrid.jsx`) to
  clear the panel, and `body.has-bottom-sheet` adds bottom room for it.
- **Совмещённый** — the card expands inline right after the row of the clicked
  poster (so it opens from that row and pushes everything below down). Switching
  to a poster in the *other* row keeps the old card collapsing in place while the
  new one opens, so a cross-row switch looks continuous. Also a singleton.

All animations respect `prefers-reduced-motion`.

## Content

Every poster renders **its own** payload — nothing is hard-coded in the
components. See the shape documented at the top of `src/data/postersData.js`:
`meta`, `badge`, `description`, `longDescription`, `logo`, `trailer`, `still`,
`seasons[].episodes[]`, `reviews[]`. Related titles for «Похожее» come from the
`similarItems` export; badges come from `src/data/badges.js`.

- **Trailer**: set `trailer` to a video URL and it plays muted/looped in the
  reveal. Without it the components fall back to the still (`still`, else the
  poster art).
- **Images** may point to temporary Figma asset URLs that expire — swap in your
  own CDN sources before deploying.
- **Font**: the design uses `iviSans Base`, loaded via `@font-face` in
  `src/index.css` from `assets/fonts/`.

## Layout

- Page has 32px side padding, so a row spans `100vw − 64px`.
- Both rows are flex; each poster is `flex: 1 1 0`, so they split the row evenly.
- Row gaps: 8px. Radii: 32px (horizontal), 24px (vertical).
- The «Совмещённый» card breaks out of the side gutters to span the full viewport
  width; `body { overflow-x: hidden }` keeps that from adding a horizontal scroll.
