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
  const [success, setSuccess] = useState<string | null>(null);
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

  const handleAcceptInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!vaxApi) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const inviteRole = role === "clinic" ? "clinic" : "admin";
      await vaxApi.acceptInvite(inviteRole, code.trim());
      setSuccess(i18n.inviteAccepted);
    } catch (err) {
      console.error("Contract failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = role === "clinic" ? i18n.invitePageTitleClinic : i18n.invitePageTitleAdmin;

  return (
  <main className="pt-12 px-6 max-w-screen-md mx-auto">
    <section className="mb-7">
      <h2
        className="text-4xl font-extrabold tracking-tight text-on-surface mb-2"
      >
        {pageTitle}
      </h2>
    </section>
    <div className="space-y-16">
      <div className="bg-surface-container-low p-8 rounded-xl shadow-sm border-none relative overflow-hidden">
        <form
        onSubmit={handleAcceptInvite}
        className="space-y-8 relative z-10">
          <div className="bg-secondary-container/20 p-5 rounded-lg border-none flex items-start gap-4 mt-12"
          style={{"background": "rgb(161 190 253 / 0.2)"}}>
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-container">
                verified_user
              </span>
            </div>
            {error && (
              <p className="text-error text-sm mt-3 px-1">{error}</p>
            )}
            {success && (
              <p className="text-green-600 text-sm mt-3 px-1 font-medium">{success}</p>
            )}
            <div className="pt-6">
                <button
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: "#0070eb" }}
                  type="submit"
                  disabled={loading}
                >
                  <span>
                    {loading ? i18n.loading : i18n.acceptInviteBtn}
                  </span>
                  {!loading && (
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export { InvitePage };
