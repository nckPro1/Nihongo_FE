import { createPortal } from 'react-dom'
import './ConfirmDeleteModal.css'

type Props = {
  title: string
  target?: string
  warning?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({ title, target, warning, loading = false, onConfirm, onCancel }: Props) {
  return createPortal(
    <div
      className="cdm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cdm-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="cdm-card">
        <div className="cdm-icon-wrap">
          <span className="material-symbols-outlined">delete_forever</span>
        </div>

        <p className="cdm-title" id="cdm-title">{title}</p>

        {target ? (
          <p className="cdm-message">
            Bạn sắp xoá <span className="cdm-target" title={target}>{target}</span>.
          </p>
        ) : null}

        {warning ? (
          <div className="cdm-warning">
            <span className="material-symbols-outlined">warning</span>
            {warning}
          </div>
        ) : null}

        <div className="cdm-actions">
          <button type="button" className="cdm-btn-cancel" onClick={onCancel} disabled={loading}>
            Huỷ
          </button>
          <button type="button" className="cdm-btn-delete" onClick={onConfirm} disabled={loading}>
            <span className="material-symbols-outlined">delete</span>
            {loading ? 'Đang xoá…' : 'Xoá'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
