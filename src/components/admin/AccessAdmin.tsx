import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../LanguageContext';
import { buildProviders, VaxZkAPI } from "../../contract-api/index";
import { urlApp, networkId, getContractId } from "../ConfigNetwork";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import {v4 as uuidv4} from 'uuid';

interface AccessAdminProps {
  connectedApi: ConnectedAPI;
}

const AccessAdmin: React.FC<AccessAdminProps> = ({ connectedApi }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);
  const [linkAddress, setLinkAddress] = useState<string | null>(null);

  const handleAddInviteAdmin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoading(true);
    setError(null);
    setLinkAddress("");
    try {
      let myuuid = uuidv4();
      console.log('Your UUID is: ' + myuuid);
      const newLink = await vaxApi.registerInvite(myuuid);
      console.log('newLink: ' + newLink);
      setLinkAddress(urlApp + "/invite?link=" + myuuid);
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
        <h3 className="text-lg font-semibold text-on-surface mb-4">{t.accessAddAdminTitle}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{t.accessAddAdminDesc}</p>
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
                    <span>{t.accessAddAdminLink}</span>
                  </>
                )}
            </button>
          {error && <p className="text-error text-sm mt-3 px-1">{error}</p>}
          {linkAddress && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Contract deployed &amp; saved!</span>
                </div>
                <p className="text-xs text-green-800/70">
                  This address is stored in your browser. All views will use it
                  automatically on the next page load.
                </p>
                <div className="flex items-center gap-2 bg-white border border-green-100 rounded-lg px-4 py-3">
                  <span className="material-symbols-outlined text-green-600 text-base shrink-0">link</span>
                  <code className="text-xs font-mono text-green-900 break-all select-all flex-1">
                    {linkAddress}
                  </code>
                  <button
                    type="button"
                    title="Copy address"
                    className="shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                    onClick={() => navigator.clipboard.writeText(linkAddress)}
                  >
                    <span className="material-symbols-outlined text-green-600 text-base">content_copy</span>
                  </button>
                </div>
              </div>
            )}
        </form>
      </div>

    </main>
  );
};

export default AccessAdmin;