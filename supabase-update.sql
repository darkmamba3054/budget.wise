-- Add invite token to accountability links
alter table accountability_links add column if not exists invite_token text unique;

-- Allow partners to update the link when they accept an invite
create policy "Partners can accept invites" on accountability_links
  for update using (true);
