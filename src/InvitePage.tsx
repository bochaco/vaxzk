import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { buildProviders, VaxZkAPI } from "./contract-api/index";
import { networkId, getContractId } from "./components/ConfigNetwork";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";

interface InvitePageProps {
  connectedApi: ConnectedAPI;
}

const InvitePage: React.FC<InvitePageProps> = ({ connectedApi }) => {
  const { uuid } = useParams();
  if (!uuid) {
    return "code is necessary"
  }
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
      } catch (err) {
        console.error("Failed to join contract:", err);
      }
    }
    
    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectedApi]);

  const handleAceptInvite = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('a');
    console.log(uuid);

    if (!vaxApi) return;

    try {
      await vaxApi.acceptInviteAdmin(uuid.trim());
    } catch (err) {
      console.error("Failed to add vaccine:", err);
//    } finally {
//      setLoading(false);
    }
  };

  return (
  <main className="pt-12 px-6 max-w-screen-md mx-auto">
    <section className="mb-7">
      <h2
        className="text-4xl font-extrabold tracking-tight text-on-surface mb-2"
        style={{}}
      >
        Adicionar como Admin
      </h2>
    </section>
    <div className="space-y-16">
      <div className="bg-surface-container-low p-8 rounded-xl shadow-sm border-none relative overflow-hidden">
        <form 
        onSubmit={handleAceptInvite}
        className="space-y-8 relative z-10">
          <div className="bg-secondary-container/20 p-5 rounded-lg border-none flex items-start gap-4 mt-12"
          style={{"background": "rgb(161 190 253 / 0.2)"}}>
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-container">
                verified_user
              </span>
            </div>
            <div>
              <h4 className="font-bold text-on-secondary-container text-sm">
                Registro Seguro
              </h4>
              <p className="text-xs text-on-secondary-container/80 leading-relaxed">
                Suas informações de saúde são criptografadas e utilizadas apenas
                para o seu controle pessoal de imunização.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <button
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: "#0070eb" }}
              type="submit"
            >
              <span className="">
                Salvar Registro
              </span>
              <span className="material-symbols-outlined">
                check_circle
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
  );
  
};

export { InvitePage };