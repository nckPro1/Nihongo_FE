import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { blogService } from '../../api/services/blogService'
import type { BlogPostPage } from '../../types/blog'
import './blog.css'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
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

export function BlogListPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<BlogPostPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      let res
      if (searchQuery.trim()) {
        res = await blogService.searchPosts(searchQuery, page, 12)
      } else {
        res = await blogService.getPublishedPosts(page, 12)
      }

      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.message || 'Không tải được danh sách')
      }
    } catch {
      setError('Không tải được danh sách blog')
    }
  }, [page, searchQuery])

  useEffect(() => {
    void load()
  }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    void load()
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog Zenigo</h1>
        <p>Chia sẻ kiến thức, mẹo học tiếng Nhật và tin tức mới nhất</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="blog-search">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="blog-search-input"
        />
        <button type="submit" className="blog-search-btn">
          🔍 Tìm kiếm
        </button>
      </form>

      {error ? <p className="blog-error">{error}</p> : null}

      {!data ? (
        <p className="blog-loading">Đang tải...</p>
      ) : data.content.length === 0 ? (
        <div className="blog-empty">
          <p>Không tìm thấy bài viết nào</p>
        </div>
      ) : (
        <>
          <div className="blog-grid">
            {data.content.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card">
                {post.featuredImage && (
                  <div className="blog-card-image">
                    <img src={post.featuredImage} alt={post.title} />
                  </div>
                )}
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="blog-card-type">{POST_TYPE_LABELS[post.postType]}</span>
                    {post.accessLevel === 'PREMIUM' && (
                      <span className="blog-card-badge-pro">PRO</span>
                    )}
                  </div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <span className="blog-card-author">✍️ {post.authorName}</span>
                    <span className="blog-card-date">
                      📅 {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                    <span className="blog-card-views">👁️ {post.viewsCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="blog-pagination">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="blog-pagination-btn"
              >
                ← Trước
              </button>
              <span className="blog-pagination-info">
                Trang {data.number + 1} / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="blog-pagination-btn"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
