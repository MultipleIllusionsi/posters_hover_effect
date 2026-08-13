/** Иконки, общие для всех вариантов взаимодействия. */

export function IconPlay() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
      <path
        d="M11.2 6.16 1.55.15A1 1 0 0 0 0 1v12.03a1 1 0 0 0 1.55.84l9.65-6.01a1 1 0 0 0 0-1.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Speaker cone shared by both sound icons. */
const SPEAKER_CONE =
  "M8.4 1.7 4.8 4.9H2.2A1.2 1.2 0 0 0 1 6.1v3.8a1.2 1.2 0 0 0 1.2 1.2h2.6l3.6 3.2a.6.6 0 0 0 1-.45V2.15a.6.6 0 0 0-1-.45Z";

export function IconSoundOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={SPEAKER_CONE} fill="currentColor" />
      <path
        d="m11.4 6.2 3.2 3.6M14.6 6.2l-3.2 3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSoundOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={SPEAKER_CONE} fill="currentColor" />
      <path
        d="M11.3 5.6a3.4 3.4 0 0 1 0 4.8M13.5 3.6a6.4 6.4 0 0 1 0 8.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconFavorite() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
      <path
        d="M2 1h8a1 1 0 0 1 1 1v12.2a.8.8 0 0 1-1.27.65L6 12.3l-3.73 2.55A.8.8 0 0 1 1 14.2V2a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Галочка — кратко показывается после выбора варианта (подтверждение). */
export function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Бургер-меню (три линии) — свёрнутый переключатель вариантов. */
export function IconBurger() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Крестик — закрытие (напр. кнопка выхода из плеера). */
export function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Шеврон для кнопок листания рейлов; `left` разворачивает влево. */
export function IconChevron({ left = false }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={left ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Незаполненная закладка — состояние «не в избранном» (по клику → IconFavorite). */
export function IconFavoriteOutline() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
      <path
        d="M2 1h8a1 1 0 0 1 1 1v12.2a.8.8 0 0 1-1.27.65L6 12.3l-3.73 2.55A.8.8 0 0 1 1 14.2V2a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
