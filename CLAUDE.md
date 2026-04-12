# 대신 결정해 줘! (Animal League)

익명 A/B 투표 앱. 로그인 없이 localStorage UUID 세션으로 투표/댓글 참여.

## 기술 스택
- **Next.js 16.2** (App Router) + TypeScript 5.7
- **Supabase** (PostgreSQL + RLS, 무인증 공개 정책)
- **Tailwind CSS v4** + shadcn/ui (Radix UI)
- **SWR** (클라이언트 데이터 폴링)
- **pnpm** 패키지 매니저

## 개발 명령어
```bash
pnpm dev    # 개발 서버
pnpm build  # 프로덕션 빌드
pnpm lint   # ESLint
```

## 환경 변수 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 상세 문서

### 기능별
- @.claude/features/decisions.md — 결정 생성/조회/마감/삭제
- @.claude/features/voting.md — 투표 흐름 및 결과 표시
- @.claude/features/comments.md — 댓글 작성/삭제
- @.claude/features/session.md — 익명 세션 (localStorage UUID)

### 레이어별
- @.claude/layers/data.md — DB 스키마, Supabase 클라이언트, 마이그레이션
- @.claude/layers/ui.md — 컴포넌트 구조, shadcn/ui, 스타일링 규칙
- @.claude/layers/logic.md — 서버/클라이언트 분리, SWR 패턴, 에러 처리
