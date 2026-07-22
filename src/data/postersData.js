import h1 from "../../assets/posters/poster_horizontal_01.png";
import h2 from "../../assets/posters/poster_horizontal_02.png";
import h3 from "../../assets/posters/poster_horizontal_03.png";
import h4 from "../../assets/posters/poster_horizontal_04.png";
import v1 from "../../assets/posters/poster_vertical_01.png";
import v2 from "../../assets/posters/poster_vertical_02.png";
import v3 from "../../assets/posters/poster_vertical_03.png";
import v4 from "../../assets/posters/poster_vertical_04.png";
import v5 from "../../assets/posters/poster_vertical_05.png";
import v6 from "../../assets/posters/poster_vertical_06.png";
import v7 from "../../assets/posters/poster_vertical_07.png";
import v8 from "../../assets/posters/poster_vertical_08.png";
import v9 from "../../assets/posters/poster_vertical_09.png";
import v10 from "../../assets/posters/poster_vertical_10.png";
import v11 from "../../assets/posters/poster_vertical_11.png";
import v12 from "../../assets/posters/poster_vertical_12.png";
import sp1 from "../../assets/series_posters/series_poster_01.png";
import sp2 from "../../assets/series_posters/series_poster_02.png";
import sp3 from "../../assets/series_posters/series_poster_03.png";
import sp4 from "../../assets/series_posters/series_poster_04.png";
import t1 from "../../assets/video_trailers/trailer_1.mp4";
import t2 from "../../assets/video_trailers/trailer_2.mp4";
import t3 from "../../assets/video_trailers/trailer_3.mp4";
import t4 from "../../assets/video_trailers/trailer_4.mp4";

/**
 * Page content: two gallery sections, each with a row of horizontal posters and
 * a row of vertical ones.
 *
 * Artwork comes from `assets/posters/` — Vite hashes and bundles it, so nothing
 * is fetched from a remote host. Poster shape (identical for both orientations):
 *
 *   id          string, unique across the page
 *   src         poster artwork
 *   alt         alt text
 *   title       show title (used for the card's a11y label)
 *   meta        string[] — chips in the "Инфо" tab ("2026 · детектив · 3 сезона")
 *   description short synopsis
 *   trailer     optional video URL; autoplays muted inside the card.
 *               When absent the card falls back to `still`, then to `src`.
 *   still       optional 16:9 frame shown while / instead of the trailer
 *   seasons     [{ id, title, episodes: [{ id, title, subtitle, still }] }]
 *   reviews     [{ id, author, rating, text }]
 *
 * Trailers come from `assets/video_trailers/` and episode stills from
 * `assets/series_posters/`; there are four of each, cycled across the shows.
 */

const bestSeriesHorizontal = [
  {
    id: "h1",
    src: h1,
    alt: "Постер сериала «Алекс Лютый. Дело сирот»",
    title: "Алекс Лютый. Дело сирот",
    meta: ["2025", "детектив", "2 сезона"],
    description:
      "Следователь идёт по следу человека, которого все считали погибшим двадцать лет назад.",
    trailer: t1,
    still: h1,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Старое дело", subtitle: "1 серия · 51 мин", still: sp1 },
          { id: "e2", title: "Свидетель", subtitle: "2 серия · 49 мин", still: sp2 },
          { id: "e3", title: "Тот самый почерк", subtitle: "3 серия · 53 мин", still: sp3 },
          { id: "e4", title: "Улика", subtitle: "4 серия · 50 мин", still: sp4 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Дом на окраине", subtitle: "1 серия · 52 мин", still: sp1 },
          { id: "e2", title: "Признание", subtitle: "2 серия · 56 мин", still: sp2 },
          { id: "e3", title: "Развязка", subtitle: "3 серия · 58 мин", still: sp3 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Роман Ш.", rating: 9, text: "Держит в напряжении с первой сцены и не отпускает." },
      { id: "r2", author: "Алина Г.", rating: 8, text: "Отличная работа с эпохой — веришь каждой детали." },
    ],
  },
  {
    id: "h2",
    src: h2,
    alt: "Постер сериала «Хрустальный»",
    title: "Хрустальный",
    meta: ["2024", "триллер", "1 сезон"],
    description:
      "Оперативник возвращается в родной город расследовать дело, которое переворачивает его прошлое.",
    trailer: t2,
    still: h2,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Возвращение домой", subtitle: "1 серия · 47 мин", still: sp4 },
          { id: "e2", title: "Городской пляж", subtitle: "2 серия · 45 мин", still: sp1 },
          { id: "e3", title: "Школьный двор", subtitle: "3 серия · 48 мин", still: sp2 },
          { id: "e4", title: "Ничего не забыто", subtitle: "4 серия · 52 мин", still: sp3 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Тимур К.", rating: 10, text: "Один из сильнейших российских триллеров последних лет." },
      { id: "r2", author: "Соня В.", rating: 8, text: "Тяжёлый, но честный. Смотреть подряд не советую." },
    ],
  },
];

const bestSeriesVertical = [
  {
    id: "v1",
    src: v1,
    alt: "Постер сериала «Переговорщик»",
    title: "Переговорщик",
    meta: ["2025", "криминал", "2 сезона"],
    description:
      "Лучший переговорщик города выходит на захват, где по другую сторону — человек из его прошлого.",
    trailer: t3,
    still: h2,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Первый контакт", subtitle: "1 серия · 48 мин", still: sp4 },
          { id: "e2", title: "Условия", subtitle: "2 серия · 46 мин", still: sp1 },
          { id: "e3", title: "Восемь минут", subtitle: "3 серия · 50 мин", still: sp2 },
          { id: "e4", title: "Обмен", subtitle: "4 серия · 52 мин", still: sp3 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Тишина в эфире", subtitle: "1 серия · 49 мин", still: sp4 },
          { id: "e2", title: "Голос", subtitle: "2 серия · 47 мин", still: sp1 },
          { id: "e3", title: "Последнее слово", subtitle: "3 серия · 54 мин", still: sp2 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Анна К.", rating: 9, text: "Диалоги — лучшее, что здесь есть. Смотрится на одном дыхании." },
      { id: "r2", author: "Игорь П.", rating: 8, text: "Второй сезон неожиданно сильнее первого." },
    ],
  },
  {
    id: "v2",
    src: v2,
    alt: "Постер сериала «Казанова. Возвращение»",
    title: "Казанова. Возвращение",
    meta: ["2025", "комедия", "1 сезон"],
    description:
      "Обаятельный аферист возвращается в город, где его слишком хорошо помнят — и не только женщины.",
    trailer: t4,
    still: h4,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Билет в один конец", subtitle: "1 серия · 44 мин", still: sp3 },
          { id: "e2", title: "Старые знакомые", subtitle: "2 серия · 42 мин", still: sp4 },
          { id: "e3", title: "Гастроли", subtitle: "3 серия · 45 мин", still: sp1 },
          { id: "e4", title: "Расплата", subtitle: "4 серия · 47 мин", still: sp2 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Артём Б.", rating: 8, text: "Лёгкий, обаятельный и очень точный по эпохе." },
      { id: "r2", author: "Юлия М.", rating: 9, text: "Идеально на вечер. Юмор живой, без пошлости." },
    ],
  },
  {
    id: "v3",
    src: v3,
    alt: "Постер сериала «Шерлок Холмс и доктор Ватсон»",
    title: "Шерлок Холмс и доктор Ватсон",
    meta: ["1979", "детектив", "1 сезон"],
    description:
      "Классическая экранизация: знакомство на Бейкер-стрит и первые дела великого сыщика.",
    trailer: t1,
    still: h1,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Знакомство", subtitle: "1 серия · 64 мин", still: sp3 },
          { id: "e2", title: "Кровавая надпись", subtitle: "2 серия · 68 мин", still: sp4 },
          { id: "e3", title: "Король шантажа", subtitle: "3 серия · 66 мин", still: sp1 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Мария Л.", rating: 10, text: "Эталон. Пересматриваю каждый год и всё так же хорошо." },
      { id: "r2", author: "Пётр Н.", rating: 10, text: "Ливанов и Соломин — лучшая пара в истории экранизаций." },
    ],
  },
  {
    id: "v4",
    src: v4,
    alt: "Постер сериала «Лепила»",
    title: "Лепила",
    meta: ["2026", "криминал", "1 сезон"],
    description:
      "Талантливый хирург вынужден лечить тех, кому нельзя в больницу, и постепенно теряет право на выбор.",
    trailer: t2,
    still: h3,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Ночной вызов", subtitle: "1 серия · 46 мин", still: sp2 },
          { id: "e2", title: "Долг", subtitle: "2 серия · 44 мин", still: sp3 },
          { id: "e3", title: "Операционная", subtitle: "3 серия · 48 мин", still: sp4 },
          { id: "e4", title: "Без наркоза", subtitle: "4 серия · 51 мин", still: sp1 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Сергей Ж.", rating: 8, text: "Жёстко и без романтизации. Главный герой отличный." },
      { id: "r2", author: "Ника Т.", rating: 7, text: "Середина провисает, но финал вытягивает." },
    ],
  },
  {
    id: "v5",
    src: v5,
    alt: "Постер сериала «Акушер 2»",
    title: "Акушер 2",
    meta: ["2025", "драма", "2 сезона"],
    description:
      "Новый сезон о врачах роддома, где каждая смена — чья-то самая важная ночь в жизни.",
    trailer: t3,
    still: h4,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Смена", subtitle: "1 серия · 42 мин", still: sp2 },
          { id: "e2", title: "Двойня", subtitle: "2 серия · 44 мин", still: sp3 },
          { id: "e3", title: "Решение", subtitle: "3 серия · 41 мин", still: sp4 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Новый заведующий", subtitle: "1 серия · 43 мин", still: sp1 },
          { id: "e2", title: "Ошибка", subtitle: "2 серия · 45 мин", still: sp2 },
          { id: "e3", title: "Рассвет", subtitle: "3 серия · 46 мин", still: sp3 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Елена Р.", rating: 9, text: "Плакала три раза за сезон. Актёры невероятные." },
      { id: "r2", author: "Дмитрий В.", rating: 7, text: "Местами слишком мелодраматично, но смотрится легко." },
    ],
  },
  {
    id: "v6",
    src: v6,
    alt: "Постер сериала «Соммердаль»",
    title: "Соммердаль",
    meta: ["2024", "детектив", "3 сезона"],
    description:
      "В тихом приморском городке комиссар расследует убийства среди людей, которых знает с детства.",
    trailer: t4,
    still: h3,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Тело на берегу", subtitle: "1 серия · 45 мин", still: sp4 },
          { id: "e2", title: "Соседи", subtitle: "2 серия · 43 мин", still: sp1 },
          { id: "e3", title: "Прилив", subtitle: "3 серия · 44 мин", still: sp2 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Яхт-клуб", subtitle: "1 серия · 44 мин", still: sp3 },
          { id: "e2", title: "Свадьба", subtitle: "2 серия · 46 мин", still: sp4 },
        ],
      },
      {
        id: "s3",
        title: "Сезон 3",
        episodes: [
          { id: "e1", title: "Возвращение", subtitle: "1 серия · 45 мин", still: sp1 },
          { id: "e2", title: "Последний сезон", subtitle: "2 серия · 47 мин", still: sp2 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Вера Д.", rating: 8, text: "Уютный скандинавский детектив, идеально на выходные." },
      { id: "r2", author: "Кирилл А.", rating: 7, text: "Предсказуемо, но атмосфера искупает всё." },
    ],
  },
];

const newReleasesHorizontal = [
  {
    id: "h3",
    src: h3,
    alt: "Постер сериала «Холод»",
    title: "Холод",
    meta: ["2026", "драма", "1 сезон"],
    description:
      "Женщина попадает в колонию за преступление, которого не совершала, и учится выживать по чужим правилам.",
    trailer: t1,
    still: h3,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Этап", subtitle: "1 серия · 50 мин", still: sp3 },
          { id: "e2", title: "Первый барак", subtitle: "2 серия · 48 мин", still: sp4 },
          { id: "e3", title: "Смотрящая", subtitle: "3 серия · 52 мин", still: sp1 },
          { id: "e4", title: "Свидание", subtitle: "4 серия · 49 мин", still: sp2 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Ольга С.", rating: 9, text: "Смотреть тяжело, оторваться невозможно." },
      { id: "r2", author: "Максим Е.", rating: 8, text: "Сильная главная роль, очень сдержанная режиссура." },
    ],
  },
  {
    id: "h4",
    src: h4,
    alt: "Постер сериала «Золотое дно 2»",
    title: "Золотое дно 2",
    meta: ["2026", "драма", "2 сезона"],
    description:
      "Наследники семейной империи снова делят состояние — и на этот раз проигравших будет больше.",
    trailer: t2,
    still: h4,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Завещание", subtitle: "1 серия · 47 мин", still: sp3 },
          { id: "e2", title: "Доля", subtitle: "2 серия · 45 мин", still: sp4 },
          { id: "e3", title: "Совет директоров", subtitle: "3 серия · 48 мин", still: sp1 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Новый управляющий", subtitle: "1 серия · 46 мин", still: sp2 },
          { id: "e2", title: "Аудит", subtitle: "2 серия · 44 мин", still: sp3 },
          { id: "e3", title: "Вода прибывает", subtitle: "3 серия · 50 мин", still: sp4 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Григорий Л.", rating: 8, text: "Семейные интриги на уровне хорошего западного сериала." },
      { id: "r2", author: "Инна Ф.", rating: 9, text: "Второй сезон закрутили так, что не оторваться." },
    ],
  },
];

const newReleasesVertical = [
  {
    id: "v7",
    src: v7,
    alt: "Постер сериала «Затмение»",
    title: "Затмение",
    meta: ["2025", "триллер", "1 сезон"],
    description:
      "Закрытый город, вспышка неизвестной болезни и следователь, которому запрещено называть вещи своими именами.",
    trailer: t3,
    still: h3,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Карантин", subtitle: "1 серия · 49 мин", still: sp1 },
          { id: "e2", title: "Первый случай", subtitle: "2 серия · 47 мин", still: sp2 },
          { id: "e3", title: "Приказ", subtitle: "3 серия · 51 мин", still: sp3 },
          { id: "e4", title: "Затмение", subtitle: "4 серия · 55 мин", still: sp4 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Валерий Н.", rating: 9, text: "Атмосфера давит с первой минуты. Очень стильно снято." },
      { id: "r2", author: "Лиза О.", rating: 8, text: "Историческая фактура сделана с уважением." },
    ],
  },
  {
    id: "v8",
    src: v8,
    alt: "Постер сериала «История его служанки»",
    title: "История его служанки",
    meta: ["2026", "мелодрама", "1 сезон"],
    description:
      "Служанка в богатом поместье оказывается втянута в историю, которая может стоить ей и места, и сердца.",
    trailer: t4,
    still: h4,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Новое место", subtitle: "1 серия · 43 мин", still: sp1 },
          { id: "e2", title: "Бал", subtitle: "2 серия · 41 мин", still: sp2 },
          { id: "e3", title: "Письмо", subtitle: "3 серия · 44 мин", still: sp3 },
          { id: "e4", title: "Признание", subtitle: "4 серия · 46 мин", still: sp4 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Дарья П.", rating: 8, text: "Красивая картинка и приятная история без надрыва." },
      { id: "r2", author: "Ксения М.", rating: 7, text: "Предсказуемо, но именно этого от жанра и ждёшь." },
    ],
  },
  {
    id: "v9",
    src: v9,
    alt: "Постер сериала «Анатомия чувств»",
    title: "Анатомия чувств",
    meta: ["2026", "мелодрама", "1 сезон"],
    description:
      "Три врача одной клиники пытаются совместить дежурства, диагнозы и совершенно неуместные чувства.",
    trailer: t1,
    still: h1,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Первый обход", subtitle: "1 серия · 42 мин", still: sp1 },
          { id: "e2", title: "Дежурство", subtitle: "2 серия · 40 мин", still: sp2 },
          { id: "e3", title: "Диагноз", subtitle: "3 серия · 43 мин", still: sp3 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Наталья В.", rating: 8, text: "Тёплый сериал про врачей, смотрится очень легко." },
      { id: "r2", author: "Егор С.", rating: 6, text: "Медицины мало, чувств много — но так и задумано." },
    ],
  },
  {
    id: "v10",
    src: v10,
    alt: "Постер сериала «Страх над Невой. Огненный круг»",
    title: "Страх над Невой. Огненный круг",
    meta: ["2026", "триллер", "1 сезон"],
    description:
      "В Петербурге появляется убийца, оставляющий на набережных огненные знаки, — и следствие идёт по кругу.",
    trailer: t2,
    still: h2,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Первый круг", subtitle: "1 серия · 50 мин", still: sp4 },
          { id: "e2", title: "Мосты разведены", subtitle: "2 серия · 48 мин", still: sp1 },
          { id: "e3", title: "Канал", subtitle: "3 серия · 47 мин", still: sp2 },
          { id: "e4", title: "Огненный круг", subtitle: "4 серия · 54 мин", still: sp3 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Антон Ж.", rating: 9, text: "Петербург здесь — полноценный герой. Мрачно и красиво." },
      { id: "r2", author: "Полина И.", rating: 8, text: "Детективная линия держится до самого финала." },
    ],
  },
  {
    id: "v11",
    src: v11,
    alt: "Постер сериала «Такси под прикрытием 2»",
    title: "Такси под прикрытием 2",
    meta: ["2026", "боевик", "2 сезона"],
    description:
      "Оперативник снова садится за руль жёлтой машины: новый город, новая банда, те же методы.",
    trailer: t3,
    still: h1,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Смена начинается", subtitle: "1 серия · 45 мин", still: sp4 },
          { id: "e2", title: "Ночной пассажир", subtitle: "2 серия · 43 мин", still: sp1 },
          { id: "e3", title: "Погоня", subtitle: "3 серия · 46 мин", still: sp2 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Новый маршрут", subtitle: "1 серия · 44 мин", still: sp3 },
          { id: "e2", title: "Конкуренты", subtitle: "2 серия · 46 мин", still: sp4 },
          { id: "e3", title: "Конечная", subtitle: "3 серия · 49 мин", still: sp1 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Марк Ш.", rating: 8, text: "Динамично, с юмором и отличными погонями." },
      { id: "r2", author: "Рита К.", rating: 7, text: "Не оригинально, но развлекает ровно как надо." },
    ],
  },
  {
    id: "v12",
    src: v12,
    alt: "Постер сериала «Искусство соблазна 2»",
    title: "Искусство соблазна 2",
    meta: ["2026", "мелодрама", "2 сезона"],
    description:
      "Три подруги открывают собственное агентство и выясняют, что чужие романы устраивать проще своих.",
    trailer: t4,
    still: h4,
    seasons: [
      {
        id: "s1",
        title: "Сезон 1",
        episodes: [
          { id: "e1", title: "Первый клиент", subtitle: "1 серия · 41 мин", still: sp2 },
          { id: "e2", title: "Правила игры", subtitle: "2 серия · 40 мин", still: sp3 },
          { id: "e3", title: "Ошибка", subtitle: "3 серия · 42 мин", still: sp4 },
        ],
      },
      {
        id: "s2",
        title: "Сезон 2",
        episodes: [
          { id: "e1", title: "Новый офис", subtitle: "1 серия · 42 мин", still: sp1 },
          { id: "e2", title: "Соперницы", subtitle: "2 серия · 44 мин", still: sp2 },
          { id: "e3", title: "Красная лента", subtitle: "3 серия · 45 мин", still: sp3 },
        ],
      },
    ],
    reviews: [
      { id: "r1", author: "Алиса Т.", rating: 8, text: "Второй сезон стал бодрее и смешнее первого." },
      { id: "r2", author: "Жанна Р.", rating: 7, text: "Чистое удовольствие под конец дня." },
    ],
  },
];

export const galleries = [
  {
    id: "best-series",
    title: "Лучшие сериалы",
    horizontalPosters: bestSeriesHorizontal,
    verticalPosters: bestSeriesVertical,
  },
  {
    id: "new-releases",
    title: "Новинки недели",
    horizontalPosters: newReleasesHorizontal,
    verticalPosters: newReleasesVertical,
  },
];
