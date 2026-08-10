import HoverPosterHorizontal from "./HoverPosterHorizontal";
import HoverPosterVertical from "./HoverPosterVertical";

/**
 * HoverGrid — вариант «Ховер». Состояния нет: просто два ряда постеров, где
 * каждый сам раскрывается по наведению (чистый CSS `:hover`).
 */
export default function HoverGrid({ horizontalPosters, verticalPosters }) {
  return (
    <div className="gallery">
      {horizontalPosters.length > 0 && (
        <div className="gallery__row gallery__row--horizontal">
          {horizontalPosters.map((poster) => (
            <HoverPosterHorizontal key={poster.id} data={poster} />
          ))}
        </div>
      )}

      <div className="gallery__row gallery__row--vertical">
        {verticalPosters.map((poster) => (
          <HoverPosterVertical key={poster.id} data={poster} />
        ))}
      </div>
    </div>
  );
}
