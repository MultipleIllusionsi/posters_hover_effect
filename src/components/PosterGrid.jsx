import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PosterHorizontal from "./PosterHorizontal";
import PosterHorizontalV2 from "./PosterHorizontalV2";
import PosterVertical from "./PosterVertical";
import PosterVerticalV2 from "./PosterVerticalV2";
import PosterVerticalV3 from "./PosterVerticalV3";
import PosterHover from "./PosterHover";
import PosterBottomsheet from "./PosterBottomsheet";
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

/** v4 bottom sheet — keep in sync with the exit animation in PosterBottomsheet.css. */
const SHEET_EXIT_DURATION = 360;

/**
 * Every PosterGrid on the page registers its immediate-close function here. The
 * bottom sheet is a page-level singleton — each gallery renders its own, so when
 * one opens we close any other that's still up, leaving only the newest.
 */
const sheetClosers = new Set();

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

/** Fraction of the viewport the v4 bottom sheet covers (see PosterBottomsheet.css). */
const SHEET_VH = 0.3;

/**
 * Scroll the page just enough that the clicked poster sits fully inside the
 * visible band — the viewport minus the bottom sheet's 30vh and a small margin.
 * Nudges up when the poster is clipped at the top, down when it's clipped (or
 * hidden behind the sheet) at the bottom; a poster taller than the band is
 * aligned to the top so its start is always in view.
 */
const revealPoster = (el) => {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const margin = 16;
  const topBound = margin;
  const bottomBound = window.innerHeight * (1 - SHEET_VH) - margin;

  let delta = 0;
  if (rect.height > bottomBound - topBound || rect.top < topBound) {
    delta = rect.top - topBound; // align to the top of the band
  } else if (rect.bottom > bottomBound) {
    delta = rect.bottom - bottomBound; // pull up above the sheet
  }

  if (delta !== 0) {
    window.scrollBy({ top: delta, behavior: "smooth" });
  }
};

/**
 * PosterGrid — both poster rows and the ONE hover card they all share.
 *
 * The card lives at grid level rather than row level, so moving from a vertical
 * poster to a horizontal one is the same smooth slide as moving between two
 * vertical ones: the card is never unmounted, only its position, size and
 * content change.
 *
 * `verticalHover` picks the treatment for the whole section:
 *   "v1" — the shared card described above, for both rows.
 *   "v2" — <PosterVerticalV2> + <PosterHorizontalV2>.
 *   "v3" — <PosterVerticalV3> for the vertical row; the horizontal row is the
 *          same as in v2.
 * Outside v1 nothing calls show(), so the shared card stays unmounted and the
 * machinery below simply sits idle.
 */
export default function PosterGrid({ horizontalPosters, verticalPosters, verticalHover = "v1" }) {
  const useCard = verticalHover === "v1";
  const useSheet = verticalHover === "v4";

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
  // v4 only — the poster whose content the bottom sheet is showing (null = closed).
  const [sheetItem, setSheetItem] = useState(null);
  // While closing, the sheet stays mounted so it can play its exit animation.
  const [sheetLeaving, setSheetLeaving] = useState(false);
  const sheetExitTimer = useRef(null);
  // Closes this grid's sheet at once, no exit animation — used when another
  // gallery's sheet takes over so two are never on screen together.
  const closeSheetNow = useCallback(() => {
    clearTimeout(sheetExitTimer.current);
    setSheetLeaving(false);
    setSheetItem(null);
    document.body.classList.remove("has-bottom-sheet");
  }, []);
  const openSheet = useCallback(
    (item, el) => {
      // Singleton: close any sheet still open in another gallery first.
      sheetClosers.forEach((close) => {
        if (close !== closeSheetNow) close();
      });
      // Opening (or switching posters) cancels any in-flight close.
      clearTimeout(sheetExitTimer.current);
      setSheetLeaving(false);
      setSheetItem(item);
      // Add the bottom scroll room *before* revealing, so a poster in the last
      // row has somewhere to scroll up to and can clear the sheet.
      document.body.classList.add("has-bottom-sheet");
      revealPoster(el);
    },
    [closeSheetNow]
  );
  const closeSheet = useCallback(() => {
    setSheetLeaving(true);
    clearTimeout(sheetExitTimer.current);
    sheetExitTimer.current = setTimeout(() => {
      setSheetItem(null);
      setSheetLeaving(false);
      document.body.classList.remove("has-bottom-sheet");
    }, SHEET_EXIT_DURATION);
  }, []);
  // Register this grid's immediate-closer so other galleries can pre-empt it.
  useEffect(() => {
    sheetClosers.add(closeSheetNow);
    return () => sheetClosers.delete(closeSheetNow);
  }, [closeSheetNow]);
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
      clearTimeout(sheetExitTimer.current);
      document.body.classList.remove("has-bottom-sheet");
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

  // Switching treatments unmounts the v1 vertical posters, so drop any card
  // that's open over one — its measured geometry no longer refers to anything.
  useEffect(() => {
    clearTimeout(timer.current);
    clearTimeout(exitTimer.current);
    clearTimeout(sheetExitTimer.current);
    setActive(null);
    setLeaving(false);
    setSheetItem(null);
    setSheetLeaving(false);
    document.body.classList.remove("has-bottom-sheet");
  }, [verticalHover]);

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
        {horizontalPosters.map((poster, i) =>
          useCard ? (
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
          ) : useSheet ? (
            /* v4 — the poster is a button that opens the bottom sheet. */
            <PosterHorizontal
              key={poster.id}
              src={poster.src}
              alt={poster.alt}
              className={`poster--clickable${sheetItem?.id === poster.id ? " poster--selected" : ""}`}
              onClick={(e) => openSheet({ ...poster, variant: "horizontal" }, e.currentTarget)}
            />
          ) : (
            /* v2 and v3 share the same horizontal treatment. */
            <PosterHorizontalV2 key={poster.id} data={poster} />
          )
        )}
      </div>

      <div className="gallery__row gallery__row--vertical">
        {verticalPosters.map((poster, j) => {
          // v2 / v3 posters own their hover entirely — no ref, no shared card.
          if (verticalHover === "v2") {
            return <PosterVerticalV2 key={poster.id} data={poster} />;
          }
          if (verticalHover === "v3") {
            return <PosterVerticalV3 key={poster.id} data={poster} />;
          }
          if (verticalHover === "v4") {
            return (
              <PosterVertical
                key={poster.id}
                src={poster.src}
                alt={poster.alt}
                className={`poster--clickable${sheetItem?.id === poster.id ? " poster--selected" : ""}`}
                onClick={(e) => openSheet({ ...poster, variant: "vertical" }, e.currentTarget)}
              />
            );
          }

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

      {useSheet && sheetItem && (
        <PosterBottomsheet data={sheetItem} onClose={closeSheet} leaving={sheetLeaving} />
      )}
    </div>
  );
}
