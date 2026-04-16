# ✅ Обновление кнопок навигации - Единый стиль

## 📅 Дата: 17 марта 2026

---

## 🎨 Что изменилось

Все кнопки навигации между шагами приложения приведены к единому стилю в соответствии с дизайн-макетом.

### Новый дизайн кнопок:

**Левая кнопка "Назад":**
- Светлая с тонкой рамкой (outline)
- Цвет рамки: `border-[#2D2D2D]/20`
- Hover эффект: `hover:bg-[#E8F0E8]/50`
- Иконка стрелки влево (`ChevronLeft`)

**Правая кнопка "Далее"/"Продолжить":**
- Темная (черная) кнопка
- Цвет фона: `bg-[#2D2D2D]`
- Hover эффект: `hover:bg-[#2D2D2D]/90`
- Белый текст: `text-white`
- Иконка стрелки вправо (`ChevronRight`)

### Общие характеристики:

- **Высота:** `h-14` (56px)
- **Округление:** `rounded-2xl`
- **Равная ширина:** `flex-1` (кнопки занимают равное пространство)
- **Расположение:** `flex gap-4` (в одну строку с отступом 16px)
- **Отзывчивость:** Всегда в одну строку (убран `flex-col sm:flex-row`)

---

## 📝 Обновленные компоненты

### 1. StepOne.tsx
```tsx
<div className="flex gap-4">
  <Button
    onClick={onNext}
    disabled={!canProceed}
    className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
  >
    Продолжить
    <ChevronRight className="w-5 h-5 ml-2" />
  </Button>
</div>
```

### 2. StepTwo.tsx
```tsx
<div className="flex gap-4">
  <Button
    onClick={onBack}
    variant="outline"
    className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
  >
    <ChevronLeft className="w-5 h-5 mr-2" />
    Назад
  </Button>
  <Button
    onClick={handleNext}
    className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
  >
    Продолжить
    <ChevronRight className="w-5 h-5 ml-2" />
  </Button>
</div>
```

### 3. StepThree.tsx
```tsx
<div className="flex gap-4">
  <Button
    onClick={onBack}
    variant="outline"
    className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
  >
    <ChevronLeft className="w-5 h-5 mr-2" />
    Назад
  </Button>
  <Button
    onClick={onNext}
    className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
  >
    Продолжить
    <ChevronRight className="w-5 h-5 ml-2" />
  </Button>
</div>
```

### 4. StepFour.tsx
```tsx
<div className="max-w-7xl mx-auto px-6 pb-6 flex gap-4">
  {onBack && (
    <Button
      onClick={onBack}
      variant="outline"
      className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
    >
      <ChevronLeft className="w-5 h-5 mr-2" />
      Назад
    </Button>
  )}

  {onNext && (
    <Button
      onClick={onNext}
      className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
    >
      Далее
      <ChevronRight className="w-5 h-5 ml-2" />
    </Button>
  )}
</div>
```

### 5. StepFive.tsx
```tsx
<div className="flex gap-4 mt-8">
  <Button
    onClick={onBack}
    variant="outline"
    className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
  >
    <ChevronLeft className="w-5 h-5 mr-2" />
    Назад
  </Button>
  <Button
    onClick={onNext}
    className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
  >
    Продолжить
    <ChevronRight className="w-5 h-5 ml-2" />
  </Button>
</div>
```

### 6. StepSix.tsx
```tsx
<div className="mt-8 flex gap-4">
  <Button
    onClick={onBack}
    variant="outline"
    className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
  >
    <ChevronLeft className="w-5 h-5 mr-2" />
    Назад
  </Button>

  <Button
    onClick={handleGeneratePDF}
    disabled={isGenerating}
    className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white disabled:opacity-50"
  >
    <Download className="w-5 h-5 mr-2" />
    {isGenerating ? "Генерация PDF..." : "Скачать PDF"}
  </Button>
</div>
```

---

## 🎯 Ключевые изменения

### Было (разный стиль):
- ❌ `flex-col sm:flex-row` - кнопки были в колонку на мобильных
- ❌ `justify-between` - кнопки были разнесены по краям
- ❌ `px-8` - разная ширина кнопок
- ❌ Непостоянные отступы между кнопками

### Стало (единый стиль):
- ✅ `flex gap-4` - всегда в одну строку с отступом 16px
- ✅ `flex-1` - равная ширина обеих кнопок
- ✅ Постоянная высота `h-14`
- ✅ Единое округление `rounded-2xl`
- ✅ Консистентные цвета и hover-эффекты

---

## 📱 Отзывчивость

Кнопки теперь **всегда** располагаются в одну строку и занимают равную ширину, что обеспечивает:

- Четкое визуальное разделение действий
- Удобство использования на всех размерах экранов
- Единообразие интерфейса

---

## 🎨 Визуальный результат

```
┌──────────────────────────────────────┐
│                                      │
│  ┌─────────────┐  ┌─────────────┐   │
│  │   ◄ Назад   │  │  Далее  ►   │   │
│  └─────────────┘  └─────────────┘   │
│   светлый, outline    темный        │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ Проверочный список

- [x] StepOne - обновлен
- [x] StepTwo - обновлен
- [x] StepThree - обновлен
- [x] StepFour - обновлен
- [x] StepFive - обновлен
- [x] StepSix - обновлен
- [x] Единый стиль на всех шагах
- [x] Равная ширина кнопок
- [x] Постоянные отступы
- [x] Консистентные hover-эффекты

---

**Версия:** 1.0.0  
**Дата:** 17 марта 2026  
**Статус:** ✅ Завершено
