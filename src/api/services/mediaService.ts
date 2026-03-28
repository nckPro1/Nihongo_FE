import { apiClient } from '../client'
import type { ApiResponse } from '../../types/auth'
import type { MediaUploadData } from '../../types/media'

/**
 * Upload ảnh hoặc video lên Cloudinary (thư mục con tùy chọn, ví dụ flashcards/lesson-1).
 * Cần JWT; server phải bật Cloudinary.
 */
export async function uploadMedia(file: File, folder?: string): Promise<ApiResponse<MediaUploadData>> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<ApiResponse<MediaUploadData>>('/media/upload', form, {
    params: folder ? { folder } : undefined,
  })
  return data
}
