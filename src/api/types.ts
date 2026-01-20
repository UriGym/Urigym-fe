// API Response Types

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface GymResponse {
  id: string;
  name: string;
  category: string;
  address: string;
  description?: string;
  phone?: string;
  imageUrl?: string;
  isOpen: boolean;
  lat?: number;
  lng?: number;
  memberCount: number;
  rating: number;
  reviewCount: number;
  priceMin?: number;
  priceMax?: number;
  tags: string[];
}

export interface UserResponse {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
}

export interface ReviewResponse {
  id: string;
  gymId: string;
  userId: string;
  userName: string;
  rating: number;
  content?: string;
  createdAt: string;
}

export interface AttendanceResponse {
  id: string;
  gymId: string;
  gymName: string;
  checkInTime: string;
  checkInMethod: string;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserResponse;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface ReviewCreateRequest {
  rating: number;
  content?: string;
}

export interface CheckInRequest {
  gymId: string;
  checkInMethod?: string;
}
