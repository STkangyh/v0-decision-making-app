-- 스핀 최고 기록 테이블
create table if not exists spin_records (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  nickname    text not null,
  speed       numeric not null,  -- deg/s
  created_at  timestamptz default now()
);

-- 상위 10개만 조회하면 되므로 RLS 없이 public read 허용
alter table spin_records enable row level security;

create policy "anyone can read spin_records"
  on spin_records for select using (true);

create policy "anyone can insert spin_records"
  on spin_records for insert with check (true);
