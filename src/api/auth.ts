import apiClient from './client';
import type { AuthResponse, LoginRequest, SignupRequest, UserResponse } from './types';

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

  // 로그아웃
  logout: () => {
    apiClient.setToken(null);
  },

  // 내 정보 조회
  getMe: async () => {
    const response = await apiClient.get<UserResponse>('/users/me');
    return response.data;
  },

  // 내 정보 수정
  updateMe: async (data: Partial<UserResponse>) => {
    const response = await apiClient.put<UserResponse>('/users/me', data);
    return response.data;
  },

  // 토큰 확인
  isAuthenticated: () => {
    return !!apiClient.getToken();
  },
};

export default authApi;
