import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { ApiResponse } from "@/types/api";

export interface UploadMediaResponse {
  url: string;
  key: string;
  filename: string;
  content_type: string;
  size: number;
}

/**
 * Upload a media file through the backend to MinIO storage.
 * @param file The file to upload (JPEG, PNG, WEBP, PDF, etc.)
 * @param folder Target folder prefix in storage (default: "catalogs")
 */
export async function uploadMedia(
  file: File,
  folder: string = "catalogs"
): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<ApiResponse<UploadMediaResponse>>(
    `${endpoints.media.upload}?folder=${encodeURIComponent(folder)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const payload = res.data;
  if (!payload || !payload.success) {
    const errorMsg =
      (!payload?.success && payload?.error?.message) ||
      "Gagal mengunggah file. Respon server tidak valid.";
    throw new Error(errorMsg);
  }

  return payload.data;
}

/**
 * Delete a media file from MinIO storage via backend API.
 * @param key The storage object key, e.g. "catalogs/user-id/uuid.jpg"
 */
export async function deleteMedia(key: string): Promise<void> {
  if (!key) return;
  await apiClient.delete(`${endpoints.media.upload}?key=${encodeURIComponent(key)}`);
}
