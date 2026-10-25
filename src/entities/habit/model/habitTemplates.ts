import type { HabitPresetCategoryId } from "./habitPresetCategories";

export interface HabitTemplate {
  id: string;
  categoryId: HabitPresetCategoryId;
  name: string;
  desc: string;
}

/** Сферы жизни, для которых есть готовые шаблоны привычек. */
export const HABIT_TEMPLATE_CATEGORY_IDS = [
  "family",
  "health",
  "selfDevelopment",
  "career",
  "spirituality",
  "socialCircle",
  "leisure",
] as const satisfies readonly HabitPresetCategoryId[];

export type HabitTemplateCategoryId =
  (typeof HABIT_TEMPLATE_CATEGORY_IDS)[number];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Семья
  {
    id: "family-shared-meal",
    categoryId: "family",
    name: "Семейный завтрак",
    desc: "Организовать общесемейный завтрак (обед ужин).",
  },
  {
    id: "family-walk",
    categoryId: "family",
    name: "Прогулка с семьей",
    desc: "Выйти на прогулку с семьей.",
  },
  {
    id: "family-home-leisure",
    categoryId: "family",
    name: "Семейный досуг",
    desc: "Организовать дома общесемейный досуг (Настольная игра, просмотр фильма, чтение книги и т.д.)",
  },
  {
    id: "family-phone-limit",
    categoryId: "family",
    name: "Лимит телефона дома",
    desc: "Ограничить время досугового пользования мобильным дома",
  },
  {
    id: "family-shared-learning",
    categoryId: "family",
    name: "Совместное обучение",
    desc: "Совместное обучение (Чтение, просмотр образовательного или познавательного контента, изучение языка и т.д.)",
  },
  {
    id: "family-ask-mood",
    categoryId: "family",
    name: "Интересоваться делами семьи",
    desc: "Интересоваться делами и настроением членов семьи после рабочего дня",
  },
  {
    id: "family-treat",
    categoryId: "family",
    name: "Вкусное для семьи",
    desc: "Купить что-нибудь вкусное для членов семьи по дороге с работы домой",
  },
  {
    id: "family-payday-gifts",
    categoryId: "family",
    name: "Подарки в день зарплаты",
    desc: "В дни получки, зп, прибыли, покупать презенты для членов семьи в соответствии с возможностями",
  },
  {
    id: "family-no-conflicts",
    categoryId: "family",
    name: "Без ссор",
    desc: "Не ругаться, избегая споров и конфликтных ситуаций.",
  },
  {
    id: "family-visit-relatives",
    categoryId: "family",
    name: "Встреча с родственниками",
    desc: "Пригласить в гости или посетить родственников, близких, без особого повода",
  },

  // Здоровье
  {
    id: "health-sleep-by-23",
    categoryId: "health",
    name: "Лечь до 23:00",
    desc: "Лечь до 23:00",
  },
  {
    id: "health-phone-before-sleep",
    categoryId: "health",
    name: "Телефон за час до сна",
    desc: "Отложить мобильный телефон за час до сна",
  },
  {
    id: "health-early-rise",
    categoryId: "health",
    name: "Ранний подъём в 6:00",
    desc: "Практиковать ранний подъем. Поставить будильник на 6 утра.",
  },
  {
    id: "health-morning-activity",
    categoryId: "health",
    name: "Утренняя зарядка",
    desc: "Выйти на утреннюю зарядку/ прогулку. Активно пользоваться мобильным шагомером",
  },
  {
    id: "health-6k-steps",
    categoryId: "health",
    name: "6000+ шагов",
    desc: "Довести ежедневное количество шагов до 6000+",
  },
  {
    id: "health-workouts",
    categoryId: "health",
    name: "Спортивные тренировки",
    desc: "Проводить спортивные тренировки (Спорт-секции, тренажерный зал, фитнес, домашние тренировки по программе и т.д.)",
  },
  {
    id: "health-no-junk",
    categoryId: "health",
    name: "Без лимонадов и фастфуда",
    desc: "Исключить из питания на день лимонады, фастфуд, энергетические напитки",
  },
  {
    id: "health-no-sugar",
    categoryId: "health",
    name: "День без сахара",
    desc: "Исключить на день сахар и содержащие его продукты",
  },
  {
    id: "health-no-white-flour",
    categoryId: "health",
    name: "День без белой муки",
    desc: "Исключить на день все приготовленное из белой муки",
  },
  {
    id: "health-water-liter",
    categoryId: "health",
    name: "Литр воды в день",
    desc: "Выпить в течение дня не меньше литра чистой воды (желательно стакан натощак и перед каждым приемом пищи)",
  },
  {
    id: "health-blood-tests",
    categoryId: "health",
    name: "Сдать анализы крови",
    desc: "Сдать кровь на основные показатели. Проконсультироваться с итогами анализа у специалиста.",
  },
  {
    id: "health-checkup",
    categoryId: "health",
    name: "Пройти обследование",
    desc: "Пройти обследование",
  },

  // Саморазвитие
  {
    id: "self-read-chapter",
    categoryId: "selfDevelopment",
    name: "Глава книги в день",
    desc: "Начать читать книгу. В день одна глава +",
  },
  {
    id: "self-useful-content",
    categoryId: "selfDevelopment",
    name: "Полезный контент — урок в день",
    desc: "Выбрать полезный контент, в интересующем направлении, и начать изучать. (Аудио уроки, ютьюб, блог эксперта и т. д.) Один урок в день +",
  },
  {
    id: "self-new-skill",
    categoryId: "selfDevelopment",
    name: "Новый навык — урок в день",
    desc: "Обрести новый навык. (учить язык, приготовить блюдо, освоить нейросеть, стрелять из лука, смастерить книжную полку) Один урок в день +",
  },
  {
    id: "self-daily-plan",
    categoryId: "selfDevelopment",
    name: "План задач на день",
    desc: "Составить план задач на день (Вечером предыдущего дня или с утра) В конце дня проанализировать свою эффективность",
  },
  {
    id: "self-on-time",
    categoryId: "selfDevelopment",
    name: "Всё вовремя",
    desc: "Все сделать вовремя, никуда не опоздать, в течение дня",
  },
  {
    id: "self-no-bad-habit",
    categoryId: "selfDevelopment",
    name: "День без вредной привычки",
    desc: "Отказаться на день от вредной привычки",
  },

  // Карьера
  {
    id: "career-daily-step",
    categoryId: "career",
    name: "Шаг к целям",
    desc: "Сформулируйте и запишите конкретные и измеримые шаги на пути к вашим достижениям. Делайте каждый день хотя бы один шаг",
  },
  {
    id: "career-education",
    categoryId: "career",
    name: "Обучение по отрасли",
    desc: "Инвестируйте в свое образование и развивайте навыки на курсах, семинарах и вебинарах, связанных с вашей отраслью.",
  },
  {
    id: "career-social-profiles",
    categoryId: "career",
    name: "Профи в соцсетях",
    desc: "Создайте профессиональные профили в социальных сетях. Публикуйте контент о ваших компетенциях и опыте.",
  },
  {
    id: "career-extra-duties",
    categoryId: "career",
    name: "Доп. обязанности и проекты",
    desc: "Возьмите на себя дополнительные обязанности и участвуйте в ключевых проектах в вашей компании.",
  },
  {
    id: "career-feedback",
    categoryId: "career",
    name: "Обратная связь от коллег",
    desc: "Просите обратную связь от своих руководителей, коллег и подчиненных. Используйте ее для улучшения своей работы и развития",
  },
  {
    id: "career-network",
    categoryId: "career",
    name: "Профессиональная сеть",
    desc: "Развивайте свою профессиональную сеть контактов. Обретайте онлайн/офлайн знакомства (коммуницируйте с новыми людьми)",
  },

  // Духовность
  {
    id: "spirit-self-reflection",
    categoryId: "spirituality",
    name: "Самоанализ 10–15 мин",
    desc: "Потратьте 10-15+ минут в день для самоанализа, размышлений о внутреннем мире, своих ценностях, убеждениях",
  },
  {
    id: "spirit-gratitude-journal",
    categoryId: "spirituality",
    name: "Ежедневник благодарностей",
    desc: "Заведите ежедневник в который вы будете вносить благодарности за конкретные положительные аспекты вашей жизни ежедневно (минимум 5 в день)",
  },
  {
    id: "spirit-prayers",
    categoryId: "spirituality",
    name: "Молитвы",
    desc: "Своевременно совершайте молитвы (Начинайте, если вы их не совершали ранее)",
  },
  {
    id: "spirit-literature",
    categoryId: "spirituality",
    name: "Духовная литература",
    desc: "Читайте духовную литературу (Книги, статьи, посты) Поставьте минимальный лимит в день и следуйте ему",
  },
  {
    id: "spirit-good-deed",
    categoryId: "spirituality",
    name: "Добрый поступок в день",
    desc: "Совершите хотя бы один добрый поступок в день",
  },
  {
    id: "spirit-charity",
    categoryId: "spirituality",
    name: "Благотворительность",
    desc: "Перечисляйте маленькие суммы в благотворительные организации систематически (100-200+ рублей каждый день)",
  },
  {
    id: "spirit-channel",
    categoryId: "spirituality",
    name: "Канал духовных ценностей",
    desc: "Подпишитесь на канал транслирующий близкие вам духовные/религиозные ценности. Читайте публикации",
  },
  {
    id: "spirit-mosque",
    categoryId: "spirituality",
    name: "Посещать мечеть",
    desc: "Посещайте чаще мечети для молитв, мольб и размышлений",
  },

  // Окружение
  {
    id: "social-boundaries",
    categoryId: "socialCircle",
    name: "Личные границы",
    desc: "Не нарушайте личные границы близких и не давайте нарушать свои",
  },
  {
    id: "social-friends-meetup",
    categoryId: "socialCircle",
    name: "Встреча с друзьями",
    desc: "Организуйте встречу с друзьями, обсудите свои взгляды на жизнь и планы",
  },
  {
    id: "social-advice",
    categoryId: "socialCircle",
    name: "Совет по активностям",
    desc: "Выпишите несколько ваших текущих активностей и посоветуйтесь с друзьями/близкими как вам лучше поступить",
  },
  {
    id: "social-reconcile",
    categoryId: "socialCircle",
    name: "Шаг к примирению",
    desc: "Сделайте первый шаг в отношении друзей/близких с которыми вы находитесь в обиде.",
  },
  {
    id: "social-value-friends",
    categoryId: "socialCircle",
    name: "Друзья по ценностям",
    desc: "Приобретите 1+ друзей разделяющих ваши жизненные ценности",
  },
  {
    id: "social-regular-meetups",
    categoryId: "socialCircle",
    name: "Встречи единомышленников",
    desc: "Организуйте систематические встречи с друзьями/близкими который разделяют ваши взгляды",
  },
  {
    id: "social-help-friend",
    categoryId: "socialCircle",
    name: "Помощь близкому",
    desc: "Узнайте о проблеме, сложности близкого/друга и помогите по мере ваших возможностей",
  },
  {
    id: "social-appreciation",
    categoryId: "socialCircle",
    name: "Признать благодарность",
    desc: "Выскажите свою признательность другу/близкому за теплые отношения и поддержку",
  },

  // Отдых
  {
    id: "leisure-schedule",
    categoryId: "leisure",
    name: "Расписание личного отдыха",
    desc: "Создайте расписание, включающее в себя время для личного отдыха",
  },
  {
    id: "leisure-lunch-break",
    categoryId: "leisure",
    name: "Обед 90 минут",
    desc: "Введите в рабочий процесс обязательный обеденный перерыв минимум на 90 минут",
  },
  {
    id: "leisure-active-day-off",
    categoryId: "leisure",
    name: "Выходной с активным отдыхом",
    desc: "Устройте себе выходной с активным отдыхом",
  },
  {
    id: "leisure-no-work-day",
    categoryId: "leisure",
    name: "День без рабочих вопросов",
    desc: "Один день в неделю не занимайтесь рабочими вопросами, принципиально",
  },
  {
    id: "leisure-joy-time",
    categoryId: "leisure",
    name: "Время для удовольствия",
    desc: "В свободное от работы время займитесь тем, что приносит вам удовольствие и радость",
  },
  {
    id: "leisure-trip",
    categoryId: "leisure",
    name: "Поездка на отдых",
    desc: "Устройте себе поездку за пределы города, республики, страны, с целью отдыха",
  },
];

export function getHabitTemplatesByCategory(
  categoryId: HabitPresetCategoryId,
): HabitTemplate[] {
  return HABIT_TEMPLATES.filter((t) => t.categoryId === categoryId);
}
