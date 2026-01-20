import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/api/auth';
import type { UserResponse, LoginRequest, SignupRequest } from '@/api/types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          authApi.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    setUser(response.user);
  };

  const signup = async (data: SignupRequest) => {
    const response = await authApi.signup(data);
    setUser(response.user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
