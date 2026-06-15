import { apiRequest, apiGet, type ApiResponse } from "~/lib/api.client";

export { apiGet, apiRequest };
export type { ApiResponse };

export async function apiPost<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { method: "POST", data });
}
export async function apiPut<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { method: "PUT", data });
}
export async function apiPatch<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { method: "PATCH", data });
}
export async function apiDelete<T = any>(path: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { method: "DELETE" });
}

/** Upload an image file to the uploader service, returns the resolved URL. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiRequest<{ url: string; path: string }>("/api/uploader/image", {
    method: "POST",
    data: form,
  });
  if (!res.success || !res.data?.url) {
    throw new Error(res.message || "Upload failed");
  }
  return res.data.url;
}
