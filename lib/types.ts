export interface Decision {
  id: string
  title: string
  description: string | null
  option_a: string
  option_b: string
  category: string
  votes_a: number
  votes_b: number
  is_closed: boolean
  deadline: string | null
  created_at: string
  updated_at: string
  /** 새 글 등록 시 저장. 이전 행은 null일 수 있음 */
  author_session_id?: string | null
}

export const DEADLINE_OPTIONS = [
  { label: '30분', value: 30 },
  { label: '1시간', value: 60 },
  { label: '3시간', value: 180 },
  { label: '6시간', value: 360 },
  { label: '12시간', value: 720 },
  { label: '24시간', value: 1440 },
] as const

export interface Vote {
  id: string
  decision_id: string
  session_id: string
  selected_option: 'A' | 'B'
  created_at: string
}

export interface Comment {
  id: string
  decision_id: string
  session_id: string
  content: string
  created_at: string
}

export type Category =
  | '음식'
  | '패션'
  | '여가'
  | '공부'
  | '연애'
  | '친구'
  | '스포츠'
  | '기타'

export const CATEGORIES: Category[] = [
  '음식',
  '패션',
  '여가',
  '공부',
  '연애',
  '친구',
  '스포츠',
  '기타',
]

export const CATEGORY_EMOJIS: Record<Category, string> = {
  음식: '🍽️',
  패션: '👗',
  여가: '🎮',
  공부: '📚',
  연애: '💕',
  친구: '🤝',
  스포츠: '⚽',
  기타: '✨',
}
