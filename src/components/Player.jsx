import { useEffect, useState } from "react";
import { IconClose, IconPlay } from "./icons";
import { usePlayer, closePlayer } from "../playerStore";
import ScrollRail from "./ScrollRail";
import iconPrevious from "../assets/player/player_previous.svg";
import iconPlay from "../assets/player/player_play.svg";
import iconNext from "../assets/player/player_next.svg";
import iconVolume from "../assets/player/player_volume.svg";
import iconSeries from "../assets/player/player_series.svg";
import iconSettings from "../assets/player/player_settings.svg";
import iconSubtitles from "../assets/player/player_subtitles.svg";
import iconFullscreen from "../assets/player/player_fullscreen.svg";
import "./Player.css";

/**
 * Player — «фейковый» полноэкранный плеер поверх всего окна (в той же вкладке).
 * По макету Figma (PD-3826, node 125:288): фон — background выбранного контента,
 * сверху top_title (название + подпись «Серия N сезон M» у сериала), снизу —
 * прогресс-бар и панель управления. Рабочие контролы: выход (player_fullscreen),
 * player_series (панель «Сезоны и серии»), а у сериалов — previous/next
 * (переход между сериями с имитацией загрузки).
 */

/** Эпизоды в полосе — добиваем до этого числа, чтобы полоса всегда прокручивалась. */
const MIN_EPISODES = 9;

export default function Player() {
  const data = usePlayer();

  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(data);
  // Панель сезонов/серий и текущая (играющая) серия — своя для каждого открытия.
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [current, setCurrent] = useState(() => ({
    season: data?.season ?? 1,
    episode: data?.episode ?? 1,
  }));
  if (session !== data) {
    setSession(data);
    setLoaded(false);
    setSeriesOpen(false);
    setCurrent({ season: data?.season ?? 1, episode: data?.episode ?? 1 });
    setSeasonIndex(data ? Math.max(0, (data.season ?? 1) - 1) : 0);
  }

  // Блокируем прокрутку страницы под плеером и закрываем по Esc.
  useEffect(() => {
    if (!data) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closePlayer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [data]);

  // Имитация загрузки: спиннер ~1с при открытии и при каждой смене серии
  // (setLoaded(false) выставляем императивно, здесь только таймер «дозагрузки»).
  useEffect(() => {
    if (!data) return undefined;
    const t = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(t);
  }, [data, current.season, current.episode]);

  // Открытую панель «Сезоны и серии» закрываем кликом в любую зону вне неё
  // (и вне самой кнопки — та переключает сама).
  useEffect(() => {
    if (!seriesOpen) return undefined;
    const onDown = (e) => {
      if (e.target.closest(".player__series-panel") || e.target.closest(".player__series-btn")) return;
      setSeriesOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [seriesOpen]);

  if (!data) return null;
  const { title, background, isFilm } = data;

  const seasons = data.seasons ?? [];

  // Плоский порядок серий по всем сезонам — для перехода previous/next и
  // определения границ (первая/последняя серия).
  const flat = [];
  seasons.forEach((s, si) => {
    (s.episodes ?? []).forEach((ep) => {
      flat.push({ season: si + 1, episode: parseInt(ep.id.slice(1), 10) || flat.length + 1 });
    });
  });
  const currentIdx = flat.findIndex((f) => f.season === current.season && f.episode === current.episode);
  const isSeries = !isFilm && flat.length > 0;
  const canPrev = isSeries && currentIdx > 0;
  const canNext = isSeries && (currentIdx === -1 ? flat.length > 0 : currentIdx < flat.length - 1);

  // Перейти к серии (с имитацией загрузки).
  const playEpisode = (season, episode) => {
    setLoaded(false);
    setCurrent({ season, episode });
    setSeasonIndex(season - 1);
  };
  const goPrev = () => canPrev && playEpisode(flat[currentIdx - 1].season, flat[currentIdx - 1].episode);
  const goNext = () => {
    if (!canNext) return;
    const next = flat[currentIdx === -1 ? 0 : currentIdx + 1];
    playEpisode(next.season, next.episode);
  };

  // Серии выбранного (в панели) сезона — добиваем до MIN_EPISODES.
  const season = seasons[Math.min(seasonIndex, Math.max(0, seasons.length - 1))];
  const baseEpisodes = season?.episodes ?? [];
  const episodes =
    baseEpisodes.length === 0
      ? []
      : Array.from({ length: Math.max(MIN_EPISODES, baseEpisodes.length) }, (_, i) => {
          const ep = baseEpisodes[i % baseEpisodes.length];
          return { ...ep, key: `${ep.id}-${i}` };
        });

  return (
    <div
      className={`player${loaded ? " player--loaded" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {background && <img className="player__bg" src={background} alt="" />}

      {!loaded && <div className="player__spinner" aria-hidden="true" />}

      <button
        type="button"
        className="player__close"
        onClick={closePlayer}
        aria-label="Закрыть плеер"
      >
        <IconClose />
      </button>

      {/* Верхняя плашка: название и (у сериала) подпись сезон/серия. */}
      <div className="player__top">
        <div className="player__top-title">
          <span className="player__title">{title}</span>
          {!isFilm && (
            <span className="player__series">
              Серия {current.episode} сезон {current.season}
            </span>
          )}
        </div>
      </div>

      {/* Панель сезонов/серий (player_series) — как таб «Сезоны» в «Карточке». */}
      {!isFilm && seriesOpen && (
        <div className="player__series-panel">
          {seasons.length > 0 && (
            <div className="player__season-nums" role="tablist" aria-label="Сезоны">
              <span className="player__seasons-caption">Сезоны</span>
              {seasons.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === seasonIndex}
                  aria-label={s.title}
                  className={`player__season-btn${i === seasonIndex ? " player__season-btn--active" : ""}`}
                  onClick={() => setSeasonIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          <ScrollRail className="player__episodes">
            {episodes.map((ep) => (
              <li
                className="player__episode"
                key={ep.key}
                onClick={() => {
                  if (ep.soon) return; // не вышедшую серию не выбираем
                  playEpisode(seasonIndex + 1, parseInt(ep.id.slice(1), 10) || 1);
                  setSeriesOpen(false);
                }}
              >
                <span className="player__episode-poster">
                  <img className="player__episode-still" src={ep.still} alt="" />
                  {ep.soon ? (
                    <span className="player__episode-soon">Скоро</span>
                  ) : (
                    <span className="player__episode-play" aria-hidden="true">
                      <IconPlay />
                    </span>
                  )}
                </span>
                <span className="player__episode-text">
                  <span className="player__episode-title">{ep.title}</span>
                  <span className="player__episode-subtitle">{ep.subtitle}</span>
                </span>
              </li>
            ))}
          </ScrollRail>
        </div>
      )}

      {/* Нижняя панель: прогресс + контролы. */}
      <div className="player__bottom">
        <div className="player__progress">
          <span className="player__time">0:00:00</span>
          <span className="player__bar" aria-hidden="true">
            <span className="player__bar-fill" />
          </span>
          <span className="player__time">1:12:40</span>
        </div>

        <div className="player__controls">
          <div className="player__controls-left">
            {isSeries ? (
              <>
                {/* previous прячем на первой серии; переход — с имитацией загрузки. */}
                {canPrev && (
                  <button type="button" className="player__btn player__nav" onClick={goPrev} aria-label="Предыдущая серия">
                    <img src={iconPrevious} alt="" />
                  </button>
                )}
                <span className="player__btn" aria-hidden="true">
                  <img src={iconPlay} alt="" />
                </span>
                {/* next прячем на последней серии последнего сезона. */}
                {canNext && (
                  <button type="button" className="player__btn player__nav" onClick={goNext} aria-label="Следующая серия">
                    <img src={iconNext} alt="" />
                  </button>
                )}
              </>
            ) : (
              /* У фильмов кнопок переключения серий (previous/next) нет — только play. */
              <span className="player__btn" aria-hidden="true">
                <img src={iconPlay} alt="" />
              </span>
            )}
            <span className="player__volume" aria-hidden="true">
              <img src={iconVolume} alt="" />
              <span className="player__volume-track" />
            </span>
          </div>

          <div className="player__controls-right">
            {/* Сезоны/серии — только у сериалов; с подписью справа от иконки. */}
            {!isFilm && (
              <button
                type="button"
                className={`player__btn player__series-btn${seriesOpen ? " player__series-btn--active" : ""}`}
                onClick={() => setSeriesOpen((o) => !o)}
                aria-label="Сезоны и серии"
                aria-pressed={seriesOpen}
              >
                <img src={iconSeries} alt="" />
                <span className="player__series-btn-label">Сезоны и серии</span>
              </button>
            )}
            <span className="player__btn" aria-hidden="true">
              <img src={iconSettings} alt="" />
            </span>
            <span className="player__btn" aria-hidden="true">
              <img src={iconSubtitles} alt="" />
            </span>
            {/* Кнопка выхода. */}
            <button
              type="button"
              className="player__btn player__exit"
              onClick={closePlayer}
              aria-label="Выйти из плеера"
            >
              <img src={iconFullscreen} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
