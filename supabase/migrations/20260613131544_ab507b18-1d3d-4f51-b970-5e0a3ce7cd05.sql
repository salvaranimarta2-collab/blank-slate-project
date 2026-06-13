revoke execute on function public.notify_orgs_of_new_donor() from public, anon, authenticated;
revoke execute on function public.notify_donors_of_new_org() from public, anon, authenticated;
grant execute on function public.notify_orgs_of_new_donor() to service_role;
grant execute on function public.notify_donors_of_new_org() to service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;