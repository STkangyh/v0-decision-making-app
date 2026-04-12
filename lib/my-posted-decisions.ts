const STORAGE_KEY = 'decide-for-me-my-decision-ids'

/** 새 글 등록 직후 호출 — `author_session_id` 없는 환경에서도 소유 판별에 사용 */
export function recordPostedDecisionId(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : []
    if (!list.includes(id)) {
      list.unshift(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)))
    }
  } catch {
    // ignore
  }
}

export function isPostedDecisionIdInBrowser(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) && parsed.includes(id)
  } catch {
    return false
  }
}
