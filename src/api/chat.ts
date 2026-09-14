import apiClient from './client';
import type { ChatMessageResponse, ChatRoomResponse } from './types';

export const chatApi = {
  // 체육관에 대한 채팅방 생성 또는 기존 방 조회 (문의자가 최초 진입 시 자동 생성)
  createOrGetChatRoom: async (gymId: string) =>
    (await apiClient.post<ChatRoomResponse>('/chat/rooms', { gymId })).data,

  // 내 채팅방 목록 (문의자/관장 역할 무관 — 내가 속한 방 전체)
  getChatRooms: async () => (await apiClient.get<ChatRoomResponse[]>('/chat/rooms')).data,

  // 메시지 목록 조회 (서버가 조회 시점에 안읽은 메시지를 자동으로 읽음 처리함)
  getChatMessages: async (roomId: string) =>
    (await apiClient.get<ChatMessageResponse[]>(`/chat/rooms/${roomId}/messages`)).data,

  // 메시지 전송
  sendChatMessage: async (roomId: string, content: string) =>
    (await apiClient.post<ChatMessageResponse>(`/chat/rooms/${roomId}/messages`, { content })).data,
};

export default chatApi;
