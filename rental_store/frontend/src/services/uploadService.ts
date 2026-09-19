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

export const uploadService = {
  async upload(file: File, folder: UploadFolder): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = response.statusText;
      try {
        const payload = JSON.parse(text) as { error?: unknown };
        if (payload && typeof payload.error === "string") {
          message = payload.error;
        }
      } catch {
        /* non-JSON response body */
      }
      throw new ApiError(message, response.status);
    }

    const payload = (await response.json()) as { url: string };
    return payload.url;
  },
};
