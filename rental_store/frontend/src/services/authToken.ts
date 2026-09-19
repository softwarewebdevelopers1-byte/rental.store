export function getAuthToken(): string | null {
  return localStorage.getItem("auth.token");
}
