import apiClient from './client';
import type { AttendanceResponse, PageResponse, CheckInRequest } from './types';

export const attendanceApi = {
  // 내 출석 기록 조회
  getMyAttendances: async (page = 0, size = 20) => {
    const response = await apiClient.get<PageResponse<AttendanceResponse>>(
      `/attendances?page=${page}&size=${size}`
    );
    return response.data;
  },

  // 월간 출석 기록 조회
  getMonthlyAttendances: async (year: number, month: number) => {
    const response = await apiClient.get<AttendanceResponse[]>(
      `/attendances/monthly?year=${year}&month=${month}`
    );
    return response.data;
  },

  // 총 출석 횟수 조회
  getTotalCount: async () => {
    const response = await apiClient.get<number>('/attendances/count');
    return response.data;
  },

  // 출석 체크
  checkIn: async (data: CheckInRequest) => {
    const response = await apiClient.post<AttendanceResponse>('/attendances', data);
    return response.data;
  },
};

export default attendanceApi;
