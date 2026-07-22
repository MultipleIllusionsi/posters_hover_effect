import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PosterHorizontal from "./PosterHorizontal";
import PosterVertical from "./PosterVertical";
import PosterHover from "./PosterHover";
import "./PosterGrid.css";

/** Dwell time before the card opens for the first time (Figma spec: 0.5s). */
const HOVER_DELAY = 500;

/**
 * Dwell time before an open card moves to another poster. Short enough to feel
 * immediate, long enough that dragging the pointer across the row doesn't make
 * the card chase it from poster to poster.
 */
const SWITCH_DELAY = 120;

/** Keep in sync with the fade-out transition in PosterGrid.css. */
const EXIT_DURATION = 240;

/**
 * How big the card is relative to the poster it covers.
 *
 * vertical   — the Figma ratios (380÷222.667 and 388÷337, node 10:417) scaled by
 *              0.9 so the card covers less of its neighbours.
 * horizontal — 1:1. The landscape poster is already large enough to hold the
 *              trailer, text and actions, so the card just fills its box.
 */
const CARD_RATIOS = {
  vertical: { w: 1.7066 * 0.9, h: 1.1513 * 0.9 },
  horizontal: { w: 1, h: 1 },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

/**
 * PosterGrid — both poster rows and the ONE hover card they all share.
 *
 * The card lives at grid level rather than row level, so moving from a vertical
 * poster to a horizontal one is the same smooth slide as moving between two
 * vertical ones: the card is never unmounted, only its position, size and
 * content change.
 */
export default function PosterGrid({ horizontalPosters, verticalPosters }) {
  // One flat list so a poster is addressed by a single index, whichever row
  // it's in. Horizontal posters come first, matching the render order.
  const items = useMemo(
    () => [
      ...horizontalPosters.map((p) => ({ ...p, variant: "horizontal" })),
      ...verticalPosters.map((p) => ({ ...p, variant: "vertical" })),
    ],
    [horizontalPosters, verticalPosters]
  );

  const [active, setActive] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [geom, setGeom] = useState(null);
  const gridRef = useRef(null);
  const itemRefs = useRef([]);
  const timer = useRef(null);
  const exitTimer = useRef(null);

  /** Where the card sits for item `index`, in grid-relative pixels. */
  const measure = useCallback(
    (index) => {
      const grid = gridRef.current;
      const item = itemRefs.current[index];
      if (!grid || !item) return null;

      const { w, h } = CARD_RATIOS[items[index].variant];
      const width = item.offsetWidth * w;
      const height = item.offsetHeight * h;

      // Centre on the poster, then keep the card inside the grid horizontally so
      // the first and last posters of a row can't push it off the page.
      const x = clamp(
        item.offsetLeft + item.offsetWidth / 2 - width / 2,
        0,
        grid.offsetWidth - width
      );
      const y = item.offsetTop + item.offsetHeight / 2 - height / 2;

      return { x, y, width, height };
    },
    [items]
  );

  const openAt = useCallback(
    (index) => {
      setActive(index);
      setGeom(measure(index));
    },
    [measure]
  );

  const show = (index) => {
    clearTimeout(timer.current);
    // Coming back mid-fade: cancel the exit and let the transition run backwards.
    clearTimeout(exitTimer.current);
    setLeaving(false);

    // Back on the poster the card already covers — nothing to schedule.
    if (index === active) return;

    // Already open → short hop to the next poster; otherwise the full dwell.
    const delay = active === null ? HOVER_DELAY : SWITCH_DELAY;
    timer.current = setTimeout(() => openAt(index), delay);
  };

  // Fade the card out first, then unmount it once the transition has finished.
  const close = () => {
    clearTimeout(timer.current);
    if (active === null) return;
    setLeaving(true);
    exitTimer.current = setTimeout(() => {
      setActive(null);
      setLeaving(false);
    }, EXIT_DURATION);
  };

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(exitTimer.current);
    },
    []
  );

  // Posters are fluid (`flex: 1 1 0`), so the card has to be re-measured when
  // the viewport changes while it's open.
  useEffect(() => {
    if (active === null) return undefined;
    const onResize = () => setGeom(measure(active));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, measure]);

  const setItemRef = (index) => (el) => {
    itemRefs.current[index] = el;
  };

  const activeItem = active === null ? null : items[active];
  // While a card is up, every other poster in the section steps back. Drops as
  // soon as the exit starts, so the gallery brightens as the card fades.
  const dimOthers = active !== null && !leaving;

  return (
    // The card is a DOM descendant of the grid, so moving the pointer onto it
    // does not count as leaving — only leaving both closes it.
    <div ref={gridRef} className="gallery poster-grid" onMouseLeave={close}>
      <div className="gallery__row gallery__row--horizontal">
        {horizontalPosters.map((poster, i) => (
          <PosterHorizontal
            key={poster.id}
            ref={setItemRef(i)}
            src={poster.src}
            alt={poster.alt}
            /* Bring the artwork back while the card fades out, not after. */
            covered={active === i && !leaving}
            dimmed={dimOthers && active !== i}
            onMouseEnter={() => show(i)}
          />
        ))}
      </div>

      <div className="gallery__row gallery__row--vertical">
        {verticalPosters.map((poster, j) => {
          const i = horizontalPosters.length + j;
          return (
            <PosterVertical
              key={poster.id}
              ref={setItemRef(i)}
              src={poster.src}
              alt={poster.alt}
              covered={active === i && !leaving}
              dimmed={dimOthers && active !== i}
              onMouseEnter={() => show(i)}
            />
          );
        })}
      </div>

      {activeItem && geom && (
        <div
          className={`poster-grid__card${leaving ? " poster-grid__card--leaving" : ""}`}
          style={{
            width: geom.width,
            height: geom.height,
            transform: `translate(${geom.x}px, ${geom.y}px)`,
          }}
        >
          <PosterHover data={activeItem} poster={activeItem.src} variant={activeItem.variant} />
        </div>
      )}
    </div>
  );
}
