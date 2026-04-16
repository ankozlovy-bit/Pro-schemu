/**
 * Module Check Utility
 * Проверяет доступность критических модулей
 */

export interface ModuleStatus {
  name: string;
  loaded: boolean;
  error?: string;
}

export async function checkCriticalModules(): Promise<ModuleStatus[]> {
  const modules: ModuleStatus[] = [];

  // Check React
  try {
    await import('react');
    modules.push({ name: 'react', loaded: true });
  } catch (error) {
    modules.push({
      name: 'react',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check Lucide React (icons)
  try {
    await import('lucide-react');
    modules.push({ name: 'lucide-react', loaded: true });
  } catch (error) {
    modules.push({
      name: 'lucide-react',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check PDF-lib
  try {
    await import('pdf-lib');
    modules.push({ name: 'pdf-lib', loaded: true });
  } catch (error) {
    modules.push({
      name: 'pdf-lib',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check jsPDF
  try {
    await import('jspdf');
    modules.push({ name: 'jspdf', loaded: true });
  } catch (error) {
    modules.push({
      name: 'jspdf',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check html2canvas
  try {
    await import('html2canvas');
    modules.push({ name: 'html2canvas', loaded: true });
  } catch (error) {
    modules.push({
      name: 'html2canvas',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check React DnD
  try {
    await import('react-dnd');
    modules.push({ name: 'react-dnd', loaded: true });
  } catch (error) {
    modules.push({
      name: 'react-dnd',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Check QRCode
  try {
    await import('qrcode');
    modules.push({ name: 'qrcode', loaded: true });
  } catch (error) {
    modules.push({
      name: 'qrcode',
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return modules;
}

export function logModuleStatus(modules: ModuleStatus[]): void {
  console.log('📦 Module Check Results:');
  console.log('========================');
  
  let allLoaded = true;
  
  modules.forEach((module) => {
    if (module.loaded) {
      console.log(`✅ ${module.name} - loaded successfully`);
    } else {
      console.error(`❌ ${module.name} - failed to load`);
      if (module.error) {
        console.error(`   Error: ${module.error}`);
      }
      allLoaded = false;
    }
  });
  
  console.log('========================');
  
  if (allLoaded) {
    console.log('✨ All critical modules loaded successfully!');
  } else {
    console.warn('⚠️ Some modules failed to load. Check errors above.');
  }
}

/**
 * Run module check on application startup (optional)
 */
export async function runStartupCheck(): Promise<boolean> {
  try {
    const modules = await checkCriticalModules();
    logModuleStatus(modules);
    return modules.every((m) => m.loaded);
  } catch (error) {
    console.error('Fatal error during module check:', error);
    return false;
  }
}
