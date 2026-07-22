import { IconFavorite, IconPlay } from "./icons";
import "./PosterVerticalV3.css";

/**
 * PosterVerticalV3 — third hover treatment for the portrait poster.
 *
 * Same content as v2, but nothing leaves the poster: on hover the whole poster
 * darkens and the actions and description sit on top of it, inset from the
 * edges. Because everything is clipped to the poster's rounded box, this
 * variant never overlaps its neighbours or the row below.
 *
 * CSS-only, like v2 — the interaction is `:hover` on the root.
 */
export default function PosterVerticalV3({ data, className = "", ...rest }) {
  return (
    <div className={`poster-v3 ${className}`.trim()} {...rest}>
      <div className="poster-v3__media">
        <img className="poster-v3__image" src={data.src} alt={data.alt} />

        <span className="poster-v3__scrim" aria-hidden="true" />

        <div className="poster-v3__overlay">
          <div className="poster-v3__text">
            <p className="poster-v3__description">{data.description}</p>
            {data.meta?.length > 0 && (
              <p className="poster-v3__meta">
                {data.meta.map((chip, i) => (
                  <span key={chip}>
                    {i > 0 && <span className="poster-v3__dot">·</span>}
                    {chip}
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="poster-v3__actions">
            <button type="button" className="poster-v3__watch">
              <IconPlay />
              Смотреть
            </button>
            <button type="button" className="poster-v3__fav" aria-label="В избранное">
              <IconFavorite />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
