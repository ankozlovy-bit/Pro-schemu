import KeyGenerator from '../components/KeyGenerator';
import { GlobalSettings } from '../types';

type Page = 'home' | 'workflow' | 'key-generator' | 'history' | 'settings';

interface KeyGeneratorPageProps {
  onNavigate: (page: Page, fromStep?: number) => void;
  settings?: GlobalSettings;
  onSaveSettings?: (settings: GlobalSettings) => void;
  previousPage?: Page;
}

export default function KeyGeneratorPage({ onNavigate, settings, previousPage }: KeyGeneratorPageProps) {
  console.log('🔑 KeyGeneratorPage rendered, previousPage:', previousPage);
  return <KeyGenerator onClose={() => onNavigate(previousPage || 'home')} settings={settings} />;
}