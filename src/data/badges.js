import flashSolid from "../../assets/badges/flash-solid.svg";
import multiseries from "../../assets/badges/multiseries.svg";
import meteorite from "../../assets/badges/meteorite.svg";
import magnet from "../../assets/badges/magnet.svg";
import balloon from "../../assets/badges/balloon.svg";
import puzzle from "../../assets/badges/puzzle.svg";
import unicorn from "../../assets/badges/unicorn.svg";
import whirlpool from "../../assets/badges/whirlpool.svg";
import matchstick from "../../assets/badges/matchstick.svg";
import cookie from "../../assets/badges/cookie.svg";
import blinkingEyes from "../../assets/badges/blinking-eyes.svg";
import lightning from "../../assets/badges/lightning.svg";
import oscar from "../../assets/badges/oscar.svg";
import parchment from "../../assets/badges/parchment.svg";
import wreathDuo from "../../assets/badges/wreath-duo.svg";
import medal from "../../assets/badges/medal.svg";
import cherry from "../../assets/badges/cherry.svg";
import subscriptionIvi from "../../assets/badges/subscription-ivi.svg";

/**
 * TextBadge catalog — every variant from the Figma «list_of_badges», keyed by a
 * short id. Icon, label and colour are bound together exactly as in the design;
 * the colour is the Figma token for that badge group:
 *   #21d468 shendi (green)   · #a869f0 york (purple) · #ff542e hanoi (orange)
 *   #00a5ff alexandria (blue)· #e6ae2e rome (gold)   · #f30745 madrid (ivi-red)
 */
export const BADGES = {
  newSeason: { icon: flashSolid, text: "новый сезон", color: "#21d468" },
  allEpisodes: { icon: multiseries, text: "все серии", color: "#21d468" },
  new: { icon: meteorite, text: "новинка", color: "#21d468" },
  instantly: { icon: magnet, text: "сразу интересно", color: "#a869f0" },
  simplePlot: { icon: balloon, text: "простой сюжет", color: "#a869f0" },
  puzzlePlot: { icon: puzzle, text: "сюжет-головоломка", color: "#a869f0" },
  exclusive: { icon: unicorn, text: "эксклюзив", color: "#a869f0" },
  bingeLong: { icon: whirlpool, text: "затянет надолго", color: "#ff542e" },
  shortEpisodes: { icon: matchstick, text: "короткие серии", color: "#ff542e" },
  oneSitting: { icon: cookie, text: "посмотреть за раз", color: "#ff542e" },
  watchingNow: { icon: blinkingEyes, text: "сейчас смотрят 50К", color: "#00a5ff" },
  popular: { icon: lightning, text: "популярно", color: "#e6ae2e" },
  oscar: { icon: oscar, text: "оскар", color: "#e6ae2e" },
  trueStory: { icon: parchment, text: "на реальных событиях", color: "#e6ae2e" },
  legendary: { icon: wreathDuo, text: "легендарный", color: "#e6ae2e" },
  top250: { icon: medal, text: "топ-250", color: "#e6ae2e" },
  iviChoice: { icon: subscriptionIvi, text: "выбор Иви", color: "#f30745" },
  iviSeries: { icon: subscriptionIvi, text: "сериал Иви", color: "#f30745" },
  bestInSub: { icon: cherry, text: "лучшее в подписке", color: "#f30745" },
};

/**
 * Pick a badge whose meaning fits a title's meta chips ([year, genre, kind]).
 *
 * The point is that the label can't contradict the content: season badges only
 * go on series, «на реальных событиях» / «оскар» / «легендарный» never go on
 * anime, films never claim «новый сезон», and so on. Every id collected into
 * `pool` is a valid, meaningful choice for that title; `salt` (the title's
 * running index) then rotates among the few most-specific eligible ones so the
 * shelves show variety rather than the same badge repeated.
 */
export function badgeForMeta(meta = [], salt = 0) {
  const year = parseInt(meta[0], 10) || 0;
  const genre = String(meta[1] || "").toLowerCase();
  const kind = String(meta[2] || "").toLowerCase();

  const isFilm = kind.includes("фильм");
  const seasonsMatch = kind.match(/(\d+)\s*сезон/);
  const seasons = seasonsMatch ? parseInt(seasonsMatch[1], 10) : isFilm ? 0 : 1;
  const isSeries = !isFilm;
  const isAnime = genre.includes("аниме");
  const isNew = year >= 2025;
  const isClassic = year > 0 && year <= 1990;

  const has = (...gs) => gs.some((g) => genre.includes(g));
  const isMelodrama = genre.includes("мелодрама");
  const mystery = has("детектив", "триллер", "криминал", "боевик");
  // Grounded, award-worthy genres. NB «мелодрама» contains the substring
  // «драма», so it's excluded explicitly — romance is not a serious/true-story
  // genre and belongs with the light ones below.
  const serious = has("драма", "военная", "биография") && !isMelodrama;
  const light = isMelodrama || has("комедия", "семейный", "спорт");
  // «На реальных событиях» — only grounded stories, never anime/fantasy/romance.
  const realistic = (serious || has("криминал", "детектив")) && !isAnime;

  const pool = [];
  // Most specific / most bound to the content first.
  if (isSeries && seasons >= 2) pool.push("newSeason");
  if (isClassic) pool.push("legendary");
  if (realistic) pool.push("trueStory");
  if (isFilm && serious && !isAnime && year <= 2018) pool.push("oscar");
  if (mystery) pool.push("puzzlePlot");
  // Top-250 implies established acclaim — never brand-new titles.
  if (!isAnime && (isClassic || (serious && year <= 2015))) pool.push("top250");
  if (isAnime) pool.push("exclusive");
  if (isSeries && seasons >= 2) pool.push("bingeLong");
  if (light) pool.push("simplePlot");
  if (isFilm) pool.push("oneSitting");
  if (isSeries) pool.push("shortEpisodes");
  if (isNew) pool.push("new");
  if (isSeries) pool.push("allEpisodes");
  // «сериал Иви» (iviSeries) намеренно НЕ в авто-пуле — он назначается точечно
  // по slug в postersData (только на конкретные тайтлы).
  // Broadly-applicable tail — always meaningful, used only when nothing more
  // specific applies (or to round out the rotation window).
  pool.push("popular", "instantly", "watchingNow", "bestInSub", "iviChoice");

  // Rotate among the top few eligible (all meaningful) options for variety.
  const window = Math.min(pool.length, 4);
  const id = pool[((salt % window) + window) % window];
  return BADGES[id];
}
