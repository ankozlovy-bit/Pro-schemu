# Исправление ошибки "Blank Preview Detected"

## Дата: 13 марта 2026

## Проблема
Приложение "ПроСхему" сталкивалось с повторяющейся ошибкой "Blank preview detected" - приложение не рендерило контент, несмотря на упрощение кода до минимального React компонента.

## Причина
Главной причиной была использование импорта `figma:asset` в компоненте StepOne:
```tsx
import heroImage from "figma:asset/54b2795d200291921f8affc80d9e6c57af85de3e.png";
```

Этот импорт вызывал ошибки рендеринга в окружении приложения.

## Решение

### 1. Восстановление полного App.tsx
Создан новый App.tsx с правильной навигацией между всеми страницами приложения:
- WelcomePage (стартовая страница с выбором языка)
- MainWorkflow (6-шаговый процесс создания PDF)
- KeyGeneratorPage (генератор ключа схемы)
- ProjectsHistoryPage (история проектов)
- SettingsPage (настройки приложения)

### 2. Замена проблемного импорта
Заменён импорт `figma:asset` на Unsplash изображение в StepOne.tsx:
```tsx
const HERO_IMAGE = "https://images.unsplash.com/photo-1632765265861-55e0726bfa43...";
```

### 3. Очистка тестовых файлов
Удалены все временные тестовые версии App:
- AppBackup.tsx
- AppDebug.tsx
- AppDebugNew.tsx
- AppMinimal.tsx
- AppSimple.tsx
- AppSimpleTest.tsx
- AppTest.tsx
- AppTest2.tsx
- AppTest3.tsx
- App_backup.tsx

## Структура приложения

### Главный компонент (/src/app/App.tsx)
- Управляет навигацией между страницами
- Хранит глобальное состояние (язык, настройки)
- Передаёт выбранный язык из WelcomePage в MainWorkflow

### Страницы
1. **WelcomePage** - стартовая страница с выбором языка (RU/EN)
2. **MainWorkflow** - основной рабочий процесс с 6 шагами
3. **KeyGeneratorPage** - инструмент для создания RTF-файлов с таблицами символов
4. **ProjectsHistoryPage** - история созданных проектов
5. **SettingsPage** - глобальные настройки приложения

### Шаги рабочего процесса
1. Загрузка схемы (StepOne)
2. Обложка (StepTwo)
3. Ключ схемы (StepThree)
4. Расход мулине (StepFour)
5. Загрузка схем (StepFive)
6. Финальный PDF (StepSix)

## Результат
Приложение полностью восстановлено и работает корректно. Все импорты безопасны, навигация функционирует, и система выбора языка интегрирована.

## Технологический стек
- React 18.3.1
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide React Icons
- Google Fonts (Inter, Playfair Display, Plus Jakarta Sans, JetBrains Mono)

## Дизайн-система
- **Название**: Ethereal Tech
- **Цветовая палитра**: Soft Botanical
  - Sage Green: #8B9D83
  - Cream: #F5F3EE
  - Soft Terracotta: #D4A89F
