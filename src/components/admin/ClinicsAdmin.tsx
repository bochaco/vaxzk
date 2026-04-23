import React, { useState, useEffect } from "react";
import {
  buildProviders,
  VaxZkAPI,
  type DerivedClinic,
} from "../../contract-api/index";
import { networkId, getContractId } from "../ConfigNetwork";
import { toHex } from "@midnight-ntwrk/midnight-js-utils";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";

interface ClinicsAdminProps {
  connectedApi: ConnectedAPI;
}

function encodeBytes(value: string, length: number): Uint8Array {
  const out = new Uint8Array(length);
  out.set(new TextEncoder().encode(value).slice(0, length));
  return out;
}

const ClinicsAdmin: React.FC<ClinicsAdminProps> = ({ connectedApi }) => {
  const [clinics, setClinics] = useState<DerivedClinic[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vaxApi, setVaxApi] = useState<VaxZkAPI | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [isOnline, setIsOnline] = useState(false);

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
          setClinics(state.clinics);
          setClinicsLoading(false);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
        setError("Failed to connect to the contract");
        setClinicsLoading(false);
      }
    }

    init();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [connectedApi]);

  const canSubmit = !!vaxApi && !loading && name.trim().length > 0;

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaxApi) return;

    setLoading(true);
    setError(null);
    try {
      const id = globalThis.crypto.getRandomValues(new Uint8Array(32));
      const profile = {
        ownerId: new Uint8Array(32), // placeholder — identity mechanism TBD
        name: encodeBytes(name.trim(), 32),
        address: encodeBytes(address.trim(), 64),
        latitud: encodeBytes(latitud.trim(), 20),
        longitud: encodeBytes(longitud.trim(), 20),
        isOnline,
      };
      await vaxApi.addClinic(id, profile);
      // Reset form on success
      setName("");
      setAddress("");
      setLatitud("");
      setLongitud("");
      setIsOnline(false);
    } catch (err: unknown) {
      console.error("Failed to add clinic:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">Manage</span> Clinics
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Register new clinics on-chain and view all currently registered
          clinics.
        </p>
      </section>

      {/* Add Clinic Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-6">
          Register New Clinic
        </h3>

        <form onSubmit={handleAddClinic} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Clinic Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 32))}
              placeholder="e.g. City Health Clinic"
              maxLength={32}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value.slice(0, 64))}
              placeholder="e.g. 123 Main St, Springfield"
              maxLength={64}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Lat / Long */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                Latitude
              </label>
              <input
                type="text"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value.slice(0, 20))}
                placeholder="e.g. -23.5990263"
                maxLength={20}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                Longitude
              </label>
              <input
                type="text"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value.slice(0, 20))}
                placeholder="e.g. -46.6419712"
                maxLength={20}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Is Online */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isOnline"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label
              htmlFor="isOnline"
              className="text-sm font-medium text-on-surface"
            >
              Online clinic (offers remote/telehealth services)
            </label>
          </div>

          {error && <p className="text-red-600 text-sm px-1">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="px-8 py-4 bg-primary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">
                  local_hospital
                </span>
                <span>Register Clinic</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Clinics List */}
      <div className="text-left">
        <h3 className="text-2xl font-bold mb-6">Registered Clinics</h3>

        {clinicsLoading ? (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm py-4">
            <span className="material-symbols-outlined animate-spin">sync</span>
            <span>Loading clinics...</span>
          </div>
        ) : clinics.length === 0 ? (
          <div className="bg-surface-container-low p-12 rounded-xl border border-dashed border-slate-200 text-center">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">
              local_hospital
            </span>
            <p className="text-on-surface-variant italic">
              No clinics registered on-chain yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clinics.map((clinic) => {
              const idHex = toHex(clinic.id);
              const ownerHex = toHex(clinic.ownerId);
              return (
                <div
                  key={idHex}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      local_hospital
                    </span>
                    <p className="font-semibold text-on-surface">
                      {clinic.name || (
                        <span className="italic text-on-surface-variant">
                          Unnamed
                        </span>
                      )}
                    </p>
                    {clinic.isOnline && (
                      <span className="ml-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        Online
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1 pl-1 text-xs">
                    <div>
                      <span className="font-semibold text-on-surface-variant uppercase tracking-wide">
                        Clinic Shielded ID:{" "}
                      </span>
                      <span className="font-mono text-on-surface-variant break-all">
                        {idHex}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-on-surface-variant uppercase tracking-wide">
                        Owner Shielded ID:{" "}
                      </span>
                      <span className="font-mono text-on-surface-variant break-all">
                        {ownerHex}
                      </span>
                    </div>
                    {clinic.address && (
                      <div>
                        <span className="font-semibold text-on-surface-variant uppercase tracking-wide">
                          Address:{" "}
                        </span>
                        <span className="text-on-surface-variant">
                          {clinic.address}
                        </span>
                      </div>
                    )}
                    {(clinic.latitud || clinic.longitud) && (
                      <div>
                        <span className="font-semibold text-on-surface-variant uppercase tracking-wide">
                          Coordinates:{" "}
                        </span>
                        <span className="text-on-surface-variant">
                          {clinic.latitud}, {clinic.longitud}
                        </span>
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
  );
};

export default ClinicsAdmin;
