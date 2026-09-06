import apiClient from './client';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  OAuthProviderName,
  SignupRequest,
  UserResponse,
  UserUpdateRequest,
} from './types';

export const authApi = {
  // 회원가입
  signup: async (data: SignupRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    if (response.data?.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response.data;
  },

  // 로그인
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data?.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response.data;
  },

  // 소셜 로그인 (카카오/네이버 SDK가 발급한 액세스 토큰으로 로그인 또는 자동 가입)
  oauthLogin: async (provider: OAuthProviderName, accessToken: string) => {
    const response = await apiClient.post<AuthResponse>(`/auth/oauth/${provider}`, { accessToken });
    if (response.data?.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }
    return response.data;
  },

  // 로그아웃
  logout: () => {
    apiClient.setToken(null);
  },

  // 내 정보 조회
  // silent: 401이어도 토스트/리다이렉트 없이 조용히 실패시킨다 (앱 부팅 시 배경 세션 체크용)
  getMe: async (options?: { silent?: boolean }) => {
    const response = await apiClient.get<UserResponse>('/users/me', options);
    return response.data;
  },

  // 내 정보 수정
  updateMe: async (data: UserUpdateRequest) => {
    const response = await apiClient.put<UserResponse>('/users/me', data);
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (data: ChangePasswordRequest) => {
    await apiClient.put<void>('/users/me/password', data);
  },

  // 전화번호 인증번호 발송 (SMS 연동 전까지는 서버 로그에 인증번호가 찍힘)
  sendPhoneCode: async (phone: string) => {
    await apiClient.post<void>('/users/me/phone/verify-code', { phone });
  },

  // 전화번호 인증번호 확인
  confirmPhoneCode: async (phone: string, code: string) => {
    const response = await apiClient.post<UserResponse>('/users/me/phone/confirm-code', { phone, code });
    return response.data;
  },

  // 토큰 확인
  isAuthenticated: () => {
    return !!apiClient.getToken();
  },
};

export default authApi;
