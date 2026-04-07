import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

interface PublishContractViewProps {
  onBack: () => void;
}

const PublishContractView: React.FC<PublishContractViewProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      setDeployed(true);
      setTimeout(() => setDeployed(false), 3000);
    }, 2000);
  };

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
          {t.publishContract}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
          {t.publishContractSubtitle}
        </p>
      </section>

      {/* Form Container with Tonal Depth */}
      <div className="space-y-16 text-left">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Decorative Subtle Background Gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          
          <form className="space-y-8 relative z-10" onSubmit={handleDeploy}>
            {/* General Settings */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
                {t.contractName}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">description</span>
                </div>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300 placeholder:text-outline" 
                  placeholder={t.contractNamePlaceholder}
                  type="text"
                  required
                />
              </div>
            </div>

            {/* Visual Aid Card */}
            <div className="bg-blue-50 p-5 rounded-lg border-none flex items-start gap-4 mt-12">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">gavel</span>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">{t.contractParamsTitle}</h4>
                <p className="text-xs text-blue-800/70 leading-relaxed mt-1">
                  {t.contractDesc}
                </p>
              </div>
            </div>

            {/* Primary Action */}
            <div className="pt-6 relative pb-20">
              <button 
                className={`w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 ${isDeploying ? 'opacity-80 cursor-wait' : ''}`}
                type="submit"
                disabled={isDeploying || deployed}
              >
                {isDeploying ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    <span>{t.deploying}</span>
                  </>
                ) : deployed ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{t.deploySuccess}</span>
                  </>
                ) : (
                  <>
                    <span>{t.deployContractButton}</span>
                    <span className="material-symbols-outlined">cloud_upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default PublishContractView;