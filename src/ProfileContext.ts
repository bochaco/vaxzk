import { createContext, useContext } from 'react';

export type Profile = 'admin' | 'clinic' | 'user';
export type Tab = "listclinics" | "myproofs" | "addvaccine" | "clinicprofile" | "metricsDerivedClinic" | "adminvaccine" | "metrics" | "access" | "adminissuers";

export interface ProfileContextValue {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const ProfileContext = createContext<ProfileContextValue>({
  profile: 'user',
  setProfile: () => {},
  activeTab: 'myproofs',
  setActiveTab: () => {},
});

export const useProfile = () => useContext(ProfileContext);
