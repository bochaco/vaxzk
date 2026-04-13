import React, { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { LanguageSelector } from "../App";
import { networkId, saveContractId, clearContractId, getContractId } from "./ConfigNetwork";
import { buildProviders, VaxZkAPI } from "../contract-api/index";

interface DeployContractProps {
  onLogout: () => void;
  walletAddress: string | null;
}

const DeployContractView: React.FC<DeployContractProps> = ({onLogout, walletAddress}) => {
  const { t } = useLanguage();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(
    getContractId() || null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setError(null);
    try {
      if (!window.midnight) {
        throw new Error("Midnight Extension not found. Please install Lace.");
      }

      const wallets = Object.values(window.midnight);
      const wallet = wallets.find(
        (w) => !!w && typeof w === "object" && "apiVersion" in w,
      ) as any;

      if (!wallet) {
        throw new Error("Compatible Midnight wallet not found");
      }

      const connectedApi = await wallet.connect(networkId);
      const providers = await buildProviders(connectedApi, networkId);

      // Fresh 32-byte secret key for this admin identity. Its derived public
      // key becomes the first admin on the ledger via the localSk() witness.
      const secretKey = crypto.getRandomValues(new Uint8Array(32));
      console.log("VaxZkAPI");
      const api = await VaxZkAPI.deploy(providers, secretKey);
      console.log("deployng...");
      const address = api.deployedContractAddress as unknown as string;
      console.log(api);

      console.log("Successfully deployed contract at:", address);
      saveContractId(address);
      setDeployedAddress(address);
      setIsDeploying(false);
    } catch (err) {
      console.error("Deployment failed:", err);
      setError(err instanceof Error ? err.message : String(err));
      setIsDeploying(false);
    }
  };

  const handleRedeploy = () => {
    clearContractId();
    setDeployedAddress(null);
    setError(null);
  };

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-slate-500">
                  {t.loggedInAs}
                </span>
                <span className="text-sm font-bold text-on-surface">
                  Midnight{" "}
                  {walletAddress ? `(...${walletAddress.slice(-6)})` : ""}
                </span>
              </div>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-200 mx-2"></div>
            <h1 className="hidden md:block text-xl font-bold text-blue-800 tracking-tight">
              VaxZk
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-error hover:bg-error/10 transition-colors text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

    <main className="pt-24 px-6 max-w-screen-md mx-auto">
      {/* Page Title & Editorial Intro */}
      <section className="mb-12 text-left">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          {t.deployContract}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
          {t.deployContractSubtitle}
        </p>
      </section>

      {/* Form Container with Tonal Depth */}
      <div className="space-y-16 text-left">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Decorative Subtle Background Gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

          <form className="space-y-8 relative z-10" onSubmit={handleDeploy}>
            {/* General Settings */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold tracking-wide text-primary uppercase ml-1">
                {t.contractName}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">
                    description
                  </span>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300 placeholder:text-outline"
                  placeholder={t.contractNamePlaceholder}
                  type="text"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm flex items-start gap-3 mt-6">
                <span className="material-symbols-outlined text-red-500">
                  error
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Visual Aid Card */}
            <div className="bg-blue-50 p-5 rounded-lg border-none flex items-start gap-4 mt-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  gavel
                </span>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">
                  {t.contractParamsTitle}
                </h4>
                <p className="text-xs text-blue-800/70 leading-relaxed mt-1">
                  {t.contractDesc}
                </p>
              </div>
            </div>

            {/* Deployed address banner */}
            {deployedAddress && (
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
                    {deployedAddress}
                  </code>
                  <button
                    type="button"
                    title="Copy address"
                    className="shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                    onClick={() => navigator.clipboard.writeText(deployedAddress)}
                  >
                    <span className="material-symbols-outlined text-green-600 text-base">content_copy</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleRedeploy}
                  className="self-start text-xs text-green-700 underline hover:no-underline"
                >
                  Deploy a new contract instead
                </button>
              </div>
            )}

            {/* Primary Action */}
            {!deployedAddress && (
            <div className="pt-6 relative pb-20">
              <button
                className={`w-full py-4 bg-gradient-to-r from-primary to-blue-600 font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 ${isDeploying ? "opacity-80 cursor-wait" : ""}`}
                type="submit"
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">
                      sync
                    </span>
                    <span>{t.deploying}</span>
                  </>
                ) : (
                  <>
                    <span>{t.deployContractButton}</span>
                    <span className="material-symbols-outlined">
                      cloud_upload
                    </span>
                  </>
                )}
              </button>
            </div>
            )}
          </form>
        </div>
      </div>
    </main>


    </div>        
  );
};

export default DeployContractView;
