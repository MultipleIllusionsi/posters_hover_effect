import { useCallback, useEffect, useRef, useState } from "react";
import CombinedPosterHorizontal from "./CombinedPosterHorizontal";
import CombinedPosterVertical from "./CombinedPosterVertical";
import CombinedCard from "./CombinedCard";

/** Держим в синхроне с exit-анимацией .combined-expander--leaving в CombinedCard.css. */
const EXIT_DURATION = 300;

/** Высота раскрывающейся карточки (.combined-expander / .combined-card = 70vh). */
const CARD_VH = 0.7;

/** Отступ снизу под карточкой при доскролле. */
const REVEAL_MARGIN = 16;

/** Синглтон на всю страницу: одновременно открыта только одна карточка. */
const closers = new Set();

/**
 * Плавно доскроллить так, чтобы раскрывшаяся карточка (70vh, от низа ряда
 * постера) оказалась внизу экрана. Считаем сразу, синхронно, по текущему DOM
 * (старая карточка ещё видна).
 *
 * Если сейчас раскрыта другая карточка ВЫШЕ нового постера, при её схлопывании
 * постер уедет вверх — вычитаем её высоту (`shift`), иначе проскроллит лишнее
 * (оверскролл). Работает детерминированно за счёт overflow-anchor:none (index.css):
 * браузер сам скролл не подстраивает.
 */
const reveal = (posterEl) => {
  if (!posterEl) return;
  const cardH = window.innerHeight * CARD_VH;
  const posterRect = posterEl.getBoundingClientRect();
  let shift = 0;
  const openExp = document.querySelector(".combined-expander:not(.combined-expander--leaving)");
  if (openExp) {
    const r = openExp.getBoundingClientRect();
    if (r.bottom <= posterRect.top) shift = r.height; // старая карточка целиком выше нового постера
  }
  // +8px = margin-top обёртки .combined-expander.
  const overflow = posterRect.bottom - shift + 8 + cardH + REVEAL_MARGIN - window.innerHeight;
  if (overflow > 0) window.scrollBy({ top: overflow, behavior: "smooth" });
};

/**
 * CombinedGrid — вариант «Совмещённый». Постеры показывают лого/описание по
 * наведению и кликабельны: клик раскрывает карточку (CombinedCard) прямо под
 * рядом кликнутого постера, толкая контент ниже вниз.
 */
export default function CombinedGrid({ horizontalPosters, verticalPosters }) {
  const [item, setItem] = useState(null);
  const [leaving, setLeaving] = useState(false);
  // Старая карточка, плавно схлопывающаяся в своём ряду, пока новая раскрывается
  // в другом, — за счёт этого переключение между рядами непрерывно, а не рывком.
  const [closing, setClosing] = useState(null);
  const exitTimer = useRef(null);
  const closeTimer = useRef(null);
  // Текущий item, читаемый синхронно внутри замыкания open.
  const itemRef = useRef(null);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  // Плавное закрытие: карточка проигрывает exit-анимацию, потом снимается.
  const close = useCallback(() => {
    setLeaving(true);
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      setItem(null);
      setLeaving(false);
    }, EXIT_DURATION);
  }, []);

  const open = useCallback(
    (next, el) => {
      // Доскролл считаем и запускаем СРАЗУ, по текущему DOM (старая карточка ещё
      // видна и её высота учитывается) — плавно, без задержки и без оверскролла.
      reveal(el);
      // Синглтон: карточку, открытую в ДРУГОМ гриде (галерее), закрываем
      // анимированно (плавно), а не рывком — иначе переключение резкое.
      closers.forEach((c) => {
        if (c !== close) c();
      });
      clearTimeout(exitTimer.current);
      // Переключение между рядами ЭТОГО грида: старую оставляем «призраком»
      // схлопываться в её ряду, пока новая раскрывается — обе анимируются разом.
      const prev = itemRef.current;
      if (prev && prev.variant !== next.variant) {
        setClosing(prev);
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setClosing(null), EXIT_DURATION);
      }
      setLeaving(false);
      setItem(next);
    },
    [close]
  );

  useEffect(() => {
    closers.add(close);
    return () => closers.delete(close);
  }, [close]);

  useEffect(
    () => () => {
      clearTimeout(exitTimer.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  // Раскрывающаяся карточка рендерится сразу после ряда кликнутого постера, чтобы
  // открываться от его низа и толкать всё ниже вниз. В каждом ряду не больше одной:
  // активная (откр./закр.) или «призрак» при переключении рядов.
  const renderCard = (rowVariant) => {
    if (item && item.variant === rowVariant) {
      return (
        <div className={`combined-expander${leaving ? " combined-expander--leaving" : ""}`}>
          <CombinedCard data={item} onClose={close} />
        </div>
      );
    }
    if (closing && closing.variant === rowVariant) {
      return (
        <div className="combined-expander combined-expander--leaving" aria-hidden="true">
          <CombinedCard data={closing} onClose={() => {}} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="gallery">
      {horizontalPosters.length > 0 && (
        <div className="gallery__row gallery__row--horizontal">
          {horizontalPosters.map((poster) => (
            <CombinedPosterHorizontal
              key={poster.id}
              data={poster}
              selected={item?.id === poster.id}
              onClick={(e) => open({ ...poster, variant: "horizontal" }, e.currentTarget)}
            />
          ))}
        </div>
      )}

      {renderCard("horizontal")}

      <div className="gallery__row gallery__row--vertical">
        {verticalPosters.map((poster) => (
          <CombinedPosterVertical
            key={poster.id}
            data={poster}
            selected={item?.id === poster.id}
            onClick={(e) => open({ ...poster, variant: "vertical" }, e.currentTarget)}
          />
        ))}
      </div>

      {renderCard("vertical")}
    </div>
  );
}
