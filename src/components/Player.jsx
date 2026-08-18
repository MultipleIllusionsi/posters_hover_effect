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
 * прогресс-бар и панель управления. Контролы декоративные, кроме: выход
 * (player_fullscreen) и — только у сериалов — player_series, открывающий панель
 * с сезонами и сериями (как таб «Сезоны» в «Карточке»).
 */

/** Эпизоды в полосе — добиваем до этого числа, чтобы полоса всегда прокручивалась. */
const MIN_EPISODES = 9;

export default function Player() {
  const data = usePlayer();

  // Имитация загрузки: секунду показываем чёрный экран со спиннером, затем
  // проявляем фон и «подлетают» контролы. Сбрасываем при каждом новом открытии.
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

  // Пока плеер открыт — блокируем прокрутку страницы, закрываем по Esc, и через
  // секунду «дозагружаем» (setLoaded).
  useEffect(() => {
    if (!data) return undefined;
    const loadTimer = setTimeout(() => setLoaded(true), 1000);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closePlayer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(loadTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [data]);

  if (!data) return null;
  const { title, background, isFilm } = data;

  // Сезоны/серии для панели player_series (только у сериалов).
  const seasons = data.seasons ?? [];
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

      {/* Спиннер загрузки — до появления фона. */}
      {!loaded && <div className="player__spinner" aria-hidden="true" />}

      {/* Заметная круглая кнопка закрытия справа сверху. */}
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
                  setCurrent({ season: seasonIndex + 1, episode: parseInt(ep.id.slice(1), 10) || 1 });
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

      {/* Нижняя панель: прогресс + контролы (декоративные, кроме выхода и серий). */}
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
            <span className="player__btn" aria-hidden="true">
              <img src={iconPrevious} alt="" />
            </span>
            <span className="player__btn" aria-hidden="true">
              <img src={iconPlay} alt="" />
            </span>
            <span className="player__btn" aria-hidden="true">
              <img src={iconNext} alt="" />
            </span>
            <span className="player__volume" aria-hidden="true">
              <img src={iconVolume} alt="" />
              <span className="player__volume-track" />
            </span>
          </div>

          <div className="player__controls-right">
            {/* Сезоны/серии — только у сериалов; рабочая кнопка. */}
            {!isFilm && (
              <button
                type="button"
                className={`player__btn player__series-btn${seriesOpen ? " player__series-btn--active" : ""}`}
                onClick={() => setSeriesOpen((o) => !o)}
                aria-label="Сезоны и серии"
                aria-pressed={seriesOpen}
              >
                <img src={iconSeries} alt="" />
              </button>
            )}
            <span className="player__btn" aria-hidden="true">
              <img src={iconSettings} alt="" />
            </span>
            <span className="player__btn" aria-hidden="true">
              <img src={iconSubtitles} alt="" />
            </span>
            {/* Единственная рабочая кнопка выхода. */}
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
