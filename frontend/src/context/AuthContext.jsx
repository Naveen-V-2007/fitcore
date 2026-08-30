import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadSession() {
    const session = await authApi.getSession();
    setUser(session?.user ?? null);
    if (session?.user) setProfile(await authApi.getCurrentProfile());
    setLoading(false);
  }

  useEffect(() => {
    loadSession();
    const subscription = authApi.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setProfile(session?.user ? await authApi.getCurrentProfile() : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function login(email, password) { await authApi.login(email, password); }
  async function logout() { await authApi.logout(); }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
