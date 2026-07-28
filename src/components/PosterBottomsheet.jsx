import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
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

/** Reviews shown in the reviews strip — padded up to this many (a demo poster
 *  only ships two real reviews). */
const MIN_REVIEWS = 8;

export default function PosterBottomsheet({ data, onClose, leaving = false, variant = "sheet" }) {
  // "sheet" — fixed overlay rising from the bottom (v4 «Шторка»).
  // "inline" — the same content, but rendered in-flow inside an expander that
  // pushes the page down (v5 «Смещение»); no gradient/blur, no backdrop.
  const inline = variant === "inline";
  const [tab, setTab] = useState("info");
  const [seasonIndex, setSeasonIndex] = useState(0);
  // Trailers start silent — autoplay with sound is blocked by every browser.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  // Natural width of the season-number strip, so its container can animate its
  // width from 0 (collapsed) to exactly this when the Seasons tab is selected.
  const seasonNavInnerRef = useRef(null);
  const [seasonNavWidth, setSeasonNavWidth] = useState(0);

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

  // Measure the season-number strip so the open/close animation targets its
  // exact width. A ResizeObserver keeps it correct across font load and any
  // late layout (a one-shot measure can catch a 0 before the pills are sized).
  useLayoutEffect(() => {
    const el = seasonNavInnerRef.current;
    if (!el) return undefined;
    const measure = () => setSeasonNavWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [seasons.length, data.id]);

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

  // Same padding for reviews, so the strip has more than the two demo cards.
  const baseReviews = data.reviews ?? [];
  const reviews =
    baseReviews.length === 0
      ? []
      : Array.from({ length: Math.max(MIN_REVIEWS, baseReviews.length) }, (_, i) => {
          const r = baseReviews[i % baseReviews.length];
          return { ...r, key: `${r.id}-${i}` };
        });

  return (
    <>
      {!inline && (
        <div
          className={`poster-sheet-backdrop${leaving ? " poster-sheet-backdrop--leaving" : ""}`}
          aria-hidden="true"
        />
      )}
      <div
        className={`poster-sheet${inline ? " poster-sheet--inline" : ""}${
          !inline && leaving ? " poster-sheet--leaving" : ""
        }`}
        role="dialog"
        aria-label={data.title}
      >
        {/* Progressive blur — stacked backdrop-filter layers, each masked so the
            blur ramps up toward the opaque bottom of the gradient scrim. Only the
            overlay «Шторка» has it; the inline «Смещение» uses a plain surface. */}
        {!inline && (
          <div className="poster-sheet__blur" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}

        <div className="poster-sheet__inner">
          {/* Tab content on top, the tab switcher pinned at the bottom. */}
          <div className="poster-sheet__body">
            <div className="poster-sheet__content">
              {/* Keyed on the tab so each switch remounts and replays the
                  fade + light-blur entrance. */}
              <div className="poster-sheet__tab-panel" key={tab}>
              {tab === "info" && (
                <div className="poster-sheet__info">
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

                  {/* Middle — title, meta + description. */}
                  <div className="poster-sheet__info-text">
                    {data.title && <h3 className="poster-sheet__title">{data.title}</h3>}
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
                  </div>

                  {/* Right — watch / favourite, beside the text. */}
                  <div className="poster-sheet__actions">
                    <button type="button" className="poster-sheet__watch">
                      <IconPlay />
                      Смотреть
                    </button>
                    <button type="button" className="poster-sheet__fav">
                      <IconFavorite />
                      {/* В избранное */}
                    </button>
                  </div>
                </div>
              )}

              {tab === "seasons" && (
                <div className="poster-sheet__panel">
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
                  {reviews.map((r) => (
                    <li className="poster-sheet__review" key={r.key}>
                      {/* Left — the rating, in its own large block. High
                          scores (9–10) get a green background. */}
                      <span
                        className={`poster-sheet__review-rating${
                          r.rating >= 9 ? " poster-sheet__review-rating--high" : ""
                        }`}
                      >
                        {r.rating}
                      </span>

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

            <div className="poster-sheet__tabs" role="tablist" aria-label="Разделы">
              {TABS.map((t) => {
                // While «Сезоны» is open, the active-tab highlight moves off the
                // Сезоны tab and onto the selected season number instead.
                const seasonsOpen = t.id === "seasons" && tab === "seasons" && seasons.length > 0;
                const showActive = tab === t.id && !seasonsOpen;
                return (
                  <Fragment key={t.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`poster-sheet__tab${showActive ? " poster-sheet__tab--active" : ""}`}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                    </button>

                    {/* Season numbers sit right after the «Сезоны» tab. The nav
                        stays mounted so its width can animate open when Seasons
                        is selected and closed again when you leave. */}
                    {t.id === "seasons" && seasons.length > 0 && (
                      <div
                        className={`poster-sheet__season-nav${
                          seasonsOpen ? " poster-sheet__season-nav--open" : ""
                        }`}
                        style={{ width: seasonsOpen ? seasonNavWidth : 0 }}
                      >
                        <div
                          className="poster-sheet__season-nav-inner"
                          ref={seasonNavInnerRef}
                          role="tablist"
                          aria-label="Сезоны"
                        >
                          {seasons.map((s, i) => (
                            <button
                              key={s.id}
                              type="button"
                              role="tab"
                              aria-selected={i === seasonIndex}
                              aria-label={s.title}
                              tabIndex={seasonsOpen ? undefined : -1}
                              className={`poster-sheet__tab${
                                i === seasonIndex ? " poster-sheet__tab--active" : ""
                              }`}
                              onClick={() => setSeasonIndex(i)}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}

              <button
                type="button"
                className="poster-sheet__close"
                onClick={onClose}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
