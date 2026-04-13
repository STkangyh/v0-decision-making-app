-- ========================================
-- 대신결정해줘 — Supabase 테이블 설정
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- posts
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  title text not null,
  description text default '',
  option_a text not null,
  option_b text not null,
  votes_a int default 0,
  votes_b int default 0,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  nickname text not null,
  created_at timestamptz default now()
);

-- votes (1인 1투표, anon_id 기반)
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  anon_id text not null,
  choice text not null check (choice in ('A','B')),
  created_at timestamptz default now(),
  unique(post_id, anon_id)
);

-- RLS 정책
alter table posts enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;

create policy "anyone can read posts" on posts for select using (true);
create policy "anyone can insert posts" on posts for insert with check (true);
create policy "anyone can read comments" on comments for select using (true);
create policy "anyone can insert comments" on comments for insert with check (true);
create policy "anyone can read votes" on votes for select using (true);
create policy "anyone can insert votes" on votes for insert with check (true);
create policy "anyone can update votes" on votes for update using (true);

-- Realtime 활성화
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table comments;

-- 더미 데이터 (선택사항)
insert into posts (category, title, description, option_a, option_b, votes_a, votes_b, expires_at) values
  ('옷', '소개팅인데 뭐 입지?', '이번 주 토요일 소개팅인데 첫인상이 중요하잖아... 도와줘', '깔끔한 셔츠 + 슬랙스', '캐주얼 맨투맨 + 청바지', 24, 18, now() + interval '2 hours'),
  ('음식', '점심 뭐 먹지?', '학식 vs 배달 고민 중... 학식이 싸긴 한데 맛이...', '학식 (3,500원)', '배달 치킨 (18,000원)', 8, 31, now() + interval '30 minutes'),
  ('인간관계', '읽씹한 친구한테 먼저 연락해야 할까?', '3일 전에 카톡 보냈는데 읽고 답 안 함. 자존심 상하는데...', '기다린다 (자존심 지킴)', '먼저 또 연락한다 (관계 유지)', 45, 32, now() + interval '5 hours'),
  ('기타', '과제 vs 넷플릭스?', '마감이 내일인데 새 시즌 나왔어... 한 편만 볼까?', '과제 먼저 (현명한 선택)', '넷플릭스 한 편만 (거짓말)', 12, 56, now() + interval '1 hour'),
  ('옷', '운동화 사려는데 어떤 색?', '뉴발란스 530 살 건데 색깔 고민', '화이트 (무난한 국룰)', '그레이 (세련된 느낌)', 29, 22, now() + interval '3 hours');
