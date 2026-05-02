# План интеграции дизайн-handoff в habit-plus

**Источник (только референс):** `c:\Users\mk\Downloads\habit_\design_handoff_habit_plus`  
**Целевой репозиторий:** `d:\Project\Main\habit-plus`  
**Статус:** планирование, без правок production-кода в рамках этой задачи.

---

## 1. Цель и не-цели

### Цель

- Перенести **оригинальную композицию UI** handoff (иерархия, экраны, нижняя навигация, лист детали привычки, формы) в кодовую базу habit-plus.
- Собрать интерфейс на **существующих примитивах** из `src/shared/ui/shadCNComponents/ui/*` (Button, Card, Dialog, Drawer, Input, Label, Checkbox, RadioGroup, Badge, Popover, ScrollArea, Separator, Command, MultiSelect, Chart — по факту необходимости экрана).
- Зафиксировать тему: **семантические токены Tailwind + CSS variables** из `src/app/styles/index.css`; блок **`.dark` (строки 121–154)** остаётся источником правды по цветам. Значения из `tokens/colors.ts` handoff **не копируются** отдельной палитрой в TS — только через сопоставление с `--background`, `--card`, `--primary`, `--muted-foreground` и т.д. (при необходимости — точечная подстройка переменных в `index.css`, а не сырые hex в компонентах).

### Не-цели

- Не переносить handoff как отдельное приложение внутрь репо (дублирующий `main.tsx`, свой `BrowserRouter`).
- Не считать `habitsStore` handoff единственным источником правды для **другого** домена (исторически в документации упоминались тренировки/календарь); текущее состояние репозитория — **заглушка** `HomePage` и минимальные `entities` (`user`, `theme`). Домен «привычки» вводится осознанно; конфликт с будущим workout-доменом решается слоями FSD и границами сущностей (см. §6).
- Не добавлять параллельную систему spacing/typography в TS, если достаточно Tailwind (`p-4`, `text-sm`, `font-semibold`) и существующих шрифтов в `index.css` / `@theme`.

---

## 2. Состояние «как сейчас» в habit-plus (якорь для маппинга)

| Область | Факт |
|--------|------|
| Роутинг | `src/app/router/routes.tsx` — только `/` → `HomePage`, остальное `Navigate` на `/`. |
| Домашняя страница | `src/pages/HomePage/ui/HomePage.tsx` — заглушка. |
| Оболочка | `src/app/AppContent.tsx` → `AppLayout` + `AppRoutes`. `AppLayout` рендерит `Header` (`src/widgets/header/ui/Header.tsx`) и **скроллируемую** колонку; handoff — **фиксированный** `100dvh` + внутренний скролл списка. |
| Тема | `ThemeProvider` в `main.tsx`; палитра — `index.css` (`:root`, `.dark`, опционально `.theme-aggressive`). |
| Сущности | `src/entities/user`, `src/entities/theme` — без календаря тренировок в текущем дереве. |

Вывод: маршруты и layout нужно **расширить** под handoff; конфликт «двойной шапки» (§8) заранее заложен в `AppLayout` + handoff top bar.

---

## 3. Маппинг экранов: handoff → habit-plus

Маршруты handoff (`App.tsx` handoff) предлагается воспроизвести в `AppRoutes` (пути сохранить для предсказуемости deep link / Android back).

| Handoff экран | Путь handoff | Целевой артефакт habit-plus | Примечание |
|---------------|--------------|-----------------------------|------------|
| `MainScreen` | `/` | `src/pages/HomePage/ui/HomePage.tsx` (или вынести композицию в `src/widgets/habitHome` + тонкая страница) | Три режима просмотра + нижняя навигация + overlay детали. |
| `HabitDetail` | не отдельный URL (overlay над главным) | `src/features/habitDetail/ui/...` + управление из Home (или `Drawer` из shadcn/vaul) | Поведение как sheet: `Drawer`/`DrawerContent` из `@/shared/ui/shadCNComponents/ui/drawer` предпочтительнее самописного absolute overlay, если сохраняется UX свайпа. |
| `EditHabitScreen` | `/add`, `/edit/:id` | `src/pages/EditHabitPage/...` или `src/pages/HabitEditorPage/...` | Форма создания/редактирования. |
| `RemindersScreen` | `/edit/:id/reminders` | `src/pages/HabitRemindersPage/...` или вложенный роут под редактором | Зависит от `id` привычки. |
| `SettingsScreen` | `/settings` | `src/pages/SettingsPage/...` | Список секций как в handoff; пункты-заглушки допустимы до появления бэкенда/фич. |

Ленивые импорты страниц — по образцу текущего `routes.tsx`.

---

## 4. Маппинг компонентов: handoff → shadcn + слой FSD

Принцип: **визуальная структура** из handoff; **реализация** — композиция Card/Button/Input/… + утилиты Tailwind. Новые «тонкие» обёртки — по месту ответственности.

| Handoff компонент | Роль UI | Примитивы habit-plus | Слой размещения предлагаемых обёрток |
|-------------------|---------|----------------------|-------------------------------------|
| `HabitCard` | крупная карточка + тумблер | `Card`, `CardHeader`/`CardContent` (по структуре), `Button` или кликабельная область + `Separator` при необходимости | `src/widgets/habitCard` или `src/features/habitList` (если логика toggle рядом) |
| `HabitListRow` | строка списка | `Card` (variant плоский) или `div` + `Separator`; `Badge` для дней | `widgets` / `features` |
| `HabitMiniCard` | мини-колонка | `Card`, компактные отступы | `widgets` |
| `HabitIcon` | иконка по имени | без shadcn; `src/shared/ui` или `src/shared/lib/icons` | **shared** |
| `DotGrid` | heatmap точек | без shadcn; возможно `chart` не обязателен — сетка div | `features` (heatmap) или `widgets` |
| `BottomNav` | табы grid/list/cols | не обязательно готовый компонент shadcn; стили через `bg-card`, `border-border`, `rounded-full`; активное состояние `bg-accent` / `text-primary` | `widgets/bottomNav` — **один** экземпляр на главном экране |
| Top bar (inline в `MainScreen`) | настройки, лого, PRO, график, добавить | `Button` (ghost/icon), `Badge` для PRO | `widgets/appTopBar` или часть `features/habitHome` |

Импорты UI: только из публичного API `src/shared/ui/shadCNComponents` (как принято в проекте), не из внутренних путей пакета в обход барреля.

---

## 5. Миграция токенов: handoff → Tailwind + `index.css`

### 5.1 Цвета (`tokens/colors.ts` → семантика)

| Handoff | Семантика habit-plus | Комментарий |
|---------|----------------------|-------------|
| `bg` `#0e0e0f` | `bg-background` | При заметном расхождении с `.dark` — **подстроить** `--background` в блоке `.dark`, не вводить `bg-[#0e0e0f]` в TSX. |
| `card` / `cardDark` | `bg-card`, границы `border-border` | Два уровня поверхности — через `card` vs `muted`/`secondary` при необходимости. |
| `text` / `textSub` | `text-foreground`, `text-muted-foreground` | |
| `purple` акцент | `text-primary` / `bg-primary` или отдельный семантический слой | Текущий `.dark` задаёт нейтральный primary (светлый на тёмном). Если бренд handoff — **фиолетовый акцент**, решение в одном месте: расширить/переопределить `--primary` / `--ring` в `.dark` (или отдельный класс темы **после** согласования), без дублирования палитры в компонентах. |
| `tagBg`, `cardBorder`, `separator` | `bg-muted`, `border-border`, `border-t` + `Separator` | |
| `habitColors[]` | палитра выбора цвета привычки | Хранить как константу в `src/entities/habit/model/` или `shared/config` — **не** как вторую систему фона приложения; сами цвета — для **акцентов привычки** (кружки), допустимы hex в данных, не в теме shell. |
| `overlay` | `bg-black/50` уже в `DrawerOverlay` | Согласовать с токеном popover/foreground при желании через variable. |

### 5.2 Spacing (`tokens/spacing.ts`)

| Handoff | Tailwind / заметка |
|---------|-------------------|
| `pagePad` 16 | `px-4` |
| `cardPad` 14 | `p-3.5` или `p-[14px]` — предпочтить стандартную шкалу `p-3`/`p-4` с минимальным отклонением для визуальной близости |
| `gap` 10, `gapSm` 8 | `gap-2.5`, `gap-2` |
| `radius.card` 16 | `rounded-2xl` (16px при дефолтном radius) или опора на `--radius` из темы |
| `radius.sheet` 24 | `rounded-t-3xl` / классы Drawer content в shadcn |

### 5.3 Typography (`tokens/typography.ts`)

| Handoff | Tailwind |
|---------|----------|
| appTitle 20/700 | `text-xl font-bold` |
| screenTitle 17/600 | `text-lg font-semibold` |
| cardTitle 15/600 | `text-base font-semibold` |
| label 13/500 | `text-sm font-medium` |
| monoBold | `font-numeric` (уже в `@theme` в `index.css`) + `font-semibold` |

Шрифт: в handoff указан Inter; в habit-plus глобально **Roboto Condensed** (`index.css`). Для визуальной близости к макету — решение «Claude's discretion»: либо оставить Roboto для единообразия продукта, либо точечно подключить Inter только для блока habit UI (нежелательно дробить без запроса продукта). Зафиксировать выбор в SUMMARY при реализации.

---

## 6. Данные: handoff store vs `entities` habit-plus

| Экран / область | Рекомендация | Обоснование |
|-----------------|--------------|-------------|
| Главный список, toggle «сегодня», viewMode | Новый **`src/entities/habit/slice/habitStore.ts`** (или `habitsStore.ts`) по образцу handoff: Zustand + `persist`, типы в `src/entities/habit/model/types.ts` | Домен handoff = привычки; соответствует экранам. API слайса можно выровнять с handoff (`toggleToday`, `setViewMode`, …) для снижения риска регрессий при переносе UI. |
| `userStore` / `themeStore` | Не смешивать с привычками | FSD: пользователь и тема — отдельные сущности. Тема уже глобальна. |
| Будущий workout / `calendarStore` (если вернётся в репо) | **Не** использовать для списка привычек без явного PM-решения «привычка = тренировка» | Пользователь предупредил о конфликте доменов; до слияния доменов — отдельные сторы и маршруты. |
| Reminders | Поля в модели `Habit` (как в handoff `types/habit.ts`) + действия в том же слайсе | |
| Settings | Пока локальный UI state + вызовы `themeStore` где пересекается (тема); остальное заглушки | |

Итог: **не копировать файл** `design_handoff/.../habitsStore.ts` как есть в `src/`, а **переписать** в `entities/habit` с публичным `index.ts`, чтобы страницы и виджеты импортировали только из `@/entities/habit`.

---

## 7. Риски и смягчение

| Риск | Описание | Митигация |
|------|-----------|-----------|
| Двойной chrome | `AppLayout` всегда рендерит `Header`; handoff — свой top bar на главной | Вариант A: для маршрутов habit-UI использовать **вложенный layout** без глобального `Header`. Вариант B: заменить `Header` на компонент, совпадающий с top bar handoff только на `/`. Не дублировать оба. |
| Скролл | `AppLayout` — `overflow-y-auto` на корне; handoff — фиксированная колонка со скроллом только в середине | Выровнять: либо `h-dvh flex flex-col overflow-hidden` на странице и скролл `ScrollArea` внутри, либо ослабить внешний скролл layout для этих маршрутов. |
| FSD-направление | `entities` не должны импортировать `widgets`/`features` | Данные и типы — вниз; UI композиция — `pages` → `widgets`/`features` → `entities`/`shared`. |
| Дублирование `BottomNav` | Появится второй низ при добавлении чего-то в `AppLayout` | Держать **одну** нижнюю навигацию в составе главной страницы/виджета; не добавлять второй в layout. |
| Android back | Уже слушается `history.back` | Вложенные модалки/drawer: закрытие drawer первым popstate-поведением или controlled `open` по URL (опционально v2). |
| Имя persist | handoff `habit-plus-v1` | Согласовать ключ localStorage с версионированием схемы данных при эволюции типов `Habit`. |

---

## 8. Ориентировочный список файлов create/modify в habit-plus

### Создать (оценка)

- `src/entities/habit/model/types.ts` — типы `Habit`, `ViewMode`, `Reminder` (из handoff с минимальными правками).
- `src/entities/habit/slice/habitStore.ts` — Zustand + persist.
- `src/entities/habit/index.ts` — публичный API.
- `src/widgets/habitBottomNav/ui/HabitBottomNav.tsx` (имя условное).
- `src/widgets/habitTopBar/ui/HabitTopBar.tsx` или аналог.
- `src/widgets/habitCard/ui/HabitCard.tsx`, `HabitListRow.tsx`, `HabitMiniCard.tsx` — разметка на shadcn + Tailwind.
- `src/features/habitDetail/ui/HabitDetailDrawer.tsx` — обёртка над `Drawer` + контент из логики `HabitDetail.tsx` handoff.
- `src/features/habitHeatmap/ui/DotGrid.tsx` (или в `widgets`) — без сырых цветов фона приложения.
- `src/pages/EditHabitPage/ui/EditHabitPage.tsx`, `src/pages/HabitRemindersPage/...`, `src/pages/SettingsPage/...` — по одному UI-модулю.
- Баррели: `src/widgets/index.ts`, `src/pages/index.ts`, обновления при необходимости.

### Изменить

- `src/app/router/routes.tsx` — маршруты `/`, `/add`, `/edit/:id`, `/edit/:id/reminders`, `/settings`.
- `src/pages/HomePage/ui/HomePage.tsx` — композиция главного экрана.
- `src/app/layout/AppLayout.tsx` и/или `src/widgets/header/ui/Header.tsx` — устранение двойной шапки, скролл-контракт.
- `src/app/styles/index.css` — только при необходимости согласовать handoff-акцент с `.dark` (без параллельной палитры в TS).

---

## 9. Чеклист верификации

### Автоматизируемо

- `pnpm run lint` — без ошибок.
- `pnpm run build` — `tsc` + Vite build успешны.

### Визуальное / UX

- Главная: три режима (grid/list/cols), переключение без артефактов, отступы близки к handoff.
- Открытие детали привычки: затемнение фона, sheet не обрезается safe-area; закрытие по клику снаружи и кнопке.
- Навигация: `/settings`, `/add`, `/edit/:id`, reminders — корректный back на Android при наличии истории.
- **Тёмная тема:** все новые экраны читаемы только через семантические классы; нет новых «сырых» hex в TSX для shell UI.

### Регрессии

- `ThemeProvider` и существующие провайдеры не сломаны.
- Нет циклических импортов между слоями.

---

## 10. Предлагаемые волны реализации (для `/gsd-execute-phase` или ручного трека)

1. **Foundation:** `entities/habit` (типы + store), маршруты, пустые страницы с навигацией.
2. **Главный экран:** виджеты списка + `BottomNav` + top bar; интеграция store.
3. **Деталь:** `Drawer` + heatmap/calendar блок из handoff.
4. **Редактор + напоминания + настройки:** формы на `Input`/`Label`/`Checkbox`/`Button`/`Separator`.
5. **Полировка:** layout/scroll, `.dark` при необходимости, lint/build.

---

## 11. Критерий готовности интеграции

- Все маршруты handoff представлены в habit-plus.
- UI собран на shadcn-примитивах проекта; визуальная иерархия соответствует референсу с допустимыми отклонениями шрифта/шкалы Tailwind.
- Цвета приложения управляются через `index.css` (включая `.dark` 121–154 как базу); акцент handoff согласован с переменными, а не размазан по компонентам отдельными hex.

---

*Документ подготовлен планировщиком GSD на основе чтения: handoff `App.tsx`, `MainScreen.tsx`, `BottomNav.tsx`, `HabitCard.tsx`, `HabitDetail.tsx`, `SettingsScreen.tsx`, токены; habit-plus `routes.tsx`, `index.css` (включая `.dark`), `AppLayout.tsx`, `HomePage.tsx`, `Header.tsx`, `drawer.tsx`.*
