-- ============================================================
-- Diatomlife — promote YOUR account to admin (v5, user_roles-free)
-- Run AFTER phase2_run_all_v5.sql AND after you have signed in
-- once on the site (so your profile row exists).
-- Account email: neonmbuthia14@gmail.com
-- ============================================================

insert into public.admin_users (id, email)
select p.id, p.email
from public.profiles p
where p.email = 'neonmbuthia14@gmail.com'
on conflict (id) do nothing;

-- Also flip the fallback flag for belt-and-braces.
update public.profiles set is_admin = true
where email = 'neonmbuthia14@gmail.com';

-- Verify (should return one row with your id + email)
select id, email from public.admin_users where email = 'neonmbuthia14@gmail.com';
