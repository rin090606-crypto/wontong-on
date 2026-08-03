create table if not exists public.exam_scopes (
  id uuid primary key default gen_random_uuid(),
  grade integer not null check (grade between 1 and 3),
  subject text not null,
  scope text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grade, subject)
);

alter table public.exam_scopes enable row level security;

drop policy if exists "로그인 사용자는 시험범위 조회 가능" on public.exam_scopes;
create policy "로그인 사용자는 시험범위 조회 가능"
on public.exam_scopes
for select
to authenticated
using (true);
