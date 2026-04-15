import React from 'react';
import { useLanguage } from '../../LanguageContext';

interface HomeViewProps {
  walletAddress: string | null;
}

const HomeView: React.FC<HomeViewProps> = () => {
  const { t } = useLanguage();

  return (
    <main className="pt-24 px-6 max-w-screen-xl mx-auto space-y-12">
      {/* Welcome Section */}
      <section className="mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl text-left">
            <p className="text-primary font-semibold tracking-wide uppercase text-xs mb-2">{t.welcomeBack}</p>
            <h2 className="text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
              {t.headline.split('\n').map((line: string, i: number) => (
                <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
              ))}
            </h2>
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
            {t.activities.map((item: any, idx: number) => (
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
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
  );
};

export default HomeView;
