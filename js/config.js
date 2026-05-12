// ═════════════════════════════════════════════
//  ONE! Summer Game 2026 — КОНФИГУРАЦИЯ SUPABASE
// ═════════════════════════════════════════════

// 🔑 REPLACE THESE WITH YOUR OWN SUPABASE KEYS:
//    1. Go to Supabase Dashboard → Settings → API
//    2. Copy "Project URL" and "anon public" key
//    3. Replace the values below

const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co'; // ← YOUR PROJECT URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'; // ← YOUR ANON KEY

const TABLES = {
  STUDENTS:     'students',
  OBSERVATIONS: 'observations',
  BADGES:       'badges'
};

// ── KTP — 10 дней × 3 трека (обновлено под 12 компетенций) ──────────
const KTP = [
  // BioTech
  { day:1,  track:'bio', name:'Анализ субстратов',    desc:'Изучаем агровату, кокос, гидрогель; замачиваем семена',         skills:['critical_thinking','learning_ability'] },
  { day:2,  track:'bio', name:'Посадка лута',         desc:'Укладка субстрата, посадка редиса и кресс-салата',              skills:['cooperation','adaptability'] },
  { day:3,  track:'bio', name:'Крафт фильтра',        desc:'Многоуровневый фильтр, очистка воды, микроскоп',               skills:['problem_solving','self_organization'] },
  { day:4,  track:'bio', name:'Дыхание растений',     desc:'Наблюдение пузырьков кислорода (фотосинтез)',                  skills:['curiosity','critical_thinking'] },
  { day:5,  track:'bio', name:'Враждебные мобы',      desc:'Микроскоп: корешки vs плесень',                                skills:['critical_thinking','persistence'] },
  { day:6,  track:'bio', name:'Зелёная химия',        desc:'pH-индикатор из красной капусты',                              skills:['curiosity','learning_ability'] },
  { day:7,  track:'bio', name:'Сбор статистики',      desc:'Измерение роста, график, pH',                                 skills:['learning_ability','problem_solving'] },
  { day:8,  track:'bio', name:'Лутаем еду!',          desc:'Срезание микрозелени, бутерброды',                             skills:['initiative','cooperation'] },
  { day:9,  track:'bio', name:'Оптимизация урожая',   desc:'Анализ данных роста',                                          skills:['problem_solving','critical_thinking'] },
  { day:10, track:'bio', name:'Финальный сбор',       desc:'Торжественный сбор, презентация',                              skills:['communication','initiative'] },

  // Engineering
  { day:1,  track:'eng', name:'Основы Редстоуна',     desc:'Сборка цепи: батарейка → кнопка → светодиод',                 skills:['problem_solving','self_organization'] },
  { day:2,  track:'eng', name:'Ветряк для базы',      desc:'Моторчик + лопасти + фен = светодиод от ветра',               skills:['creativity','adaptability'] },
  { day:3,  track:'eng', name:'Умный полив',          desc:'Датчик влажности + Micro:bit → красный LED',                  skills:['learning_ability','problem_solving'] },
  { day:4,  track:'eng', name:'Солнечная панель',     desc:'Вентилятор к мини-панели = воздушный поток',                  skills:['initiative','adaptability'] },
  { day:5,  track:'eng', name:'Термо-щит',            desc:'Датчик температуры → авто-вентилятор',                        skills:['critical_thinking','self_organization'] },
  { day:6,  track:'eng', name:'Авто-Свет',            desc:'Фоторезистор → ночь = авто-лампочка',                         skills:['creativity','learning_ability'] },
  { day:7,  track:'eng', name:'Анти-Грифер',          desc:'Геркон → открыл без спроса = зуммер!',                        skills:['initiative','persistence'] },
  { day:8,  track:'eng', name:'Финальный коннект',    desc:'Подключение всего вместе',                                    skills:['cooperation','problem_solving'] },
  { day:9,  track:'eng', name:'Оптимизация энергии',  desc:'Подсчёт энергии, оптимизация схемы',                          skills:['critical_thinking','learning_ability'] },
  { day:10, track:'eng', name:'Технический рум-тур',  desc:'Трубопровод, вентиляция, лазерная ловушка',                   skills:['communication','initiative'] },

  // Media
  { day:1,  track:'media', name:'Хук Мистера Биста', desc:'Видеодневник, селфи-обращение с анонсом',                      skills:['communication','creativity'] },
  { day:2,  track:'media', name:'B-roll репортаж',   desc:'Макросъёмка посадки, интервью',                               skills:['communication','cooperation'] },
  { day:3,  track:'media', name:'Научпоп обзор',     desc:'Разница воды, принципы фильтрации',                           skills:['learning_ability','critical_thinking'] },
  { day:4,  track:'media', name:'Stop-Motion',       desc:'Анимация прорастания из пластилина',                          skills:['creativity','problem_solving'] },
  { day:5,  track:'media', name:'Эко-Челлендж',      desc:'Вертикальный ролик с экопризывом',                            skills:['initiative','social_position'] },
  { day:6,  track:'media', name:'Рум-тур по Базе',   desc:'Динамичный обзор теплицы',                                    skills:['communication','adaptability'] },
  { day:7,  track:'media', name:'Срочные новости',     desc:'Сценка "взлом базы", импровизация',                           skills:['creativity','persistence'] },
  { day:8,  track:'media', name:'Премьера фильма',   desc:'3-мин ролик, совместный просмотр',                            skills:['cooperation','communication'] },
  { day:9,  track:'media', name:'Бэкстейдж',         desc:'Закулисье, интервью с инженерами',                            skills:['curiosity','learning_ability'] },
  { day:10, track:'media', name:'Аналитика и CTR',   desc:'Анализ метрик, праздник!',                                    skills:['critical_thinking','problem_solving'] }
];

// ── 12 компетенций (новые) ────────────────────
const COMPETENCIES = [
  { id:'communication',      name:'Коммуникация',          icon:'💬', color:'#FBBF24' },
  { id:'cooperation',       name:'Кооперация',            icon:'🤝', color:'#22C55E' },
  { id:'problem_solving',   name:'Решение проблем',       icon:'🧩', color:'#3B82F6' },
  { id:'adaptability',      name:'Адаптивность',          icon:'🔄', color:'#06B6D4' },
  { id:'critical_thinking', name:'Критическое мышление', icon:'🧠', color:'#8B5CF6' },
  { id:'curiosity',         name:'Любознательность',      icon:'🔍', color:'#EC4899' },
  { id:'learning_ability', name:'Умение учиться',         icon:'📚', color:'#0EA5E9' },
  { id:'self_organization', name:'Самоорганизация',      icon:'📋', color:'#6366F1' },
  { id:'creativity',        name:'Креативное мышление',   icon:'🎨', color:'#F59E0B' },
  { id:'initiative',       name:'Инициативность',        icon:'🚀', color:'#EF4444' },
  { id:'persistence',       name:'Настойчивость',          icon:'💪', color:'#A855F7' },
  { id:'social_position',  name:'Общественная позиция', icon:'🏛', color:'#14B8A6' }
];

// ── Достижения (9 значков) ────────────────────
const BADGE_DEFS = [
  { id:'agronomist',  name:'Агроном-испытатель', icon:'🌱', track:'bio',   day:5,  condition:'completed',   rarity:'common',    desc:'Изучил корневую систему под микроскопом' },
  { id:'greenchem',   name:'Зелёная химия',      icon:'🧪', track:'bio',   day:6,  condition:'completed',   rarity:'common',    desc:'Создал pH-индикатор из красной капусты' },
  { id:'harvest',     name:'Мастер Урожая',      icon:'🌾', track:'bio',   day:8,  condition:'completed',   rarity:'rare',      desc:'Собрал и приготовил свой первый урожай' },
  { id:'redstone',    name:'Мастер Редстоуна',   icon:'⚡', track:'eng',   day:1,  condition:'initiative',  rarity:'rare',      desc:'Собрал цепь и проявил инициативу' },
  { id:'energy',      name:'Повелитель Энергии', icon:'☀️', track:'eng',   day:4,  condition:'completed',   rarity:'common',    desc:'Запустил солнечную панель' },
  { id:'architect',   name:'Код-архитектор',     icon:'💻', track:'eng',   day:6,  condition:'initiative',  rarity:'epic',      desc:'Запрограммировал авто-свет и пошёл дальше' },
  { id:'reporter',    name:'Голос Базы',         icon:'🎙️', track:'media', day:2,  condition:'completed',   rarity:'common',    desc:'Снял первый репортаж' },
  { id:'director',    name:'Режиссёр монтажа',   icon:'🎬', track:'media', day:4,  condition:'completed',   rarity:'rare',      desc:'Создал stop-motion анимацию' },
  { id:'youtuber',    name:'Звезда YouTube',     icon:'⭐', track:'media', day:10, condition:'initiative',  rarity:'legendary', desc:'Провёл аналитику и был признан лучшим' }
];

// ── DISC: маппинг 12 компетенций → тип (с цветами) ──────────────
const DISC_COLORS = {
  D: '#EF4444', // Красный
  I: '#FBBF24', // Жёлтый
  S: '#22C55E', // Зелёный
  C: '#3B82F6'  // Синий
};

const DISC_SKILL_MAP = {
  D: ['initiative','persistence','problem_solving'],          // Красный: активный, ориентирован на результат
  I: ['communication','creativity','social_position'],       // Жёлтый: активный, дружелюбный, ориентирован на людей
  S: ['cooperation','adaptability','self_organization'],    // Зелёный: пассивный, дружелюбный, ориентирован на процессы
  C: ['critical_thinking','learning_ability','curiosity']  // Синий: пассивный, ориентирован на качество
};

// Комбо-типы DISC (для расширенного профиля)
const DISC_COMBO = {
  'DI':  { label:'Харизматичный лидер',    color:'#EF4444', desc:'Ориентирован на результат через взаимодействие с людьми' },
  'IS':  { label:'Дипломат',                 color:'#FBBF24', desc:'Умеет убеждать, сохраняя дружелюбную атмосферу' },
  'SC':  { label:'Надёжный исполнитель',     color:'#22C55E', desc:'Качественно и методично выполняет задачи' },
  'CD':  { label:'Точный стратег',            color:'#3B82F6', desc:'Анализирует и находит самые эффективные решения' }
};

// ── Профессии по трекам ────────────────────────
const TRACK_PROFESSIONS = {
  media: [
    { title:'Видеограф', desc:'Снимает трендовое видео для TikTok' },
    { title:'Продюсер', desc:'Делает обзор проекта и презентует экспертам' },
    { title:'Блогер', desc:'Создаёт научно-популярный блог, может «засветиться» в видео известного блогера' }
  ],
  eng: [
    { title:'Робототехник', desc:'Проектирует и собирает роботов' },
    { title:'Аналитик данных', desc:'Анализирует данные и строит прогнозы' },
    { title:'Разработчик ИИ', desc:'Создаёт интеллектуальные системы' }
  ],
  bio: [
    { title:'Биоинженер', desc:'Разрабатывает новые биологические решения' },
    { title:'Агротехнолог', desc:'Внедряет современные методы выращивания' },
    { title:'Генетик', desc:'Изучает и модифицирует генетический код' }
  ]
};

// ── Клубы лагеря (открываются постепенно) ─────
const CAMP_CLUBS = [
  { id:'sport',   name:'Спорт',       icon:'⚽', desc:'Футбол, волейбол, плавание в бассейне',                                     unlockDay:1,  active:true },
  { id:'creative', name:'Творчество', icon:'🎨', desc:'Лепка, арт, пирография',                                                     unlockDay:1,  active:true },
  { id:'relax',   name:'Релакс',      icon:'🛋', desc:'Отдых, природа, любимые игры, гамак, полный чилл',                         unlockDay:5,  active:false },
  { id:'cyber',   name:'Кибер',        icon:'🎮', desc:'FIFA, Gran Turismo, Nintendo Wii, Roblox, Minecraft, PlayStation',         unlockDay:7,  active:false }
];

// ── Вечерние активности ─────────────────────────
const EVENING_ACTIVITIES = {
  day: [
    { name:'Cartoon Club',      desc:'Просмотр мультфильмов и фильмов с носителями английского языка' },
    { name:'VR-челленджи',      desc:'Соревнования в играх с наградами' },
    { name:'Вечерние квесты',   desc:'Загадки и головоломки' },
    { name:'Музыкальные баттлы', desc:'Музыкальные и танцевальные баттлы' }
  ],
  evening: [
    { name:'Командные игры',   desc:'Командные игры на свежем воздухе' },
    { name:'Маршмеллоу у костра', desc:'Маршмеллоу у костра' },
    { name:'Прятки в темноте', desc:'Прятки в темноте' },
    { name:'Тематическая дискотека', desc:'Тематическая дискотека' }
  ]
};

// ── Языковая составляющая (English) ────────────
const ENGLISH_COMPONENTS = [
  { name:'Английский язык',    desc:'Занятия английским языком каждый день' },
  { name:'Киноклуб',           desc:'Просмотр фильмов и обсуждение с носителем (Cartoon Club)' }
];

// ── Команда лагеря ─────────────────────────────
const CAMP_TEAM = [
  { role:'Продюсер каникулярных программ',      name:'Андрей Кулешов',       alias:'Mr. Andrew' },
  { role:'Фасилитатор каникулярных программ',    name:'Жанна Карманова',      alias:'Ms. Zhanna' },
  { role:'Научный руководитель (Медиа)',        name:'Михаил Кулаков',        alias:'Mr. Michael' },
  { role:'Главный по языковым апгрейдам',       name:'Икиди Вилфред',         alias:'Mr. Fred' },
  { role:'Научный руководитель (Биотехнологии)', name:'Светлана Пономарева',  alias:'Ms. Svetlana' },
  { role:'Научный руководитель (Инженерия)',     name:'Руслан Фомичев',        alias:'Mr. Ruslan' }
];

// ── Инфраструктура ─────────────────────────────
const INFRASTRUCTURE = {
  nutrition: '5-разовое питание, система шведский стол',
  territory: 'Охраняемая территория, 22 гектара лесопарковой зоны',
  facilities: ['Спортзал', 'Аквацентр', 'Верёвочный парк']
};

// ── Экспорт в window (для доступности в других скриптах) ─────────
// Константы уже глобальные в браузере, window нужен только для внешних скриптов
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.TABLES = TABLES;
window.KTP = KTP;
window.COMPETENCIES = COMPETENCIES;
window.BADGE_DEFS = BADGE_DEFS;
window.DISC_COLORS = DISC_COLORS;
window.DISC_SKILL_MAP = DISC_SKILL_MAP;
window.DISC_COMBO = DISC_COMBO;
window.TRACK_PROFESSIONS = TRACK_PROFESSIONS;
window.CAMP_CLUBS = CAMP_CLUBS;
window.EVENING_ACTIVITIES = EVENING_ACTIVITIES;
window.ENGLISH_COMPONENTS = ENGLISH_COMPONENTS;
window.CAMP_TEAM = CAMP_TEAM;
window.INFRASTRUCTURE = INFRASTRUCTURE;
