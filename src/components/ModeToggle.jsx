import "./ModeToggle.css";

/**
 * ModeToggle — фиксированный переключатель (справа сверху), выбирающий вариант
 * взаимодействия для всей страницы.
 */

const MODES = [
  { id: "hover", label: "Ховер", hint: "Постер затемняется, всё внутри постера" },
  { id: "sheet", label: "Шторка", hint: "Клик по постеру открывает нижнюю панель" },
  { id: "combined", label: "Совмещённый", hint: "Ховер с логотипом + раскрывающаяся карточка по клику" },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Вариант взаимодействия">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`mode-toggle__option${mode === m.id ? " mode-toggle__option--active" : ""}`}
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
