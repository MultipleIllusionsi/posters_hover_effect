import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevron } from "./icons";
import "./ScrollRail.css";

/**
 * ScrollRail — обёртка над любым горизонтально прокручиваемым списком (отзывы,
 * серии, «похожее»). По ховеру показывает круглые кнопки листания: «вправо» —
 * если ещё есть куда прокрутить, «влево» — если можно вернуться назад. Кнопки —
 * общие для всех вариантов (сама раскладка списка остаётся у каждого своя).
 *
 * `as` — тег списка (по умолчанию ul), `className` и children пробрасываются в
 * него; скролл-контейнером служит именно этот список.
 */
export default function ScrollRail({ as: Tag = "ul", className, children, ...rest }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  // Пересчитываем и при смене контента (другой сезон / другой тайтл).
  useEffect(update);

  const nudge = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="scroll-rail">
      {/* Краевой фейд управляется прокруткой: слева гаснет только когда есть что
          прокрутить назад, справа — только когда есть что прокрутить вперёд, так
          что в начале не затемнён левый край, а в конце — последний элемент. */}
      <Tag
        className={`${className} scroll-rail__list`}
        ref={ref}
        style={{
          "--fade-left": canLeft ? "var(--rail-fade)" : "0px",
          "--fade-right": canRight ? "var(--rail-fade)" : "0px",
        }}
        {...rest}
      >
        {children}
      </Tag>
      <button
        type="button"
        className="scroll-rail__arrow scroll-rail__arrow--left"
        data-visible={canLeft}
        aria-label="Прокрутить назад"
        tabIndex={-1}
        onClick={() => nudge(-1)}
      >
        <IconChevron left />
      </button>
      <button
        type="button"
        className="scroll-rail__arrow scroll-rail__arrow--right"
        data-visible={canRight}
        aria-label="Прокрутить вперёд"
        tabIndex={-1}
        onClick={() => nudge(1)}
      >
        <IconChevron />
      </button>
    </div>
  );
}
