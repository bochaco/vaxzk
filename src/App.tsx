import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { networkId, getContractId, setContractId } from "./components/ConfigNetwork";
import DeployContractView from "./components/DeployContractView";
import { ProfileProvider } from './Profile';
import { LanguageProvider, useLanguage } from './LanguageContext';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { InvitePage } from './InvitePage';
import { HashRouter, Routes, Route } from "react-router-dom";
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
    <div translate="no" className={`flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-slate-200/60 ${fixed ? 'fixed top-3 right-4 z-[100]' : ''}`}>
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
  const [contractId, setContractIdState] = useState<string>(() => getContractId());

  const handleLoginSuccess = async (address: string, api: ConnectedAPI) => {
    const id = getContractId();
    if (id) {
      const providers = await buildProviders(api, networkId);
      const secretKey = new Uint8Array(32);
      const joined = await VaxZkAPI.join(providers, id, secretKey);
      setVaxApi(joined);
    }
    setWalletAddress(address);
    setConnectedApi(api);
    setIsConnected(true);
  };

  const handleDeployed = async (address: string) => {
    setContractId(address);
    setContractIdState(address);
    if (connectedApi) {
      const providers = await buildProviders(connectedApi, networkId);
      const secretKey = new Uint8Array(32);
      const joined = await VaxZkAPI.join(providers, address, secretKey);
      setVaxApi(joined);
    }
  };

  const handleLogout = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setConnectedApi(null);
  };

  return (
    <HashRouter>
      <>
        {!isConnected ? (
          <><LanguageSelector fixed /><Login onLoginSuccess={handleLoginSuccess} /></>
        ) : (
          <>
            {!contractId ? (
              <DeployContractView onLogout={handleLogout} walletAddress={walletAddress} onDeployed={handleDeployed} />
            ) : (
              <Routes>
                <Route path="/invite" element={ <InvitePage vaxApi={vaxApi!} />} />
                <Route path="/" element={ <Dashboard onLogout={handleLogout} walletAddress={walletAddress} connectedApi={connectedApi!} vaxApi={vaxApi!} /> } />
              </Routes>
            )}
          </>
        )}
      </>
    </HashRouter>
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
