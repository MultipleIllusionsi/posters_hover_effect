import "./SheetPoster.css";

/**
 * SheetPoster — простой постер-кнопка для варианта «Шторка». По клику открывает
 * нижнюю панель (логика в SheetGrid). `shape` задаёт формат — вертикаль или
 * горизонталь (меняются пропорции и радиус); `selected` подсвечивает выбранный.
 */
export default function SheetPoster({ src, alt = "", shape = "vertical", selected = false, ...rest }) {
  return (
    <button
      type="button"
      className={[
        "sheet-poster",
        `sheet-poster--${shape}`,
        selected && "sheet-poster--selected",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span className="sheet-poster__media">
        <img className="sheet-poster__image" src={src} alt={alt} />
      </span>
    </button>
  );
}
