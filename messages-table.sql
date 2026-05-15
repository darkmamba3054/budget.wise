-- Messages table for accountability partner threads
create table messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references accountability_links(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  text text not null,
  ref_type text,
  ref_label text,
  created_at timestamp default now()
);

alter table messages enable row level security;

create policy "Users can read messages in their threads" on messages
  for select using (
    sender_id = auth.uid() or
    thread_id in (
      select id from accountability_links
      where owner_user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

create policy "Users can send messages in their threads" on messages
  for insert with check (
    sender_id = auth.uid() and
    thread_id in (
      select id from accountability_links
      where owner_user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );
