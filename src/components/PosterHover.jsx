import { useEffect, useRef, useState } from "react";
import "./PosterHover.css";

/**
 * PosterHover — the card shown on top of a hovered vertical poster.
 * Figma: node 10:417 (variants `tab_active=info` 10:416 / `tab_active=seasons` 10:415).
 *
 * There is exactly ONE of these per section; <PosterGrid> mounts it, sizes it
 * and slides it between posters. This component only fills the box it is given,
 * so switching posters is a content swap — the card is never remounted.
 *
 * `variant` follows the poster it covers. "horizontal" keeps the same design but
 * narrows the trailer to 2/3 of the card (with gradients closing the gap on both
 * sides) and centres the tags and description.
 *
 * Everything rendered here comes from `data` — see data/postersData.js for the
 * shape. The "Отзывы" tab has no Figma variant; it reuses the seasons styling.
 */

const TABS = [
  { id: "info", label: "Инфо" },
  { id: "seasons", label: "Сезоны" },
  { id: "reviews", label: "Отзывы" },
];

function IconFavorite() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
    <path
      d="M2 1h8a1 1 0 0 1 1 1v12.2a.8.8 0 0 1-1.27.65L6 12.3l-3.73 2.55A.8.8 0 0 1 1 14.2V2a1 1 0 0 1 1-1Z"
      fill="currentColor"
    />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
    <path
      d="M11.2 6.16 1.55.15A1 1 0 0 0 0 1v12.03a1 1 0 0 0 1.55.84l9.65-6.01a1 1 0 0 0 0-1.7Z"
      fill="currentColor"
    />
    </svg>
  );
}

/** Speaker cone shared by both sound icons. */
const SPEAKER_CONE =
  "M8.4 1.7 4.8 4.9H2.2A1.2 1.2 0 0 0 1 6.1v3.8a1.2 1.2 0 0 0 1.2 1.2h2.6l3.6 3.2a.6.6 0 0 0 1-.45V2.15a.6.6 0 0 0-1-.45Z";

function IconSoundOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={SPEAKER_CONE} fill="currentColor" />
      <path
        d="m11.4 6.2 3.2 3.6M14.6 6.2l-3.2 3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSoundOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={SPEAKER_CONE} fill="currentColor" />
      <path
        d="M11.3 5.6a3.4 3.4 0 0 1 0 4.8M13.5 3.6a6.4 6.4 0 0 1 0 8.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PosterHover({ data, poster, variant = "vertical" }) {
  const [tab, setTab] = useState("info");
  const [seasonIndex, setSeasonIndex] = useState(0);
  // Trailers start silent — autoplay with sound is blocked by every browser.
  // Unmuting happens on click, which counts as the gesture that permits it.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  // The card survives a switch to another poster, so reset the tabs when the
  // content changes. Adjusting state during render (rather than in an effect)
  // means the new poster never flashes with the previous poster's tab.
  const [shownId, setShownId] = useState(data.id);
  if (shownId !== data.id) {
    setShownId(data.id);
    setTab("info");
    setSeasonIndex(0);
    setMuted(true);
  }

  // React sets `muted` only on the initial mount of a <video>, so keep the DOM
  // property in sync by hand.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  const seasons = data.seasons ?? [];
  const season = seasons[seasonIndex];
  const trailerStill = data.still || poster;
  const hasTrailer = Boolean(data.trailer) && tab === "info";

  return (
    <div className={`poster-hover poster-hover--${variant}`} role="group" aria-label={data.title}>
      {tab === "info" && (
        <div className="poster-hover__info">
          <div className="poster-hover__trailer">
            {data.trailer ? (
              <video
                ref={videoRef}
                className="poster-hover__trailer-media"
                src={data.trailer}
                poster={trailerStill}
                autoPlay
                muted={muted}
                loop
                playsInline
              />
            ) : (
              <img className="poster-hover__trailer-media" src={trailerStill} alt="" />
            )}
            <span className="poster-hover__trailer-fade" aria-hidden="true" />
          </div>

          <div className="poster-hover__text">
            {data.meta?.length > 0 && (
              <p className="poster-hover__meta">
                {data.meta.map((chip, i) => (
                  <span key={chip}>
                    {i > 0 && <span className="poster-hover__dot">·</span>}
                    {chip}
                  </span>
                ))}
              </p>
            )}
            <p className="poster-hover__description">{data.description}</p>
          </div>
        </div>
      )}

      {tab === "seasons" && (
        <div className="poster-hover__panel">
          {seasons.length > 1 && (
            <div className="poster-hover__season-tabs" role="tablist" aria-label="Сезоны">
              {seasons.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === seasonIndex}
                  className={`poster-hover__season-tab${
                    i === seasonIndex ? " poster-hover__season-tab--active" : ""
                  }`}
                  onClick={() => setSeasonIndex(i)}
                >
                  <span className="poster-hover__season-tab-label">{s.title}</span>
                  <span className="poster-hover__season-tab-underline" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          <ul className="poster-hover__list poster-hover__list--episodes">
            {season?.episodes.map((ep) => (
              <li className="poster-hover__episode" key={ep.id}>
                <img className="poster-hover__episode-still" src={ep.still} alt="" />
                <span className="poster-hover__episode-text">
                  <span className="poster-hover__episode-title">{ep.title}</span>
                  <span className="poster-hover__episode-subtitle">{ep.subtitle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "reviews" && (
        <div className="poster-hover__panel">
          <ul className="poster-hover__list poster-hover__list--reviews">
            {data.reviews?.map((r) => (
              <li className="poster-hover__review" key={r.id}>
                <span className="poster-hover__review-head">
                  <span className="poster-hover__episode-title">{r.author}</span>
                  <span className="poster-hover__review-rating">{r.rating}</span>
                </span>
                <span className="poster-hover__review-text">{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasTrailer && (
        <button
          type="button"
          className="poster-hover__sound"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          aria-pressed={!muted}
        >
          {muted ? <IconSoundOff /> : <IconSoundOn />}
        </button>
      )}

      {/* Fades the scrolling list out behind the action bar (Figma 9:385).
          The info tab has no gradient — its text sits above the bar. */}
      {tab !== "info" && <span className="poster-hover__dim" aria-hidden="true" />}

      <div className="poster-hover__actions">
        <div className="poster-hover__tabs" role="tablist" aria-label="Разделы">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`poster-hover__tab${tab === t.id ? " poster-hover__tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button type="button" className="poster-hover__fav" aria-label="В избранное">
          <IconFavorite />
        </button>

        <button type="button" className="poster-hover__watch">
          <IconPlay />
          <span className="poster-hover__visually-hidden">Смотреть</span>
        </button>
      </div>
    </div>
  );
}
