import apiClient from './client';
import type {
  AnnouncementResponse,
  EventResponse,
  GymResponse,
  MembershipPlanResponse,
  PageResponse,
  ReviewResponse,
} from './types';

export const gymsApi = {
  // 체육관 목록 조회
  getAll: async (page = 0, size = 10) => {
    const response = await apiClient.get<PageResponse<GymResponse>>(
      `/gyms?page=${page}&size=${size}`
    );
    return response.data;
  },

  // AI 추천 랭킹 조회
  getRanked: async (limit = 5) => {
    const response = await apiClient.get<GymResponse[]>(`/gyms/ranked?limit=${limit}`);
    return response.data;
  },

  // 체육관 상세 조회
  getById: async (id: string) => {
    const response = await apiClient.get<GymResponse>(`/gyms/${id}`);
    return response.data;
  },

  // 카테고리별 체육관 조회
  getByCategory: async (category: string, page = 0, size = 10) => {
    const response = await apiClient.get<PageResponse<GymResponse>>(
      `/gyms/category/${category}?page=${page}&size=${size}`
    );
    return response.data;
  },

  // 체육관 검색
  search: async (keyword: string, page = 0, size = 10) => {
    const response = await apiClient.get<PageResponse<GymResponse>>(
      `/gyms/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
    return response.data;
  },

  // 위치 기반 체육관 조회
  getByLocation: async (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => {
    const response = await apiClient.get<GymResponse[]>(
      `/gyms/location?minLat=${bounds.minLat}&maxLat=${bounds.maxLat}&minLng=${bounds.minLng}&maxLng=${bounds.maxLng}`
    );
    return response.data;
  },

  // 체육관 리뷰 조회
  getReviews: async (gymId: string, page = 0, size = 10) => {
    const response = await apiClient.get<PageResponse<ReviewResponse>>(
      `/gyms/${gymId}/reviews?page=${page}&size=${size}`
    );
    return response.data;
  },

  // 리뷰 작성
  createReview: async (gymId: string, rating: number, content?: string) => {
    const response = await apiClient.post<ReviewResponse>(`/gyms/${gymId}/reviews`, {
      rating,
      content,
    });
    return response.data;
  },

  // 체육관 공지사항 조회
  getAnnouncements: async (gymId: string, page = 0, size = 10) => {
    const response = await apiClient.get<PageResponse<AnnouncementResponse>>(
      `/gyms/${gymId}/announcements?page=${page}&size=${size}`
    );
    return response.data;
  },

  // 체육관 예정 이벤트 조회
  getEvents: async (gymId: string) => {
    const response = await apiClient.get<EventResponse[]>(`/gyms/${gymId}/events`);
    return response.data;
  },

  // 회원권(기간별 가격) 조회
  getMembershipPlans: async (gymId: string) => {
    const response = await apiClient.get<MembershipPlanResponse[]>(`/gyms/${gymId}/membership-plans`);
    return response.data;
  },
};

export default gymsApi;
