import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { blogService } from '../../api/services/blogService'
import { RichTextEditor } from '../../components/editor/RichTextEditor'
import { MediaUpload } from '../../components/media/MediaUpload'
import type { BlogTag, PostType, PostStatus } from '../../types/blog'
import '../admin/admin.css'

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'ARTICLE', label: '📝 Bài viết' },
  { value: 'VIDEO_LESSON', label: '🎥 Video bài học' },
  { value: 'COURSE_AD', label: '📢 Quảng cáo khóa học' },
  { value: 'NEWS', label: '📰 Tin tức' },
  { value: 'TUTORIAL', label: '📚 Hướng dẫn' }
]

const STATUSES: { value: PostStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Nháp (Draft)' },
  { value: 'PUBLISHED', label: 'Xuất bản (Published)' },
  { value: 'ARCHIVED', label: 'Lưu trữ (Archived)' }
]

export function AdminBlogEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [postType, setPostType] = useState<PostType>('ARTICLE')
  const [status, setStatus] = useState<PostStatus>('DRAFT')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [featuredImage, setFeaturedImage] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDuration, setVideoDuration] = useState<number | ''>('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')

  // Reference data
  const [tags, setTags] = useState<BlogTag[]>([])

  // Load tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagRes = await blogService.getTags()
        if (tagRes.success && tagRes.data) setTags(tagRes.data)
      } catch (err) {
        console.error('Failed to load tags:', err)
      }
    }
    void loadTags()
  }, [])

  // Load existing post if editing
  useEffect(() => {
    if (!isEdit || !id) return

    const loadPost = async () => {
      setLoading(true)
      try {
        const res = await blogService.getPostById(Number(id))
        if (res.success && res.data) {
          const post = res.data
          setTitle(post.title)
          setContent(post.content)
          setExcerpt(post.excerpt)
          setPostType(post.postType)
          setStatus(post.status)
          setSelectedTags(post.tags.map((t: { id: number }) => t.id))
          setFeaturedImage(post.featuredImage || '')
          setVideoUrl(post.videoUrl || '')
          setVideoDuration(post.videoDurationMinutes || '')
          setMetaTitle(post.metaTitle || '')
          setMetaDescription(post.metaDescription || '')
          setMetaKeywords(post.metaKeywords || '')
        } else {
          setError('Không tải được bài viết')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải bài viết')
      } finally {
        setLoading(false)
      }
    }
    void loadPost()
  }, [isEdit, id])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        postType,
        status,
        tagIds: selectedTags,
        featuredImage: featuredImage.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        videoDurationMinutes: videoDuration ? Number(videoDuration) : undefined,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        metaKeywords: metaKeywords.trim() || undefined
      }

      if (isEdit && id) {
        await blogService.updatePost(Number(id), { ...payload, id: Number(id) })
      } else {
        await blogService.createPost(payload)
      }

      navigate('/admin/blog')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu bài viết')
    } finally {
      setLoading(false)
    }
  }, [title, content, excerpt, postType, status, selectedTags, featuredImage, videoUrl, videoDuration, metaTitle, metaDescription, metaKeywords, isEdit, id, navigate])

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  if (loading && isEdit) {
    return (
      <div className="admin-main-header">
        <p className="admin-muted">Đang tải bài viết...</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/blog')}
          style={{
            background: 'none',
            border: 'none',
            color: '#4a5568',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '0.25rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#3182ce')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#4a5568')}
        >
          ← Quay lại danh sách bài viết
        </button>
      </div>

      <div className="admin-main-header">
        <h1>{isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
        <p className="admin-main-subtitle">
          {isEdit ? 'Cập nhật nội dung bài viết' : 'Viết nội dung mới cho blog'}
        </p>
      </div>

      {error ? <p className="admin-err">{error}</p> : null}

      <form onSubmit={e => void handleSubmit(e)}>
        <div className="admin-table-wrap" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Title */}
            <div className="admin-field">
              <label htmlFor="title">Tiêu đề bài viết *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề hấp dẫn..."
                required
              />
            </div>

            {/* Excerpt */}
            <div className="admin-field">
              <label htmlFor="excerpt">Tóm tắt ngắn (Excerpt) *</label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Tóm tắt ngắn gọn nội dung bài viết (1-2 câu)"
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Content Editor */}
            <div className="admin-field">
              <label>Nội dung bài viết *</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </div>

            {/* Post Type & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="admin-field">
                <label htmlFor="postType">Loại bài viết *</label>
                <select
                  id="postType"
                  value={postType}
                  onChange={e => setPostType(e.target.value as PostType)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.95rem'
                  }}
                >
                  {POST_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="status">Trạng thái *</label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value as PostStatus)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.95rem'
                  }}
                >
                  {STATUSES.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="admin-field">
              <label>Tags (Chọn nhiều)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '999px',
                      border: '2px solid',
                      borderColor: selectedTags.includes(tag.id) ? '#667eea' : '#e2e8f0',
                      background: selectedTags.includes(tag.id) ? '#667eea' : '#ffffff',
                      color: selectedTags.includes(tag.id) ? '#ffffff' : '#4a5568',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Image */}
            <MediaUpload
              label="Ảnh đại diện (Featured Image)"
              accept="image/*"
              folder="blog/featured"
              currentUrl={featuredImage}
              onUploadSuccess={setFeaturedImage}
              type="image"
            />

            {/* Video fields (conditional) */}
            {postType === 'VIDEO_LESSON' && (
              <>
                <MediaUpload
                  label="Video bài học"
                  accept="video/*"
                  folder="blog/videos"
                  currentUrl={videoUrl}
                  onUploadSuccess={setVideoUrl}
                  type="video"
                />
                <div className="admin-field">
                  <label htmlFor="videoDuration">Thời lượng video (phút)</label>
                  <input
                    id="videoDuration"
                    type="number"
                    value={videoDuration}
                    onChange={e => setVideoDuration(e.target.value ? Number(e.target.value) : '')}
                    placeholder="15"
                    min="1"
                  />
                </div>
              </>
            )}

            {/* SEO Meta */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#2d3748' }}>
                SEO Metadata (Tùy chọn)
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="admin-field">
                  <label htmlFor="metaTitle">Meta Title</label>
                  <input
                    id="metaTitle"
                    type="text"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    placeholder="Tiêu đề cho SEO (nếu khác với tiêu đề bài viết)"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="metaDescription">Meta Description</label>
                  <textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    placeholder="Mô tả ngắn cho search engines (150-160 ký tự)"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '2px solid #e2e8f0',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="metaKeywords">Meta Keywords</label>
                  <input
                    id="metaKeywords"
                    type="text"
                    value={metaKeywords}
                    onChange={e => setMetaKeywords(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="submit"
                className="admin-btn"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Đang lưu...' : isEdit ? '💾 Cập nhật bài viết' : '✅ Tạo bài viết'}
              </button>
              <button
                type="button"
                className="admin-btn-ghost"
                onClick={() => navigate('/admin/blog')}
                disabled={loading}
                style={{ flex: 1 }}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
