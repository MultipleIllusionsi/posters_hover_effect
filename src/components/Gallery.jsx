import PosterGrid from "./PosterGrid";
import "./Gallery.css";

/**
 * Gallery — one titled section of the page (Figma node 1:29).
 *
 * Layout:
 *   Row 1 — horizontal posters, full grid width.
 *   Row 2 — vertical posters, full grid width.
 * Grid width = 100% of the screen minus 32px gutters on each side
 * (the .gallery-page horizontal padding provides those gutters).
 *
 * <PosterGrid> renders both rows and the single hover card they share. Each
 * section gets its own card, so the page can hold as many galleries as needed;
 * content comes from data/postersData.js.
 */
export default function Gallery({ title, horizontalPosters, verticalPosters, verticalHover }) {
  return (
    <section className="gallery-page">
      <header className="gallery-header">
        <h2 className="gallery-header__title">{title}</h2>
        <span className="gallery-header__arrow" aria-hidden="true">
          <svg width="8" height="20" viewBox="0 0 8 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 1L7 10L1 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </header>

      <PosterGrid
        horizontalPosters={horizontalPosters}
        verticalPosters={verticalPosters}
        verticalHover={verticalHover}
      />
    </section>
  );
}
