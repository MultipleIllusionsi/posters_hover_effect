import { forwardRef } from "react";
import "./PosterVertical.css";

/**
 * PosterVertical — the portrait poster format (bottom row of the gallery).
 * Figma: nodes 1:43 / 1:50 / 1:42 / 1:39 / 1:40 / 1:41, aspect ~222.67×337, radius 24px.
 *
 * Purely presentational. Hover state lives in <PosterGrid>, which owns the single
 * card shared by every poster: `covered` says the card is sitting on top of this
 * poster, `dimmed` that it is open somewhere else in the gallery.
 */
const PosterVertical = forwardRef(function PosterVertical(
  { src, alt = "", covered = false, dimmed = false, className = "", ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={[
        "poster-vertical",
        covered && "poster-vertical--covered",
        dimmed && "poster-vertical--dimmed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className="poster-vertical__media">
        <img className="poster-vertical__image" src={src} alt={alt} />
      </div>
    </div>
  );
});

export default PosterVertical;
