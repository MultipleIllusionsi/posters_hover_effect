// Трейлеры — локальные (видео Иви под DRM); заменишь ссылками позже.
import t1 from "../../assets/video_trailers/trailer_1.mp4";
import t2 from "../../assets/video_trailers/trailer_2.mp4";
import t3 from "../../assets/video_trailers/trailer_3.mp4";
import t4 from "../../assets/video_trailers/trailer_4.mp4";

// Реальные данные каждой карточки, вытащенные с ivi.ru скриптом
// scripts/ivi-extract.mjs. Картинки — публичные URL CDN Иви (грузятся вживую).
import aleksLyutyij from "./ivi/aleks-lyutyij.json";
import hrustalnyij from "./ivi/hrustalnyij.json";
import peregovorschik from "./ivi/peregovorschik.json";
import kazanova from "./ivi/kazanova-2020.json";
import sherlok from "./ivi/sherlok_holms_i_doktor_vatson.json";
import lepila from "./ivi/lepila.json";
import akusher from "./ivi/akusher.json";
import delfin from "./ivi/delfin.json";
import otchiyDom from "./ivi/168196.json";
import izgnanie from "./ivi/96320.json";
import letyatZhuravli from "./ivi/53159.json";
import moyLaskovyj from "./ivi/53130.json";
import kogdaDerevya from "./ivi/51505.json";
import monolog from "./ivi/26594.json";
import otelTasokare from "./ivi/otel-tasokare.json";
import bezdarnayaZlodejka from "./ivi/hot-i-bezdarnaya-zlodejka.json";
import temnoeDitya from "./ivi/temnoe-ditya-otgoloski.json";
import rodstvennyeDushi from "./ivi/rodstvennyie-dushi-2020.json";
import klevatess from "./ivi/klevatess-korol-demonicheskih-zverej-mladenets-i-geroj-nezhit.json";
import liniyaRazloma from "./ivi/liniya-razloma.json";
import holod from "./ivi/holod.json";
import zolotoeDno from "./ivi/zolotoe-dno.json";
import zatmenie from "./ivi/zatmenie-2025.json";
import istoriyaSluzhanki from "./ivi/istoriya-ego-sluzhanki.json";
import pirogovka from "./ivi/pirogovka.json";
import strahNadNevoj from "./ivi/strah-nad-nevoj.json";
import taksi from "./ivi/taksi-pod-prikryitiem.json";
import iskusstvoSoblazna from "./ivi/iskusstvo-soblazna.json";
import mazhor from "./ivi/mazhor.json";
import kuhnya from "./ivi/kuhnya_2012.json";
import klon from "./ivi/klon.json";
import proslushka from "./ivi/proslushka.json";
import besprintsipnyie from "./ivi/besprintsipnyie-2020.json";
import velikolepnyjVek from "./ivi/velikolepnyij-vek.json";
import papinyDochki from "./ivi/papinyi-dochki-novyie.json";
import stambul from "./ivi/vo-vsyom-vinovat-stambul.json";
import domovyonokKuzya from "./ivi/domovyonok-kuzya-2.json";
import molodyozhka from "./ivi/molodyozhka-studentyi.json";
import zheltyjChemodanchik from "./ivi/priklyucheniya-zhyoltogo-chemodanchika-2026.json";
import draniki from "./ivi/draniki.json";
import { badgeForMeta, BADGES } from "./badges";

/**
 * Каждая карточка строится из JSON'а, вытащенного с ivi.ru. Форма карточки:
 *   id           slug контента (уникален на странице)
 *   src          постер (горизонтальный для гор. ряда, вертикальный для верт.)
 *   logo         лого-вордмарк
 *   alt, title   название
 *   meta         чипы («2021 · детективы · 1 сезон» или «… · фильм»)
 *   description  короткое описание (ховер)
 *   longDescription  синопсис (шторка/совмещённый)
 *   trailer      ЛОКАЛЬНОЕ видео (циклично t1–t4) — видео Иви под DRM
 *   still        кадр-заставка для трейлера
 *   seasons      [{ id, title, episodes:[{ id, title, subtitle, still }] }]
 *   reviews      отзывы Иви [{ id, author, text }] — без оценки
 *   similar      «похожее» (жанровая подборка Иви)
 *   badge        назначается ниже по meta (локальный каталог badges.js)
 */
const TRAILERS = [t1, t2, t3, t4];
let trailerIndex = 0;

// Слаги без трейлера на Иви (проверено по SSR) — у них вместо видео показываем
// BackgroundImage. У остальных трейлер есть (пока локальная заглушка, дальше —
// реальные mp4 с CDN).
const NO_TRAILER = new Set(["aleks-lyutyij", "168196", "53130", "51505"]);

function card(data, shape) {
  const poster = shape === "horizontal" ? data.images.posterHorizontal : data.images.posterVertical;
  return {
    id: data.slug,
    // Ссылка на страницу контента на ivi.ru (по ней открывается «Подробнее»
    // и клик по карточке в «Ховере»).
    link: `https://www.ivi.ru/watch/${data.slug}`,
    src: poster,
    logo: data.images.logo,
    alt: `Постер «${data.title}»`,
    title: data.title,
    meta: data.meta,
    description: data.shortDescription,
    longDescription: data.synopsis,
    trailer: NO_TRAILER.has(data.slug) ? null : TRAILERS[trailerIndex++ % TRAILERS.length],
    // BackgroundImage-1280x720: poster у трейлера (до загрузки видео) и картинка
    // вместо трейлера у контента без него.
    still: data.images.background || data.images.shots?.[0] || poster,
    seasons: data.seasons,
    reviews: data.comments,
    similar: data.similar,
  };
}

const h = (data) => card(data, "horizontal");
const v = (data) => card(data, "vertical");

export const galleries = [
  {
    id: "best-series",
    title: "Лучшие сериалы",
    horizontalPosters: [h(aleksLyutyij), h(hrustalnyij)],
    verticalPosters: [v(peregovorschik), v(kazanova), v(sherlok), v(lepila), v(akusher), v(delfin)],
  },
  {
    id: "shelf-cannes",
    title: "Фильмы Каннского кинофестиваля",
    horizontalPosters: [],
    verticalPosters: [v(otchiyDom), v(izgnanie), v(letyatZhuravli), v(moyLaskovyj), v(kogdaDerevya), v(monolog)],
  },
  {
    id: "shelf-fantastic",
    title: "Фантастические сериалы",
    horizontalPosters: [],
    verticalPosters: [v(otelTasokare), v(bezdarnayaZlodejka), v(temnoeDitya), v(rodstvennyeDushi), v(klevatess), v(liniyaRazloma)],
  },
  {
    id: "100-main-series-of-the-year",
    title: "100 главных сериалов года",
    horizontalPosters: [h(holod), h(zolotoeDno)],
    verticalPosters: [v(zatmenie), v(istoriyaSluzhanki), v(pirogovka), v(strahNadNevoj), v(taksi), v(iskusstvoSoblazna)],
  },
  {
    id: "top-250",
    title: "Топ-250 Иви",
    horizontalPosters: [],
    verticalPosters: [v(mazhor), v(kuhnya), v(klon), v(proslushka), v(besprintsipnyie), v(velikolepnyjVek)],
  },
  {
    id: "shelf-comedies",
    title: "Лучшие комедии",
    horizontalPosters: [],
    verticalPosters: [v(papinyDochki), v(stambul), v(domovyonokKuzya), v(molodyozhka), v(zheltyjChemodanchik), v(draniki)],
  },
];

// Точечные бейджи по slug (переопределяют авто-подбор):
//  · «сериал Иви» — только на эти четыре тайтла;
//  · «Летят журавли» — легендарная классика (а не «посмотреть за раз»).
const BADGE_OVERRIDES = {
  holod: "iviSeries",
  "zolotoe-dno": "iviSeries",
  "istoriya-ego-sluzhanki": "iviSeries",
  "iskusstvo-soblazna": "iviSeries",
  "53159": "legendary", // Летят журавли
};

// Каждой карточке — свой TextBadge (иконка + подпись): точечный override по slug,
// иначе авто-подбор по meta. Бегущий индекс даёт разнообразие.
let badgeIndex = 0;
for (const gallery of galleries) {
  for (const poster of [...gallery.horizontalPosters, ...gallery.verticalPosters]) {
    const auto = badgeForMeta(poster.meta, badgeIndex++);
    poster.badge = BADGES[BADGE_OVERRIDES[poster.id]] || auto;
  }
}
