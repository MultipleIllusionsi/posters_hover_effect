import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconFavorite, IconFavoriteOutline, IconPlay, IconSoundOff, IconSoundOn } from "../icons";
import ScrollRail from "../ScrollRail";
import "./SheetPanel.css";

/**
 * SheetPanel — вариант «Шторка». Клик по любому постеру поднимает снизу одну
 * общую панель: 240px высотой, во всю ширину, скруглённую только по верхнему
 * краю. Слева направо: трейлер, описание с табами Инфо/Сезоны/Отзывы, кнопки.
 */

const TABS = [
  { id: "info", label: "Инфо" },
  { id: "seasons", label: "Сезоны" },
  { id: "reviews", label: "Отзывы" },
];

/** Эпизоды в полосе сезонов — список добивается до этого числа, чтобы всегда
 *  переполнять область прокрутки и обрезать последнюю карточку. */
const MIN_EPISODES = 9;

/** Отзывы показываем только если их хотя бы столько (иначе таб скрыт). */
const MIN_REVIEWS = 3;

export default function SheetPanel({ data, onClose, leaving = false }) {
  const [tab, setTab] = useState("info");
  const [seasonIndex, setSeasonIndex] = useState(0);
  // Трейлеры стартуют без звука — автоплей со звуком блокируют все браузеры.
  const [muted, setMuted] = useState(true);
  // «В избранное» — визуальный тумблер (сбрасывается при смене контента ниже).
  const [fav, setFav] = useState(false);
  const videoRef = useRef(null);
  // Собственная ширина полосы номеров сезонов, чтобы контейнер анимировал свою
  // ширину от 0 (свёрнуто) ровно до неё при выборе таба «Сезоны».
  const seasonNavInnerRef = useRef(null);
  const [seasonNavWidth, setSeasonNavWidth] = useState(0);

  // Панель переиспользуется при клике на другой постер — сбрасываем табы при
  // смене контента, а не перемонтируем её.
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

  // Панель закрывается только ✕ или кликом по пустому месту страницы. Клик по
  // постеру не трогаем — его обработчик подменит контент вместо закрытия; клик
  // внутри панели её оставляет. Фон чисто визуальный (pointer-events:none).
  useEffect(() => {
    const onDown = (e) => {
      if (e.target.closest(".sheet") || e.target.closest(".sheet-poster")) {
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

  // У фильмов (чип «фильм») нет сезонов, поэтому у них и таба «Сезоны» нет.
  const isFilm = data.meta?.includes("фильм");

  // Отзывы — только уникальные (по тексту), без повторов-добивки.
  const seenReviews = new Set();
  const reviews = (data.reviews ?? []).filter((r) => {
    const k = (r.text || "").trim();
    if (!k || seenReviews.has(k)) return false;
    seenReviews.add(k);
    return true;
  });

  // Табы: «Инфо» → «О сериале»/«О фильме»; «Сезоны» скрываем у фильмов; «Отзывы»
  // — только если их хотя бы MIN_REVIEWS (иначе таб не показываем совсем).
  const visibleTabs = TABS.filter((t) => {
    if (t.id === "seasons") return !isFilm;
    if (t.id === "reviews") return reviews.length >= MIN_REVIEWS;
    return true;
  }).map((t) => (t.id === "info" ? { ...t, label: isFilm ? "О фильме" : "О сериале" } : t));

  // Меряем полосу номеров сезонов, чтобы анимация открытия/закрытия целилась в
  // её точную ширину. ResizeObserver держит замер верным после загрузки шрифта
  // и поздней раскладки (разовый замер поймал бы 0 до появления пилюль).
  useLayoutEffect(() => {
    const el = seasonNavInnerRef.current;
    if (!el) return undefined;
    const measure = () => setSeasonNavWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [seasons.length, data.id]);

  // Повторяем эпизоды сезона, пока полоса не переполнит область прокрутки
  // (у демо-сезона всего 3–4 реальных эпизода).
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
        className={`sheet-backdrop${leaving ? " sheet-backdrop--leaving" : ""}`}
        aria-hidden="true"
      />
      <div className={`sheet${leaving ? " sheet--leaving" : ""}`} role="dialog" aria-label={data.title}>
        {/* Прогрессивный блюр — стопка backdrop-filter слоёв, каждый с маской,
            так что размытие нарастает к непрозрачному низу градиента. */}
        <div className="sheet__blur" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="sheet__inner">
          {/* Контент сверху, переключатель табов приколот снизу. */}
          <div className="sheet__body">
            <div className="sheet__content">
              {/* Ключ по табу — каждое переключение перемонтирует и повторяет
                  fade + лёгкий блюр на входе. */}
              <div className="sheet__tab-panel" key={tab}>
                {tab === "info" && (
                  <div className="sheet__info">
                    {/* Слева — трейлер. */}
                    <div className="sheet__trailer">
                      {data.trailer ? (
                        <video
                          ref={videoRef}
                          className="sheet__trailer-media"
                          src={data.trailer}
                          poster={trailerStill}
                          autoPlay
                          muted={muted}
                          loop
                          playsInline
                        />
                      ) : (
                        <img className="sheet__trailer-media" src={trailerStill} alt="" />
                      )}
                      {hasTrailer && (
                        <button
                          type="button"
                          className="sheet__sound"
                          onClick={() => setMuted((m) => !m)}
                          aria-label={muted ? "Включить звук" : "Выключить звук"}
                          aria-pressed={!muted}
                        >
                          {muted ? <IconSoundOff /> : <IconSoundOn />}
                        </button>
                      )}
                    </div>

                    {/* По центру — заголовок, мета и описание. */}
                    <div className="sheet__info-text">
                      {data.title && <h3 className="sheet__title">{data.title}</h3>}
                      {data.meta?.length > 0 && (
                        <p className="sheet__meta">
                          {data.meta.map((chip, i) => (
                            <span key={chip}>
                              {i > 0 && <span className="sheet__dot">·</span>}
                              {chip}
                            </span>
                          ))}
                        </p>
                      )}
                      <p className="sheet__description">{data.longDescription || data.description}</p>
                    </div>

                    {/* Справа — смотреть / в избранное. */}
                    <div className="sheet__actions">
                      <button type="button" className="sheet__watch">
                        <IconPlay />
                        Смотреть
                      </button>
                      <button
                        type="button"
                        className="sheet__fav"
                        aria-label="В избранное"
                        aria-pressed={fav}
                        onClick={() => setFav((f) => !f)}
                      >
                        {fav ? <IconFavorite /> : <IconFavoriteOutline />}
                      </button>
                    </div>
                  </div>
                )}

                {tab === "seasons" && (
                  <div className="sheet__panel">
                    <ScrollRail className="sheet__list sheet__list--episodes">
                      {episodes.map((ep) => (
                        <li className="sheet__episode" key={ep.key}>
                          <span className="sheet__episode-poster">
                            <img className="sheet__episode-still" src={ep.still} alt="" />
                            {/* На ховере — круглая красная кнопка play в правом
                                нижнем углу постера. */}
                            <span className="sheet__episode-play" aria-hidden="true">
                              <IconPlay />
                            </span>
                          </span>
                          <span className="sheet__episode-text">
                            <span className="sheet__episode-title">{ep.title}</span>
                            <span className="sheet__episode-subtitle">{ep.subtitle}</span>
                          </span>
                        </li>
                      ))}
                    </ScrollRail>
                  </div>
                )}

                {tab === "reviews" && (
                  <ScrollRail className="sheet__list sheet__list--reviews">
                    {reviews.map((r) => (
                      /* Как на ivi.ru — только имя автора и текст, без оценки. */
                      <li className="sheet__review" key={r.id}>
                        <span className="sheet__review-author">{r.author}</span>
                        <span className="sheet__review-text">{r.text}</span>
                      </li>
                    ))}
                  </ScrollRail>
                )}
              </div>
            </div>

            <div className="sheet__tabs" role="tablist" aria-label="Разделы">
              {visibleTabs.map((t) => {
                // Пока открыт «Сезоны», подсветка активного таба уходит с самого
                // таба на выбранный номер сезона.
                const seasonsOpen = t.id === "seasons" && tab === "seasons" && seasons.length > 0;
                const showActive = tab === t.id && !seasonsOpen;
                return (
                  <Fragment key={t.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`sheet__tab${showActive ? " sheet__tab--active" : ""}`}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                    </button>

                    {/* Номера сезонов сразу после таба «Сезоны». Нав остаётся в
                        DOM, чтобы его ширина анимировалась от 0 до полной при
                        выборе «Сезоны» и обратно при уходе. */}
                    {t.id === "seasons" && seasons.length > 0 && (
                      <div
                        className={`sheet__season-nav${seasonsOpen ? " sheet__season-nav--open" : ""}`}
                        style={{ width: seasonsOpen ? seasonNavWidth : 0 }}
                      >
                        <div
                          className="sheet__season-nav-inner"
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
                              className={`sheet__tab${i === seasonIndex ? " sheet__tab--active" : ""}`}
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

              {/* Последний таб — не переключает контент, а открывает страницу
                  контента на ivi.ru в новой вкладке. */}
              {data.link && (
                <button
                  type="button"
                  className="sheet__tab sheet__more"
                  onClick={() => window.open(data.link, "_blank", "noopener,noreferrer")}
                >
                  Подробнее
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M4 10L10 4M10 4H5.5M10 4V8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              <button type="button" className="sheet__close" onClick={onClose} aria-label="Закрыть">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
