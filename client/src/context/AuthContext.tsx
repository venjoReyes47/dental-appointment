import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { checkAuth, login as apiLogin, logout as apiLogout, register as registerAccount } from '../apis/services';
import Loading from '../components/shared/Loading';
import type { AuthUser, LoginResponse, RegisterPayload } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: RegisterPayload) => Promise<unknown>;
  logout: () => Promise<void>;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try { setUser((await checkAuth()).data.user); }
      catch { setUser(null); }
      finally { setLoading(false); }
    };
    void verify();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setUser(result.data.user);
    return result;
  };

  const register = async (data: RegisterPayload) => registerAccount(data);
  const logout = async () => { await apiLogout(); setUser(null); };
  const getToken = () => document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1];
  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout, getToken }), [user, loading]);

  if (loading) return <Loading />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
