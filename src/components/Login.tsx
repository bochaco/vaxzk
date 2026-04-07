import React, { useState } from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { useLanguage } from '../LanguageContext';

const getCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet
  );
};

const wallet = getCompatibleWallet();

interface LoginProps {
  onLoginSuccess: (address: string, connectedApi: ConnectedAPI) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'idle' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!wallet) {
      setError(t.walletNotFound);
      setStatus('error');
      return;
    }

    console.log('Found wallet:', wallet.name, wallet.apiVersion); // "lace", "4.0.1"

    try {
      setStatus('connecting');
      setError(null);

      // Connect to Preprod network
      const connectedApi = await wallet.connect('preprod');

      // Retrieve shielded address
      const addresses = await connectedApi.getShieldedAddresses();
      if (addresses.shieldedAddress) {
        setStatus('connected');
        onLoginSuccess(addresses.shieldedAddress, connectedApi);
      } else {
        throw new Error(t.shieldedAddressNotFound);
      }
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : t.connectionFailed);
      setStatus('error');
    }
  };
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-between hero-gradient overflow-hidden w-full">
      {/* Hero Content & Branding */}
      <main className="flex-1 w-full max-w-md px-8 flex flex-col items-center justify-center text-center mt-12">
        {/* Logo/Illustration Container */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10 p-6 bg-surface-container-lowest rounded-[2rem] shadow-2xl shadow-primary/5">
            <span className="material-symbols-outlined text-primary text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              health_and_safety
            </span>
          </div>
          {/* Secondary Floating Elements for Visual Interest */}
          <div className="absolute top-0 right-0 p-3 bg-secondary-container rounded-full shadow-lg">
            <span className="material-symbols-outlined text-on-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4 leading-tight">
          VaxZk
        </h1>

        {/* Value Proposition Section */}
        <section className="mb-12 space-y-4">
          <p className="text-on-surface-variant text-lg leading-relaxed font-medium px-4">
            {t.tagline}
          </p>
          <div className="bg-surface-container-low p-5 rounded-xl text-sm border-none shadow-sm text-left">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
              <p className="text-on-surface-variant leading-snug">
                {t.privacyNote} <span className="font-bold text-primary">Midnight</span> {t.privacyNote2}
              </p>
            </div>
            {status === 'error' && error && (
              <div className="mt-4 p-2 bg-error-container text-on-error-container rounded text-[10px]">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Primary Action */}
        <div className="w-full space-y-4">
          <button
            onClick={connectWallet}
            disabled={status === 'connecting' || status === 'connected'}
            className="w-full midnight-gradient text-white font-semibold py-5 px-8 rounded-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95 duration-200 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'connecting' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">account_balance_wallet</span>
            )}
            <span className="text-lg">
              {status === 'connecting' ? t.connecting : status === 'connected' ? t.connected : t.connectButton}
            </span>
          </button>
          {/* Contextual Hint */}
          <p className="text-xs text-outline uppercase tracking-widest font-bold">
            {t.secureConnection}
          </p>
        </div>
      </main>

      {/* Footer Options */}
      <footer className="w-full max-w-md px-8 pb-12">
        <div className="flex flex-col gap-4 items-center">
          <a className="text-primary text-sm font-semibold hover:underline flex items-center gap-1" href="https://midnight.network/" target="_blank">
            {t.learnMore}
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
          <div className="w-12 h-1 bg-surface-container-highest rounded-full"></div>
          <a className="text-on-surface-variant text-xs hover:text-primary transition-colors" href="https://github.com/bochaco/vaxzk" target="_blank">
            {t.needHelp}
          </a>
        </div>
      </footer>

      {/* Abstract Background Decor */}
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default Login;
