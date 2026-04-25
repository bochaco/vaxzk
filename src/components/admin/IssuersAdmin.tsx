import React, { useState, useEffect } from "react";
import { VaxZkAPI, type DerivedIssuer } from "../../contract-api/index";
import { getPublicKey } from "../../contract-api/signing";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";

const HARDCODED_ISSUER_SK =
  1234567890123456789012345678901234567890123456789012345678901234n;

interface IssuersAdminProps {
  vaxApi: VaxZkAPI;
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

const IssuersAdmin: React.FC<IssuersAdminProps> = ({ vaxApi }) => {
  const [issuers, setIssuers] = useState<DerivedIssuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [issuerLoading, setIssuerLoading] = useState(false);
  const [issuerError, setIssuerError] = useState<string | null>(null);
  const [issuerName, setIssuerName] = useState("");
  const [issuerUri, setIssuerUri] = useState("");
  const [issuerVerificationEndpoint, setIssuerVerificationEndpoint] =
    useState("");
  const [issuerKey, setIssuerKey] = useState("");

  useEffect(() => {
    if (!vaxApi) return;

    let subscription: { unsubscribe: () => void } | undefined;

    try {
      subscription = vaxApi.state$.subscribe((state) => {
        setIssuers(state.issuers);
        setLoading(false);
      });
    } catch (err) {
      console.error("Failed to subscribe to contract state:", err);
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [vaxApi]);

  const handleAddIssuer = async () => {
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
      setIssuerName("");
      setIssuerUri("");
      setIssuerVerificationEndpoint("");
      setIssuerKey("");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add issuer:", err);
      setIssuerError(
        "Failed to add issuer: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIssuerLoading(false);
    }
  };

  return (
    <>
      <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
        <section className="mb-12 text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
            <span className="text-primary">Manage</span> Certificate Issuers
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Register and review the organizations authorized to issue vaccine
            certificates.
          </p>
        </section>

        {/* Add Issuer button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => { setIssuerError(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-secondary font-bold rounded-lg shadow active:scale-95 transition-all duration-200 text-sm"
          >
            <span className="material-symbols-outlined text-base">verified_user</span>
            Add Issuer
          </button>
        </div>

        {/* Registered Issuers list */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-left">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            Vaccination Certificate Issuers
          </h3>
          {loading ? (
            <div className="flex items-center gap-2 text-on-surface-variant text-sm py-2">
              <span className="material-symbols-outlined animate-spin text-base">
                sync
              </span>
              <span>Loading issuers...</span>
            </div>
          ) : issuers.length === 0 ? (
            <div className="bg-surface-container-low p-8 rounded-xl border border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">
                verified_user
              </span>
              <p className="text-on-surface-variant italic text-sm">
                No issuers registered yet.
              </p>
            </div>
          ) : (
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
                        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                          Issuer Shielded Id:{" "}
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono break-all">
                          {idHex}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                          Signature Public Key:{" "}
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono break-all">
                          {issuer.verifyingKeyHex}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                          URI:{" "}
                        </span>
                        <span className="text-xs text-on-surface-variant break-all">
                          {issuer.uri}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                          Verification Endpoint:{" "}
                        </span>
                        <span className="text-xs text-on-surface-variant break-all">
                          {issuer.verificationEndpoint}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Certificate Issuer modal */}
      {showModal && (
        <Modal
          title="Add Certificate Issuer"
          onClose={() => setShowModal(false)}
        >
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
                URL used by administrative agents or personnel to verify the
                authenticity of a vaccination certificate.
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

          {issuerError && (
            <p className="text-error text-sm mb-4 px-1">{issuerError}</p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-on-surface-variant text-sm font-semibold hover:bg-slate-50 transition-colors"
              onClick={() => setShowModal(false)}
              disabled={issuerLoading}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 bg-secondary font-bold rounded-lg shadow active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
              onClick={handleAddIssuer}
              disabled={
                issuerLoading ||
                !issuerName ||
                !issuerUri ||
                !issuerVerificationEndpoint
              }
            >
              {issuerLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">
                    sync
                  </span>
                  <span>Adding Issuer...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">
                    verified_user
                  </span>
                  <span>Add Issuer</span>
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default IssuersAdmin;
