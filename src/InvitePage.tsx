import React from 'react';
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get("key") ?? "";
  if (secretKey == "") {
    return "code is necessary"
  }
  const nonce = searchParams.get("code") ?? "";
  if (nonce == "") {
    return "code is necessary"
  }

/*
  // Timestamp de quando o convite foi registrado (salvo no momento do registerInvite)
  const registeredAt: number; // Date.now() salvo no momento do registro
  // TTL de 48 horas em milissegundos
  const TTL_MS = 48 * 60 * 60 * 1000;
  // Verificar se o convite ainda é válido
  const now = Date.now();
  const isValid = now < registeredAt + TTL_MS;
  if (isValid) {
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
          Código: {secretKey} {nonce}</h2>
      </section>
    </main>
  );
  
};

export { InvitePage };