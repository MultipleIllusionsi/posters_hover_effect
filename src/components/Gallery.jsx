import HoverGrid from "./hover/HoverGrid";
import SheetGrid from "./sheet/SheetGrid";
import CombinedGrid from "./combined/CombinedGrid";
import "./Gallery.css";

// Каждому режиму — свой самодостаточный грид.
const GRIDS = {
  hover: HoverGrid,
  sheet: SheetGrid,
  combined: CombinedGrid,
};

/**
 * Gallery — одна озаглавленная секция страницы.
 *
 * Раскладка:
 *   Ряд 1 — горизонтальные постеры, во всю ширину сетки.
 *   Ряд 2 — вертикальные постеры, во всю ширину сетки.
 * Ширина сетки = 100% экрана минус отступы по 32px с каждой стороны (их даёт
 * горизонтальный паддинг .gallery-page).
 *
 * По `mode` выбирается грид взаимодействия (Ховер / Шторка / Совмещённый); он
 * рендерит оба ряда и всю свою логику. Контент — из data/postersData.js.
 */
export default function Gallery({ title, horizontalPosters, verticalPosters, mode }) {
  const Grid = GRIDS[mode] ?? HoverGrid;

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

      <Grid horizontalPosters={horizontalPosters} verticalPosters={verticalPosters} />
    </section>
  );
}
