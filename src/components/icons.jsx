/**
 * Icons shared by the v2 hover components.
 *
 * The v1 card (PosterHover.jsx) keeps its own copies — that implementation is
 * finished and isn't being edited.
 */

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
