import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { VaxZkAPI } from "./contract-api/index";
import { useLanguage } from './LanguageContext';

interface InvitePageProps {
  vaxApi: VaxZkAPI;
}

const InvitePage: React.FC<InvitePageProps> = ({ vaxApi }) => {
  const { i18n } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  if (!code) {
    return <p className="p-8 text-error">{i18n.inviteCodeMissing}</p>;
  }
  const role = params.get("role");
  if (!role) {
    return <p className="p-8 text-error">{i18n.inviteRoleMissing}</p>;
  }

  const isClinic = role === "clinic";
  const pageTitle = isClinic ? i18n.invitePageTitleClinic : i18n.invitePageTitleAdmin;
  const pageSubtitle = isClinic ? i18n.invitePageSubtitleClinic : i18n.invitePageSubtitleAdmin;
  const roleIcon = isClinic ? "local_hospital" : "admin_panel_settings";

  const handleAcceptInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoading(true);
    setError(null);

    try {
      await vaxApi.acceptInvite(isClinic ? "clinic" : "admin", code.trim());
      setSuccess(true);
    } catch (err) {
      console.error("Contract failed:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
            <span className="material-symbols-outlined text-primary text-3xl">{roleIcon}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-3">
            {pageTitle}
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed max-w-sm mx-auto">
            {pageSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
              </div>
              <div>
                <p className="text-lg font-bold text-green-700">{i18n.inviteAccepted}</p>
                <p className="text-sm text-on-surface-variant mt-1">{i18n.inviteAcceptedDesc}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAcceptInvite} className="flex flex-col gap-6">
              {/* Invite code info */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 shrink-0">key</span>
                <code className="text-xs font-mono text-slate-500 break-all">{code}</code>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-4">
                  <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">error</span>
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              <button
                className="w-full py-4 bg-primary-container text-on-primary-container font-bold text-base rounded-xl shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                    <span>{i18n.loading}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                    <span>{i18n.acceptInviteBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
};

export { InvitePage };
