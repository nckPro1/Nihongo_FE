import type { LearningProjectItem } from '../types/learningProject'

/** Ưu tiên "Kho mặc định", không thì Zenigo tạo sớm nhất — dùng khi thêm thẻ từ trang chủ. */
export function pickDefaultProjectId(projects: LearningProjectItem[]): string | null {
  if (projects.length === 0) return null
  const def = projects.find((p) => p.name === 'Kho mặc định')
  if (def) return def.id
  const sorted = [...projects].sort(
    (a, b) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
  )
  return sorted[0]?.id ?? null
}
