import React, { useState, useEffect } from "react";
import { VaxZkAPI } from "../../contract-api/index";

interface MetricsAdminProps {
  vaxApi: VaxZkAPI;
}

const MetricsAdmin: React.FC<MetricsAdminProps> = ({ vaxApi }) => {
    const [totalAdmin, setTotalAdmin] = useState<bigint>(0n);
    const [totalInviteAdmin, setTotalAdminInvites] = useState<bigint>(0n);
    const [totalInviteClinic, setTotalClinicInvites] = useState<bigint>(0n);
    const [totalClinics, setTotalClinics] = useState<number>(0);
    const [totalVaccines, setTotalVaccines] = useState<number>(0);
    const [totalActiveClinicOwners, setTotalActiveClinicOwners] = useState<bigint>(0n);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    async function init() {
      try {
        subscription = vaxApi.state$.subscribe((state) => {
          setTotalAdmin(state.totalAdmin);
          setTotalAdminInvites(state.totalInviteAdmin);
          setTotalClinicInvites(state.totalInviteClinic);
          setTotalClinics(state.totalClinics);
          setTotalVaccines(state.totalVaccines);
          setTotalActiveClinicOwners(state.totalActiveClinicOwners);
        });
      } catch (err) {
        console.error("Failed to join contract:", err);
      }
    }

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <section className="p-4">
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between group hover:bg-primary-fixed-dim transition-colors duration-500 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">vaccines</span>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-on-surface-variant font-medium label-md">Total Vaccines Registered</p>
            <h2 className="text-6xl font-extrabold tracking-tighter mt-2">{totalVaccines}</h2>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-3 md:grid-cols-3 gap-4 p-4">
        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors shadow-sm">
        <div className="p-3 w-fit rounded-lg bg-secondary/10 text-secondary">
        <span className="material-symbols-outlined">admin_panel_settings</span>
        </div>
        <div className="mt-4">
        <p className="text-on-surface-variant font-medium text-sm">Active Admins</p>
        <h2 className="text-3xl font-bold tracking-tight">{totalAdmin}</h2>
        </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors shadow-sm">
        <div className="p-3 w-fit rounded-lg bg-tertiary/10 text-tertiary">
        <span className="material-symbols-outlined">medical_services</span>
        </div>
          <div className="mt-4">
          <p className="text-on-surface-variant font-medium text-sm">Total Clinics</p>
          <h2 className="text-3xl font-bold tracking-tight">{totalClinics}</h2>
          </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors shadow-sm">
          <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="mt-4">
            <p className="text-on-surface-variant font-medium text-sm">Active Clinic Owners</p>
            <h2 className="text-3xl font-bold tracking-tight">{totalActiveClinicOwners.toString()}</h2>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4">
        <div className="bg-surface-container-highest rounded-xl p-8 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-on-surface-variant font-medium">Pending Admin Invites</p>
            <h2 className="text-5xl font-extrabold tracking-tight">{totalInviteAdmin}</h2>
          </div>
        </div>
        <div className="bg-surface-container-highest rounded-xl p-8 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-on-surface-variant font-medium">Pending Clinic Invites</p>
            <h2 className="text-5xl font-extrabold tracking-tight">{totalInviteClinic}</h2>
          </div>
        </div>
      </section>
    </main>
  );
};

export default MetricsAdmin;
