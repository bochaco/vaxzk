import { createContext, useContext, useState } from 'react';

const ProfileOptions = [
  { code: 'admin', label: 'Admin' },
  { code: 'clinic', label: 'Clinic' },
  { code: 'user', label: 'User' },
]
export type Profile = 'admin' | 'clinic' | 'user';

interface ProfileContextValue {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: 'user',
  setProfile: () => {},
});

export function ProfileSelector({ fixed = false }: { fixed?: boolean }) {
  const {profile, setProfile} = useProfile();
  return (
    <div className={`flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-slate-200/60 ${fixed ? 'fixed top-3 right-4 z-[100]' : ''}`}>
        <select style={{ border: 0 }} defaultValue={profile} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors bg-primary" onChange={(e) => setProfile(e.target.value as Profile)}>
        {ProfileOptions.map(({ code, label }) => (
            <option value={code}>{label}</option>
        ))}
        </select>
    </div>
  );
}

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile>('user');

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext);
