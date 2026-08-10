import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconPlay, IconSoundOff, IconSoundOn } from "../icons";
import { similarItems } from "../../data/postersData";
import TextBadge from "../TextBadge";
import "./CombinedCard.css";

/**
 * CombinedCard — карточка варианта «Совмещённый». Раскрывается инлайн под рядом
 * кликнутого постера (высотой 70vh, во всю ширину). Табы Инфо/Сезоны/Похожее
 * приколоты к верхнему центру. Инфо — две колонки: слева лого·описание·мета·
 * кнопки·отзывы, справа трейлер с фейдом влево.
 */

const TABS = [
  { id: "info", label: "Инфо" },
  { id: "seasons", label: "Сезоны" },
  { id: "similar", label: "Похожее" },
];

// Чипы фильтра над рейлом «Похожее» — как подобраны родственные тайтлы.
// Пока демо (содержимое рейла одинаковое для каждого).
const SIMILAR_FILTERS = [
  { id: "genre", label: "По жанру" },
  { id: "actors", label: "По актёрам" },
  { id: "director", label: "По режиссёру" },
  { id: "mood", label: "По настроению" },
];

/** Эпизоды в полосе сезонов — список добивается до этого числа. */
const MIN_EPISODES = 9;

/** Отзывы в рейле — добиваются до этого числа. */
const MIN_REVIEWS = 8;

export default function CombinedCard({ data, onClose }) {
  const [tab, setTab] = useState("info");
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [similarFilter, setSimilarFilter] = useState(SIMILAR_FILTERS[0].id);
  // Трейлеры стартуют без звука — автоплей со звуком блокируют все браузеры.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  // Карточка переиспользуется при клике на другой постер — сбрасываем состояние
  // при смене контента, а не перемонтируем.
  const [shownId, setShownId] = useState(data.id);
  if (shownId !== data.id) {
    setShownId(data.id);
    setTab("info");
    setSeasonIndex(0);
    setSimilarFilter(SIMILAR_FILTERS[0].id);
    setMuted(true);
  }

  // React применяет `muted` только при первом монтировании <video>; синхроним.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  // Закрывается ✕ или кликом по пустому месту. Клик по постеру не трогаем — его
  // обработчик подменит контент; клик внутри карточки её оставляет.
  useEffect(() => {
    const onDown = (e) => {
      if (e.target.closest(".combined-card, .combined-vertical, .combined-horizontal")) {
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

  // У фильмов (чип «фильм») нет сезонов — убираем для них таб «Сезоны».
  const isFilm = data.meta?.includes("фильм");
  const visibleTabs = isFilm ? TABS.filter((t) => t.id !== "seasons") : TABS;

  // Повторяем эпизоды сезона, пока полоса не переполнит область прокрутки.
  const baseEpisodes = season?.episodes ?? [];
  const episodes =
    baseEpisodes.length === 0
      ? []
      : Array.from({ length: Math.max(MIN_EPISODES, baseEpisodes.length) }, (_, i) => {
          const ep = baseEpisodes[i % baseEpisodes.length];
          return { ...ep, key: `${ep.id}-${i}`, label: `${i + 1} серия` };
        });

  // Та же добивка для отзывов.
  const baseReviews = data.reviews ?? [];
  const reviews =
    baseReviews.length === 0
      ? []
      : Array.from({ length: Math.max(MIN_REVIEWS, baseReviews.length) }, (_, i) => {
          const r = baseReviews[i % baseReviews.length];
          return { ...r, key: `${r.id}-${i}` };
        });

  // Средняя оценка и коллективная фраза для сводного блока отзывов.
  const ratingValues = baseReviews.map((r) => r.rating).filter((n) => typeof n === "number");
  const overallRating = ratingValues.length
    ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
    : null;
  const collectiveReview =
    "Зрители хвалят крепкий сюжет и игру актёров — большинство советует к просмотру.";

  return (
    <div className="combined-card" role="dialog" aria-label={data.title}>
      <div className="combined-card__inner">
        <div className="combined-card__body">
          <div className="combined-card__content">
            {/* Ключ по табу — каждое переключение повторяет fade + лёгкий блюр. */}
            <div className="combined-card__tab-panel" key={tab}>
              {tab === "info" && (
                <div className="combined-card__info">
                  <div className="combined-card__info-col">
                    {data.logo ? (
                      <img className="combined-card__logo" src={data.logo} alt={data.title} />
                    ) : (
                      /* Нет вордмарка — показываем заголовок как текст-лого. */
                      <h2 className="combined-card__logo-text">{data.title}</h2>
                    )}
                    <p className="combined-card__description">
                      {data.longDescription || data.description}
                    </p>
                    {(data.badge || data.meta?.length > 0) && (
                      <div className="combined-card__meta-row">
                        {data.badge && (
                          <TextBadge className="combined-card__badge" {...data.badge} />
                        )}
                        {data.meta?.length > 0 && (
                          <p className="combined-card__meta">
                            {data.meta.map((chip, i) => (
                              <span key={chip}>
                                {i > 0 && <span className="combined-card__dot">·</span>}
                                {chip}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="combined-card__actions">
                      <button type="button" className="combined-card__watch">
                        <IconPlay />
                        Смотреть
                      </button>
                      <button type="button" className="combined-card__fav" aria-label="В избранное">
                        <IconFavorite />
                      </button>
                    </div>
                    {/* Рейл отзывов под кнопками: сводный блок (общая оценка +
                        коллективная фраза), точка-разделитель, затем отзывы. */}
                    <ul className="combined-card__reviews">
                      {overallRating && (
                        <li className="combined-card__review-summary">
                          <span
                            className={`combined-card__review-rating${
                              Number(overallRating) >= 9 ? " combined-card__review-rating--high" : ""
                            }`}
                          >
                            {overallRating}
                          </span>
                          <span className="combined-card__review-body">
                            <span className="combined-card__review-author">Общая оценка</span>
                            <span className="combined-card__review-text">{collectiveReview}</span>
                          </span>
                        </li>
                      )}
                      {overallRating && (
                        <li className="combined-card__review-sep" aria-hidden="true" />
                      )}
                      {reviews.map((r) => (
                        <li className="combined-card__review" key={r.key}>
                          <span
                            className={`combined-card__review-rating${
                              r.rating >= 9 ? " combined-card__review-rating--high" : ""
                            }`}
                          >
                            {r.rating}
                          </span>
                          <span className="combined-card__review-body">
                            <span className="combined-card__review-author">{r.author}</span>
                            <span className="combined-card__review-text">{r.text}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="combined-card__trailer">
                    {data.trailer ? (
                      <video
                        ref={videoRef}
                        className="combined-card__trailer-media"
                        src={data.trailer}
                        poster={trailerStill}
                        autoPlay
                        muted={muted}
                        loop
                        playsInline
                      />
                    ) : (
                      <img className="combined-card__trailer-media" src={trailerStill} alt="" />
                    )}
                    {hasTrailer && (
                      <button
                        type="button"
                        className="combined-card__sound"
                        onClick={() => setMuted((m) => !m)}
                        aria-label={muted ? "Включить звук" : "Выключить звук"}
                        aria-pressed={!muted}
                      >
                        {muted ? <IconSoundOff /> : <IconSoundOn />}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {tab === "seasons" && (
                <div className="combined-card__panel">
                  {/* Заголовок-лого, затем номера сезонов, над полосой эпизодов. */}
                  <div className="combined-card__seasons">
                    {data.logo ? (
                      <img className="combined-card__seasons-logo" src={data.logo} alt={data.title} />
                    ) : (
                      <h2 className="combined-card__logo-text">{data.title}</h2>
                    )}
                    {seasons.length > 0 && (
                      <div className="combined-card__season-nums" role="tablist" aria-label="Сезоны">
                        <span className="combined-card__seasons-caption">Сезоны</span>
                        {seasons.map((s, i) => (
                          <button
                            key={s.id}
                            type="button"
                            role="tab"
                            aria-selected={i === seasonIndex}
                            aria-label={s.title}
                            className={`combined-card__tab${
                              i === seasonIndex ? " combined-card__tab--active" : ""
                            }`}
                            onClick={() => setSeasonIndex(i)}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <ul className="combined-card__list combined-card__list--episodes">
                    {episodes.map((ep) => (
                      <li className="combined-card__episode" key={ep.key}>
                        <span className="combined-card__episode-poster">
                          <img className="combined-card__episode-still" src={ep.still} alt="" />
                          <span className="combined-card__episode-play" aria-hidden="true">
                            <IconPlay />
                          </span>
                        </span>
                        <span className="combined-card__episode-text">
                          <span className="combined-card__episode-title">{ep.title}</span>
                          <span className="combined-card__episode-subtitle">{ep.subtitle}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* «Похожее» — рейл родственных тайтлов: ландшафтный кадр, короткое
                  описание под ним, мета ниже. */}
              {tab === "similar" && (
                <div className="combined-card__panel">
                  <div
                    className="combined-card__similar-filters"
                    role="tablist"
                    aria-label="Фильтр похожего"
                  >
                    {SIMILAR_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={similarFilter === f.id}
                        className={`combined-card__tab${
                          similarFilter === f.id ? " combined-card__tab--active" : ""
                        }`}
                        onClick={() => setSimilarFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <ul className="combined-card__list combined-card__list--similar">
                    {similarItems.map((s) => (
                      <li className="combined-card__similar" key={s.id}>
                        <span className="combined-card__similar-poster">
                          <img className="combined-card__similar-image" src={s.src} alt={s.title} />
                        </span>
                        <span className="combined-card__similar-description">{s.description}</span>
                        <span className="combined-card__similar-meta">
                          {s.meta.map((chip, i) => (
                            <span key={chip}>
                              {i > 0 && <span className="combined-card__dot">·</span>}
                              {chip}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Табы приколоты к верхнему центру карточки. */}
          <div className="combined-card__tabs" role="tablist" aria-label="Разделы">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`combined-card__tab${tab === t.id ? " combined-card__tab--active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}

            <button type="button" className="combined-card__close" onClick={onClose} aria-label="Закрыть">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
