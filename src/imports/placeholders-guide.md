# Руководство по плейсхолдерам StitchPDF

## Обзор системы

StitchPDF использует систему плейсхолдеров для автоматической генерации профессиональных PDF схем вышивки. Плейсхолдеры - это специальные метки, которые заменяются реальными данными из вашего проекта.

## Основные плейсхолдеры

### 1. Информация о дизайне

| Плейсхолдер | Описание | Пример значения |
|------------|----------|-----------------|
| `%Title%` | Название схемы | "Розовый сад" |
| `%count%` | Каунт канвы | "14" |
| `%dimcm%` | Размер в сантиметрах | "25 x 30 см" |
| `%stitches%` | Размер в стежках | "120 x 150" |
| `%RNG%` | Название палитры | "DMC" |

### 2. Крест (основные цвета)

Для каждого цвета используются следующие плейсхолдеры:

| Плейсхолдер | Описание | Пример |
|------------|----------|--------|
| `%p%` | Предпросмотр цвета (hex) | "#E90039" |
| `%s%` | Символ на схеме | "●" |
| `%n%` | Номер нити DMC | "666" |
| `%st%` | Количество сложений | "2" |

**Пример использования:**
```html
<tr>
  <td><div style="background: %p%"></div></td>
  <td>%s%</td>
  <td>%n%</td>
  <td>%st%</td>
</tr>
```

### 3. Полукрест

| Плейсхолдер | Описание | Пример |
|------------|----------|--------|
| `%hs%` | Символ полукреста | "◐" |
| `%hn%` | Номер нити DMC | "415" |
| `%hst%` | Количество сложений | "1" |

### 4. Бэкстич

| Плейсхолдер | Описание | Пример |
|------------|----------|--------|
| `%bs%` | Символ бэкстича | "/" |
| `%bn%` | Номер нити DMC | "310" |
| `%bst%` | Количество сложений | "1" |

### 5. Французские узелки

| Плейсхолдер | Описание | Пример |
|------------|----------|--------|
| `%fs%` | Символ узелка | "○" |
| `%fn%` | Номер нити DMC | "310" |
| `%fst%` | Количество сложений | "1" |

### 6. Бисер

| Плейсхолдер | Описание | Пример |
|------------|----------|--------|
| `%bds%` | Символ бисера | "◇" |
| `%bdn%` | Номер бисера | "02010" |
| `%bdc%` | Цвет бисера (hex) | "#FFD700" |

## Условные блоки

Используйте условные блоки для автоматического скрытия пустых секций:

### Синтаксис

```
@@%ifhalf%
  ... содержимое для полукреста ...
@@
```

### Доступные условия

| Условие | Когда отображается |
|---------|-------------------|
| `@@%ifhalf% ... @@` | Когда есть цвета полукреста |
| `@@%ifbacks% ... @@` | Когда есть цвета бэкстича |
| `@@%iffrench% ... @@` | Когда есть французские узелки |
| `@@%ifbeads% ... @@` | Когда есть бисер |

### Пример использования

```html
<!-- Таблица полукреста появится только если есть такие цвета -->
@@%ifhalf%
<div class="half-stitch-section">
  <h3>Полукрест</h3>
  <table>
    <tr>
      <td>%hs%</td>
      <td>%hn%</td>
      <td>%hst%</td>
    </tr>
  </table>
</div>
@@

<!-- Таблица бэкстича появится только если есть такие цвета -->
@@%ifbacks%
<div class="backstitch-section">
  <h3>Бэкстич</h3>
  <table>
    <tr>
      <td>%bs%</td>
      <td>%bn%</td>
      <td>%bst%</td>
    </tr>
  </table>
</div>
@@
```

## Полный пример шаблона

```html
<!DOCTYPE html>
<html>
<head>
  <title>%Title% - Схема вышивки</title>
  <style>
    .color-preview { width: 30px; height: 30px; border: 1px solid #000; }
    table { border-collapse: collapse; width: 100%; }
    td, th { padding: 8px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>%Title%</h1>
  
  <div class="specs">
    <p><strong>Каунт:</strong> %count%</p>
    <p><strong>Размер:</strong> %dimcm%</p>
    <p><strong>Стежков:</strong> %stitches%</p>
    <p><strong>Палитра:</strong> %RNG%</p>
  </div>
  
  <h2>Крест</h2>
  <table>
    <thead>
      <tr>
        <th>Цвет</th>
        <th>Символ</th>
        <th>DMC</th>
        <th>Нити</th>
      </tr>
    </thead>
    <tbody>
      <!-- Цвета креста будут автоматически добавлены -->
      <tr>
        <td><div class="color-preview" style="background: %p%"></div></td>
        <td>%s%</td>
        <td>%n%</td>
        <td>%st%</td>
      </tr>
    </tbody>
  </table>
  
  @@%ifhalf%
  <h2>Полукрест</h2>
  <table>
    <thead>
      <tr>
        <th>Символ</th>
        <th>DMC</th>
        <th>Нити</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>%hs%</td>
        <td>%hn%</td>
        <td>%hst%</td>
      </tr>
    </tbody>
  </table>
  @@
  
  @@%ifbacks%
  <h2>Бэкстич</h2>
  <table>
    <thead>
      <tr>
        <th>Символ</th>
        <th>DMC</th>
        <th>Нити</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>%bs%</td>
        <td>%bn%</td>
        <td>%bst%</td>
      </tr>
    </tbody>
  </table>
  @@
  
  @@%ifbeads%
  <h2>Бисер</h2>
  <table>
    <thead>
      <tr>
        <th>Цвет</th>
        <th>Символ</th>
        <th>Номер</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><div class="color-preview" style="background: %bdc%"></div></td>
        <td>%bds%</td>
        <td>%bdn%</td>
      </tr>
    </tbody>
  </table>
  @@
</body>
</html>
```

## Использование в коде

### JavaScript/TypeScript

```typescript
import { generatePlaceholders, applyPlaceholders } from './utils/pdfPlaceholders';

// Генерируем плейсхолдеры из данных проекта
const placeholders = generatePlaceholders(projectData);

// Применяем к шаблону
const template = `
  <h1>%Title%</h1>
  <p>Каунт: %count%</p>
  @@%ifhalf%
    <p>Есть полукрест!</p>
  @@
`;

const result = applyPlaceholders(template, placeholders);
```

### Генерация HTML таблиц

```typescript
import { 
  generateCompleteKey,
  generateCrossStitchTable,
  generateHalfStitchTable 
} from './utils/pdfPlaceholders';

// Генерируем все таблицы
const keyHTML = generateCompleteKey(placeholders);

// Или отдельные таблицы
const crossTable = generateCrossStitchTable(placeholders);
const halfTable = generateHalfStitchTable(placeholders);
```

## Примечания

1. **Автоматическое скрытие**: Пустые секции (полукрест, бэкстич, бисер) будут автоматически скрыты если в них нет данных
2. **Множественные цвета**: Система автоматически обрабатывает массивы цветов и создает строки таблицы для каждого
3. **Безопасность**: Все значения автоматически экранируются для предотвращения XSS
4. **Расширяемость**: Легко добавить новые плейсхолдеры в `pdfPlaceholders.ts`

## Поддержка

Для вопросов и предложений используйте:
- VK: [ваша группа]
- Boosty: [ваш проект]
