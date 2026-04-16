/**
 * Console Helpers for ПроСхему
 * Полезные команды для диагностики в консоли браузера
 */

// Make these available globally in development
if (import.meta.env.DEV) {
  // @ts-ignore
  window.proschemu = {
    // Check module status
    checkModules: async () => {
      try {
        const { checkCriticalModules, logModuleStatus } = await import('./moduleCheck');
        const modules = await checkCriticalModules();
        logModuleStatus(modules);
        return modules;
      } catch (error) {
        console.error('Failed to load module checker:', error);
        return [];
      }
    },

    // Show application info
    info: () => {
      console.log('%c🌟 ПроСхему - Professional Cross Stitch Pattern Generator', 'font-size: 16px; font-weight: bold; color: #8B9D83;');
      console.log('%cВерсия: 0.0.1', 'color: #6B6B6B;');
      console.log('%cДизайн: Ethereal Tech | Soft Botanical', 'color: #D4A89F;');
      console.log('');
      console.log('📦 Доступные команды:');
      console.log('  proschemu.checkModules() - Проверить загрузку модулей');
      console.log('  proschemu.info()         - Показать информацию о приложении');
      console.log('  proschemu.clearCache()   - Оч��стить localStorage');
      console.log('  proschemu.help()         - Показать эту справку');
      console.log('');
      console.log('📚 Документация:');
      console.log('  /START_HERE.md           - Начните здесь');
      console.log('  /QUICK_FIX_CHECKLIST.md  - Быстрое исправление ошибок');
      console.log('  /DIAGNOSTIC_REPORT.md    - Полный отчет о системе');
    },

    // Clear localStorage
    clearCache: () => {
      const confirm = window.confirm('Очистить все данные ПроСхему из localStorage?');
      if (confirm) {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('proschemu-'));
        keys.forEach(key => localStorage.removeItem(key));
        console.log(`✅ Очищено ${keys.length} записей из localStorage`);
        console.log('Перезагрузите страницу для применения изменений');
      } else {
        console.log('❌ Очистка отменена');
      }
    },

    // Show help
    help: () => {
      // @ts-ignore
      window.proschemu.info();
    },

    // Get current version
    version: '0.0.1',

    // Design system info
    design: {
      colors: {
        sageGreen: '#8B9D83',
        cream: '#F5F3EE',
        terracotta: '#D4A89F',
        charcoal: '#2D2D2D',
      },
      fonts: {
        serif: 'Georgia, Times New Roman, serif',
        sans: 'Arial, Helvetica, sans-serif',
        mono: 'Consolas, Courier New, monospace',
      },
    },

    // Export current project data (if available)
    exportProject: () => {
      const data = localStorage.getItem('proschemu-project');
      if (data) {
        console.log('📦 Current project data:');
        try {
          const parsed = JSON.parse(data);
          console.log(parsed);
          return parsed;
        } catch (e) {
          console.error('Failed to parse project data:', e);
          return null;
        }
      } else {
        console.log('⚠️ No project data found in localStorage');
        return null;
      }
    },
  };

  // Show welcome message
  console.log('%c🌟 ПроСхему загружен!', 'font-size: 18px; font-weight: bold; color: #8B9D83; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);');
  console.log('%cВведите proschemu.help() для списка команд', 'color: #6B6B6B; font-style: italic;');
}

export {}; // Make this a module