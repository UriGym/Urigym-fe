import apiClient from './client';
import type {
  GymResponse,
  MyMembershipResponse,
  NotificationResponse,
  OwnerApplicationRequest,
  OwnerApplicationResponse,
  PageResponse,
  ReportCreateRequest,
  ReportResponse,
} from './types';

export const notificationsApi = {
  list: async (page = 0, size = 20) =>
    (await apiClient.get<PageResponse<NotificationResponse>>(
      `/notifications?page=${page}&size=${size}`
    )).data,

  unreadCount: async () => (await apiClient.get<number>('/notifications/unread-count')).data,

  markAsRead: async (id: string) => apiClient.patch<void>(`/notifications/${id}/read`),
};

export const ownerApplicationsApi = {
  apply: async (data: OwnerApplicationRequest) =>
    (await apiClient.post<OwnerApplicationResponse>('/owner-applications', data)).data,

  getMine: async () =>
    (await apiClient.get<OwnerApplicationResponse | null>('/owner-applications/me')).data,
};

export const reportsApi = {
  create: async (data: ReportCreateRequest) =>
    (await apiClient.post<ReportResponse>('/reports', data)).data,

  getMine: async (page = 0, size = 20) =>
    (await apiClient.get<PageResponse<ReportResponse>>(`/reports/me?page=${page}&size=${size}`)).data,
};

export const membershipsApi = {
  getMyGyms: async () => (await apiClient.get<GymResponse[]>('/memberships/my-gyms')).data,

  getMine: async () => (await apiClient.get<MyMembershipResponse[]>('/memberships/mine')).data,

  cancel: async (membershipId: string) =>
    apiClient.delete<void>(`/memberships/mine/${membershipId}`),
};

export const uploadsApi = {
  upload: async (file: File) => {
    const result = await apiClient.upload<{ url: string }>('/uploads', file);
    return result.data?.url ?? '';
  },
};
