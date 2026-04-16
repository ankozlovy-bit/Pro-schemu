# StitchPDF - Quick Placeholder Reference

## 📋 Основные плейсхолдеры

```
%Title%      - Название схемы
%count%      - Каунт канвы (14, 16, 18...)
%dimcm%      - Размер в см (25 x 30 см)
%stitches%   - Размер в стежках (120 x 150)
%RNG%        - Палитра (DMC)
```

## 🎨 Крест (основные цвета)

```
%p%   - Цвет (hex)
%s%   - Символ
%n%   - Номер DMC
%st%  - Количество нитей
```

## 🧵 Специальные стежки

### Полукрест
```
%hs%  - Символ
%hn%  - Номер DMC
%hst% - Количество нитей
```

### Бэкстич
```
%bs%  - Символ
%bn%  - Номер DMC
%bst% - Количество нитей
```

### Французские узелки
```
%fs%  - Символ
%fn%  - Номер DMC
%fst% - Количество нитей
```

### Бисер
```
%bds% - Символ
%bdn% - Номер бисера
%bdc% - Цвет (hex)
```

## ⚡ Условные блоки

```html
@@%ifhalf%
  <!-- Показывается только если есть полукрест -->
@@

@@%ifbacks%
  <!-- Показывается только если есть бэкстич -->
@@

@@%iffrench%
  <!-- Показывается только если есть французские узелки -->
@@

@@%ifbeads%
  <!-- Показывается только если есть бисер -->
@@
```

## 💡 Пример использования

```html
<h1>%Title%</h1>
<p>Размер: %stitches% (%dimcm%)</p>
<p>Канва: Aida %count%</p>

<table>
  <tr>
    <td style="background: %p%">%s%</td>
    <td>DMC %n%</td>
    <td>%st% нити</td>
  </tr>
</table>

@@%ifhalf%
<h2>Полукрест</h2>
<table>
  <tr>
    <td>%hs%</td>
    <td>DMC %hn%</td>
  </tr>
</table>
@@
```

## 🔧 Использование в коде

```typescript
import { generatePlaceholders } from './utils/pdfPlaceholders';

const placeholders = generatePlaceholders(projectData);
console.log(placeholders['%Title%']); // "Моя схема"
console.log(placeholders['%ifhalf%']); // true/false
```

---

📚 Полная документация: `/src/imports/placeholders-guide.md`
