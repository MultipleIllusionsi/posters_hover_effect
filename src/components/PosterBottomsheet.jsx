import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconPlay, IconSoundOff, IconSoundOn } from "./icons";
import "./PosterBottomsheet.css";

/**
 * PosterBottomsheet — fourth interaction ("Ховер 3"). Unlike the hover
 * treatments, this one is driven by a CLICK: tapping any poster (either row)
 * opens a single shared panel pinned to the bottom of the screen — 30vh tall,
 * full width, rounded only along its top edge.
 *
 * The content is the same as the v1 hover card (see PosterHover): a trailer, the
 * meta/description text with the Инфо/Сезоны/Отзывы tabs, and the Watch /
 * favourite actions — only laid out as a horizontal strip instead of a stacked
 * card. Left → right: trailer, then description + tabs, then the action buttons.
 */

const TABS = [
  { id: "info", label: "Инфо" },
  { id: "seasons", label: "Сезоны" },
  { id: "reviews", label: "Отзывы" },
];

/** Thumbs-up / -down used by the review card's like/dislike controls. */
function IconThumbUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.5 7 8 1.2a1.4 1.4 0 0 1 2.6.7V6h3.1a1.4 1.4 0 0 1 1.37 1.72l-1.1 5A1.4 1.4 0 0 1 12.6 13.8H4.5m0-6.8H2a.9.9 0 0 0-.9.9v5a.9.9 0 0 0 .9.9h2.5m0-6.8v6.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconThumbDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 9 8 14.8a1.4 1.4 0 0 1-2.6-.7V10H2.3A1.4 1.4 0 0 1 .93 8.28l1.1-5A1.4 1.4 0 0 1 3.4 2.2H11.5m0 6.8H14a.9.9 0 0 0 .9-.9v-5a.9.9 0 0 0-.9-.9h-2.5m0 6.8V2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Episodes shown in the seasons strip — the list is padded up to this many so
 *  it always overflows the scroll area and the last card is cropped. */
const MIN_EPISODES = 9;

export default function PosterBottomsheet({ data, onClose, leaving = false }) {
  const [tab, setTab] = useState("info");
  const [seasonIndex, setSeasonIndex] = useState(0);
  // Trailers start silent — autoplay with sound is blocked by every browser.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  // The sheet is reused when another poster is clicked, so reset the tabs when
  // the content changes rather than remounting.
  const [shownId, setShownId] = useState(data.id);
  if (shownId !== data.id) {
    setShownId(data.id);
    setTab("info");
    setSeasonIndex(0);
    setMuted(true);
  }

  // React only applies `muted` on the <video>'s first mount; keep it in sync.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  // The sheet closes only on the ✕ or a click on empty page space. A click on a
  // poster is left alone so its own handler can swap the sheet's content instead
  // of closing it; a click inside the sheet keeps it open. The backdrop is
  // purely visual (pointer-events: none), so these are the only two exits.
  useEffect(() => {
    const onDown = (e) => {
      if (e.target.closest(".poster-sheet") || e.target.closest(".poster--clickable")) {
        return;
      }
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const seasons = data.seasons ?? [];
  const season = seasons[seasonIndex];
  const trailerStill = data.still || data.src;
  const hasTrailer = Boolean(data.trailer) && tab === "info";

  // Repeat the season's episodes until the strip is long enough to spill past
  // the scroll area (a demo season only ships 3–4 real episodes).
  const baseEpisodes = season?.episodes ?? [];
  const episodes =
    baseEpisodes.length === 0
      ? []
      : Array.from({ length: Math.max(MIN_EPISODES, baseEpisodes.length) }, (_, i) => {
          const ep = baseEpisodes[i % baseEpisodes.length];
          return { ...ep, key: `${ep.id}-${i}`, label: `${i + 1} серия` };
        });

  return (
    <>
      <div
        className={`poster-sheet-backdrop${leaving ? " poster-sheet-backdrop--leaving" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`poster-sheet${leaving ? " poster-sheet--leaving" : ""}`}
        role="dialog"
        aria-label={data.title}
      >
        <div className="poster-sheet__inner">
          {/* Left — the trailer. */}
          <div className="poster-sheet__trailer">
            {data.trailer ? (
              <video
                ref={videoRef}
                className="poster-sheet__trailer-media"
                src={data.trailer}
                poster={trailerStill}
                autoPlay
                muted={muted}
                loop
                playsInline
              />
            ) : (
              <img className="poster-sheet__trailer-media" src={trailerStill} alt="" />
            )}
            {hasTrailer && (
              <button
                type="button"
                className="poster-sheet__sound"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Включить звук" : "Выключить звук"}
                aria-pressed={!muted}
              >
                {muted ? <IconSoundOff /> : <IconSoundOn />}
              </button>
            )}
          </div>

          {/* Middle — description and tabs. */}
          <div className="poster-sheet__body">
            <div className="poster-sheet__tabs" role="tablist" aria-label="Разделы">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`poster-sheet__tab${tab === t.id ? " poster-sheet__tab--active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="poster-sheet__content">
              {tab === "info" && (
                <div className="poster-sheet__info">
                  {data.meta?.length > 0 && (
                    <p className="poster-sheet__meta">
                      {data.meta.map((chip, i) => (
                        <span key={chip}>
                          {i > 0 && <span className="poster-sheet__dot">·</span>}
                          {chip}
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="poster-sheet__description">
                    {data.longDescription || data.description}
                  </p>

                  {/* Watch / favourite sit under the description, side by side. */}
                  <div className="poster-sheet__actions">
                    <button type="button" className="poster-sheet__watch">
                      <IconPlay />
                      Смотреть
                    </button>
                    <button type="button" className="poster-sheet__fav">
                      <IconFavorite />
                      В избранное
                    </button>
                  </div>
                </div>
              )}

              {tab === "seasons" && (
                <div className="poster-sheet__panel">
                  {seasons.length > 0 && (
                    <div className="poster-sheet__season-tabs" role="tablist" aria-label="Сезоны">
                      {seasons.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={i === seasonIndex}
                          className={`poster-sheet__season-tab${
                            i === seasonIndex ? " poster-sheet__season-tab--active" : ""
                          }`}
                          onClick={() => setSeasonIndex(i)}
                        >
                          <span className="poster-sheet__season-tab-label">{s.title}</span>
                          <span className="poster-sheet__season-tab-underline" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                  <ul className="poster-sheet__list poster-sheet__list--episodes">
                    {episodes.map((ep) => (
                      <li className="poster-sheet__episode" key={ep.key}>
                        <span className="poster-sheet__episode-poster">
                          <img className="poster-sheet__episode-still" src={ep.still} alt="" />
                          {/* Revealed on hover — a round red play affordance in the
                              poster's bottom-right corner. */}
                          <span className="poster-sheet__episode-play" aria-hidden="true">
                            <IconPlay />
                          </span>
                        </span>
                        <span className="poster-sheet__episode-text">
                          <span className="poster-sheet__episode-title">{ep.title}</span>
                          <span className="poster-sheet__episode-subtitle">{ep.subtitle}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === "reviews" && (
                <ul className="poster-sheet__list poster-sheet__list--reviews">
                  {data.reviews?.map((r) => (
                    <li className="poster-sheet__review" key={r.id}>
                      {/* Left — the rating, in its own large block. */}
                      <span className="poster-sheet__review-rating">{r.rating}</span>

                      {/* Right — author, review text, then like / dislike. */}
                      <span className="poster-sheet__review-body">
                        <span className="poster-sheet__review-author">{r.author}</span>
                        <span className="poster-sheet__review-text">{r.text}</span>
                        {/* <span className="poster-sheet__review-votes">
                          <button
                            type="button"
                            className="poster-sheet__review-vote"
                            aria-label="Полезный отзыв"
                          >
                            <IconThumbUp />
                          </button>
                          <button
                            type="button"
                            className="poster-sheet__review-vote"
                            aria-label="Бесполезный отзыв"
                          >
                            <IconThumbDown />
                          </button>
                        </span> */}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

        <button
          type="button"
          className="poster-sheet__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>
    </>
  );
}
