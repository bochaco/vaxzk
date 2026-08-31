import React, { useState } from "react";
import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { useLanguage } from "../LanguageContext";
import { LanguageSelector } from "../App";
import { networkId, getContractId } from "./ConfigNetwork";
import { buildProviders, VaxZkAPI } from "../contract-api/index";

interface DeployContractProps {
  onLogout: () => void;
  walletAddress: string | null;
  onDeployed?: (address: string) => void;
}

const DeployContractView: React.FC<DeployContractProps> = ({onLogout, walletAddress, onDeployed}) => {
  const { i18n } = useLanguage();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(
    getContractId() || null,
  );
  const [error, setError] = useState<string | null>(null);
  const [joinAddress, setJoinAddress] = useState("");

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
        (w): w is InitialAPI => !!w && typeof w === "object" && "apiVersion" in w,
      );

      if (!wallet) {
        throw new Error("Compatible Midnight wallet not found");
      }

      const connectedApi = await wallet.connect(networkId);
      const providers = await buildProviders(connectedApi, networkId);

      // Fresh 32-byte secret key for this admin identity. Its derived public
      // key becomes the first admin on the ledger via the localSk() witness.
      const secretKey = crypto.getRandomValues(new Uint8Array(32));

      const api = await VaxZkAPI.deploy(providers, secretKey);
      const address = api.deployedContractAddress as unknown as string;
      console.log(api);

      console.log("Successfully deployed contract at:", address);
      setDeployedAddress(address);
      setIsDeploying(false);
    } catch (err) {
      console.error("Deployment failed:", err);
      if (err && typeof err === 'object' && 'cause' in err) {
        const cause = err.cause as {
          failure?: { message?: unknown; cause?: { txData?: Record<string, number> } };
        } | undefined;
        let errorMessage = cause?.failure?.message ? String(cause?.failure?.message) : String("");
        const txData = cause?.failure?.cause?.txData;
        if (txData) {
          const bytes = new Uint8Array(Object.values(txData));
          const str = String.fromCharCode(...bytes);
          console.log(str);
          errorMessage = errorMessage + '\n' + str;
        }
        setError(errorMessage);
      }
      setIsDeploying(false);
    }
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
                  {i18n.loggedInAs}
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
              <span className="hidden sm:inline">{i18n.logout}</span>
            </button>
          </div>
        </div>
      </header>

    <main className="pt-24 px-6 max-w-screen-md mx-auto pb-16">
      {/* Page Title */}
      <section className="mb-12 text-left">
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          {i18n.deployContract}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
          {i18n.deployContractSubtitle}
        </p>
      </section>

      <div className="space-y-8 text-left">
        {/* Join Existing Contract */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            {i18n.joinExistingContract}
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-base">link</span>
              </div>
              <input
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all placeholder:text-outline font-mono"
                placeholder={i18n.contractAddressPlaceholder}
                type="text"
                value={joinAddress}
                onChange={(e) => setJoinAddress(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 bg-primary text-black font-bold rounded-lg shadow active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-sm whitespace-nowrap"
              disabled={!joinAddress.trim()}
              onClick={() => onDeployed?.(joinAddress.trim())}
            >
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              <span>{i18n.joinContract}</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm text-on-surface-variant font-medium">{i18n.orDeployNew}</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Deploy New Contract */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

          <form className="space-y-8 relative z-10" onSubmit={handleDeploy}>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Visual Aid Card */}
            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">gavel</span>
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">
                  {i18n.contractParamsTitle}
                </h4>
                <p className="text-xs text-blue-800/70 leading-relaxed mt-1">
                  {i18n.contractDesc}
                </p>
              </div>
            </div>

            {deployedAddress && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{i18n.deploySuccess}</span>
                </div>
                <p className="text-xs text-green-800/70">{i18n.deploySuccessDesc}</p>
                <div className="flex items-center gap-2 bg-white border border-green-100 rounded-lg px-4 py-3">
                  <span className="material-symbols-outlined text-green-600 text-base shrink-0">link</span>
                  <code className="text-xs font-mono text-green-900 break-all select-all flex-1">
                    {deployedAddress}
                  </code>
                  <button
                    type="button"
                    title={i18n.copyAddress}
                    className="shrink-0 p-1 rounded hover:bg-green-100 transition-colors"
                    onClick={() => navigator.clipboard.writeText(deployedAddress)}
                  >
                    <span className="material-symbols-outlined text-green-600 text-base">content_copy</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={() => onDeployed?.(deployedAddress)}
                >
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                  <span>{i18n.useThisContract}</span>
                </button>
              </div>
            )}

            {!deployedAddress && (
              <button
                className={`w-full py-4 bg-gradient-to-r from-primary to-blue-600 font-bold text-lg rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 ${isDeploying ? "opacity-80 cursor-wait" : ""}`}
                type="submit"
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    <span>{i18n.deploying}</span>
                  </>
                ) : (
                  <>
                    <span>{i18n.deployContractButton}</span>
                    <span className="material-symbols-outlined">cloud_upload</span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
    </div>
  );
};

export default DeployContractView;
