import React, { useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import { VaxZkAPI } from "../../contract-api/index";
import { urlApp } from "../ConfigNetwork";
import {v4 as uuidv4} from 'uuid';

interface AccessAdminProps {
  vaxApi: VaxZkAPI;
}

const AccessAdmin: React.FC<AccessAdminProps> = ({ vaxApi }) => {
  const { i18n } = useLanguage();
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingClinic, setLoadingClinicState] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [errorAdmin, setErrorAdmin] = useState<string | null>(null);
  const [errorClinic, setErrorClinic] = useState<string | null>(null);
  const [errorRemove, setErrorRemove] = useState<string | null>(null);
  const [linkAdminAddress, setLinkAdminAddress] = useState<string | null>(null);
  const [linkClinicAddress, setLinkClinicAddress] = useState<string | null>(null);
  const [removedSuccess, setRemovedSuccess] = useState(false);

  const handleAddInviteAdmin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoadingAdmin(true);
    setErrorAdmin(null);
    setLinkAdminAddress("");
    try {
      const uuid = uuidv4();
      const txData = await vaxApi.registerInvite('admin', uuid);
      console.log("txData", txData);
      setLinkAdminAddress(urlApp + "/#/invite?role=admin&code=" + uuid);
    } catch (err) {
      console.error("Failed to add vaccine:", err);
      if (err instanceof Error) {
        setErrorAdmin(i18n.errCreateInvite + err.message);
      } else {
        setErrorAdmin(i18n.errCreateInvite + String(err));
      }
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleAddInviteClinic = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoadingClinicState(true);
    setErrorClinic(null);
    setLinkClinicAddress("");
    try {
      const uuid = uuidv4();
      const txData = await vaxApi.registerInvite('clinic', uuid);
      console.log("txData", txData);
      setLinkClinicAddress(urlApp + "/#/invite?role=clinic&code=" + uuid);
    } catch (err) {
      console.error("Failed to add vaccine:", err);
      if (err instanceof Error) {
        setErrorClinic(i18n.errCreateInvite + err.message);
      } else {
        setErrorClinic(i18n.errCreateInvite + String(err));
      }
    } finally {
      setLoadingClinicState(false);
    }
  };

  const handleRemoveSelfAdmin = async () => {
    if (!vaxApi) return;

    setLoadingRemove(true);
    setErrorRemove(null);
    setRemovedSuccess(false);
    try {
      await vaxApi.revokeAdmin();
      setRemovedSuccess(true);
    } catch (err) {
      console.error("Failed to remove admin:", err);
      if (err instanceof Error) {
        setErrorRemove(i18n.errRemoveAdmin + err.message);
      } else {
        setErrorRemove(i18n.errRemoveAdmin + String(err));
      }
    } finally {
      setLoadingRemove(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">

      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          <span className="text-primary">{i18n.manage}</span> {i18n.accessAdminTitleEnd} </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">{i18n.accessAdminSubtitle}</p>
      </section>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-on-surface mb-4">{i18n.accessAddAdminTitle}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{i18n.accessAddAdminDesc}</p>
        <form onSubmit={handleAddInviteAdmin} className="flex flex-col gap-4">
            <button
              className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              type="submit"
              disabled={loadingAdmin}>
                {loadingAdmin ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                    <span>{i18n.loading}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">verified_user</span>
                    <span>{i18n.accessAddAdminLink}</span>
                  </>
                )}
            </button>
          {errorAdmin && <p className="text-error text-sm mt-3 px-1">{errorAdmin}</p>}
          {linkAdminAddress && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{i18n.inviteLinkCreated}</span>
                </div>
                <p className="text-xs text-green-800/70">{i18n.inviteLinkStoredDesc}</p>
                <div className="flex items-center gap-2 bg-white border border-green-100 rounded-lg px-4 py-3">
                  <span className="material-symbols-outlined text-green-600 text-base shrink-0">link</span>
                  <code className="text-xs font-mono text-green-900 break-all select-all flex-1">
                    {linkAdminAddress}
                  </code>
                  <button
                    type="button"
                    title={i18n.copyLink}
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
        <h3 className="text-lg font-semibold text-on-surface mb-4">{i18n.accessAddClinicTitle}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{i18n.accessAddClinicDesc}</p>
        <form onSubmit={handleAddInviteClinic} className="flex flex-col gap-4">
            <button
              className="px-8 py-4 bg-secondary font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              type="submit"
              disabled={loadingClinic}>
                {loadingClinic ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                    <span>{i18n.loading}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">verified_user</span>
                    <span>{i18n.accessAddAClinicLink}</span>
                  </>
                )}
            </button>
          {errorClinic && <p className="text-error text-sm mt-3 px-1">{errorClinic}</p>}
          {linkClinicAddress && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{i18n.inviteLinkCreated}</span>
                </div>
                <p className="text-xs text-green-800/70">{i18n.inviteLinkStoredDesc}</p>
                <div className="flex items-center gap-2 bg-white border border-green-100 rounded-lg px-4 py-3">
                  <span className="material-symbols-outlined text-green-600 text-base shrink-0">link</span>
                  <code className="text-xs font-mono text-green-900 break-all select-all flex-1">
                    {linkClinicAddress}
                  </code>
                  <button
                    type="button"
                    title={i18n.copyLink}
                    className="shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                    onClick={() => navigator.clipboard.writeText(linkClinicAddress)}>
                    <span className="material-symbols-outlined text-green-600 text-base">content_copy</span>
                  </button>
                </div>
              </div>
            )}
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 mb-12 text-left">
        <h3 className="text-lg font-semibold text-red-600 mb-4">{i18n.removeAdminTitle}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{i18n.removeAdminDesc}</p>
        <div className="flex flex-col gap-4">
            <button 
              className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              type="button"
              onClick={handleRemoveSelfAdmin}
              disabled={loadingRemove}>
                {loadingRemove ? (
                  <>
                    <span translate="no" className="material-symbols-outlined animate-spin">
                      sync
                    </span>
                    <span>{i18n.loading}</span>
                  </>
                ) : (
                  <>
                    <span translate="no" className="material-symbols-outlined">delete_forever</span>
                    <span>{i18n.removeAccess}</span>
                  </>
                )}
            </button>
          {errorRemove && <p className="text-error text-sm mt-3 px-1">{errorRemove}</p>}
          {removedSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{i18n.adminAccessRemoved}</span>
                </div>
              </div>
            )}
        </div>
      </div>

    </main>
  );
};

export default AccessAdmin;