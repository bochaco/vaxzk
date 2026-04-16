import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "../../LanguageContext";
import {
  buildProviders,
  VaxZkAPI,
  type DerivedIssuer,
  type DerivedProofRequest,
} from "../../contract-api/index";
import { networkId, getContractId } from "../ConfigNetwork";
import { getPublicKey } from "../../contract-api/signing";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";

const HARDCODED_ISSUER_SK =
  1234567890123456789012345678901234567890123456789012345678901234n;

interface AddVaccineViewProps {
  connectedApi: ConnectedAPI;
}

const AddVaccineView: React.FC<AddVaccineViewProps> = ({ connectedApi }) => {
  const { t } = useLanguage();
  const [issuers, setIssuers] = useState<DerivedIssuer[]>([]);
  const [issuersListLoading, setIssuersListLoading] = useState(true);
  const [issuerLoading, setIssuerLoading] = useState(false);
  const [issuerError, setIssuerError] = useState<string | null>(null);
  const [issuerName, setIssuerName] = useState("");
  const [issuerUri, setIssuerUri] = useState("");
  const [issuerVerificationEndpoint, setIssuerVerificationEndpoint] = useState("");
  const [issuerKey, setIssuerKey] = useState(""); // collected but not yet used
  const [vaccines, setVaccines] = useState<string[]>([]);
  const [proofReqLoading, setProofReqLoading] = useState(false);
  const [proofReqError, setProofReqError] = useState<string | null>(null);
  const [proofVaccine, setProofVaccine] = useState("");
  const [proofPersonalId, setProofPersonalId] = useState("");
  const [proofValidUntil, setProofValidUntil] = useState("");
  const [proofReqs, setProofReqs] = useState<DerivedProofRequest[]>([]);
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
        // Using placeholder secret key as in Dashboard.tsx
        const secretKey = new Uint8Array(32);
        const api = await VaxZkAPI.join(
          providers,
          contractId as unknown as ContractAddress,
          secretKey,
        );
        setVaxApi(api);

        subscription = api.state$.subscribe((state) => {
          setIssuers(state.issuers);
          setVaccines(state.vaccines);
          setProofReqs(state.vaccineProofReqs);
          setIssuersListLoading(false);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
        setIssuerError("Erro ao conectar ao contrato");
      }
    }

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectedApi]);

  const handleAddIssuer = async () => {
    if (!vaxApi) return;

    setIssuerLoading(true);
    setIssuerError(null);
    try {
      const issuerPk = getPublicKey(HARDCODED_ISSUER_SK);
      await vaxApi.addCertificateIssuer({
        uri: issuerUri,
        name: issuerName,
        key: issuerPk,
        verificationEndpoint: issuerVerificationEndpoint,
      });
    } catch (err) {
      console.error("Failed to add issuer:", err);
      if (err instanceof Error) {
        setIssuerError("Erro ao adicionar emissor: " + err.message);
      } else {
        setIssuerError("Erro ao adicionar emissor: " + String(err));
      }
    } finally {
      setIssuerLoading(false);
    }
  };

  const handleRequestVaccineProof = async () => {
    if (!vaxApi) return;

    setProofReqLoading(true);
    setProofReqError(null);
    try {
//      try {
//        await vaxApi.addSelfAsClinic();
//      } catch (clinicErr) {
//        const msg = clinicErr instanceof Error ? clinicErr.message : String(clinicErr);
//        if (msg.includes("already in the clinics list")) {
//          console.log("Already registered as clinic, continuing.");
//        } else {
//          throw clinicErr;
//       }
//      }

      const enc = new TextEncoder();
      const vaccine = new Uint8Array(20);
      vaccine.set(enc.encode(proofVaccine).slice(0, 20));
      const personalId = new Uint8Array(20);
      personalId.set(enc.encode(proofPersonalId).slice(0, 20));
      // Use Date.UTC to guarantee UTC parsing regardless of browser locale,
      // then divide in bigint arithmetic to avoid any floating-point coercion.
      const [y, m, d] = proofValidUntil.split("-").map(Number);
      const validUntil = BigInt(Date.UTC(y, m - 1, d)) / 1000n;

      await vaxApi.requestVaccineProof({ vaccine, personalId, validUntil });
    } catch (err) {
      console.error("Failed to request vaccine proof:", err);
      if (err instanceof Error) {
        setProofReqError("Erro ao solicitar prova de vacina: " + err.message);
      } else {
        setProofReqError("Erro ao solicitar prova de vacina: " + String(err));
      }
    } finally {
      setProofReqLoading(false);
    }
  };

  const handleSubmitVaccineProof = async (req: DerivedProofRequest) => {
    if (!vaxApi) return;

    const issuer = issuers[0];
    if (!issuer) {
      setSubmitProofError("No registered issuer found. Please add an issuer first.");
      return;
    }

    const reqIdHex = toHex(req.id);
    setSubmitingProofId(reqIdHex);
    setSubmitProofError(null);
    try {
      await vaxApi.submitVaccineProof(req.id, issuer.id, req.vaccine, req.personalId);
    } catch (err) {
      console.error("Failed to submit vaccine proof:", err);
      if (err instanceof Error) {
        setSubmitProofError("Erro ao submeter prova: " + err.message);
      } else {
        setSubmitProofError("Erro ao submeter prova: " + String(err));
      }
    } finally {
      setSubmitingProofId(null);
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">{t.manage}</span>{" "}
          {t.vaccinesAdminTitleEnd}{" "}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          {t.vaccinesAdminSubtitle}
        </p>
      </section>

      {/* Add Issuer */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">
          Vaccination Certificate Issuers
        </h3>

        {/* Info notice */}
        <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <span className="material-symbols-outlined text-blue-500 text-xl flex-shrink-0">
            info
          </span>
          <p className="text-blue-800 text-sm leading-relaxed">
            To register a certificate issuer, contact the vaccine certificate
            provider/issuer to obtain their details (name, service URI,
            verification endpoint, and public key).
          </p>
        </div>

        {/* Issuer form fields */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Issuer Name
            </label>
            <input
              type="text"
              value={issuerName}
              onChange={(e) => setIssuerName(e.target.value)}
              placeholder="e.g. National Health Authority"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Issuer URI
            </label>
            <input
              type="text"
              value={issuerUri}
              onChange={(e) => setIssuerUri(e.target.value)}
              placeholder="e.g. https://issuer.example.com"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Verification Endpoint
            </label>
            <p className="text-xs text-on-surface-variant mb-1">
              URL used by administrative agents or personnel to verify the authenticity of a vaccination certificate.
            </p>
            <input
              type="text"
              value={issuerVerificationEndpoint}
              onChange={(e) => setIssuerVerificationEndpoint(e.target.value)}
              placeholder="e.g. https://issuer.example.com/verify"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Public Key
            </label>
            <input
              type="text"
              value={issuerKey}
              onChange={(e) => setIssuerKey(e.target.value)}
              placeholder="Public key provided by the issuer"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        <button
          className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          onClick={handleAddIssuer}
          disabled={issuerLoading || !vaxApi || !issuerName || !issuerUri || !issuerVerificationEndpoint}
        >
          {issuerLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin">
                sync
              </span>
              <span>Adding Issuer...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">verified_user</span>
              <span>Add Issuer</span>
            </>
          )}
        </button>
        {issuerError && (
          <p className="text-error text-sm mt-3 px-1">{issuerError}</p>
        )}
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase mb-2">
            Registered Issuers
          </p>
          {issuersListLoading ? (
            <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
              <span>Loading issuers...</span>
            </div>
          ) : issuers.length > 0 && (
          <div className="space-y-2">
            {issuers.map((issuer) => {
              const idHex = toHex(issuer.id);
              return (
                <div
                  key={idHex}
                  className="p-4 bg-surface-container-low rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">
                      verified_user
                    </span>
                    <p className="font-semibold text-sm text-on-surface">
                      {issuer.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-1">
                    <div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Signature Public Key: </span>
                      <span className="text-xs text-on-surface-variant font-mono break-all">{idHex}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">URI: </span>
                      <span className="text-xs text-on-surface-variant break-all">{issuer.uri}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Verification Endpoint: </span>
                      <span className="text-xs text-on-surface-variant break-all">{issuer.verificationEndpoint}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Request Vaccine Proof */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">
          Vaccine Proof Request
        </h3>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Vaccine
            </label>
            {issuersListLoading ? (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
                <span className="material-symbols-outlined animate-spin text-base">sync</span>
                <span>Loading vaccines...</span>
              </div>
            ) : (
              <select
                value={proofVaccine}
                onChange={(e) => setProofVaccine(e.target.value)}
                disabled={vaccines.length === 0}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tertiary bg-white disabled:opacity-50"
              >
                <option value="">{vaccines.length === 0 ? "No vaccines registered" : "Select a vaccine..."}</option>
                {vaccines.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Patient ID
            </label>
            <input
              type="text"
              value={proofPersonalId}
              onChange={(e) => setProofPersonalId(e.target.value.slice(0, 20))}
              placeholder="e.g. PASSPORT-001"
              maxLength={20}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Valid Until
            </label>
            <input
              type="date"
              value={proofValidUntil}
              onChange={(e) => setProofValidUntil(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>
        </div>

        <button
          className="px-8 py-4 bg-tertiary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          onClick={handleRequestVaccineProof}
          disabled={proofReqLoading || !vaxApi || !proofVaccine || !proofPersonalId || !proofValidUntil}
        >
          {proofReqLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin">
                sync
              </span>
              <span>Requesting...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">assignment</span>
              <span>Request Vaccine Proof</span>
            </>
          )}
        </button>
        {proofReqError && (
          <p className="text-error text-sm mt-3 px-1">{proofReqError}</p>
        )}
      </div>

      {/* Proof Requests List */}
      <div className="space-y-4 text-left mb-12">
        <h3 className="text-2xl font-bold mb-6">Vaccine Proof Requests</h3>
        {submitProofError && (
          <p className="text-error text-sm mb-3 px-1">{submitProofError}</p>
        )}
        {proofReqs.length === 0 ? (
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
                        {" "}
                        · {personalIdStr}
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
                      <span className="material-symbols-outlined text-base">
                        task_alt
                      </span>
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
                          <span className="material-symbols-outlined animate-spin text-base">
                            sync
                          </span>
                          <span>Submitting…</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">
                            verified
                          </span>
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
      </div>

    </main>
  );
};

export default AddVaccineView;
