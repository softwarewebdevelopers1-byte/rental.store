import { API_BASE_URL, ApiError } from "./apiClient";
import { getAuthToken } from "./authToken";

export type UploadFolder =
  | "hostels"
  | "products"
  | "packs"
  | "avatars"
  | "maintenance"
  | "messages"
  | "conflicts";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const uploadService = {
  async upload(file: File, folder: UploadFolder): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = response.statusText;
      try {
        const payload = JSON.parse(text) as { error?: unknown };
        if (typeof payload.error === "string") message = payload.error;
      } catch {
        /* non-JSON response body */
      }
      throw new ApiError(message, response.status);
    }

    const payload = (await response.json()) as { url: string };
    return payload.url;
  },

  async remove(url: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/uploads?url=${encodeURIComponent(url)}`,
      { method: "DELETE", headers: authHeaders() },
    );
    if (!response.ok) {
      throw new ApiError("Unable to remove uploaded file", response.status);
    }
  },
};
