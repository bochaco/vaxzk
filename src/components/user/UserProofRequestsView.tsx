import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  buildProviders,
  VaxZkAPI,
  type DerivedIssuer,
  type DerivedProofRequest,
} from "../../contract-api/index";
import { networkId, getContractId } from "../ConfigNetwork";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";

interface UserProofRequestsViewProps {
  connectedApi: ConnectedAPI;
}

const UserProofRequestsView: React.FC<UserProofRequestsViewProps> = ({
  connectedApi,
}) => {
  const [issuers, setIssuers] = useState<DerivedIssuer[]>([]);
  const [proofReqs, setProofReqs] = useState<DerivedProofRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitingProofId, setSubmitingProofId] = useState<string | null>(null);
  const [submitProofError, setSubmitProofError] = useState<string | null>(null);
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    async function init() {
      const contractId = getContractId();
      if (!connectedApi || !contractId) return;
      try {
        const providers = await buildProviders(connectedApi, networkId);
        const secretKey = new Uint8Array(32);
        const api = await VaxZkAPI.join(
          providers,
          contractId as unknown as ContractAddress,
          secretKey,
        );
        setVaxApi(api);

        subscription = api.state$.subscribe((state) => {
          setIssuers(state.issuers);
          setProofReqs(state.vaccineProofReqs);
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
        setLoading(false);
      }
    }

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectedApi]);

  const handleSubmitVaccineProof = async (req: DerivedProofRequest) => {
    if (!vaxApi) return;

    const issuer = issuers[0];
    if (!issuer) {
      setSubmitProofError("No registered issuer found.");
      return;
    }

    const reqIdHex = toHex(req.id);
    setSubmitingProofId(reqIdHex);
    setSubmitProofError(null);
    try {
      await vaxApi.submitVaccineProof(
        req.id,
        issuer.id,
        req.vaccine,
        req.personalId,
      );
    } catch (err) {
      console.error("Failed to submit vaccine proof:", err);
      setSubmitProofError(
        err instanceof Error ? "Failed to submit proof: " + err.message : String(err),
      );
    } finally {
      setSubmitingProofId(null);
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">My</span> Vaccine Proofs
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          View and submit your vaccine proof requests.
        </p>
      </section>

      {submitProofError && (
        <p className="text-error text-sm mb-6 px-1">{submitProofError}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-on-surface-variant text-sm py-8">
          <span className="material-symbols-outlined animate-spin text-base">sync</span>
          <span>Loading proof requests...</span>
        </div>
      ) : proofReqs.length === 0 ? (
        <div className="bg-surface-container-low p-12 rounded-xl border border-dashed border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">
            assignment
          </span>
          <p className="text-on-surface-variant italic">
            No proof requests on-chain yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proofReqs.map((req) => {
            const reqIdHex = toHex(req.id);
            const vaccineName = new TextDecoder()
              .decode(req.vaccine)
              .replace(/\0/g, "")
              .trim();
            const personalIdStr = new TextDecoder()
              .decode(req.personalId)
              .replace(/\0/g, "")
              .trim();
            const isSubmitting = submitingProofId === reqIdHex;
            const issuer = issuers[0];
            const issuerLabel = issuer
              ? `${issuer.name} (${toHex(issuer.id).slice(0, 16)}…)`
              : "No issuer registered";
            return (
              <div
                key={reqIdHex}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-row items-center gap-6"
              >
                <div className="flex-shrink-0 p-2 bg-white border border-slate-100 rounded-lg">
                  <QRCodeSVG value={reqIdHex} size={96} />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-on-surface">
                      <span className="text-primary">{vaccineName}</span>
                      <span className="text-on-surface-variant font-normal">
                        {" "}· {personalIdStr}
                      </span>
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono">
                      Req ID: {reqIdHex.slice(0, 16)}…
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Issuer:{" "}
                      <span className="font-semibold text-secondary">
                        {issuerLabel}
                      </span>
                    </p>
                  </div>
                  {req.submitted ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                      <span className="material-symbols-outlined text-base">task_alt</span>
                      <span>Submitted</span>
                    </div>
                  ) : (
                    <button
                      className="px-6 py-3 bg-primary font-bold rounded-lg shadow active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
                      onClick={() => handleSubmitVaccineProof(req)}
                      disabled={isSubmitting || !vaxApi || !issuer}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-base">sync</span>
                          <span>Submitting…</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">verified</span>
                          <span>Submit Proof</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default UserProofRequestsView;
