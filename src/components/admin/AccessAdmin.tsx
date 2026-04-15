import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../LanguageContext';
import { buildProviders, VaxZkAPI } from "../../contract-api/index";
import { networkId, getContractId } from "../ConfigNetwork";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";

interface AccessAdminProps {
  connectedApi: ConnectedAPI;
}

const AccessAdmin: React.FC<AccessAdminProps> = ({ connectedApi }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    
    async function init() {
      const contractId = getContractId();
      if (!connectedApi || !contractId) return;
      try {
        const providers = await buildProviders(connectedApi, networkId);
        // Using placeholder secret key as in Dashboard.tsx
        const secretKey = new Uint8Array(32);
        const api = await VaxZkAPI.join(
          providers,
          contractId as unknown as ContractAddress,
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

  const handleAddVaccine = async (e: React.FormEvent) => {
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
      setError("Erro ao adicionar vacina");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">

      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">{t.manage}</span> {t.accessAdminTitleEnd} </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">{t.accessAdminSubtitle}</p>
      </section>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">Certificate Issuers</h3>
        <p className="text-on-surface-variant text-sm mb-4">Register the hard-coded demo issuer on-chain so patients can submit signed vaccine proofs.</p>
        <button className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2">
        <span className="material-symbols-outlined">verified_user</span>
        <span>Add Issuer</span>
        </button>
        <p className="text-error text-sm mt-3 px-1">Erro ao conectar ao contrato</p>
      </div>

    </main>
  );
};

export default AccessAdmin;