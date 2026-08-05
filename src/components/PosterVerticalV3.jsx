import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconPlay, IconSoundOff, IconSoundOn } from "./icons";
import TextBadge from "./TextBadge";
import "./PosterVerticalV3.css";

/**
 * PosterVerticalV3 — third hover treatment for the portrait poster.
 *
 * Same content as v2, but nothing leaves the poster: on hover the whole poster
 * darkens and a trailer drops in across the top while the actions and
 * description sit on the artwork below it, inset from the edges. Everything is
 * clipped to the poster's rounded box, so this variant never overlaps its
 * neighbours or the row below.
 *
 * The visual reveal is still CSS `:hover`; the small amount of JS here only
 * drives the trailer — play/pause on hover and the mute toggle — exactly as in
 * PosterHorizontalV2.
 */
export default function PosterVerticalV3({ data, variant = "trailer", className = "", ...rest }) {
  // "combined" (v6): no trailer on hover — the logo shows above the meta instead.
  const combined = variant === "combined";
  // Trailers start silent — autoplay with sound is blocked by every browser.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const handleEnter = () => {
    // Ignore the rejection browsers throw when the pointer leaves before the
    // clip has buffered enough to start.
    videoRef.current?.play().catch(() => {});
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    // Next hover starts silent again.
    setMuted(true);
  };

  // React only applies `muted` on the <video>'s first mount, and this one stays
  // mounted for the life of the poster — so sync the property by hand.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  return (
    <div
      className={`poster-v3 ${combined ? "poster-v3--combined" : ""} ${className}`.trim()}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      <div className="poster-v3__media">
        <img className="poster-v3__image" src={data.src} alt={data.alt} />

        <span
          className={`poster-v3__scrim${combined ? " poster-v3__scrim--combined" : ""}`}
          aria-hidden="true"
        />

        {!combined && data.trailer && (
          <video
            ref={videoRef}
            className="poster-v3__trailer"
            src={data.trailer}
            poster={data.still}
            preload="none"
            muted={muted}
            loop
            playsInline
          />
        )}

        {!combined && data.trailer && (
          <button
            type="button"
            className="poster-v3__sound"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Включить звук" : "Выключить звук"}
            aria-pressed={!muted}
          >
            {muted ? <IconSoundOff /> : <IconSoundOn />}
          </button>
        )}

        <div className="poster-v3__overlay">
          <div className="poster-v3__text">
            {/* Logo is the topmost element. It shares a wrapper with the genre
                line so the two stay the same width (the wrapper shrinks to the
                nowrap meta, and the logo — width:0/min-width:100% — fills it);
                the description sits below the pair. */}
            <div className="poster-v3__brand">
              {combined && data.logo && (
                <img className="poster-v3__logo" src={data.logo} alt="" />
              )}
              {/* Content badge (icon + label) in place of the old meta line. */}
              {data.badge && <TextBadge className="poster-v3__badge" {...data.badge} />}
            </div>

            <p className="poster-v3__description">{data.description}</p>
          </div>

          {!combined && (
            <div className="poster-v3__actions">
              <button type="button" className="poster-v3__watch">
                <IconPlay />
                Смотреть
              </button>
              <button type="button" className="poster-v3__fav" aria-label="В избранное">
                <IconFavorite />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
