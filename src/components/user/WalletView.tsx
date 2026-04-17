import React from 'react';
import { useLanguage } from '../../LanguageContext';

const WalletView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      {/* Editorial Header Section */}
      <section className="mb-12 text-left">
        <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">
          {t.vaccinationWallet}
        </h2>
        <p className="text-on-surface-variant text-lg">
          {t.walletSubtitle}
        </p>
      </section>

      {/* Vaccine Bento Grid / Asymmetric List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
        {/* Highlight Card: Latest Vaccine */}
        <div className="md:col-span-12 lg:col-span-12 bg-primary-container p-8 rounded-xl flex flex-col justify-between text-on-primary-container relative overflow-hidden group mb-4">
          <div className="relative z-10">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 inline-block">
              {t.latestUpdate}
            </span>
            <h3 className="text-3xl font-bold mb-2">{t.covidBooster}</h3>
            <p className="opacity-90 mb-6">{t.bivalentDose}</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">event</span>
              <span>{t.lastUpdateDate}</span>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 bg-on-primary-container/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-green-300" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-bold">{t.completedStatus}</span>
            </div>
          </div>
          {/* Abstract Glass Detail */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* List of Previous Doses */}
        <div className="md:col-span-12 space-y-4">
          {/* Vaccine Item: Influenza */}
          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">vaccines</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-on-surface leading-tight">{t.vaccines.influenza}</h4>
                <p className="text-on-surface-variant text-sm">22 de Maio, 2023 • {t.categories.adult}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined">flight</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-on-surface leading-tight">{t.vaccines.yellowFever}</h4>
                <p className="text-on-surface-variant text-sm">10 de Janeiro, 2023 • {t.categories.travel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          {/* Vaccine Item: Hepatitis B */}
          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">medical_services</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-on-surface leading-tight">{t.vaccines.hepatitisB}</h4>
                <p className="text-on-surface-variant text-sm">15 de Setembro, 2022 • Dose 3 de 3</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">child_care</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-on-surface leading-tight">{t.vaccines.mmr}</h4>
                <p className="text-on-surface-variant text-sm">05 de Março, 2022 • {t.categories.infant}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-high transition-all duration-300 flex items-center justify-between group opacity-70 hover:opacity-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-on-surface leading-tight">{t.vaccines.td}</h4>
                <p className="text-on-surface-variant text-sm">12 de Novembro, 2021 • {t.categories.booster}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <button className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors text-slate-400">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WalletView;
