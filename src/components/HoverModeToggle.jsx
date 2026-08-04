import "./HoverModeToggle.css";

/**
 * HoverModeToggle — fixed control (bottom right) that switches which hover
 * treatment the section uses. v1 changes both rows; v2 and v3 differ only in
 * the vertical posters — the horizontal ones are the same in either.
 */

const MODES = [
  // { id: "v1", label: "Ховер-КК", hint: "Постер заменяется карточкой" },
  { id: "v3", label: "Ховер", hint: "Постер затемняется, всё внутри постера" },
  { id: "v4", label: "Шторка", hint: "Клик по постеру открывает нижнюю панель" },
  { id: "v5", label: "Смещение", hint: "Панель раскрывается под постером, сдвигая всё вниз" },
  { id: "v6", label: "Совмещённый", hint: "Ховер с логотипом + раскрывающаяся карточка по клику" },
  // { id: "v2", label: "Ховер натив", hint: "Информация появляется под постером" },
];

export default function HoverModeToggle({ mode, onChange }) {
  return (
    <div className="hover-mode" role="group" aria-label="Вариант ховера">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`hover-mode__option${mode === m.id ? " hover-mode__option--active" : ""}`}
          aria-pressed={mode === m.id}
          title={m.hint}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
