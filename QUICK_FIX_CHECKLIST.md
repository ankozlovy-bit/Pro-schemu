# ⚡ Быстрый чеклист устранения проблем

Если видите ошибки в консоли браузера - выполните эти шаги по порядку:

---

## 1️⃣ Очистка кэша браузера (90% проблем)

### Chrome / Edge
```
1. Откройте DevTools (F12)
2. Правый клик на кнопке обновления страницы (⟳)
3. Выберите "Empty Cache and Hard Reload" / "Очистить кэш и жесткая перезагрузка"
```

### Firefox
```
1. Откройте DevTools (F12)
2. Нажмите Ctrl + Shift + R (или Cmd + Shift + R на Mac)
```

### Safari
```
1. Меню "Разработка" → "Очистить кэши"
2. Нажмите Cmd + Option + R
```

**После очистки проверьте - проблема решена?**
- ✅ Да → Готово!
- ❌ Нет → Переходите к шагу 2

---

## 2️⃣ Проверка работы приложения

Игнорируйте ошибки в консоли и проверьте **фактическую работу**:

- [ ] Приложение загружается?
- [ ] Видны все 6 шагов workflow?
- [ ] Можно загрузить XSP файл?
- [ ] Можно создать обложку?
- [ ] Можно сгенерировать PDF?

**Если все работает** → Ошибки можно игнорировать (см. шаг 3)

---

## 3️⃣ Игнорируемые ошибки (не влияют на работу)

### ✅ Можно игнорировать:

#### CORS ошибки
```
❌ Access to image at 'https://www.gravatar.com/...' has been blocked by CORS policy
❌ Failed to load resource: https://www.figma.com/api/...
```
→ **Это внешние API, не влияют на ПроСхему**

#### Permissions Policy
```
⚠️ Permissions policy violation: unload is not allowed in this document
⚠️ Permissions policy violation: fullscreen is not allowed
```
→ **Предупреждения браузера, не влияют на функционал**

#### Figma internal
```
❌ Failed to load resource: vendor-core-adc2edec...js.br:sourcemap
```
→ **Внутренние файлы Figma Make, не критично**

---

## 4️⃣ Критические ошибки (требуют внимания)

### ⚠️ Если видите эти ошибки - нужно исправить:

```
❌ Failed to load StepSix.tsx
❌ Uncaught Error in component
❌ Module not found: lucide-react
```

**Решение:**
```bash
# 1. Очистите кэш Vite (если работаете локально)
rm -rf node_modules/.vite

# 2. Переустановите зависимости
pnpm install

# 3. Перезапустите dev сервер
pnpm dev
```

---

## 5️⃣ Если ничего не помогло

### В браузере:
1. Откройте консоль (F12)
2. Перейдите на вкладку "Console"
3. Сделайте скриншот **красных ошибок** (не предупреждений)
4. Проверьте вкладку "Network" - есть ли 404 или 500 ошибки?

### Диагностика:
1. Откройте файл `/DIAGNOSTIC_REPORT.md`
2. Проверьте список компонентов
3. Убедитесь что все файлы на месте

---

## 📊 Статус проверки модулей (Dev режим)

В dev режиме приложение автоматически проверяет модули при запуске.

Откройте консоль и найдите:
```
📦 Module Check Results:
========================
✅ react - loaded successfully
✅ lucide-react - loaded successfully
✅ pdf-lib - loaded successfully
✅ jspdf - loaded successfully
✅ html2canvas - loaded successfully
✅ react-dnd - loaded successfully
✅ qrcode - loaded successfully
========================
✨ All critical modules loaded successfully!
```

**Если видите ❌** - модуль не загрузился, нужна переустановка зависимостей.

---

## 🎯 Итоговый чеклист

- [ ] Очистил кэш браузера (Ctrl+Shift+R)
- [ ] Проверил работу всех 6 шагов
- [ ] Проигнорировал CORS и Permissions ошибки
- [ ] Проверил загрузку критических модулей (в консоли)
- [ ] Приложение работает корректно

**Если все пункты ✅ → Готово! Можно работать!**

---

## 📞 Дополнительная помощь

- См. `/CONSOLE_ERRORS_FIX.md` для детальных инструкций
- См. `/DIAGNOSTIC_REPORT.md` для полного отчета о системе
- См. `/READY_TO_USE.md` для обзора функционала

---

**Последнее обновление:** 16 марта 2026
