import { forwardRef } from "react";
import "./PosterHorizontal.css";

/**
 * PosterHorizontal — the landscape poster format (top row of the gallery).
 * Figma: node 1:52 / 1:35, aspect 676×380, radius 32px.
 *
 * Purely presentational, like PosterVertical. Hover state lives in <PosterGrid>,
 * which owns the single card shared by every poster in the section: `covered`
 * says the card is sitting on top of this poster, `dimmed` that it is open
 * somewhere else in the gallery.
 */
const PosterHorizontal = forwardRef(function PosterHorizontal(
  { src, alt = "", covered = false, dimmed = false, className = "", ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={[
        "poster-horizontal",
        covered && "poster-horizontal--covered",
        dimmed && "poster-horizontal--dimmed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className="poster-horizontal__media">
        <img className="poster-horizontal__image" src={src} alt={alt} />
      </div>
    </div>
  );
});

export default PosterHorizontal;
