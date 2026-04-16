import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { networkId, getContractId } from "./components/ConfigNetwork";
import DeployContractView from "./components/DeployContractView";
import { ProfileProvider } from './Profile';
import { LanguageProvider, useLanguage } from './LanguageContext';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { InvitePage } from './InvitePage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import { buildProviders, VaxZkAPI } from "./contract-api/index";

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
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);

  const handleLoginSuccess = async (address: string, connectedApi: ConnectedAPI) => {
    console.log('loading...');

    const providers = await buildProviders(connectedApi, networkId);
    // Using placeholder secret key as in Dashboard.tsx
    const secretKey = new Uint8Array(32);
    const vaxApi =  await VaxZkAPI.join(
      providers,
      getContractId(),
      secretKey,
    );
    setVaxApi(vaxApi);

    setWalletAddress(address);
    setConnectedApi(connectedApi);
    setIsConnected(true);
  };

  const handleLogout = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setConnectedApi(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/invite" element={
            <>
              {!isConnected ? (
                <><LanguageSelector fixed /><Login onLoginSuccess={handleLoginSuccess} /></>
              ) : (
                <InvitePage vaxApi={vaxApi!} />
              )
              }
            </>
        } />
        <Route path="/" element={
            <>
              {!isConnected ? (
                <>
                  <LanguageSelector fixed />
                  <Login onLoginSuccess={handleLoginSuccess} />
                </>  
              ) : (
                <>
                  {!getContractId() ? (
                    <DeployContractView onLogout={handleLogout} walletAddress={walletAddress} />
                  ) : (
                    <Dashboard onLogout={handleLogout} walletAddress={walletAddress} connectedApi={connectedApi!} />
                  )
                }
                </>
              )}
            </>
          } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </LanguageProvider>
  );
}

export default App;
