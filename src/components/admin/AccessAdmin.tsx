import React, { useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import { VaxZkAPI } from "../../contract-api/index";
import { urlApp } from "../ConfigNetwork";
import {v4 as uuidv4} from 'uuid';

interface AccessAdminProps {
  vaxApi: VaxZkAPI;
}

const AccessAdmin: React.FC<AccessAdminProps> = ({ vaxApi }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkAdminAddress, setLinkAdminAddress] = useState<string | null>(null);
  const [linkClinicAddress, setLinkClinicAddress] = useState<string | null>(null);

  const handleAddInviteAdmin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoading(true);
    setError(null);
    setLinkAdminAddress("");
    try {
      const uuid = uuidv4();
      const txData = await vaxApi.registerInviteAdmin(uuid);
      console.log("txData", txData);
      setLinkAdminAddress(urlApp + "/#/invite?code=" + uuid);
    } catch (err) {
      console.error("Failed to add vaccine:", err);
      if (err instanceof Error) {
        setError("Erro ao criar um novo convite: " + err.message);
      } else {
        setError("Erro ao criar um novo convite: " + String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddInviteClinic = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoading(true);
    setError(null);
    setLinkClinicAddress("");
    try {
      const uuid = uuidv4();
      const txData = await vaxApi.registerInviteAdmin(uuid);
      console.log("txData", txData);
      setLinkClinicAddress(urlApp + "/#/invite?code=" + uuid);
    } catch (err) {
      console.error("Failed to add vaccine:", err);
      if (err instanceof Error) {
        setError("Erro ao criar um novo convite: " + err.message);
      } else {
        setError("Erro ao criar um novo convite: " + String(err));
      }
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleAddInviteAdmin} className="flex flex-col gap-4">
            <button 
              className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              type="submit"
              disabled={loading}>
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
          {linkAdminAddress && (
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
                    {linkAdminAddress}
                  </code>
                  <button
                    type="button"
                    title="Copy address"
                    className="shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                    onClick={() => navigator.clipboard.writeText(linkAdminAddress)}
                  >
                    <span className="material-symbols-outlined text-green-600 text-base">content_copy</span>
                  </button>
                </div>
              </div>
            )}
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">{t.accessAddClinicTitle}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{t.accessAddClinicDesc}</p>
        <form onSubmit={handleAddInviteClinic} className="flex flex-col gap-4">
            <button 
              className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              type="submit"
              disabled={loading}>
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
                    <span>{t.accessAddAClinicLink}</span>
                  </>
                )}
            </button>
          {error && <p className="text-error text-sm mt-3 px-1">{error}</p>}
          {linkClinicAddress && (
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
                    {linkClinicAddress}
                  </code>
                  <button
                    type="button"
                    title="Copy address"
                    className="shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                    onClick={() => navigator.clipboard.writeText(linkClinicAddress)}
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