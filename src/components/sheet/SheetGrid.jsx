import { useCallback, useEffect, useRef, useState } from "react";
import SheetPoster from "./SheetPoster";
import SheetPanel from "./SheetPanel";

/** Высота панели «Шторка» в px (см. --sheet-h в SheetPanel.css). */
const SHEET_H = 240;

/** Держим в синхроне с exit-анимацией .sheet--leaving в SheetPanel.css. */
const EXIT_DURATION = 360;

/**
 * Каждый SheetGrid на странице регистрирует сюда свою мгновенную закрывашку.
 * Панель — синглтон на всю страницу: когда открывается одна, любую другую
 * закрываем, чтобы на экране всегда была ровно одна.
 */
const closers = new Set();

/**
 * Доскроллить страницу ровно настолько, чтобы кликнутый постер целиком попал
 * в видимую полосу — вьюпорт минус высота панели и небольшой отступ. Подтягивает
 * вверх, если постер обрезан сверху, и вниз (из-под панели), если снизу; постер
 * выше полосы выравнивается по верху, чтобы его начало всегда было видно.
 */
const revealPoster = (el) => {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const margin = 16;
  const topBound = margin;
  const bottomBound = window.innerHeight - SHEET_H - margin;

  let delta = 0;
  if (rect.height > bottomBound - topBound || rect.top < topBound) {
    delta = rect.top - topBound; // выравниваем по верху полосы
  } else if (rect.bottom > bottomBound) {
    delta = rect.bottom - bottomBound; // подтягиваем над панелью
  }

  if (delta !== 0) {
    window.scrollBy({ top: delta, behavior: "smooth" });
  }
};

/**
 * SheetGrid — вариант «Шторка». Постеры кликабельны; клик поднимает снизу одну
 * общую панель (SheetPanel), закреплённую у нижнего края экрана.
 */
export default function SheetGrid({ horizontalPosters, verticalPosters }) {
  // Постер, чей контент показывает панель (null = закрыта).
  const [item, setItem] = useState(null);
  // На время закрытия панель остаётся в DOM, чтобы доиграть exit-анимацию.
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef(null);

  // Закрывает панель этого грида мгновенно, без анимации — когда её перехватывает
  // другой грид, чтобы две не оказались на экране разом.
  const closeNow = useCallback(() => {
    clearTimeout(exitTimer.current);
    setLeaving(false);
    setItem(null);
    document.body.classList.remove("has-bottom-sheet");
  }, []);

  const open = useCallback(
    (poster, el) => {
      // Синглтон: сначала закрываем панель, открытую в другом гриде.
      closers.forEach((close) => {
        if (close !== closeNow) close();
      });
      // Открытие (или смена постера) отменяет незавершённое закрытие.
      clearTimeout(exitTimer.current);
      setLeaving(false);
      setItem(poster);
      // Добавляем нижний запас ДО доскролла, чтобы постеру из последнего ряда
      // было куда подняться над панелью.
      document.body.classList.add("has-bottom-sheet");
      revealPoster(el);
    },
    [closeNow]
  );

  const close = useCallback(() => {
    setLeaving(true);
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => {
      setItem(null);
      setLeaving(false);
      document.body.classList.remove("has-bottom-sheet");
    }, EXIT_DURATION);
  }, []);

  // Регистрируем мгновенную закрывашку, чтобы другие гриды могли её перехватить.
  useEffect(() => {
    closers.add(closeNow);
    return () => closers.delete(closeNow);
  }, [closeNow]);

  // Снятие с монтирования (в т.ч. при смене режима): гасим таймер и нижний запас.
  useEffect(
    () => () => {
      clearTimeout(exitTimer.current);
      document.body.classList.remove("has-bottom-sheet");
    },
    []
  );

  return (
    <div className="gallery">
      {horizontalPosters.length > 0 && (
        <div className="gallery__row gallery__row--horizontal">
          {horizontalPosters.map((poster) => (
            <SheetPoster
              key={poster.id}
              shape="horizontal"
              src={poster.src}
              alt={poster.alt}
              selected={item?.id === poster.id}
              onClick={(e) => open(poster, e.currentTarget)}
            />
          ))}
        </div>
      )}

      <div className="gallery__row gallery__row--vertical">
        {verticalPosters.map((poster) => (
          <SheetPoster
            key={poster.id}
            shape="vertical"
            src={poster.src}
            alt={poster.alt}
            selected={item?.id === poster.id}
            onClick={(e) => open(poster, e.currentTarget)}
          />
        ))}
      </div>

      {item && <SheetPanel data={item} onClose={close} leaving={leaving} />}
    </div>
  );
}
