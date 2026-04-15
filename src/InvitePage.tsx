import React from 'react';
import { useParams } from "react-router-dom";
/*
import {
  Contract,
  ledger,
} from "./managed/meu-contrato/contract/index.js";
import {
  createConstructorContext,
  QueryContext,
  CostModel,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";
import { witnesses, createInvitePrivateState } from "./witnesses.js";
*/

const InvitePage: React.FC = () => {
  const { uuid } = useParams();
  if (uuid == "") {
    return "code is necessary"
  }

/*
  // Chamar o circuito useInvite passando secret e nonce como parâmetros
  const { context: contextAfterUse } = contract.impureCircuits.useInvite(
    circuitContext,
    secretKey,
    nonce
  );
  circuitContext = contextAfterUse;

  // Ler o estado do ledger após o uso
  const currentLedger = ledger(circuitContext.currentQueryContext.state);
  console.log("Convite usado com sucesso:", currentLedger);

  // Definir TTL de 48 horas para a transação
  const ttl = new Date(registeredAt + TTL_MS);

  // Balancear e submeter a transação com o TTL
  const finalizedTx = await walletProvider.balanceTx(
    unboundTx,
    ttl
  );

  await walletProvider.submitTx(finalizedTx);
  } else {
    console.error("Convite expirado. Não é possível usar após 48 horas.");
  }
*/
  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">

      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">Under Construction </span> <br/>
          Código: {uuid}</h2>
      </section>
    </main>
  );
  
};

export { InvitePage };