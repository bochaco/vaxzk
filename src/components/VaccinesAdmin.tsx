import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { buildProviders, VaxZkAPI } from "../contract-api/index";
import { networkId, CONTRACTID } from "./ConfigNetwork";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";

interface VaccinesAdminProps {
  connectedApi: ConnectedAPI;
}

const VaccinesAdmin: React.FC<VaccinesAdminProps> = ({ connectedApi }) => {
  const { t } = useLanguage();
  const [vaccines, setVaccines] = useState<string[]>([]);
  const [newVaccineName, setNewVaccineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    
    async function init() {
      if (!connectedApi || !CONTRACTID) return;
      try {
        const providers = await buildProviders(connectedApi, networkId);
        // Using placeholder secret key as in Dashboard.tsx
        const secretKey = new Uint8Array(32);
        const api = await VaxZkAPI.join(
          providers,
          CONTRACTID as unknown as ContractAddress,
          secretKey,
        );
        setVaxApi(api);

        subscription = api.state$.subscribe((state) => {
          setVaccines(state.vaccines);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
        setError("Erro ao conectar ao contrato");
      }
    }
    
    init();
    
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectedApi]);

  const handleAddVaccine = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi || !newVaccineName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await vaxApi.addVaccine(newVaccineName.trim());
      setNewVaccineName('');
      // The list should update automatically via subscription
    } catch (err) {
      console.error("Failed to add vaccine:", err);
      if (err instanceof Error) {
        setError("Erro ao adicionar vacina: " + err.message);
      } else {
        setError("Erro ao adicionar vacina: " + String(err));
      }
//    setError("Erro ao adicionar vacina");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVaccine = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const vaccineName = e.currentTarget.dataset.name;
    
    if (!vaxApi || !vaccineName || !vaccineName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await vaxApi.delVaccine(vaccineName.trim());
      setNewVaccineName('');
    } catch (err) {
      console.error("Failed to add vaccine:", err);
      if (err instanceof Error) {
        setError("Erro ao adicionar vacina: " + err.message);
      } else {
        setError("Erro ao adicionar vacina: " + String(err));
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">

      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">{t.manage}</span> {t.vaccinesAdminTitleEnd} </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">{t.vaccinesAdminSubtitle}</p>
      </section>

      {/* Add Vaccine Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <form onSubmit={handleAddVaccine} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
              {t.vaccineName}
            </label>
            <input 
              className="w-full px-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300" 
              placeholder={t.vaccinePlaceholder}
              value={newVaccineName}
              onChange={(e) => setNewVaccineName(e.target.value)}
              disabled={loading}
              type="text"
            />
          </div>
          <div className="flex items-end">
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-primary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading || !newVaccineName.trim()}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">add</span>
                  <span>{t.add}</span>
                </>
              )}
            </button>
          </div>
        </form>
        {error && <p className="text-error text-sm mt-3 px-1">{error}</p>}
      </div>

      {/* Vaccines List */}
      <div className="space-y-4 text-left">
        <h3 className="text-2xl font-bold mb-6">{t.vaccinesList}</h3>
        {vaccines.length === 0 ? (
          <div className="bg-surface-container-low p-12 rounded-xl border border-dashed border-slate-200 text-center">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">vaccines</span>
            <p className="text-on-surface-variant italic">Nenhuma vacina cadastrada no contrato.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map((v, i) => (
              <div key={i} className="bg-surface-container-low p-6 rounded-xl border border-slate-50 flex items-center gap-4 hover:bg-surface-container-high transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">vaccines</span>
                </div>
                <span className="font-bold text-lg text-on-surface">{v}</span>

                <a href="#" data-name={v} onClick={handleRemoveVaccine}>
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin">trash</span></>
                  ) : (
                    <><span className="material-symbols-outlined">trash</span></>
                  )}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default VaccinesAdmin;