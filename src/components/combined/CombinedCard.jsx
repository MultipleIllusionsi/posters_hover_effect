import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconFavoriteOutline, IconPlay, IconSoundOff, IconSoundOn } from "../icons";
import { openExternal } from "../../openExternal";
import ScrollRail from "../ScrollRail";
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

/** Эпизоды в полосе сезонов — список добивается до этого числа. */
const MIN_EPISODES = 9;

/** Блок отзывов показываем только если их хотя бы столько. */
const MIN_REVIEWS = 3;

export default function CombinedCard({ data, onClose }) {
  const [tab, setTab] = useState("info");
  const [seasonIndex, setSeasonIndex] = useState(0);
  // Трейлеры стартуют без звука — автоплей со звуком блокируют все браузеры.
  const [muted, setMuted] = useState(true);
  // «В избранное» — визуальный тумблер (сбрасывается при смене контента ниже).
  const [fav, setFav] = useState(false);
  const videoRef = useRef(null);

  // Карточка переиспользуется при клике на другой постер — сбрасываем состояние
  // при смене контента, а не перемонтируем.
  const [shownId, setShownId] = useState(data.id);
  if (shownId !== data.id) {
    setShownId(data.id);
    setTab("info");
    setSeasonIndex(0);
    setMuted(true);
    setFav(false);
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

  // У фильмов (чип «фильм») нет сезонов — убираем для них таб «Сезоны», а «Инфо»
  // подписываем «О фильме»/«О сериале».
  const isFilm = data.meta?.includes("фильм");
  const visibleTabs = (isFilm ? TABS.filter((t) => t.id !== "seasons") : TABS).map((t) =>
    t.id === "info" ? { ...t, label: isFilm ? "О фильме" : "О сериале" } : t
  );

  // Повторяем эпизоды сезона, пока полоса не переполнит область прокрутки.
  const baseEpisodes = season?.episodes ?? [];
  const episodes =
    baseEpisodes.length === 0
      ? []
      : Array.from({ length: Math.max(MIN_EPISODES, baseEpisodes.length) }, (_, i) => {
          const ep = baseEpisodes[i % baseEpisodes.length];
          return { ...ep, key: `${ep.id}-${i}`, label: `${i + 1} серия` };
        });

  // Отзывы — только уникальные (по тексту), без повторов-добивки.
  const seenReviews = new Set();
  const reviews = (data.reviews ?? []).filter((r) => {
    const k = (r.text || "").trim();
    if (!k || seenReviews.has(k)) return false;
    seenReviews.add(k);
    return true;
  });

  // «Похожее»: реальная жанровая подборка с Иви.
  const similar = data.similar ?? [];

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
                      <button
                        type="button"
                        className="combined-card__fav"
                        aria-label="В избранное"
                        aria-pressed={fav}
                        onClick={() => setFav((f) => !f)}
                      >
                        {fav ? <IconFavorite /> : <IconFavoriteOutline />}
                      </button>
                    </div>
                    {/* Рейл отзывов под кнопками — как на ivi.ru: имя автора и
                        текст, без оценки. Показываем только если их достаточно. */}
                    {reviews.length >= MIN_REVIEWS && (
                      <ScrollRail className="combined-card__reviews">
                        {reviews.map((r) => (
                          <li className="combined-card__review" key={r.id}>
                            <span className="combined-card__review-author">{r.author}</span>
                            <span className="combined-card__review-text">{r.text}</span>
                          </li>
                        ))}
                      </ScrollRail>
                    )}
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
                  <ScrollRail className="combined-card__list combined-card__list--episodes">
                    {episodes.map((ep) => (
                      <li className="combined-card__episode" key={ep.key}>
                        <span className="combined-card__episode-poster">
                          <img className="combined-card__episode-still" src={ep.still} alt="" />
                          {ep.soon ? (
                            /* Ещё не вышла — затемнение и «Скоро» вместо play. */
                            <span className="combined-card__episode-soon">Скоро</span>
                          ) : (
                            <span className="combined-card__episode-play" aria-hidden="true">
                              <IconPlay />
                            </span>
                          )}
                        </span>
                        <span className="combined-card__episode-text">
                          <span className="combined-card__episode-title">{ep.title}</span>
                          <span className="combined-card__episode-subtitle">{ep.subtitle}</span>
                        </span>
                      </li>
                    ))}
                  </ScrollRail>
                </div>
              )}

              {/* «Похожее» — рейл родственных тайтлов: ландшафтный кадр, короткое
                  описание под ним, мета ниже. */}
              {tab === "similar" && (
                <div className="combined-card__panel">
                  <ScrollRail className="combined-card__list combined-card__list--similar">
                    {similar.map((s) => (
                      <li
                        className="combined-card__similar"
                        key={s.id}
                        onClick={() => openExternal(s.link)}
                      >
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
                  </ScrollRail>
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
