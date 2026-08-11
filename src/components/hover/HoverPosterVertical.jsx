import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconPlay, IconSoundOff, IconSoundOn } from "../icons";
import TextBadge from "../TextBadge";
import "./HoverPosterVertical.css";

/**
 * HoverPosterVertical — вариант «Ховер» для вертикального постера.
 *
 * Ничего не покидает постер: по наведению он затемняется, сверху опускается
 * трейлер, а под ним — бейдж, описание и кнопки, вжатые в скруглённый бокс
 * постера. Сам показ — это CSS `:hover`; JS здесь только управляет трейлером
 * (play/pause по наведению и переключатель звука).
 */
export default function HoverPosterVertical({ data }) {
  // Трейлеры стартуют без звука — автоплей со звуком блокируют все браузеры.
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const handleEnter = () => {
    // Глотаем reject, который бросают браузеры, если курсор ушёл до буферизации.
    videoRef.current?.play().catch(() => {});
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    // Следующее наведение снова начинается без звука.
    setMuted(true);
  };

  // `muted` применяется только при первом монтировании <video>; синхронизируем.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  const openLink = () => {
    if (data.link) window.open(data.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="hover-vertical"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={openLink}
    >
      <div className="hover-vertical__media">
        <img className="hover-vertical__image" src={data.src} alt={data.alt} loading="lazy" />

        <span className="hover-vertical__scrim" aria-hidden="true" />

        {/* Трейлер — видео (poster=BackgroundImage до загрузки); если трейлера
            нет, на его месте статичный BackgroundImage. */}
        {data.trailer ? (
          <video
            ref={videoRef}
            className="hover-vertical__trailer"
            src={data.trailer}
            poster={data.still}
            preload="none"
            muted={muted}
            loop
            playsInline
          />
        ) : data.still ? (
          <img className="hover-vertical__trailer" src={data.still} alt="" />
        ) : null}

        {data.trailer && (
          <button
            type="button"
            className="hover-vertical__sound"
            onClick={(e) => {
              e.stopPropagation();
              setMuted((m) => !m);
            }}
            aria-label={muted ? "Включить звук" : "Выключить звук"}
            aria-pressed={!muted}
          >
            {muted ? <IconSoundOff /> : <IconSoundOn />}
          </button>
        )}

        <div className="hover-vertical__overlay">
          <div className="hover-vertical__text">
            {/* Обёртка сжимается до бейджа и центрируется, а описание ниже
                занимает всю ширину — поэтому бейдж и текст не «разъезжаются». */}
            {data.badge && (
              <div className="hover-vertical__brand">
                <TextBadge className="hover-vertical__badge" {...data.badge} />
              </div>
            )}
            <p className="hover-vertical__description">{data.description}</p>
          </div>

          <div className="hover-vertical__actions">
            <button type="button" className="hover-vertical__watch">
              <IconPlay />
              Смотреть
            </button>
            <button type="button" className="hover-vertical__fav" aria-label="В избранное">
              <IconFavorite />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
