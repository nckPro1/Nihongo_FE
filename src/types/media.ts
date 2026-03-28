/** Phản hồi upload Cloudinary (khớp backend MediaUploadResponse). */
export interface MediaUploadData {
  publicId: string
  secureUrl: string
  resourceType: string
  format?: string | null
  width?: number | null
  height?: number | null
  duration?: number | null
}
