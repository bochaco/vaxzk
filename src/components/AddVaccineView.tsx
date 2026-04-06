import React from 'react';
import { useLanguage } from '../LanguageContext';

interface AddVaccineViewProps {
  onBack: () => void;
}

const AddVaccineView: React.FC<AddVaccineViewProps> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <main className="pt-24 px-6 max-w-screen-md mx-auto">
      {/* Page Title & Editorial Intro */}
      <section className="mb-12 text-left">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-50/50 transition-colors active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined text-blue-700">arrow_back</span>
          </button>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          {t.registerVaccine}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
          {t.addVaccineSubtitle}
        </p>
      </section>

      {/* Form Container with Tonal Depth */}
      <div className="space-y-16 text-left">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Decorative Subtle Background Gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          
          <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
            {/* Vaccine Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
                {t.vaccineName}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">search</span>
                </div>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300 placeholder:text-outline" 
                  placeholder={t.vaccinePlaceholder}
                  type="text"
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-2 px-1">
                <span className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-on-surface-variant hover:bg-blue-100 cursor-pointer transition-colors">Gripe Sazonal</span>
                <span className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-on-surface-variant hover:bg-blue-100 cursor-pointer transition-colors">Reforço COVID</span>
                <span className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-on-surface-variant hover:bg-blue-100 cursor-pointer transition-colors">Tétano</span>
              </div>
            </div>

            {/* Date and Batch Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
                  {t.doseDate}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">calendar_month</span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300" 
                    type="date"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
                  {t.lotNumber} <span className="text-outline font-normal lowercase">({t.optional})</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">barcode_scanner</span>
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300" 
                    placeholder="Ex: ABC12345" 
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Application Location */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
                {t.applicationLocation}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                </div>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300" 
                  placeholder={t.locationPlaceholder}
                  type="text"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant italic px-1">
                {t.locationTip}
              </p>
            </div>

            {/* Visual Aid Card */}
            <div className="bg-blue-50 p-5 rounded-lg border-none flex items-start gap-4 mt-12">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">verified_user</span>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">{t.secureRegistry}</h4>
                <p className="text-xs text-blue-800/70 leading-relaxed">
                  {t.secureRegistryDesc}
                </p>
              </div>
            </div>

            {/* Primary Action */}
            <div className="pt-6">
              <button 
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2" 
                type="submit"
              >
                <span>{t.saveRegistry}</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </div>
          </form>
        </div>

        {/* Secondary Guidance Section (Asymmetric) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-orange-600 mb-3">info</span>
            <h3 className="font-bold text-on-surface mb-2">{t.forgotDate}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t.forgotDateDesc}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-primary mb-3">notifications_active</span>
            <h3 className="font-bold text-on-surface mb-2">{t.boosterReminder}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t.boosterReminderDesc}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddVaccineView;
