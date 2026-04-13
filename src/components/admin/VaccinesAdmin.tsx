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

interface VaccinesAdminProps {
  connectedApi: ConnectedAPI;
}

const VaccinesAdmin: React.FC<VaccinesAdminProps> = ({ connectedApi }) => {
  const { t } = useLanguage();
  const [vaccines, setVaccines] = useState<string[]>([]);
  const [newVaccineName, setNewVaccineName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuers, setIssuers] = useState<DerivedIssuer[]>([]);
  const [issuerLoading, setIssuerLoading] = useState(false);
  const [issuerError, setIssuerError] = useState<string | null>(null);
  const [proofReqLoading, setProofReqLoading] = useState(false);
  const [proofReqError, setProofReqError] = useState<string | null>(null);
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
          setVaccines(state.vaccines);
          setIssuers(state.issuers);
          setProofReqs(state.vaccineProofReqs);
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
      setNewVaccineName("");
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

  const handleAddIssuer = async () => {
    if (!vaxApi) return;

    setIssuerLoading(true);
    setIssuerError(null);
    try {
      const issuerPk = getPublicKey(HARDCODED_ISSUER_SK);
      await vaxApi.addCertificateIssuer({
        uri: "https://issuer.vaxzk.example",
        name: "VaxZk Demo Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.vaxzk.example/verify",
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
      try {
        await vaxApi.addSelfAsClinic();
      } catch (clinicErr) {
        const msg = clinicErr instanceof Error ? clinicErr.message : String(clinicErr);
        if (msg.includes("already in the clinics list")) {
          console.log("Already registered as clinic, continuing.");
        } else {
          throw clinicErr;
        }
      }

      const enc = new TextEncoder();
      const vaccine = new Uint8Array(20);
      vaccine.set(enc.encode("HepB").slice(0, 20));
      const personalId = new Uint8Array(20);
      personalId.set(enc.encode("PASSPORT-001").slice(0, 20));
      // 1/1/2030 00:00:00 UTC
      const validUntil = 1893456000n;

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

  const handleRemoveVaccine = async (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    e.preventDefault();

    const vaccineName = e.currentTarget.dataset.name;

    if (!vaxApi || !vaccineName || !vaccineName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await vaxApi.delVaccine(vaccineName.trim());
      setNewVaccineName("");
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
          <span className="text-primary">{t.manage}</span>{" "}
          {t.vaccinesAdminTitleEnd}{" "}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          {t.vaccinesAdminSubtitle}
        </p>
      </section>

      {/* Add Vaccine Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <form
          onSubmit={handleAddVaccine}
          className="flex flex-col sm:flex-row gap-4"
        >
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
                  <span className="material-symbols-outlined animate-spin">
                    sync
                  </span>
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

      {/* Add Issuer */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">
          Certificate Issuers
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">
          Register the hard-coded demo issuer on-chain so patients can submit
          signed vaccine proofs.
        </p>
        <button
          className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          onClick={handleAddIssuer}
          disabled={issuerLoading || !vaxApi}
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
        {issuers.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase mb-2">
              Registered Issuers
            </p>
            {issuers.map((issuer) => {
              const idHex = toHex(issuer.id);
              return (
                <div
                  key={idHex}
                  className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg"
                >
                  <span className="material-symbols-outlined text-secondary text-base">
                    verified_user
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-on-surface">
                      {issuer.name}
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono truncate">
                      {idHex}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Vaccine Proof */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">
          Vaccine Proof Request
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">
          Request a HepB vaccine proof for passport{" "}
          <strong>PASSPORT-001</strong>, valid until 1 Jan 2030.
        </p>
        <button
          className="px-8 py-4 bg-tertiary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          onClick={handleRequestVaccineProof}
          disabled={proofReqLoading || !vaxApi}
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

      {/* Vaccines List */}
      <div className="space-y-4 text-left">
        <h3 className="text-2xl font-bold mb-6">{t.vaccinesList}</h3>
        {vaccines.length === 0 ? (
          <div className="bg-surface-container-low p-12 rounded-xl border border-dashed border-slate-200 text-center">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">
              vaccines
            </span>
            <p className="text-on-surface-variant italic">
              Nenhuma vacina cadastrada no contrato.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map((v, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-6 rounded-xl border border-slate-50 flex items-center gap-4 hover:bg-surface-container-high transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">vaccines</span>
                </div>
                <span className="font-bold text-lg text-on-surface">{v}</span>

                <a href="#" data-name={v} onClick={handleRemoveVaccine}>
                  <span className="material-symbols-outlined">delete</span>
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
