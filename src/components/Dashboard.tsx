import React from 'react';
import { useLanguage } from '../LanguageContext';

interface DashboardProps {
  onLogout: () => void;
  walletAddress: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, walletAddress }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary/20">
                <img
                  alt="User profile photo"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC18Bi4VhaO_ifjE-xTn5LxEs5PGv1gprQHtZ7zQepNhxm1dMOG8Evppxki8MLKbucZpYeIsqiWME4CAjvnOCBpFiOIy3MxwSh0CRj3s5k7F-zcqgXbGQMp6X7mmqH3PdxURzsooPG27Rxh1H0IFxHhrRiGrQOhe6xUQ5BkfeHm6ani2h1ruMvVz2sWBDSMwsGhz9q6IoARZ22R4ua4l13SZzPT8FVrZYppQhwyDzkHuF62kg9Ovy6b-7qPyjr01bM_U80ui6dNpwH"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-slate-500">{t.loggedInAs}</span>
                <span className="text-sm font-bold text-on-surface">
                  Midnight {walletAddress ? `(...${walletAddress.slice(-6)})` : ''}
                </span>
              </div>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-200 mx-2"></div>
            <h1 className="hidden md:block text-xl font-bold text-blue-800 tracking-tight">Clinical Sanctuary</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-error hover:bg-error/10 transition-colors text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-blue-50/50 transition-colors rounded-full active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-screen-xl mx-auto space-y-12">
        {/* Welcome Section */}
        <section className="mt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl text-left">
              <p className="text-primary font-semibold tracking-wide uppercase text-xs mb-2">{t.welcomeBack}</p>
              <h2 className="text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
                {t.headline.split('\n').map((line, i) => (
                  <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
                ))}
              </h2>
              {walletAddress && (
                <p className="mt-4 text-[10px] font-mono text-on-surface-variant opacity-60 break-all">
                  Wallet: {walletAddress}
                </p>
              )}
            </div>
            <div className="hidden md:block">
              <div className="bg-surface-container-low rounded-xl px-6 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">{t.overallStatus}</p>
                  <p className="text-lg font-bold text-on-surface">{t.immunized}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlight Card: Next Vaccine */}
        <section>
          <div className="relative overflow-hidden bg-primary-container rounded-[2rem] p-8 md:p-12 text-on-primary-container shadow-2xl">
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">{t.nextDose}</span>
                <h3 className="text-4xl font-bold mt-4 mb-2">{t.nextVaccineName}</h3>
                <p className="text-blue-100 text-lg mb-8 opacity-90">{t.nextVaccineDesc}</p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95">
                    {t.scheduleNow}
                  </button>
                  <button className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-colors">
                    {t.viewDetails}
                  </button>
                </div>
              </div>
              <div className="hidden md:flex justify-end">
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border border-white/10 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full animate-pulse"></div>
                  <span className="material-symbols-outlined text-9xl text-white/40">vaccines</span>
                </div>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Bento Grid: Stats & Recent */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Immunization Progress */}
          <div className="bg-surface-container-low rounded-xl p-8 space-y-6 md:col-span-1 text-left">
            <h4 className="text-xl font-bold text-on-surface">{t.progress}</h4>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-on-surface-variant">{t.infantCycle}</span>
                  <span className="text-primary">{t.completed}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-on-surface-variant">{t.boosterDoses}</span>
                  <span className="text-on-surface">{t.outOf4}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[75%]"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-on-surface-variant">{t.internationalTravel}</span>
                  <span className="text-on-surface">{t.pending}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[40%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm md:col-span-2 text-left">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-bold text-on-surface">{t.recentHistory}</h4>
              <button className="text-primary font-semibold text-sm hover:underline">{t.viewAll}</button>
            </div>
            <div className="space-y-4">
              {t.activities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-colors group">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">{item.title}</p>
                    <p className="text-sm text-on-surface-variant">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-on-surface">{item.date}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">{t.validated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low rounded-xl p-8 flex items-start gap-6 text-left">
            <div className="bg-secondary-container p-4 rounded-full text-on-secondary-container">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <h5 className="text-lg font-bold text-on-secondary-container mb-1">{t.nearestClinic}</h5>
              <p className="text-on-secondary-container/80 text-sm mb-4">{t.nearestClinicDesc}</p>
              <button className="text-on-secondary-container font-bold text-sm underline underline-offset-4">{t.viewOnMap}</button>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-8 flex items-start gap-6 text-left">
            <div className="bg-surface-container-highest p-4 rounded-full text-on-surface">
              <span className="material-symbols-outlined">family_restroom</span>
            </div>
            <div>
              <h5 className="text-lg font-bold text-on-surface mb-1">{t.familyGroup}</h5>
              <p className="text-on-surface-variant text-sm mb-4">{t.familyGroupDesc}</p>
              <button className="text-primary font-bold text-sm underline underline-offset-4">{t.manageFamily}</button>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-slate-50/70 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
        <a className="flex flex-col items-center justify-center text-blue-700 bg-blue-100/50 rounded-2xl px-5 py-2 active:scale-90 duration-150 transition-all" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 px-5 py-2 hover:text-blue-600 active:scale-90 duration-150 transition-all" href="#">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Wallet</span>
        </a>
        <button className="flex flex-col items-center justify-center text-slate-400 px-5 py-2 hover:text-blue-600 active:scale-90 duration-150 transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Add</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-400 px-5 py-2 hover:text-blue-600 active:scale-90 duration-150 transition-all">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[11px] font-medium tracking-wide uppercase mt-1">Calendar</span>
        </button>
      </nav>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-transform z-40 md:bottom-8 md:right-8">
        <span className="material-symbols-outlined scale-125">calendar_add_on</span>
      </button>
    </div>
  );
};

export default Dashboard;
