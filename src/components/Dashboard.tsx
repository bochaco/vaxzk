import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { networkId, CONTRACTID } from './ConfigNetwork';
import { LanguageSelector } from '../App';
import HomeView from './HomeView';
import WalletView from './WalletView';
import AddVaccineView from './AddVaccineView';
import CalendarView from './CalendarView';
import PublishContractView from './PublishContractView';
import { joinVaxZkContract, isClinic, buildProviders } from '../utils/deploy';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

interface DashboardProps {
  onLogout: () => void;
  walletAddress: string | null;
  connectedApi: ConnectedAPI;
}

type Tab = 'home' | 'wallet' | 'add' | 'calendar' | 'publish';

const Dashboard: React.FC<DashboardProps> = ({ onLogout, walletAddress, connectedApi }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [prevTab, setPrevTab] = useState<Tab>('home');
  const [isClinicUser, setIsClinicUser] = useState<boolean | null>(null);

  React.useEffect(() => {
    async function checkClinicStatus() {
      if (!walletAddress || !CONTRACTID || !connectedApi) return;
      try {
        const providers = await buildProviders(connectedApi, networkId);
        
        // For this check, we need a secret key. In a real-world scenario, 
        // this would be retrieved from secure storage or derivation.
        // For now, we try to join with a placeholder or the stored state.
        const secretKey = new Uint8Array(32); // This should be the user's real secret key
        const contract = await joinVaxZkContract(providers, CONTRACTID as any, secretKey);
        
        const result = await isClinic(contract as any);
        setIsClinicUser(result);
      } catch (err) {
        console.error('Failed to check clinic status:', err);
        setIsClinicUser(false);
      }
    }
    checkClinicStatus();
  }, [walletAddress, connectedApi]);

  const handleTabChange = (tab: Tab) => {
    if (tab !== 'add' && tab !== 'publish') setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView walletAddress={walletAddress} onSchedule={() => handleTabChange('add')} />;
      case 'wallet':
        return <WalletView />;
      case 'add':
        return <AddVaccineView onBack={() => setActiveTab(prevTab)} />;
      case 'publish':
        return <PublishContractView onBack={() => setActiveTab(prevTab)} />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <HomeView walletAddress={walletAddress} onSchedule={() => handleTabChange('add')} />;
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-slate-500">{t.loggedInAs}</span>
                <span className="text-sm font-bold text-on-surface">
                  Midnight {walletAddress ? `(...${walletAddress.slice(-6)})` : ''}
                </span>
              </div>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-200 mx-2"></div>
            <h1 className="hidden md:block text-xl font-bold text-blue-800 tracking-tight">VaxZk</h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-error hover:bg-error/10 transition-colors text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {renderView()}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-slate-50/70 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:flex">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
            activeTab === 'home' ? 'text-blue-700 bg-blue-100/50 rounded-2xl' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : undefined }}>home</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Home</span>
        </button>
        <button
          onClick={() => handleTabChange('wallet')}
          className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
            activeTab === 'wallet' ? 'text-blue-700 bg-blue-100/50 rounded-2xl' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'wallet' ? "'FILL' 1" : undefined }}>account_balance_wallet</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Wallet</span>
        </button>
        
        {/* Only clinics can access the Add button */}
        {isClinicUser && (
          <button
            onClick={() => handleTabChange('add')}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === 'add' ? 'text-blue-700 bg-blue-100/50 rounded-2xl' : 'text-slate-400 hover:text-blue-600'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'add' ? "'FILL' 1" : undefined }}>add_circle</span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Add</span>
          </button>
        )}

        <button
          onClick={() => handleTabChange('calendar')}
          className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
            activeTab === 'calendar' ? 'text-blue-700 bg-blue-100/50 rounded-2xl' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'calendar' ? "'FILL' 1" : undefined }}>calendar_today</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Calendar</span>
        </button>
        {!CONTRACTID && (
          <button
            onClick={() => handleTabChange('publish')}
            className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === 'publish' ? 'text-blue-700 bg-blue-100/50 rounded-2xl' : 'text-slate-400 hover:text-blue-600'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'publish' ? "'FILL' 1" : undefined }}>publish</span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Admin</span>
          </button>
        )}
      </nav>

      {/* FAB - Only show on Home for clinics */}
      {activeTab === 'home' && isClinicUser && (
        <button 
          onClick={() => handleTabChange('add')}
          className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-transform z-40 md:bottom-28"
        >
          <span className="material-symbols-outlined scale-125">calendar_add_on</span>
        </button>
      )}
    </div>
  );
};

export default Dashboard;
