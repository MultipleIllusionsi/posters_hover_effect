import TextBadge from "../TextBadge";
import "./CombinedPosterVertical.css";

/**
 * CombinedPosterVertical — вертикальный постер варианта «Совмещённый». По
 * наведению артворк остаётся (без блюра), снизу поднимается затемняющий
 * градиент, а на нём — бейдж и описание по центру. Клик открывает карточку
 * (логика в CombinedGrid); `selected` рисует под постером указатель и рамку.
 */
export default function CombinedPosterVertical({ data, selected = false, ...rest }) {
  return (
    <button
      type="button"
      className={`combined-vertical${selected ? " combined-vertical--selected" : ""}`}
      {...rest}
    >
      <span className="combined-vertical__media">
        <img className="combined-vertical__image" src={data.src} alt={data.alt} loading="lazy" />
        <span className="combined-vertical__scrim" aria-hidden="true" />

        <span className="combined-vertical__overlay">
          <span className="combined-vertical__text">
            {data.badge && (
              <span className="combined-vertical__brand">
                <TextBadge className="combined-vertical__badge" {...data.badge} rating={data.rating} />
              </span>
            )}
            <span className="combined-vertical__description">{data.description}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
