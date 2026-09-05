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

export type AppRole = 'USER' | 'OWNER' | 'ADMIN';

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
  favoriteCount?: number;
  priceMin?: number;
  priceMax?: number;
  tags: string[];
  reportCount: number;
  suspendedUntil?: string | null;
  ownerId?: string;
  /** Only present on the ranked listing. */
  rankScore?: number | null;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  avatarUrl?: string;
  role: AppRole;
  notifyAnnouncements?: boolean;
  notifyMessages?: boolean;
  /** False for accounts created purely through social login. */
  hasPassword?: boolean;
  createdAt?: string;
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

export type CheckInMethod = 'PHONE' | 'QR' | 'FACE' | 'NFC';

export interface AttendanceResponse {
  id: string;
  gymId: string;
  gymName: string;
  checkInTime: string;
  checkInMethod: CheckInMethod;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
}

export interface EventResponse {
  id: string;
  gymId: string;
  title: string;
  description?: string;
  eventDate: string;
  createdAt: string;
}

export interface GymMemberResponse {
  id: string;
  gymId: string;
  userId: string;
  userName?: string;
  userEmail: string;
  userPhone?: string;
  status: string;
  joinedAt: string;
  expiresAt?: string | null;
  lastCheckInTime?: string | null;
  attendanceCount?: number;
  attendanceRate?: number;
  daysSinceLastCheckIn?: number | null;
}

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OwnerApplicationResponse {
  id: string;
  userId: string;
  userName?: string;
  userEmail: string;
  userPhone?: string;
  businessRegImageUrl: string;
  licenseImageUrl: string;
  businessNumber?: string;
  status: ApplicationStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export type ReportCategory = 'PRICE_MISMATCH' | 'FACILITY' | 'STAFF' | 'OTHER' | 'INQUIRY';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'REJECTED';

export interface ReportResponse {
  id: string;
  reporterId: string;
  reporterName?: string;
  gymId?: string | null;
  gymName?: string | null;
  category: ReportCategory;
  title: string;
  content: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export type NotificationType = 'ANNOUNCEMENT' | 'MESSAGE' | 'SYSTEM';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  relatedGymId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type MessageTarget = 'ALL' | 'SELECTED';

export interface GroupMessageResponse {
  id: string;
  gymId: string;
  title: string;
  content: string;
  targetType: MessageTarget;
  recipientCount: number;
  createdAt: string;
}

export type OAuthProviderName = 'KAKAO' | 'NAVER';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface MembershipPlanResponse {
  id: string;
  gymId: string;
  name: string;
  price: number;
  description?: string;
}

export interface MembershipPlanRequest {
  name: string;
  price: number;
  description?: string;
}

export interface MyMembershipResponse {
  id: string;
  gym: GymResponse;
  status: string;
  joinedAt: string;
  expiresAt?: string | null;
  lastCheckInTime?: string | null;
  attendanceCount: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface OrderResponse {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
}

export interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface OwnerGymStats {
  memberCount: number;
  todayAttendance: number;
  rating: number;
  absentMemberCount: number;
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
  address?: string;
}

export interface UserUpdateRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  notifyAnnouncements?: boolean;
  notifyMessages?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ReviewCreateRequest {
  rating: number;
  content?: string;
}

export interface CheckInRequest {
  gymId: string;
  checkInMethod: CheckInMethod;
  phoneNumber?: string;
}

export interface GymOwnerRequest {
  name: string;
  category: string;
  address: string;
  description?: string;
  phone?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  priceMin: number;
  priceMax?: number;
  isOpen?: boolean;
  tags?: string[];
}

export interface GymMemberRequest {
  userEmail: string;
  status?: string;
  expiresAt?: string | null;
}

export interface AnnouncementRequest {
  title: string;
  content: string;
}

export interface EventRequest {
  title: string;
  description?: string;
  eventDate: string;
}

export interface GroupMessageRequest {
  title: string;
  content: string;
  targetType: MessageTarget;
  memberIds?: string[];
}

export interface OwnerApplicationRequest {
  businessRegImageUrl: string;
  licenseImageUrl?: string;
  businessNumber: string;
}

export interface ReportCreateRequest {
  gymId?: string;
  category: ReportCategory;
  title: string;
  content: string;
}

export interface FavoriteStatusResponse {
  favorited: boolean;
}
