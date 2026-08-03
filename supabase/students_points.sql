alter table public.profiles
add column if not exists approved boolean not null default false;

alter table public.profiles
add column if not exists points integer not null default 0;

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists point_transactions_profile_id_idx
on public.point_transactions(profile_id);

alter table public.point_transactions enable row level security;

drop policy if exists "본인 포인트 내역 조회" on public.point_transactions;
create policy "본인 포인트 내역 조회"
on public.point_transactions
for select
to authenticated
using (
  profile_id in (
    select id
    from public.profiles
    where auth_user_id = auth.uid()
  )
);

create or replace function public.adjust_student_points(
  target_profile_id uuid,
  change_amount integer,
  change_reason text,
  actor_profile_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  if change_amount = 0 then
    raise exception '포인트 변경값은 0일 수 없습니다.';
  end if;

  if trim(coalesce(change_reason, '')) = '' then
    raise exception '포인트 사유가 필요합니다.';
  end if;

  update public.profiles
  set points = points + change_amount,
      updated_at = now()
  where id = target_profile_id
    and points + change_amount >= 0
  returning points into new_balance;

  if new_balance is null then
    raise exception '학생을 찾을 수 없거나 포인트가 부족합니다.';
  end if;

  insert into public.point_transactions (
    profile_id,
    amount,
    reason,
    created_by
  )
  values (
    target_profile_id,
    change_amount,
    trim(change_reason),
    actor_profile_id
  );

  return new_balance;
end;
$$;
