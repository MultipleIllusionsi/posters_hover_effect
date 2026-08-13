import { useSyncExternalStore } from "react";

/**
 * Крошечный глобальный стор для «фейкового» полноэкранного плеера. Открыть его
 * можно из любого варианта (кнопка «Смотреть», клик по серии), а рендерится он
 * один раз в App поверх всего окна.
 *
 * payload: { title, background, isFilm, season, episode }
 *   · isFilm — у фильма подписи сезон/серия нет;
 *   · season/episode — для подписи сериала («Серия N сезон M»).
 */
let state = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export function openPlayer(payload) {
  state = payload;
  emit();
}

export function closePlayer() {
  state = null;
  emit();
}

/**
 * Открыть плеер для контента карточки. По умолчанию — 1 сезон 1 серия (клик по
 * «Смотреть»); для клика по конкретной серии передаём её сезон/номер.
 */
export function playContent(data, { season = 1, episode = 1 } = {}) {
  openPlayer({
    title: data.title,
    background: data.still || data.src,
    isFilm: data.meta?.includes("фильм") ?? false,
    season,
    episode,
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlayer() {
  return useSyncExternalStore(subscribe, () => state, () => null);
}
