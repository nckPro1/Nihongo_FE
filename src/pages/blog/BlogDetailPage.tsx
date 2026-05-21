import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogService } from '../../api/services/blogService'
import type { BlogPost } from '../../types/blog'
import './blog.css'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPost = useCallback(async () => {
    if (!slug) return
    setError(null)
    try {
      const res = await blogService.getPostBySlug(slug)
      if (res.success && res.data) {
        setPost(res.data)
      } else {
        setError('Không tìm thấy bài viết')
      }
    } catch {
      setError('Không tải được bài viết')
    }
  }, [slug])

  useEffect(() => {
    void loadPost()
  }, [loadPost])

  const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
    if (!post) return
    try {
      const res = await blogService.reactToPost(post.slug, type)
      if (res.success && res.data) {
        setPost(res.data)
      }
    } catch {
      alert('Vui lòng đăng nhập để thực hiện thích/không thích bài viết.')
    }
  }

  if (error && !post) {
    return (
      <div className="blog-container">
        <div className="blog-error-box">
          <h2>Lỗi</h2>
          <p>{error}</p>
          <Link to="/blog" className="blog-back-btn">
            ← Quay lại danh sách blog
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="blog-container">
        <p className="blog-loading">Đang tải bài viết...</p>
      </div>
    )
  }

  return (
    <div className="blog-container">
      <Link to="/blog" className="blog-back-link">
        ← Quay lại
      </Link>

      <article className="blog-detail">
        {post.featuredImage && (
          <div className="blog-detail-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        )}

        <div className="blog-detail-header">
          <h1>{post.title}</h1>
          <div className="blog-detail-meta-row">
            <div className="blog-detail-meta">
              <span>✍️ {post.authorName}</span>
              <span>📅 {formatDate(post.publishedAt || post.createdAt)}</span>
              <span>👁️ {post.viewsCount.toLocaleString()} lượt xem</span>
              {post.accessLevel === 'PREMIUM' && (
                <span className="blog-card-badge-pro">PRO</span>
              )}
            </div>

            <div className="blog-reaction-wrapper">
              <div className="blog-reaction-pill">
                <button
                  className={`blog-reaction-btn like-btn ${post.userReaction === 'LIKE' ? 'active' : ''}`}
                  onClick={() => void handleReaction('LIKE')}
                  title="Thích bài viết này"
                >
                  <span className="reaction-icon">👍</span>
                  <span className="reaction-count">{post.likesCount || 0}</span>
                </button>
                <div className="blog-reaction-divider" />
                <button
                  className={`blog-reaction-btn dislike-btn ${post.userReaction === 'DISLIKE' ? 'active' : ''}`}
                  onClick={() => void handleReaction('DISLIKE')}
                  title="Không thích bài viết này"
                >
                  <span className="reaction-icon">👎</span>
                  <span className="reaction-count">{post.dislikesCount || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="blog-detail-tags">
          {post.tags.map(tag => (
            <span key={tag.id} className="blog-tag">
              {tag.name}
            </span>
          ))}
        </div>

        {post.videoUrl && (
          <div className="blog-detail-video">
            <iframe
              src={post.videoUrl}
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}
