import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconPlay, IconSoundOff, IconSoundOn } from "./icons";
import "./PosterHorizontalV2.css";

/**
 * PosterHorizontalV2 — the landscape counterpart of PosterVerticalV2.
 *
 * Same idea: the poster keeps its place and size, and the content appears on
 * top of it. The landscape box is wide enough to split, so instead of rising
 * from below, the reveal fills the card — a trailer along the left 70%, a
 * gradient darkening the right, and text with the actions beneath it in the
 * remaining third.
 *
 * The one bit that can't be pure CSS (unlike the vertical v2) is the trailer:
 * the <video> is always in the DOM so it can fade in, but it carries
 * `preload="none"` and is only played on hover, so nothing downloads until you
 * actually hover the poster.
 */
export default function PosterHorizontalV2({ data, className = "", ...rest }) {
  const [hovered, setHovered] = useState(false);
  // Trailers start silent — autoplay with sound is blocked by every browser.
  // The click that unmutes is the gesture that permits it.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hovered) {
      // Ignore the rejection browsers throw when the pointer leaves before the
      // clip has loaded enough to start.
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered]);

  // React only applies `muted` when the <video> first mounts, and this one
  // stays mounted for the life of the poster — so sync the property by hand.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  return (
    <div
      className={`poster-h2 ${hovered ? "poster-h2--hovered" : ""} ${className}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        // Next hover starts silent again, like the first one.
        setMuted(true);
      }}
      {...rest}
    >
      {/* Everything that scales lives in __media: the artwork, the trailer and
          the gradient move as one, so the dimming can never drift out of
          alignment with what it dims. The controls below stay put. */}
      <div className="poster-h2__media">
        <img className="poster-h2__image" src={data.src} alt={data.alt} />

        {data.trailer && (
          <video
            ref={videoRef}
            className="poster-h2__trailer"
            src={data.trailer}
            poster={data.still}
            preload="none"
            muted={muted}
            loop
            playsInline
          />
        )}

        <span className="poster-h2__scrim" aria-hidden="true" />
      </div>

      {data.trailer && (
        <button
          type="button"
          className="poster-h2__sound"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          aria-pressed={!muted}
        >
          {muted ? <IconSoundOff /> : <IconSoundOn />}
        </button>
      )}

      <div className="poster-h2__panel">
        <div className="poster-h2__text">
          <p className="poster-h2__description">{data.description}</p>
          {data.meta?.length > 0 && (
            <p className="poster-h2__meta">
              {data.meta.map((chip, i) => (
                <span key={chip}>
                  {i > 0 && <span className="poster-h2__dot">·</span>}
                  {chip}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="poster-h2__actions">
          <button type="button" className="poster-h2__watch">
            <IconPlay />
            Смотреть
          </button>
          <button type="button" className="poster-h2__fav" aria-label="В избранное">
            <IconFavorite />
          </button>
        </div>
      </div>
    </div>
  );
}
