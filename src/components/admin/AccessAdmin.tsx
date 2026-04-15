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

  const handleAddInviteAdmin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoading(true);
    setError(null);
    try {
        const newLink = await vaxApi.inviteAdmin();
        console.log('running');
        console.log(newLink);
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

//        subscription = api.state$.subscribe((state) => {
//          setVaccines(state.vaccines);
//        });
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

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">

      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">{t.manage}</span> {t.accessAdminTitleEnd} </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">{t.accessAdminSubtitle}</p>
      </section>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">Adicionar um Admin</h3>
        <p className="text-on-surface-variant text-sm mb-4">Crie um link de convite para o usuario se tornar admin.</p>
        <form
          onSubmit={handleAddInviteAdmin}
          className="flex flex-col sm:flex-row gap-4"
        >
            <button 
              className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              type="submit"
              disabled={loading}
            >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                    <span>{t.loading}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">verified_user</span>
                    <span>Criar Convite</span>
                  </>
                )}
            </button>
          {error && <p className="text-error text-sm mt-3 px-1">{error}</p>}
        </form>
      </div>

    </main>
  );
};

export default AccessAdmin;