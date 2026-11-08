drop table if exists public.user_context cascade;

create table public.profile(
    id uuid primary key default gen_random_uuid(),
    github_username text,
    avatar_url text,
    career_goal text,
    interests text ,
    current_actions text,
    worries text,
    updated_at timestamptz not null default now()
)

alter table public.profile enable row level security;
create policy "Users can view own profile"
on public.profile
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profile
for update 
to authenticated 
using (auth.uid() = id) 
with check (auth.uid() = id);

create policy "Users can insert own profile" 
on public.profile
for insert 
to authenticated 
with check (auth.uid() = id);



--GitHubログイン等でユーザーが新規作成された際、自動で profiles に行を追加するトリガー関数
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security DEFINER SET search_path = ''
as $$
begin
  insert into public.profile (id, github_username, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'user_name', 
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

--トリガーの登録（既存があれば削除してから再作成）
drop trigger if exists on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();