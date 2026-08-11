#!/usr/bin/env node
/**
 * ivi-extract — вытаскивает реальные данные карточки контента с ivi.ru и кладёт
 * их в src/data/ivi/<slug>.json, откуда их берёт postersData.js.
 *
 * Как это работает — два источника
 * ────────────────────────────────
 * 1) Мобильный API Иви (чистый JSON, работает headless, CORS `*`) — ОСНОВНОЙ
 *    источник базовой инфы и ПОСТЕРОВ:
 *      фильм   → api.ivi.ru/mobileapi/videoinfo/v7/?…&id=<числовой id>
 *      сериал  → api.ivi.ru/mobileapi/compilationinfo/v7/?…&hru=<текстовый hru>
 *    Отсюда берём: description (длинное), synopsis (короткое), posters
 *    (poster-vertical / poster-horizontal), логотип, фоны, кадры, рейтинги.
 * 2) SSR-страница www.ivi.ru/watch/<hru> (`window.__INITIAL_STATE__`) — для
 *    того, чего нет в мобильном API: словари жанров/стран (там только id),
 *    список серий (кадры серий) и отзывы.
 *
 * Все картинки — публичные URL CDN `thumbs.dfs.ivi.ru` (CORS `*`, hotlink ok).
 *
 * Чего НЕ достаётся: играбельный трейлер (видео под DRM; есть только превью-кадр)
 * — его подставляем локально/отдельными ссылками.
 *
 * Гео: серии и отзывы есть в SSR-стейте только на российском рендере www.ivi.ru;
 * из другого региона идёт редирект на www.ivi.tv (там пусто). Обходим заголовком
 * X-Forwarded-For с российским IP (см. IVI_HEADERS) — тогда всё тянется headless
 * из любого региона.
 *
 * Тип контента по аргументу: числовой → фильм (videoinfo по id); текстовый hru
 * может быть и сериалом, и фильмом — пробуем compilationinfo, затем videoinfo?hru.
 *
 * Запуск:  node scripts/ivi-extract.mjs <id|hru> [<id|hru> ...]
 * Пример:  node scripts/ivi-extract.mjs hrustalnyij      (сериал по hru)
 *          node scripts/ivi-extract.mjs 112399           (фильм по id)
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../src/data/ivi");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126 Safari/537.36";

/**
 * Российский IP в X-Forwarded-For заставляет ivi.ru отдавать полный российский
 * рендер (с сериями и отзывами в SSR-стейте) вместо гео-редиректа на ivi.tv, где
 * они пусты. Позволяет тянуть всё headless из любого региона.
 */
const RU_IP = "95.108.213.1";
const IVI_HEADERS = { "User-Agent": UA, "Accept-Language": "ru-RU,ru", "X-Forwarded-For": RU_IP };

/** Публичный CDN картинок Иви умеет ресайз через сегмент пути /<W>x<H>/. */
const CDN_RESIZE = (url, w, h) => `${url}/${w}x${h}/?q=85&mod=to_webp`;

const MOBILE_API = "https://api.ivi.ru/mobileapi";
const MOBILE_PARAMS = "app_version=870&country_place_id=41207";

/**
 * Базовая инфа + постеры из мобильного API Иви. Числовой аргумент — это фильм
 * (videoinfo по id); текстовый — сериал (compilationinfo по hru). Возвращает
 * `result` (тот же по форме объект, что и SSR-compilation) и флаг сериала.
 */
async function tryInfo(url) {
  const res = await fetch(url, { headers: IVI_HEADERS });
  if (!res.ok) return null;
  const info = (await res.json())?.result;
  return info && info.id ? info : null;
}

async function fetchMobileInfo(idOrHru) {
  const key = String(idOrHru);
  // Числовой аргумент — всегда фильм по id.
  if (/^\d+$/.test(key)) {
    const info = await tryInfo(`${MOBILE_API}/videoinfo/v7/?${MOBILE_PARAMS}&id=${key}`);
    if (info) return { info, isSeries: false };
    throw new Error(`mobileapi: пустой result (videoinfo id=${key})`);
  }
  // Текстовый hru бывает и у сериала, и у фильма — сначала пробуем сериал
  // (compilationinfo), затем фильм (videoinfo по hru).
  const enc = encodeURIComponent(key);
  const series = await tryInfo(`${MOBILE_API}/compilationinfo/v7/?${MOBILE_PARAMS}&hru=${enc}`);
  if (series) return { info: series, isSeries: true };
  const film = await tryInfo(`${MOBILE_API}/videoinfo/v7/?${MOBILE_PARAMS}&hru=${enc}`);
  if (film) return { info: film, isSeries: false };
  throw new Error(`mobileapi: пустой result для «${key}»`);
}

/**
 * Реальное «похожее» из каталога Иви — тайтлы той же категории и (главного)
 * жанра, что и наш контент. Настоящий персональный рейл «С этим смотрят» под
 * анти-бот/сессионной защитой и headless не отдаётся, поэтому берём жанровую
 * подборку через catalogue: у каждого элемента есть постер, описание и мета.
 */
async function fetchSimilar(comp, genresById = {}, limit = 10) {
  const category = (comp.categories || [])[0];
  const genre = (comp.genres || [])[0];
  if (category == null || genre == null) return [];
  const genreName = genresById[genre]?.title?.toLowerCase() || null;
  const url =
    `${MOBILE_API}/catalogue/v7/?${MOBILE_PARAMS}&category=${category}&genre=${genre}&from=0&to=${limit + 5}`;
  let list = [];
  try {
    const res = await fetch(url, { headers: IVI_HEADERS });
    if (res.ok) list = (await res.json()).result || [];
  } catch {
    return [];
  }
  return list
    .filter((x) => x.id !== comp.id) // без самого тайтла
    .map((x) => {
      const posterH = pickImage(x.posters, { type: "poster-horizontal" });
      if (!posterH) return null;
      const year = Array.isArray(x.years) ? x.years[0] : x.year;
      return {
        id: `sim-${x.id}`,
        title: x.title,
        src: CDN_RESIZE(posterH.url, 640, 360),
        description: stripHtml(x.short_description || x.synopsis),
        meta: [year ? String(year) : null, genreName].filter(Boolean),
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}

/**
 * Достаёт объект `window.__INITIAL_STATE__ = {...}` из HTML. Наивный regex тут
 * не годится (в JSON вложенные скобки и строки), поэтому матчим скобки вручную,
 * уважая строки и экранирование, и парсим ровно найденный кусок.
 */
function extractInitialState(html) {
  const marker = "window.__INITIAL_STATE__ = ";
  const start = html.indexOf(marker);
  if (start < 0) throw new Error("В HTML нет window.__INITIAL_STATE__");
  const begin = start + marker.length;
  if (html[begin] !== "{") throw new Error("После маркера ожидалась {");

  let depth = 0;
  let inStr = false;
  let esc = false;
  let i = begin;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      i++;
      break;
    }
  }
  return JSON.parse(html.slice(begin, i));
}

/** Снимает HTML-разметку и склеивает переносы в человекочитаемый абзац. */
const stripHtml = (s = "") =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** «сезон / сезона / сезонов» по числу. */
const seasonWord = (n) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "сезон";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "сезона";
  return "сезонов";
};

/** Первый элемент images-массива с подходящим content_format / type. */
const pickImage = (arr = [], { format, type } = {}) =>
  arr.find(
    (im) =>
      (format ? im.content_format === format : true) &&
      (type ? im.type === type : true)
  ) || null;

/** Все URL кадров-скриншотов (Shots-*), пригодятся как заставки. */
const pickShots = (promo = []) =>
  promo.filter((im) => /^Shots-/.test(im.content_format || "")).map((im) => im.url);

// `comp` — объект из мобильного API (базовая инфа + постеры), `state` — SSR-стейт
// (нужен для словарей жанров/стран, списка серий и отзывов).
function normalize(comp, state, slug, isSeries) {
  const genresById = state.genres || {};
  const countriesById = state.countries || {};
  const genres = (comp.genres || []).map((id) => genresById[id]?.title).filter(Boolean);
  const country = countriesById[comp.country]?.title || null;
  const year = Array.isArray(comp.years) ? comp.years[0] : comp.year || null;

  // ── Картинки ──────────────────────────────────────────────────────────────
  // Постеры — из массива posters мобильного API: poster-vertical / poster-horizontal
  // (это настоящие постеры, а не «чистый» фон-бэкдроп из promo_images).
  const posterV = pickImage(comp.posters, { type: "poster-vertical" });
  const posterH = pickImage(comp.posters, { type: "poster-horizontal" });
  const logo = (comp.title_image || [])[0] || null;
  const background = pickImage(comp.promo_images, { format: "BackgroundImage-1280x720" });
  // Трейлер берём из additional_data SSR-стейта — там он полный; в ответе
  // мобильного API он бывает пропущен (напр. у «Монолога»). Фолбэк — мобильный.
  const ssrComp =
    Object.values(state?.common?.compilation || {})[0] ||
    Object.values(state?.common?.content || {}).find((c) => c && typeof c.episode !== "number");
  const additionalData = (ssrComp?.additional_data || []).length
    ? ssrComp.additional_data
    : comp.additional_data || [];
  const trailerAd = additionalData.find((a) => a.data_type === "trailer");

  const images = {
    // Постеры без alpha → лёгкий webp с ресайзом под наш дисплей (×2).
    posterVertical: posterV ? CDN_RESIZE(posterV.url, 445, 675) : null,
    posterHorizontal: posterH ? CDN_RESIZE(posterH.url, 1352, 760) : null,
    // Логотип — прозрачный PNG; берём как есть, чтобы гарантированно сохранить alpha.
    logo: logo ? logo.url : null,
    background: background ? CDN_RESIZE(background.url, 1280, 720) : null,
    shots: pickShots(comp.promo_images).slice(0, 6).map((u) => CDN_RESIZE(u, 1280, 720)),
    trailerPreview: trailerAd?.preview?.url || null,
  };

  // ── Серии и сезоны ──────────────────────────────────────────────────────────
  // Объекты серий лежат в common.content, привязка к сериалу — по полю
  // compilation (оно бывает объектом {id,...} или голым id — учитываем оба).
  const contentMap = state?.common?.content || {};
  const compIdOf = (c) =>
    c && c.compilation && typeof c.compilation === "object" ? c.compilation.id : c?.compilation;
  const allEpisodes = Object.values(contentMap)
    .filter((c) => c && compIdOf(c) === comp.id && typeof c.episode === "number")
    .sort((a, b) => (a.season - b.season) || (a.episode - b.episode));

  const bySeason = new Map();
  for (const ep of allEpisodes) {
    const sn = ep.season || 1;
    if (!bySeason.has(sn)) bySeason.set(sn, []);
    const durationSec = ep.localizations?.[0]?.duration || 0;
    const minutes = durationSec ? Math.round(durationSec / 60) : null;
    bySeason.get(sn).push({
      id: `e${ep.episode}`,
      title: ep.title || `Серия ${ep.episode}`,
      subtitle: minutes ? `${ep.episode} серия · ${minutes} мин` : `${ep.episode} серия`,
      still: (ep.thumbs || [])[0]?.url || null,
    });
  }
  const seasons = [...bySeason.entries()].map(([sn, episodes]) => ({
    id: `s${sn}`,
    title: `Сезон ${sn}`,
    episodes,
  }));

  const seasonCount = seasons.length || (comp.seasons || []).length || 1;

  // ── Отзывы (comments) ───────────────────────────────────────────────────────
  // У контента два типа: рецензии (reviews — длинные, развёрнутые) и отзывы
  // (comments — короткие). Берём именно отзывы: имя автора и текст, первые 10, в
  // порядке «best». Оценки у отзыва на сайте нет. Тоже подгружается лениво: в
  // headless-рендере common.comments может быть пуст (та же гео-оговорка, что и
  // про серии).
  const COMMENTS_LIMIT = 10;
  const commentsMap = state?.common?.comments || {};
  const commentIds =
    state?.pages?.watch?.comments?.best?.commentsIds || Object.keys(commentsMap);
  const comments = commentIds
    .map((id) => commentsMap[id])
    .filter(Boolean)
    .slice(0, COMMENTS_LIMIT)
    .map((c, i) => ({
      id: `c${i + 1}`,
      author:
        (typeof c.author === "object" ? c.author?.nick || c.author?.name : c.author) || "Гость",
      text: stripHtml(c.text),
    }));

  return {
    slug,
    id: comp.id,
    title: comp.title,
    year,
    country,
    genres,
    // У сериала последний чип — число сезонов, у фильма — «фильм» (по нему же
    // компоненты прячут вкладку «Сезоны»).
    meta: [
      year ? String(year) : null,
      genres[0] ? genres[0].toLowerCase() : null,
      isSeries ? `${seasonCount} ${seasonWord(seasonCount)}` : "фильм",
    ].filter(Boolean),
    ratings: {
      kp: comp.kp_rating ? Number(comp.kp_rating) : null,
      imdb: comp.imdb_rating ? Number(comp.imdb_rating) : null,
      ivi: comp.ivi_rating_10 ?? null,
    },
    shortDescription: stripHtml(comp.short_description),
    synopsis: stripHtml(comp.synopsis),
    description: stripHtml(comp.description),
    images,
    seasons,
    comments,
  };
}

async function extractSlug(idOrHru) {
  // 1) Мобильный API — базовая инфа + постеры (чистый JSON, работает headless).
  const { info, isSeries } = await fetchMobileInfo(idOrHru);
  const hru = info.hru || String(idOrHru);

  // 2) SSR-страница — словари жанров/стран, список серий и отзывы.
  const url = `https://www.ivi.ru/watch/${hru}`;
  const res = await fetch(url, { headers: IVI_HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error(`${hru}: watch HTTP ${res.status}`);
  const html = await res.text();
  const state = extractInitialState(html);

  const data = normalize(info, state, hru, isSeries);

  // 3) «Похожее» — жанровая подборка из каталога (мобильный API, headless ok).
  data.similar = await fetchSimilar(info, state.genres || {}, 10);

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = resolve(OUT_DIR, `${hru}.json`);
  await writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");

  const epCount = data.seasons.reduce((n, s) => n + s.episodes.length, 0);
  console.log(
    `✓ ${hru} → ${outPath.replace(process.cwd() + "/", "")}\n` +
      `  «${data.title}» ${data.year} · ${data.genres.join(", ")} · ` +
      `${data.seasons.length} сез. / ${epCount} серий\n` +
      `  логотип: ${data.images.logo ? "есть" : "нет"} · ` +
      `постер-гор: ${data.images.posterHorizontal ? "есть" : "нет"} · ` +
      `кадров-серий: ${epCount} · shots: ${data.images.shots.length} · ` +
      `отзывов: ${data.comments.length} · похожего: ${data.similar.length}`
  );
}

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("Использование: node scripts/ivi-extract.mjs <slug> [<slug> ...]");
  process.exit(1);
}

let failed = 0;
for (const slug of slugs) {
  try {
    await extractSlug(slug);
  } catch (err) {
    failed++;
    console.error(`✗ ${slug}: ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);
