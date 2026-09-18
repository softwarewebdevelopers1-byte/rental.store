// Placeholder for future HTTP client. Currently unused by mock services
// but exported so a real implementation can be swapped in.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

// Deliberately not implemented yet — mock services replace this.
export const apiClient: ApiClient | null = null;
