import { createContext, useContext } from 'react';

const ProfileOptions = [
  { code: 'admin', label: 'Admin' },
  { code: 'clinic', label: 'Clinic' },
  { code: 'user', label: 'User' },
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
        <select class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors bg-primary" id={profile} onChange={setProfile}>
        {ProfileOptions.map(({ code, label }) => (
            <option value={code}>{label}</option>
        ))}
        </select>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext);
