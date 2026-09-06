import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/api/auth';
import type { LoginRequest, OAuthProviderName, SignupRequest, UserResponse, UserUpdateRequest } from '@/api/types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  loginWithOAuth: (provider: OAuthProviderName, accessToken: string) => Promise<void>;
  updateProfile: (data: UserUpdateRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
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
          // 부팅 시 배경 세션 체크: 만료 토큰이어도 조용히 로그아웃 상태로만 전환한다
          // (전역 401 토스트/리다이렉트는 사용자가 실제로 인증 필요한 동작을 할 때만 뜨게 함)
          const userData = await authApi.getMe({ silent: true });
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

  const loginWithOAuth = async (provider: OAuthProviderName, accessToken: string) => {
    const response = await authApi.oauthLogin(provider, accessToken);
    setUser(response.user);
  };

  const updateProfile = async (data: UserUpdateRequest) => {
    const updated = await authApi.updateMe(data);
    if (updated) setUser(updated);
  };

  const refreshUser = async () => {
    const fresh = await authApi.getMe();
    if (fresh) setUser(fresh);
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
        loginWithOAuth,
        updateProfile,
        refreshUser,
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
