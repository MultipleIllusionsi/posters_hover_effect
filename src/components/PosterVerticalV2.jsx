import { IconFavorite, IconPlay } from "./icons";
import "./PosterVerticalV2.css";

/**
 * PosterVerticalV2 — the second hover treatment (Figma node 27:657).
 *
 * Unlike the v1 card, the poster itself never changes: on hover a block of
 * actions + description rises from the bottom, overlapping the poster's lower
 * edge by 48px and continuing below it, with a gradient darkening what's behind.
 *
 * Self-contained and CSS-only — the whole interaction is `:hover` on the root,
 * so this component holds no state and needs nothing from <PosterGrid>.
 */
export default function PosterVerticalV2({ data, className = "", ...rest }) {
  return (
    <div className={`poster-v2 ${className}`.trim()} {...rest}>
      {/* The gradient sits inside the media so it scales — and clips to the
          rounded corners — along with the artwork it darkens. */}
      <div className="poster-v2__media">
        <img className="poster-v2__image" src={data.src} alt={data.alt} />
        <span className="poster-v2__gradient" aria-hidden="true" />
      </div>

      <div className="poster-v2__overlay">
        <div className="poster-v2__actions">
          <button type="button" className="poster-v2__watch">
            <IconPlay />
            Смотреть
          </button>
          <button type="button" className="poster-v2__fav" aria-label="В избранное">
            <IconFavorite />
          </button>
        </div>

        <div className="poster-v2__text">
          <p className="poster-v2__description">{data.description}</p>
          {data.meta?.length > 0 && (
            <p className="poster-v2__meta">
              {data.meta.map((chip, i) => (
                <span key={chip}>
                  {i > 0 && <span className="poster-v2__dot">·</span>}
                  {chip}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
