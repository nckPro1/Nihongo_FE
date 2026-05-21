import { useCallback, useEffect, useState } from 'react'
import { adminService } from '../../api/services/adminService'
import type { AdminDashboardStats } from '../../types/admin'
import './admin.css'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await adminService.dashboardStats()
      if (res.success && res.data) {
        setStats(res.data)
      } else {
        setError(res.message || 'Không tải được dữ liệu')
      }
    } catch {
      setError('Không tải được dữ liệu')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <div className="admin-main-header">
        <h1>Tổng quan</h1>
        <p className="admin-main-subtitle">Chào mừng bạn trở lại, Admin-san! 🎌</p>
      </div>

      <div className="admin-welcome-banner">
        <div className="admin-welcome-content">
          <h2>Xin chào buổi sáng! 🌸</h2>
          <p>
            Hệ thống đang hoạt động trơn tru. Có {stats?.totalUsers || 0} người dùng đang học tập cùng Zenigo.
            Chúc một ngày làm việc hiệu quả!
          </p>
          <button className="admin-welcome-btn">Xem Báo Cáo</button>
        </div>
        <div className="admin-welcome-illustration">👨‍💻</div>
      </div>

      {error ? <p className="admin-err">{error}</p> : null}

      {stats ? (
        <div className="admin-stat-grid">
          <div className="admin-stat">
            <div className="admin-stat-header">
              <div className="admin-stat-icon admin-stat-icon--primary">👥</div>
            </div>
            <p className="admin-stat-value">{stats.totalUsers.toLocaleString()}</p>
            <p className="admin-stat-label">Tổng Người Dùng</p>
            <p className="admin-stat-trend admin-stat-trend--up">
              ↑ +15% <span style={{ color: '#718096' }}>tuần này</span>
            </p>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-header">
              <div className="admin-stat-icon admin-stat-icon--success">✓</div>
            </div>
            <p className="admin-stat-value">{stats.activeUsers.toLocaleString()}</p>
            <p className="admin-stat-label">Đang Hoạt Động</p>
            <p className="admin-stat-trend admin-stat-trend--up">
              ↑ +8% <span style={{ color: '#718096' }}>tuần này</span>
            </p>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-header">
              <div className="admin-stat-icon admin-stat-icon--warning">📚</div>
            </div>
            <p className="admin-stat-value">842</p>
            <p className="admin-stat-label">Bài Học Mới</p>
            <p className="admin-stat-trend admin-stat-trend--down">
              ↓ -5% <span style={{ color: '#718096' }}>hôm nay</span>
            </p>
          </div>
          <div className="admin-stat">
            <div className="admin-stat-header">
              <div className="admin-stat-icon admin-stat-icon--danger">❓</div>
            </div>
            <p className="admin-stat-value">24</p>
            <p className="admin-stat-label">Yêu Cầu Hỗ Trợ</p>
            <p className="admin-stat-trend admin-stat-trend--down">
              ↓ -3% <span style={{ color: '#718096' }}>hôm nay</span>
            </p>
          </div>
        </div>
      ) : !error ? (
        <p className="admin-muted">Đang tải thống kê…</p>
      ) : null}
    </>
  )
}
