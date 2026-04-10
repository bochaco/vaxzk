import { createContext, useContext, useState } from 'react';
import Select from 'react-select'

const options = [
  { value: 'amdin', label: 'Amdin' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'user', label: 'User' },
]

interface ProfileContextValue {
  profile: string;
  setProfile: (profile: string) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: 'user',
  setProfile: () => {},
});

export function ProfileSelector({ fixed = false }: { fixed?: boolean }) {
  const { profile, setProfile } = useProfile();
  return (
    <div className={`flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-slate-200/60 ${fixed ? 'fixed top-3 right-4 z-[100]' : ''}`}>
        <Select id={profile} options={options} onChange={setProfile} />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext);
