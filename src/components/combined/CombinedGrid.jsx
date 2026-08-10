import { useCallback, useEffect, useRef, useState } from "react";
import CombinedPosterHorizontal from "./CombinedPosterHorizontal";
import CombinedPosterVertical from "./CombinedPosterVertical";
import CombinedCard from "./CombinedCard";

/** Держим в синхроне с exit-анимацией .combined-expander--leaving в CombinedCard.css. */
const EXIT_DURATION = 300;

/** Синглтон на всю страницу: одновременно открыта только одна карточка. */
const closers = new Set();

/**
 * CombinedGrid — вариант «Совмещённый». Постеры показывают лого/описание по
 * наведению и кликабельны: клик раскрывает карточку (CombinedCard) прямо под
 * рядом кликнутого постера, толкая контент ниже вниз.
 */
export default function CombinedGrid({ horizontalPosters, verticalPosters }) {
  // Постер, чья карточка открыта (null = закрыта), и идёт ли сворачивание.
  const [item, setItem] = useState(null);
  const [leaving, setLeaving] = useState(false);
  // Карточка-«призрак», сворачивающаяся в старом ряду, пока новая открывается
  // в другом, — за счёт этого переключение между рядами выглядит непрерывным.
  const [closing, setClosing] = useState(null);
  const exitTimer = useRef(null);
  const closeTimer = useRef(null);
  // Текущий item, читаемый синхронно внутри замыкания open.
  const itemRef = useRef(null);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  const closeNow = useCallback(() => {
    clearTimeout(exitTimer.current);
    clearTimeout(closeTimer.current);
    setLeaving(false);
    setItem(null);
    setClosing(null);
  }, []);

  const open = useCallback(
    (next) => {
      // Синглтон: закрываем карточку, открытую в другом гриде.
      closers.forEach((close) => {
        if (close !== closeNow) close();
      });
      clearTimeout(exitTimer.current);
      // Переключение на постер в ДРУГОМ ряду: оставляем старую карточку в её
      // ряду сворачиваться, пока новая открывается — обе анимируются разом.
      const prev = itemRef.current;
      if (prev && prev.variant !== next.variant) {
        setClosing(prev);
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setClosing(null), EXIT_DURATION);
      }
      setLeaving(false);
      setItem(next);
    },
    [closeNow]
  );

  const close = useCallback(() => {
    setLeaving(true);
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      setItem(null);
      setLeaving(false);
    }, EXIT_DURATION);
  }, []);

  useEffect(() => {
    closers.add(closeNow);
    return () => closers.delete(closeNow);
  }, [closeNow]);

  useEffect(
    () => () => {
      clearTimeout(exitTimer.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  // Раскрывающаяся карточка рендерится сразу после ряда кликнутого постера,
  // чтобы открываться от его низа и толкать всё ниже вниз. В каждом ряду не
  // больше одной: активная (откр./закр.) или «призрак» при переключении рядов.
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
              onClick={() => open({ ...poster, variant: "horizontal" })}
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
            onClick={() => open({ ...poster, variant: "vertical" })}
          />
        ))}
      </div>

      {renderCard("vertical")}
    </div>
  );
}
