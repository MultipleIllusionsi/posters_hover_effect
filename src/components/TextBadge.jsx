import "./TextBadge.css";

/**
 * TextBadge — a small icon + label chip from the ivi design system.
 *
 * Each variant is a 16px icon next to a 15/20 «IVI Sans Base Medium» label in a
 * semantic colour (green = «свежесть», purple = «про сюжет», orange = «про
 * длину», blue = «популярность сейчас», gold = «награды/статус», ivi-red =
 * «подписка Иви»). The icon SVGs already carry their colour, so `color` only
 * needs to tint the text.
 *
 * Pass a badge descriptor from the catalog in `src/data/badges.js`:
 *   <TextBadge icon={badge.icon} text={badge.text} color={badge.color} />
 * or spread one directly: `<TextBadge {...badge} />`.
 */
export default function TextBadge({ icon, text, color, className = "", ...rest }) {
  return (
    <span
      className={`text-badge ${className}`.trim()}
      style={color ? { color } : undefined}
      {...rest}
    >
      <img className="text-badge__icon" src={icon} alt="" aria-hidden="true" />
      <span className="text-badge__text">{text}</span>
    </span>
  );
}
