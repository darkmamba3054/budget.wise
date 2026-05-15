-- Purchase decisions table for the checker page
create table if not exists purchase_decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  price decimal(10,2) default 0,
  score integer default 0,
  decision text not null,
  date date default current_date,
  created_at timestamp default now()
);

alter table purchase_decisions enable row level security;

create policy "Users can manage their own decisions" on purchase_decisions
  for all using (auth.uid() = user_id);

-- Purchase decision comments
create table if not exists decision_comments (
  id uuid default gen_random_uuid() primary key,
  decision_id uuid references purchase_decisions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text,
  text text not null,
  created_at timestamp default now()
);

alter table decision_comments enable row level security;

create policy "Users can read comments on accessible decisions" on decision_comments
  for select using (
    user_id = auth.uid() or
    decision_id in (
      select id from purchase_decisions where user_id = auth.uid()
    )
  );

create policy "Users can insert comments" on decision_comments
  for insert with check (auth.uid() = user_id);

-- Fix journal_entries to store full content
alter table journal_entries add column if not exists note text;
alter table journal_entries add column if not exists tags text[];
alter table journal_events  add column if not exists tags text[];
