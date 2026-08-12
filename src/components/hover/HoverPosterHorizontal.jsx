import { useEffect, useRef, useState } from "react";
import { IconFavorite, IconFavoriteOutline, IconPlay, IconSoundOff, IconSoundOn } from "../icons";
import TextBadge from "../TextBadge";
import "./HoverPosterHorizontal.css";

/**
 * HoverPosterHorizontal — «Ховер» для ландшафтного постера.
 *
 * Постер остаётся на месте и в размере, контент проявляется поверх: слева
 * ~75% занимает трейлер, справа затемнение с текстом и кнопками. <video>
 * всегда в DOM (чтобы плавно проявиться), но с preload="none" и играет только
 * по наведению — так ничего не грузится, пока постер не навели.
 */
export default function HoverPosterHorizontal({ data }) {
  const [hovered, setHovered] = useState(false);
  // Трейлеры стартуют без звука — автоплей со звуком блокируют все браузеры.
  const [muted, setMuted] = useState(true);
  // «В избранное» — визуальный тумблер: незаполненная → заполненная по клику.
  const [fav, setFav] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered) {
      // Глотаем reject, который браузеры бросают, если курсор ушёл до загрузки.
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered]);

  // `muted` применяется только при первом монтировании <video>; синхронизируем.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  });

  return (
    <div
      className={`hover-horizontal ${hovered ? "hover-horizontal--hovered" : ""}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        // Следующее наведение снова начинается без звука.
        setMuted(true);
      }}
      onClick={() => data.link && window.open(data.link, "_blank", "noopener,noreferrer")}
    >
      {/* Всё масштабируемое живёт в __media: артворк, трейлер и градиент
          двигаются как одно целое. Кнопки ниже стоят на месте. */}
      <div className="hover-horizontal__media">
        <img className="hover-horizontal__image" src={data.src} alt={data.alt} loading="lazy" />

        {/* Трейлер — видео (poster=BackgroundImage до загрузки); если трейлера
            нет, на его месте статичный BackgroundImage. */}
        {data.trailer ? (
          <video
            ref={videoRef}
            className="hover-horizontal__trailer"
            src={data.trailer}
            poster={data.still}
            preload="none"
            muted={muted}
            loop
            playsInline
          />
        ) : data.still ? (
          <img className="hover-horizontal__trailer" src={data.still} alt="" />
        ) : null}

        <span className="hover-horizontal__scrim" aria-hidden="true" />
      </div>

      {data.trailer && (
        <button
          type="button"
          className="hover-horizontal__sound"
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

      <div className="hover-horizontal__panel">
        <div className="hover-horizontal__text">
          {/* Логотип сверху, в одной обёртке с бейджем — держат одинаковую
              ширину; описание идёт под ними. */}
          <div className="hover-horizontal__brand">
            {data.logo && <img className="hover-horizontal__logo" src={data.logo} alt="" />}
            {data.badge && <TextBadge className="hover-horizontal__badge" {...data.badge} />}
          </div>

          <p className="hover-horizontal__description">{data.description}</p>
        </div>

        <div className="hover-horizontal__actions">
          <button type="button" className="hover-horizontal__watch">
            <IconPlay />
            Смотреть
          </button>
          <button
            type="button"
            className="hover-horizontal__fav"
            aria-label="В избранное"
            aria-pressed={fav}
            onClick={(e) => {
              e.stopPropagation();
              setFav((f) => !f);
            }}
          >
            {fav ? <IconFavorite /> : <IconFavoriteOutline />}
          </button>
        </div>
      </div>
    </div>
  );
}
