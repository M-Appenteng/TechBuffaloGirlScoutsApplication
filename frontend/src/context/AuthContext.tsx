import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '../lib/api';
import { setAuthToken } from '../lib/api';

interface AuthContextValue {
  profile: Profile | null;
  signIn: (profile: Profile, token: string) => void;
  setProfile: (profile: Profile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PROFILE_KEY = 'gsva.profile';
const TOKEN_KEY = 'gsva.token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }, [profile]);

  const setProfile = (next: Profile | null) => setProfileState(next);

  const signIn = (nextProfile: Profile, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setProfileState(nextProfile);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setProfileState(null);
  };

  return <AuthContext.Provider value={{ profile, signIn, setProfile, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
