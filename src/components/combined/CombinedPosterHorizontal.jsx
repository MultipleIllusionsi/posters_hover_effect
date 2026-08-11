import TextBadge from "../TextBadge";
import "./CombinedPosterHorizontal.css";

/**
 * CombinedPosterHorizontal — ландшафтный постер «Совмещённого». По наведению
 * артворк остаётся (лёгкий зум), снизу поднимается затемняющий градиент, а на
 * нём — бейдж и описание по центру внизу. Клик открывает карточку (логика в
 * CombinedGrid); `selected` рисует под постером указатель и рамку. Показ —
 * чистый CSS `:hover`, состояния нет.
 */
export default function CombinedPosterHorizontal({ data, selected = false, ...rest }) {
  return (
    <button
      type="button"
      className={`combined-horizontal${selected ? " combined-horizontal--selected" : ""}`}
      {...rest}
    >
      <span className="combined-horizontal__media">
        <img className="combined-horizontal__image" src={data.src} alt={data.alt} loading="lazy" />
        <span className="combined-horizontal__scrim" aria-hidden="true" />
      </span>

      <span className="combined-horizontal__panel">
        <span className="combined-horizontal__text">
          {data.badge && (
            <span className="combined-horizontal__brand">
              <TextBadge className="combined-horizontal__badge" {...data.badge} />
            </span>
          )}
          <span className="combined-horizontal__description">{data.description}</span>
        </span>
      </span>
    </button>
  );
}
