import { useEffect, useState } from 'react'
import { authService } from '../../api/services/authService'
import type { TransactionItem } from '../../types/auth'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './profile.css'

export function ProfileTransactionsPage() {
  const [rows, setRows] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await authService.getTransactions()
        if (!cancelled) setRows(res.data ?? [])
      } catch {
        if (!cancelled) setRows([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <AnimatedPage variant="fadeOnly">
        <div className="profile-card" style={{ pointerEvents: 'none' }}>
          <h3>Lịch sử giao dịch</h3>
          <div className="profile-table-wrap">
            <table className="profile-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton width={110} height={14} /></td>
                    <td><Skeleton width={170} height={14} /></td>
                    <td><Skeleton width={60} height={14} /></td>
                    <td><Skeleton width={80} height={14} style={{ borderRadius: '0.25rem' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  if (rows.length === 0) {
    return (
      <AnimatedPage variant="fadeOnly">
        <div className="profile-card">
          <h3>Lịch sử giao dịch</h3>
          <p className="profile-empty">Chưa có giao dịch. Thanh toán gói Pro hoặc nạp tiền sẽ hiển thị tại đây.</p>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage variant="fadeOnly">
      <div className="profile-card">
        <h3>Lịch sử giao dịch</h3>
        <div className="profile-table-wrap">
          <table className="profile-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Mô tả</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '—'}</td>
                  <td>{r.description}</td>
                  <td>{r.amount}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  )
}
