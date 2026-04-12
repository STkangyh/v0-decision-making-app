/** 투표 관련 순수 함수 — 테스트 가능하도록 분리 */

export function calcPercent(target: number, total: number): number {
  if (total === 0) return 50
  return Math.round((target / total) * 100)
}

export function getTimeAgo(date: Date): string {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
  return date.toLocaleDateString('ko-KR')
}

export function formatRemainingTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}시간 ${minutes % 60}분 남음`
  if (minutes > 0) return `${minutes}분 ${seconds % 60}초 남음`
  return `${seconds}초 남음`
}
