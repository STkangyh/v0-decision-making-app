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
  created_at: string
  updated_at: string
}

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
  | '기타'

export const CATEGORIES: Category[] = [
  '음식',
  '패션',
  '여가',
  '공부',
  '연애',
  '기타',
]

export const CATEGORY_EMOJIS: Record<Category, string> = {
  '음식': '🍽️',
  '패션': '👗',
  '여가': '🎮',
  '공부': '📚',
  '연애': '💕',
  '기타': '✨',
}
