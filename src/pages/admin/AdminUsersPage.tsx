import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { adminService } from '../../api/services/adminService'
import type { AdminUserPage, AdminUserRow } from '../../types/admin'
import './admin.css'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN')
  } catch {
    return iso
  }
}

export function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AdminUserPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await adminService.listUsers(page, 20)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.message || 'Không tải được danh sách')
      }
    } catch {
      setError('Không tải được danh sách')
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  const toggleActive = async (row: AdminUserRow) => {
    setBusyId(row.id)
    setError(null)
    try {
      await adminService.setUserActive(row.id, !row.active)
      await load()
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message
        : null
      setError(msg || 'Không cập nhật được')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="admin-main-header">
        <h1>Quản lý người dùng</h1>
        <p className="admin-main-subtitle">Xem và quản lý tất cả người dùng trong hệ thống</p>
      </div>

      {error ? <p className="admin-err">{error}</p> : null}

      {!data ? (
        <p className="admin-muted">Đang tải danh sách người dùng…</p>
      ) : (
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Danh sách người dùng ({data.totalElements})</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tên</th>
                <th>Role</th>
                <th>JLPT</th>
                <th>Email xác thực</th>
                <th>Trạng thái</th>
                <th>Tạo lúc</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 500 }}>{row.email}</td>
                  <td>{row.name}</td>
                  <td>
                    <span style={{
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: row.role === 'ADMIN' ? '#3182ce' : '#718096'
                    }}>
                      {row.role}
                    </span>
                  </td>
                  <td>{row.jlptLevel ?? '—'}</td>
                  <td>
                    <span className={`admin-badge ${row.emailVerified ? 'admin-badge--ok' : 'admin-badge--off'}`}>
                      {row.emailVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${row.active ? 'admin-badge--ok' : 'admin-badge--off'}`}>
                      {row.active ? '● Hoạt động' : '● Khóa'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#718096' }}>
                    {formatDate(row.createdAt)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-toggle"
                      disabled={busyId === row.id}
                      onClick={() => void toggleActive(row)}
                    >
                      {busyId === row.id ? '...' : row.active ? '🔒 Khóa' : '🔓 Mở'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-pager">
            <span>
              Hiển thị {data.content.length} / {data.totalElements} người dùng
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
