import { useEffect, useRef, useState } from "react";
import { IconBurger, IconCheck } from "./icons";
import "./ModeToggle.css";

/**
 * ModeToggle — фиксированный переключатель варианта взаимодействия (справа
 * сверху). Свёрнут выглядит как кнопка-бургер; по ховеру (или фокусу — для
 * тача/клавиатуры) раскрывается в пилюлю с вариантами. После выбора варианта
 * сворачивается обратно (класс --collapsed перебивает ховер, пока курсор рядом)
 * и на секунду показывает галочку-подтверждение вместо бургера.
 */

const MODES = [
  { id: "hover", label: "Ховер", hint: "Постер затемняется, всё внутри постера" },
  { id: "sheet", label: "Шторка", hint: "Клик по постеру открывает нижнюю панель" },
  { id: "combined", label: "Карточка", hint: "Ховер с логотипом + раскрывающаяся карточка по клику" },
];

/** Сколько показываем галочку после выбора нового варианта. */
const CHECK_MS = 1000;

export default function ModeToggle({ mode, onChange }) {
  // После клика по варианту принудительно сворачиваем меню; сбрасываем, когда
  // курсор уходит, чтобы следующий ховер снова раскрывал.
  const [collapsed, setCollapsed] = useState(false);
  // Кратко показать галочку-подтверждение вместо бургера после выбора.
  const [checked, setChecked] = useState(false);
  const checkTimer = useRef(null);

  useEffect(() => () => clearTimeout(checkTimer.current), []);

  const pick = (id) => {
    const changed = id !== mode;
    onChange(id);
    setCollapsed(true);
    // Снимаем фокус — иначе :focus-within держал бы меню раскрытым.
    document.activeElement?.blur?.();
    if (changed) {
      setChecked(true);
      clearTimeout(checkTimer.current);
      checkTimer.current = setTimeout(() => setChecked(false), CHECK_MS);
    }
  };

  return (
    <div
      className={`mode-toggle${collapsed ? " mode-toggle--collapsed" : ""}`}
      role="group"
      aria-label="Вариант взаимодействия"
      onMouseLeave={() => setCollapsed(false)}
    >
      <div className="mode-toggle__options">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`mode-toggle__option${mode === m.id ? " mode-toggle__option--active" : ""}`}
            aria-pressed={mode === m.id}
            title={m.hint}
            onClick={() => pick(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Свёрнутое состояние — бургер (или галочка сразу после выбора); служит
          и «ручкой» для раскрытия. Ключ на иконке — чтобы её смена проигрывала
          анимацию появления. */}
      <button
        type="button"
        className="mode-toggle__burger"
        aria-label={checked ? "Вариант выбран" : "Сменить вариант"}
      >
        <span className="mode-toggle__burger-icon" key={checked ? "check" : "burger"}>
          {checked ? <IconCheck /> : <IconBurger />}
        </span>
      </button>
    </div>
  );
}
