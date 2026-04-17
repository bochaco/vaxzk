import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import { VaxZkAPI, type DerivedClinic } from "../../contract-api/index";
import ClinicMap from './ClinicMap';

interface ListClinicsViewProps {
  vaxApi: VaxZkAPI;
}

const ListClinicsView: React.FC<ListClinicsViewProps> = ({ vaxApi }) => {
  const { t } = useLanguage();
  const [clinics, setClinics] = useState<DerivedClinic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

   useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    async function init() {
      try {
        console.log('init clinic list');
        subscription = vaxApi.state$.subscribe((state) => {
          console.log('clinics');
          setClinics(state.clinics);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
      }
    }

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const hasValidCoords = (latitud: string, longitud: string): boolean => {
    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  };

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto space-y-8">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl text-left">
            <p className="text-primary font-semibold tracking-wide uppercase text-xs mb-2">Healthcare Network</p>
            <h2 className="text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
              {t.listClinicsTitle || 'List of Clinics'}
            </h2>
            <p className="text-on-surface-variant mt-4 text-lg">
              {t.listClinicsSubtitle || 'Find authorized vaccination centers near you'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-surface-container-low rounded-xl px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">{t.registeredClinics || 'Registered Clinics'}</p>
                <p className="text-lg font-bold text-on-surface">{clinics.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder={t.searchClinics || 'Search clinics...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClinics.length > 0 ? (
          filteredClinics.map((clinic, index) => (
            <div
              key={index}
              className="bg-surface-container-low rounded-xl p-6 hover:bg-surface-container hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface truncate">{clinic.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {clinic.address}
                  </p>
                  {hasValidCoords(clinic.latitud, clinic.longitud) && (
                    <ClinicMap
                      latitud={clinic.latitud}
                      longitud={clinic.longitud}
                    />
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-container-high">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <span>{t.verifiedProvider || 'Verified Provider'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant mb-4">
              <span className="material-symbols-outlined text-4xl">search_off</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              {t.noClinicsFound || 'No clinics found'}
            </h3>
            <p className="text-on-surface-variant">
              {searchQuery
                ? (t.tryDifferentSearch || 'Try a different search term')
                : (t.noClinicsRegistered || 'No clinics have been registered yet')}
            </p>
          </div>
        )}
      </section>

      {filteredClinics.length > 0 && (
        <section className="bg-primary-container rounded-[2rem] p-8 md:p-12 text-on-primary-container">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">info</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">
                {t.needHelpFinding || 'Need help finding a clinic?'}
              </h3>
              <p className="opacity-90">
                {t.contactLocalHealth || 'Contact your local health authority for the most up-to-date information about vaccination centers.'}
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ListClinicsView;
