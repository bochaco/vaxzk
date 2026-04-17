import { createContext, useContext, useState } from 'react';
// import { buildProviders, VaxZkAPI } from "./contract-api/index";

const ProfileOptions = [
  { code: 'admin', label: 'Admin' },
  { code: 'clinic', label: 'Clinic' },
  { code: 'user', label: 'User' },
]

export type Profile = 'admin' | 'clinic' | 'user';
export type Tab = "home" | "wallet" | "listclinics" | "addvaccine" | "clinicprofile" | "metricsDerivedClinic" | "adminvaccine" | "metrics" | "access" | "adminclinic";

interface ProfileContextValue {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: 'user',
  setProfile: () => {},
  activeTab: 'home',
  setActiveTab: () => {},
});

export function ProfileSelector({ fixed = false }: { fixed?: boolean }) {
  const {profile, setProfile, setActiveTab} = useProfile();

  const handleProfileChange = (newProfile: Profile) => {
    if (newProfile === profile) return;
    console.log("handleProfileChange", newProfile);
    setActiveTab(newProfile === "user" ? "home" : newProfile === "clinic" ? "addvaccine" : "metrics");
    setProfile(newProfile);
  };

  return (
    <div className={`flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-slate-200/60 ${fixed ? 'fixed top-3 right-4 z-[100]' : ''}`}>
        <select style={{ border: 0, minWidth: 'max-content' }} defaultValue={profile} className="flex items-center gap-1 pl-2 pr-6 py-0.5 rounded-full text-xs font-bold transition-colors bg-primary" onChange={(e) => handleProfileChange(e.target.value as Profile)}>
        {ProfileOptions.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
        ))}
        </select>
    </div>
  );
}

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile>('user');
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <ProfileContext.Provider value={{ profile, setProfile, activeTab, setActiveTab }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
