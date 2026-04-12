# Layer: UI 컴포넌트

## 컴포넌트 구조

### 페이지 레벨 (app/)
| 컴포넌트 | 타입 | 역할 |
|---|---|---|
| `app/page.tsx` | Server | 홈 레이아웃 |
| `app/new/page.tsx` | Client | 결정 생성 폼 |
| `app/decision/[id]/page.tsx` | Server | 상세 데이터 fetch |
| `app/decision/[id]/decision-detail.tsx` | Client | 상세 UI + 상호작용 |

### 공통 컴포넌트 (components/)
| 컴포넌트 | 역할 |
|---|---|
| `Header` | 로고 + "결정 요청하기" 버튼. sticky top-0 |
| `DecisionList` | SWR 기반 목록, 카테고리 필터 연동 |
| `DecisionCard` | 카드 요약 + 인라인 투표 |
| `CommentSection` | 댓글 목록 + 작성 폼 |
| `CategoryFilter` | 카테고리 필터 버튼 그룹 |

## shadcn/ui 컴포넌트 (`components/ui/`)
Radix UI 기반 헤드리스 컴포넌트. 직접 수정 가능.
주요 사용 컴포넌트: `Button`, `Card`, `Badge`, `Dialog`, `Input`, `Textarea`, `Field`, `Spinner`, `Empty`, `Toast(sonner)`

## 스타일링 규칙
- Tailwind CSS v4 사용
- `cn()` 유틸로 조건부 클래스 조합:
  ```ts
  import { cn } from '@/lib/utils'
  cn('base-class', condition && 'conditional-class')
  ```
- 색상 토큰: `primary`, `accent`, `muted`, `destructive`, `border`, `background`, `foreground` 등 CSS 변수 기반

## 반응형
- 최대 너비: 홈/상세 `max-w-3xl`, 생성 폼 `max-w-2xl`
- `sm:` 접두사로 모바일 우선 설계

## 상태 패턴
```ts
// 낙관적 업데이트 예시 (DecisionCard)
setLocalVotesA((prev) => prev + 1)  // 즉시 UI 반영
setVotedOption(option)               // 재투표 방지
```

## 토스트 알림
`sonner` 라이브러리 사용:
```ts
import { toast } from 'sonner'
toast.success('메시지')
toast.error('메시지')
```
