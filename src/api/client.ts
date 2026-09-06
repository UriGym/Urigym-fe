import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/** Thrown on any non-2xx response so callers can branch on `status` instead of parsing messages. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Module-level (not per-instance) so concurrent 401s from parallel requests only
// trigger one toast + redirect instead of one per failed request.
let isHandlingUnauthorized = false;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    silent = false
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) this.handleUnauthorized(silent);
      throw new ApiError(response.status, data.message || 'API request failed');
    }

    return data;
  }

  /**
   * Session expired or was never valid: clear the token.
   * `silent` skips the toast + redirect — used for background checks (e.g. app-boot
   * session probe) where the user isn't actively doing something that requires auth,
   * so they should just fall back to logged-out state on the page they're already on.
   */
  private handleUnauthorized(silent = false) {
    this.setToken(null);
    if (silent) return;
    if (isHandlingUnauthorized) return;
    isHandlingUnauthorized = true;
    toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
    window.location.href = '/login';
  }

  async get<T>(endpoint: string, options?: { silent?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, options?.silent);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /** Multipart upload — the browser sets its own Content-Type boundary. */
  async upload<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) this.handleUnauthorized();
      throw new ApiError(response.status, data.message || '파일 업로드에 실패했습니다.');
    }
    return data;
  }

  /** Absolute URL for a stored file path such as "/files/abc.png". */
  fileUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${this.baseUrl.replace(/\/api$/, '')}${path}`;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
