import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { blogService } from '../../api/services/blogService'
import type { BlogPostListItem, BlogPostPage } from '../../types/blog'
import '../admin/admin.css'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return iso
  }
}

const POST_TYPE_LABELS: Record<string, string> = {
  ARTICLE: '📝 Bài viết',
  VIDEO_LESSON: '🎥 Video',
  COURSE_AD: '📢 Quảng cáo',
  NEWS: '📰 Tin tức',
  TUTORIAL: '📚 Hướng dẫn'
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Lưu trữ'
}

export function AdminBlogPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [data, setData] = useState<BlogPostPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await blogService.getAllPosts(page, 20)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.message || 'Không tải được danh sách')
      }
    } catch {
      setError('Không tải được danh sách blog')
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  const handleDelete = async (post: BlogPostListItem) => {
    if (!confirm(`Xóa bài viết "${post.title}"?`)) return

    setBusyId(post.id)
    setError(null)
    try {
      await blogService.deletePost(post.id)
      await load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không xóa được')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="admin-main-header">
        <h1>Quản lý Blog</h1>
        <p className="admin-main-subtitle">Tạo và quản lý nội dung blog cho học viên</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="admin-btn"
          onClick={() => navigate('/admin/blog/new')}
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
        >
          ➕ Tạo bài viết mới
        </button>
      </div>

      {error ? <p className="admin-err">{error}</p> : null}

      {!data ? (
        <p className="admin-muted">Đang tải danh sách blog...</p>
      ) : data.content.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Chưa có bài viết nào</h3>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
            <p>Nhấn "Tạo bài viết mới" để bắt đầu!</p>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Danh sách bài viết ({data.totalElements})</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Tác giả</th>
                <th>Lượt xem</th>
                <th>Thích / Ghét</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 500, maxWidth: '300px' }}>
                    {post.title}
                  </td>
                  <td>{POST_TYPE_LABELS[post.postType]}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        post.status === 'PUBLISHED'
                          ? 'admin-badge--ok'
                          : post.status === 'DRAFT'
                            ? 'admin-badge--pending'
                            : 'admin-badge--off'
                      }`}
                    >
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </td>
                  <td>{post.authorName}</td>
                  <td style={{ textAlign: 'center' }}>
                    {post.viewsCount.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#3182ce', fontWeight: 600 }}>👍 {post.likesCount || 0}</span>
                    <span style={{ color: '#e2e8f0', margin: '0 0.4rem' }}>|</span>
                    <span style={{ color: '#e53e3e', fontWeight: 600 }}>👎 {post.dislikesCount || 0}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#718096' }}>
                    {formatDate(post.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="admin-toggle"
                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        style={{ minWidth: '60px' }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        type="button"
                        className="admin-toggle"
                        onClick={() => void handleDelete(post)}
                        disabled={busyId === post.id}
                        style={{ minWidth: '60px', borderColor: '#f56565', color: '#f56565' }}
                      >
                        {busyId === post.id ? '...' : '🗑️ Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-pager">
            <span>
              Hiển thị {data.content.length} / {data.totalElements} bài viết
            </span>
            <div className="admin-pager-controls">
              <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                ← Trước
              </button>
              <span style={{ padding: '0.5rem 0.75rem', color: '#4a5568', fontWeight: 500 }}>
                {data.number + 1} / {Math.max(1, data.totalPages)}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
