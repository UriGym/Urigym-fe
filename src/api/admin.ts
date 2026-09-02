import apiClient from './client';
import type {
  ApplicationStatus,
  GymResponse,
  OwnerApplicationResponse,
  PageResponse,
  ReportResponse,
  ReportStatus,
  UserResponse,
  UserUpdateRequest,
} from './types';

export const adminApi = {
  // 사용자
  getUsers: async (keyword = '', page = 0, size = 20) => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (keyword) query.set('keyword', keyword);
    return (await apiClient.get<PageResponse<UserResponse>>(`/admin/users?${query}`)).data;
  },

  updateUser: async (userId: string, data: UserUpdateRequest) =>
    (await apiClient.put<UserResponse>(`/admin/users/${userId}`, data)).data,

  deleteUser: async (userId: string) => apiClient.delete<void>(`/admin/users/${userId}`),

  // 관장 신청
  getOwnerApplications: async (status?: ApplicationStatus, page = 0, size = 20) => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) query.set('status', status);
    return (await apiClient.get<PageResponse<OwnerApplicationResponse>>(
      `/admin/owner-applications?${query}`
    )).data;
  },

  reviewOwnerApplication: async (applicationId: string, approve: boolean, adminNote?: string) =>
    (await apiClient.put<OwnerApplicationResponse>(`/admin/owner-applications/${applicationId}`, {
      approve,
      adminNote,
    })).data,

  // 신고 / 문의
  getReports: async (status?: ReportStatus, page = 0, size = 20) => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) query.set('status', status);
    return (await apiClient.get<PageResponse<ReportResponse>>(`/admin/reports?${query}`)).data;
  },

  updateReportStatus: async (reportId: string, status: ReportStatus, adminNote?: string) =>
    (await apiClient.put<ReportResponse>(`/admin/reports/${reportId}`, { status, adminNote })).data,

  // 체육관 노출 정지
  getAllGyms: async (page = 0, size = 20) =>
    (await apiClient.get<PageResponse<GymResponse>>(`/admin/gyms?page=${page}&size=${size}`)).data,

  suspendGym: async (gymId: string, days: number) =>
    (await apiClient.put<GymResponse>(`/admin/gyms/${gymId}/suspend?days=${days}`)).data,

  unsuspendGym: async (gymId: string) =>
    (await apiClient.put<GymResponse>(`/admin/gyms/${gymId}/unsuspend`)).data,
};

export default adminApi;
