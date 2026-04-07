import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { LanguageProvider, useLanguage } from './LanguageContext';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import './index.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
] as const;

export function LanguageSelector({ fixed = false }: { fixed?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div className={`flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-slate-200/60 ${fixed ? 'fixed top-3 right-4 z-[100]' : ''}`}>
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
            language === code
              ? 'bg-primary'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function AppContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

  const handleLoginSuccess = (address: string, api: ConnectedAPI) => {
    setWalletAddress(address);
    setConnectedApi(api);
    setIsConnected(true);
  };

  const handleLogout = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setConnectedApi(null);
  };

  return (
    <>
      {isConnected ? (
        <Dashboard onLogout={handleLogout} walletAddress={walletAddress} connectedApi={connectedApi!} />
      ) : (
        <>
          <LanguageSelector fixed />
          <Login onLoginSuccess={handleLoginSuccess} />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
