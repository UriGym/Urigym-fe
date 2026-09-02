import apiClient from './client';
import type {
  AnnouncementRequest,
  AnnouncementResponse,
  AttendanceResponse,
  EventRequest,
  EventResponse,
  GroupMessageRequest,
  GroupMessageResponse,
  GymMemberRequest,
  GymMemberResponse,
  GymOwnerRequest,
  GymResponse,
  MembershipPlanRequest,
  MembershipPlanResponse,
  OwnerGymStats,
  PageResponse,
  ReviewResponse,
} from './types';

export const ownerApi = {
  // 체육관
  getMyGyms: async () => (await apiClient.get<GymResponse[]>('/owner/gyms')).data,

  createGym: async (data: GymOwnerRequest) =>
    (await apiClient.post<GymResponse>('/owner/gyms', data)).data,

  updateGym: async (gymId: string, data: GymOwnerRequest) =>
    (await apiClient.put<GymResponse>(`/owner/gyms/${gymId}`, data)).data,

  deleteGym: async (gymId: string) => apiClient.delete<void>(`/owner/gyms/${gymId}`),

  // 통계
  getStats: async (gymId: string, absentDays = 7) =>
    (await apiClient.get<OwnerGymStats>(`/owner/gyms/${gymId}/stats?absentDays=${absentDays}`)).data,

  // 관원
  getMembers: async (gymId: string) =>
    (await apiClient.get<GymMemberResponse[]>(`/owner/gyms/${gymId}/members`)).data,

  getAbsentMembers: async (gymId: string, days = 7) =>
    (await apiClient.get<GymMemberResponse[]>(`/owner/gyms/${gymId}/members/absent?days=${days}`)).data,

  addMember: async (gymId: string, data: GymMemberRequest) =>
    (await apiClient.post<GymMemberResponse>(`/owner/gyms/${gymId}/members`, data)).data,

  updateMember: async (gymId: string, memberId: string, data: GymMemberRequest) =>
    (await apiClient.put<GymMemberResponse>(`/owner/gyms/${gymId}/members/${memberId}`, data)).data,

  removeMember: async (gymId: string, memberId: string) =>
    apiClient.delete<void>(`/owner/gyms/${gymId}/members/${memberId}`),

  // 회원권
  createMembershipPlan: async (gymId: string, data: MembershipPlanRequest) =>
    (await apiClient.post<MembershipPlanResponse>(`/owner/gyms/${gymId}/membership-plans`, data)).data,

  updateMembershipPlan: async (gymId: string, planId: string, data: MembershipPlanRequest) =>
    (await apiClient.put<MembershipPlanResponse>(
      `/owner/gyms/${gymId}/membership-plans/${planId}`,
      data
    )).data,

  deleteMembershipPlan: async (gymId: string, planId: string) =>
    apiClient.delete<void>(`/owner/gyms/${gymId}/membership-plans/${planId}`),

  // 공지
  createAnnouncement: async (gymId: string, data: AnnouncementRequest) =>
    (await apiClient.post<AnnouncementResponse>(`/owner/gyms/${gymId}/announcements`, data)).data,

  updateAnnouncement: async (gymId: string, announcementId: string, data: AnnouncementRequest) =>
    (await apiClient.put<AnnouncementResponse>(`/owner/gyms/${gymId}/announcements/${announcementId}`, data)).data,

  deleteAnnouncement: async (gymId: string, announcementId: string) =>
    apiClient.delete<void>(`/owner/gyms/${gymId}/announcements/${announcementId}`),

  // 이벤트
  createEvent: async (gymId: string, data: EventRequest) =>
    (await apiClient.post<EventResponse>(`/owner/gyms/${gymId}/events`, data)).data,

  deleteEvent: async (gymId: string, eventId: string) =>
    apiClient.delete<void>(`/owner/gyms/${gymId}/events/${eventId}`),

  // 단체 메시지
  sendGroupMessage: async (gymId: string, data: GroupMessageRequest) =>
    (await apiClient.post<GroupMessageResponse>(`/owner/gyms/${gymId}/messages`, data)).data,

  getGroupMessages: async (gymId: string, page = 0, size = 20) =>
    (await apiClient.get<PageResponse<GroupMessageResponse>>(
      `/owner/gyms/${gymId}/messages?page=${page}&size=${size}`
    )).data,

  // 조회 전용
  getReviews: async (gymId: string, page = 0, size = 20) =>
    (await apiClient.get<PageResponse<ReviewResponse>>(
      `/owner/gyms/${gymId}/reviews?page=${page}&size=${size}`
    )).data,

  getAttendances: async (gymId: string, page = 0, size = 50) =>
    (await apiClient.get<PageResponse<AttendanceResponse>>(
      `/owner/gyms/${gymId}/attendances?page=${page}&size=${size}`
    )).data,
};

export default ownerApi;
