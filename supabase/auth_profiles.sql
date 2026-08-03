create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  student_id text not null unique,
  name text not null,
  grade integer not null check (grade between 1 and 3),
  class_no integer not null check (class_no between 1 and 20),
  student_number integer not null check (student_number between 1 and 99),
  role text not null default 'student' check (role in ('student', 'admin')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "본인 프로필 조회" on public.profiles;
create policy "본인 프로필 조회"
on public.profiles
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "본인 프로필 수정" on public.profiles;
create policy "본인 프로필 수정"
on public.profiles
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    auth_user_id,
    student_id,
    name,
    grade,
    class_no,
    student_number
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'student_id', ''),
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce((new.raw_user_meta_data->>'grade')::integer, 1),
    coalesce((new.raw_user_meta_data->>'class_no')::integer, 1),
    coalesce((new.raw_user_meta_data->>'student_number')::integer, 1)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 아래 두 줄은 가입 테스트 후, 본인 계정을 관리자로 바꿀 때 사용합니다.
-- 학번 부분만 본인 학번으로 바꿔 실행하세요.
-- update public.profiles set approved = true, role = 'admin' where student_id = '23015';

-- 일반 학생 승인 예시:
-- update public.profiles set approved = true where student_id = '13001';
