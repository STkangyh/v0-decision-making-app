# Layer: 데이터 (Database / Supabase)

## 클라이언트 생성

| 파일 | 용도 |
|---|---|
| `lib/supabase/client.ts` | 브라우저 (Client Component) |
| `lib/supabase/server.ts` | 서버 (Server Component, Route Handler) |
| `lib/supabase/proxy.ts` | 미들웨어용 세션 갱신 |

```ts
// Client Component에서
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server Component에서
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

## 테이블 구조

### decisions
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | UUID PK | gen_random_uuid() |
| title | TEXT NOT NULL | |
| description | TEXT | nullable |
| option_a | TEXT NOT NULL | |
| option_b | TEXT NOT NULL | |
| category | TEXT | DEFAULT '기타' |
| votes_a | INT | DEFAULT 0 |
| votes_b | INT | DEFAULT 0 |
| is_closed | BOOLEAN | DEFAULT FALSE |
| deadline | TIMESTAMPTZ | nullable, 인덱스 있음 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### votes
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | UUID PK | |
| decision_id | UUID FK | ON DELETE CASCADE |
| session_id | TEXT | |
| selected_option | TEXT | CHECK IN ('A','B') |
| UNIQUE | (decision_id, session_id) | 세션당 1표 |

### comments
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | UUID PK | |
| decision_id | UUID FK | ON DELETE CASCADE |
| session_id | TEXT | |
| content | TEXT | |
| created_at | TIMESTAMPTZ | |

## RLS 정책
모든 테이블 전 작업(SELECT/INSERT/UPDATE/DELETE) 허용 — 무인증 공개 앱.

## 마이그레이션 순서 (`scripts/`)
1. `001_create_tables.sql` — 기본 테이블 생성
2. `002_add_category.sql` — category 컬럼 추가
3. `003_fix_rls.sql` — RLS 정책 수정
4. `004_fix_votes_comments_rls.sql` — votes/comments RLS 수정
5. `005_add_deadline.sql` — deadline 컬럼 + 인덱스 추가

## 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
두 변수 모두 클라이언트 노출용 (NEXT_PUBLIC_ 접두사).
