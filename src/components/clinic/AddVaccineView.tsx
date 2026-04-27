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
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";

interface AddVaccineViewProps {
  connectedApi: ConnectedAPI;
  triggerModal?: "proofReq" | null;
  onModalTriggered?: () => void;
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            close
          </span>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const AddVaccineView: React.FC<AddVaccineViewProps> = ({
  connectedApi,
  triggerModal,
  onModalTriggered,
}) => {
  const { i18n } = useLanguage();
  const [issuers, setIssuers] = useState<DerivedIssuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaccines, setVaccines] = useState<string[]>([]);
  const [proofReqLoading, setProofReqLoading] = useState(false);
  const [proofReqError, setProofReqError] = useState<string | null>(null);
  const [proofVaccine, setProofVaccine] = useState("");
  const [proofPersonalId, setProofPersonalId] = useState("");
  const [proofValidUntil, setProofValidUntil] = useState("");
  const [proofReqs, setProofReqs] = useState<DerivedProofRequest[]>([]);
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);
  const [showProofReqModal, setShowProofReqModal] = useState(false);

  useEffect(() => {
    if (triggerModal === "proofReq") {
      setProofReqError(null);
      setShowProofReqModal(true);
      onModalTriggered?.();
    }
  }, [triggerModal]);

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
          setVaccines(state.vaccines);
          setProofReqs(state.vaccineProofReqs);
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
        setProofReqError(i18n.errConnectContract);
      }
    }

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectedApi]);

  const handleRequestVaccineProof = async () => {
    if (!vaxApi) return;

    setProofReqLoading(true);
    setProofReqError(null);
    try {
      const enc = new TextEncoder();
      const vaccine = new Uint8Array(20);
      vaccine.set(enc.encode(proofVaccine).slice(0, 20));
      const personalId = new Uint8Array(20);
      personalId.set(enc.encode(proofPersonalId).slice(0, 20));
      const [y, m, d] = proofValidUntil.split("-").map(Number);
      const validUntil = BigInt(Date.UTC(y, m - 1, d)) / 1000n;

      await vaxApi.requestVaccineProof({ vaccine, personalId, validUntil });
      setProofVaccine("");
      setProofPersonalId("");
      setProofValidUntil("");
      setShowProofReqModal(false);
    } catch (err) {
      console.error("Failed to request vaccine proof:", err);
      setProofReqError(
        i18n.errRequestVaccineProof +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setProofReqLoading(false);
    }
  };

  return (
    <>
      <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
        <section className="mb-12 text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
            <span className="text-primary">{i18n.manage}</span>{" "}
            {i18n.vaccinesAdminTitleEnd}{" "}
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {i18n.vaccinesAdminSubtitle}
          </p>
        </section>

        {/* Vaccine Proof Requests list */}
        <div className="space-y-4 text-left mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{i18n.vaccineProofRequests}</h3>
            <button
              onClick={() => { setProofReqError(null); setShowProofReqModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-tertiary text-on-tertiary font-semibold rounded-full shadow active:scale-95 transition-all duration-200 text-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              {i18n.newRequest}
            </button>
          </div>
          {loading ? (
            <div className="flex items-center gap-3 text-on-surface-variant text-sm py-12 justify-center">
              <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
              <span>{i18n.loadingProofRequests}</span>
            </div>
          ) : proofReqs.length === 0 ? (
            <div className="bg-surface-container-low p-12 rounded-xl border border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">
                assignment
              </span>
              <p className="text-on-surface-variant italic">
                {i18n.noProofRequestsYet}
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
                const issuer = issuers[0];
                const issuerLabel = issuer
                  ? `${issuer.name} (${toHex(issuer.id).slice(0, 16)}…)`
                  : i18n.noIssuerRegistered;
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
                          {i18n.reqIdLabel} {reqIdHex.slice(0, 16)}…
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {i18n.issuerLabel}{" "}
                          <span className="font-semibold text-secondary">
                            {issuerLabel}
                          </span>
                        </p>
                      </div>
                      {req.submitted ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                          <span className="material-symbols-outlined text-base">task_alt</span>
                          <span>{i18n.submitted}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-semibold">
                          <span className="material-symbols-outlined text-base">pending</span>
                          <span>{i18n.pending}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* New Vaccine Proof Request modal */}
      {showProofReqModal && (
        <Modal
          title={i18n.newVaccineProofRequest}
          onClose={() => setShowProofReqModal(false)}
        >
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                {i18n.vaccineLabel}
              </label>
              {loading ? (
                <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
                  <span className="material-symbols-outlined animate-spin text-base">
                    sync
                  </span>
                  <span>{i18n.loadingVaccines}</span>
                </div>
              ) : (
                <select
                  value={proofVaccine}
                  onChange={(e) => setProofVaccine(e.target.value)}
                  disabled={vaccines.length === 0}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tertiary bg-white disabled:opacity-50"
                >
                  <option value="">
                    {vaccines.length === 0
                      ? i18n.noVaccinesRegistered
                      : i18n.selectVaccine}
                  </option>
                  {vaccines.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                {i18n.patientId}
              </label>
              <input
                type="text"
                value={proofPersonalId}
                onChange={(e) =>
                  setProofPersonalId(e.target.value.slice(0, 20))
                }
                placeholder={i18n.patientIdPlaceholder}
                maxLength={20}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                {i18n.validUntilLabel}
              </label>
              <input
                type="date"
                value={proofValidUntil}
                onChange={(e) => setProofValidUntil(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tertiary"
              />
            </div>
          </div>

          {proofReqError && (
            <p className="text-error text-sm mb-4 px-1">{proofReqError}</p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-on-surface-variant text-sm font-semibold hover:bg-slate-50 transition-colors"
              onClick={() => setShowProofReqModal(false)}
              disabled={proofReqLoading}
            >
              {i18n.cancel}
            </button>
            <button
              className="px-6 py-2.5 bg-tertiary font-bold rounded-lg shadow active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
              onClick={handleRequestVaccineProof}
              disabled={
                proofReqLoading ||
                !proofVaccine ||
                !proofPersonalId ||
                !proofValidUntil
              }
            >
              {proofReqLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">
                    sync
                  </span>
                  <span>{i18n.requesting}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    assignment
                  </span>
                  <span>{i18n.requestVaccineProofBtn}</span>
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AddVaccineView;
