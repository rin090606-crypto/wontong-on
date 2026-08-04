create table if not exists public.meal_pass_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  request_date date not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, request_date)
);

alter table public.meal_pass_requests enable row level security;

drop policy if exists "본인 급식실 패스 조회" on public.meal_pass_requests;
create policy "본인 급식실 패스 조회"
on public.meal_pass_requests for select to authenticated
using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

drop policy if exists "본인 급식실 패스 신청" on public.meal_pass_requests;
create policy "본인 급식실 패스 신청"
on public.meal_pass_requests for insert to authenticated
with check (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

drop policy if exists "본인 급식실 패스 취소" on public.meal_pass_requests;
create policy "본인 급식실 패스 취소"
on public.meal_pass_requests for delete to authenticated
using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()) and status = 'pending');
