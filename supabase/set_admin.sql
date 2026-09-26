-- ============================================================
-- Diatomlife — promote YOUR account to admin
-- Run this in Supabase Dashboard -> SQL Editor (after you have
-- signed in once on the site so your profile exists).
-- Account email: neonmbuthia14@gmail.com  (adjust below if different)
-- ============================================================

-- 1) Give your existing profile the 'admin' role
insert into public.user_roles (user_id, role)
select id, 'admin'
from public.profiles
where email = 'neonmbuthia14@gmail.com'
on conflict (user_id, role) do nothing;

-- 2) Verify it worked (should return one row with role = 'admin')
select p.email, ur.role
from public.profiles p
join public.user_roles ur on ur.user_id = p.id
where p.email = 'neonmbuthia14@gmail.com';
