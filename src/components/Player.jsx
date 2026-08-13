import { useEffect, useState } from "react";
import { IconClose } from "./icons";
import { usePlayer, closePlayer } from "../playerStore";
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
 * прогресс-бар и панель управления. Все контролы декоративные; работает только
 * кнопка справа снизу (player_fullscreen) — выход из плеера.
 */
export default function Player() {
  const data = usePlayer();

  // Имитация загрузки: секунду показываем чёрный экран со спиннером, затем
  // проявляем фон и «подлетают» контролы. Сбрасываем при каждом новом открытии.
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(data);
  if (session !== data) {
    setSession(data);
    setLoaded(false);
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
  const { title, background, isFilm, season, episode } = data;

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
              Серия {episode} сезон {season}
            </span>
          )}
        </div>
      </div>

      {/* Нижняя панель: прогресс + контролы (декоративные, кроме выхода). */}
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
            <span className="player__btn" aria-hidden="true">
              <img src={iconSeries} alt="" />
            </span>
            <span className="player__btn" aria-hidden="true">
              <img src={iconSettings} alt="" />
            </span>
            <span className="player__btn" aria-hidden="true">
              <img src={iconSubtitles} alt="" />
            </span>
            {/* Единственная рабочая кнопка — выход из плеера. */}
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
