-- Allow the currently signed-in user to claim an existing device push token.
-- Without this, upsert fails when the same Expo token was previously stored
-- under a different user_id (e.g. buyer then vendor on one phone).

drop policy if exists "Users manage their own push tokens" on public.push_tokens;

create policy "Users select own push tokens"
on public.push_tokens
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users insert own push tokens"
on public.push_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users claim or update push tokens"
on public.push_tokens
for update
to authenticated
using (true)
with check (auth.uid() = user_id);

create policy "Users delete own push tokens"
on public.push_tokens
for delete
to authenticated
using (auth.uid() = user_id);
