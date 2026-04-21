import React from "react";
import { useLanguage } from "../LanguageContext";
import { LanguageSelector } from "../App";
import { useProfile, ProfileSelector } from "../Profile";
import type { Tab } from "../Profile";
import HomeView from "./user/HomeView";
import WalletView from "./user/WalletView";
import ListClinicsView from "./user/ListClinicsView";
import UserProofRequestsView from "./user/UserProofRequestsView";
import AddVaccineView from "./clinic/AddVaccineView";
import AccessAdmin from "./admin/AccessAdmin";
import MetricsAdmin from "./admin/MetricsAdmin";
import VaccinesAdmin from "./admin/VaccinesAdmin";
import ClinicsAdmin from "./admin/ClinicsAdmin";
import IssuersAdmin from "./admin/IssuersAdmin";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import UnderConstruction from "./UnderConstruction";
import { networkId, getContractId } from "./ConfigNetwork";
import { VaxZkAPI } from "../contract-api/index";

interface DashboardProps {
  onLogout: () => void;
  walletAddress: string | null;
  connectedApi: ConnectedAPI;
  vaxApi: VaxZkAPI;
}

const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
  walletAddress,
  connectedApi,
  vaxApi,
}) => {
  const { t } = useLanguage();
  const { profile, activeTab, setActiveTab } = useProfile();
  const [clinicModalTrigger, setClinicModalTrigger] = React.useState<
    "proofReq" | null
  >(null);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <HomeView walletAddress={walletAddress} />;
      case "wallet": // USER
        return <WalletView />;
      case "listclinics": // USER
        return <ListClinicsView vaxApi={vaxApi!} />;
      case "myproofs": // USER
        return <UserProofRequestsView connectedApi={connectedApi!} />;
      case "addvaccine": // CLINIC
        return (
          <AddVaccineView
            connectedApi={connectedApi!}
            triggerModal={clinicModalTrigger}
            onModalTriggered={() => setClinicModalTrigger(null)}
          />
        );
      case "clinicprofile": // CLINIC
        return <UnderConstruction />;
      case "metrics": // ADMIN
        return <MetricsAdmin vaxApi={vaxApi!} />;
      case "access": // ADMIN
        return <AccessAdmin vaxApi={vaxApi!} />;
      case "adminvaccine": // ADMIN
        return <VaccinesAdmin vaxApi={vaxApi!} />;
      case "adminclinic": // ADMIN
        return <ClinicsAdmin connectedApi={connectedApi!} />;
      case "adminissuers": // ADMIN
        return <IssuersAdmin vaxApi={vaxApi!} />;
      default:
        switch (profile) {
          case "admin":
            return <MetricsAdmin vaxApi={vaxApi!} />;
          case "clinic":
            return (
              <AddVaccineView
                connectedApi={connectedApi!}
                triggerModal={clinicModalTrigger}
                onModalTriggered={() => setClinicModalTrigger(null)}
              />
            );
          default:
            return <HomeView walletAddress={walletAddress} />;
        }
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
                  {t.loggedInAs} {profile}
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
              {getContractId() && (
                <a
                  href={`https://${networkId}.nightforge.jp/address/${getContractId()}`}
                  target="_blank"
                >
                  <br />
                  <span className="text-xs font-medium text-slate-500">
                    ContractID: {getContractId()}
                  </span>
                </a>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ProfileSelector />
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

      {renderView()}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-slate-50/70 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:flex">
        {profile == "user" && (
          <button
            onClick={() => handleTabChange("home")}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "home"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "home" ? "'FILL' 1" : undefined,
              }}
            >
              home
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Home
            </span>
          </button>
        )}

        {profile == "user" && (
          <button
            onClick={() => handleTabChange("wallet")}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "wallet"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "wallet" ? "'FILL' 1" : undefined,
              }}
            >
              account_balance_wallet
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Wallet
            </span>
          </button>
        )}

        {profile == "user" && (
          <button
            onClick={() => handleTabChange("listclinics")}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "listclinics"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "listclinics" ? "'FILL' 1" : undefined,
              }}
            >
              local_hospital
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Clinics
            </span>
          </button>
        )}

        {profile == "user" && (
          <button
            onClick={() => handleTabChange("myproofs")}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "myproofs"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "myproofs" ? "'FILL' 1" : undefined,
              }}
            >
              vaccines
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              My Proofs
            </span>
          </button>
        )}

        {profile == "clinic" && (
          <button
            onClick={() => {
              handleTabChange("addvaccine");
              setClinicModalTrigger("proofReq");
            }}
            className="flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all text-slate-400 hover:text-blue-600"
          >
            <span className="material-symbols-outlined">assignment_add</span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Proof Req
            </span>
          </button>
        )}

        {profile == "clinic" && (
          <button
            onClick={() => handleTabChange("clinicprofile")}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "clinicprofile"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "clinicprofile" ? "'FILL' 1" : undefined,
              }}
            >
              local_hospital
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Profile
            </span>
          </button>
        )}

        {profile == "admin" && (
          <button
            onClick={() => handleTabChange("metrics")}
            className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "metrics"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "metrics" ? "'FILL' 1" : undefined,
              }}
            >
              dashboard
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Metrics
            </span>
          </button>
        )}

        {profile == "admin" && (
          <button
            onClick={() => handleTabChange("access")}
            className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "access"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "access" ? "'FILL' 1" : undefined,
              }}
            >
              admin_panel_settings
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Access
            </span>
          </button>
        )}

        {profile == "admin" && (
          <button
            onClick={() => handleTabChange("adminvaccine")}
            className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "adminvaccine"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "adminvaccine" ? "'FILL' 1" : undefined,
              }}
            >
              vaccines
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Vaccines
            </span>
          </button>
        )}

        {profile == "admin" && (
          <button
            onClick={() => handleTabChange("adminclinic")}
            className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "adminclinic"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "adminclinic" ? "'FILL' 1" : undefined,
              }}
            >
              local_hospital
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Clinics
            </span>
          </button>
        )}

        {profile == "admin" && (
          <button
            onClick={() => handleTabChange("adminissuers")}
            className={`flex flex-col items-center justify-center px-3 py-2 active:scale-90 duration-150 transition-all ${
              activeTab === "adminissuers"
                ? "text-blue-700 bg-blue-100/50 rounded-2xl"
                : "text-slate-400 hover:text-blue-600"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  activeTab === "adminissuers" ? "'FILL' 1" : undefined,
              }}
            >
              verified_user
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase mt-1">
              Certificate Issuers
            </span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default Dashboard;
