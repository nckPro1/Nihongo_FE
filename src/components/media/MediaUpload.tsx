import { useState, useRef } from 'react'
import { adminApiClient } from '../../api/adminClient'
import type { ApiResponse } from '../../types/common'
import './MediaUpload.css'

interface MediaUploadResponse {
  secureUrl: string
  publicId: string
  format: string
  resourceType: string
  width?: number
  height?: number
}

interface MediaUploadProps {
  label: string
  accept: string
  folder: string
  currentUrl?: string
  onUploadSuccess: (url: string) => void
  type?: 'image' | 'video'
}

export function MediaUpload({
  label,
  accept,
  folder,
  currentUrl,
  onUploadSuccess,
  type = 'image'
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState(currentUrl || '')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // Validate file size (max 50MB for video, 10MB for image)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File quá lớn. Tối đa ${type === 'video' ? '50MB' : '10MB'}`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await adminApiClient.post<ApiResponse<MediaUploadResponse>>(
        '/media/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      console.log('Upload response:', res.data)

      if (res.data.success && res.data.data) {
        const uploadedUrl = res.data.data.secureUrl
        console.log('Upload successful, URL:', uploadedUrl)
        setPreview(uploadedUrl)
        onUploadSuccess(uploadedUrl)
      } else {
        console.error('Upload failed - response:', res.data)
        setError('Upload thất bại')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      setError(err.response?.data?.message || err.message || 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className="media-upload">
      <label className="media-upload-label">{label}</label>

      {preview && (
        <div className="media-upload-preview">
          {type === 'image' ? (
            <img src={preview} alt="Preview" />
          ) : (
            <video src={preview} controls />
          )}
        </div>
      )}

      <div
        className={`media-upload-dropzone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="media-upload-input-hidden"
        />

        <div className="media-upload-dropzone-content">
          {uploading ? (
            <>
              <div className="media-upload-spinner"></div>
              <p className="media-upload-text">Đang upload...</p>
            </>
          ) : (
            <>
              <svg className="media-upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="media-upload-text">
                <span className="media-upload-browse">Chọn file</span> hoặc kéo thả vào đây
              </p>
              <p className="media-upload-hint">
                {type === 'image' ? 'PNG, JPG, GIF, WebP (tối đa 10MB)' : 'MP4, WebM, MOV (tối đa 50MB)'}
              </p>
            </>
          )}
        </div>
      </div>

      {error && <p className="media-upload-error">{error}</p>}

      {preview && (
        <p className="media-upload-url">
          <small>{preview}</small>
        </p>
      )}
    </div>
  )
}
