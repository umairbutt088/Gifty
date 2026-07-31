-- Reliable device-token claim: bypasses upsert RLS edge cases when the same
-- Expo push token moves between buyer/vendor on one device.

create or replace function public.upsert_push_token(
  p_expo_push_token text,
  p_platform text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_expo_push_token is null or length(trim(p_expo_push_token)) = 0 then
    raise exception 'Push token is required';
  end if;

  insert into public.push_tokens (user_id, expo_push_token, platform)
  values (auth.uid(), trim(p_expo_push_token), p_platform)
  on conflict (expo_push_token)
  do update set
    user_id = auth.uid(),
    platform = excluded.platform,
    updated_at = timezone('utc'::text, now());
end;
$$;

revoke all on function public.upsert_push_token(text, text) from public;
grant execute on function public.upsert_push_token(text, text) to authenticated;
