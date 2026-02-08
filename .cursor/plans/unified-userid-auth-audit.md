## Plan: Unified userId + auth/me + admin + sync-user

Backend (Neon + Supabase)
- [ ] Neon: add `User.supabase_id` UUID UNIQUE (keep `User.id` = Supabase user id for FKs)
- [ ] NeonUserService: upsert user on every login (create if new, update if exists)
- [ ] Supabase profiles: add `plan`, `listing_limit`, `listing_used`, `is_admin` (SQL migrations)
- [ ] `/api/auth/me`: single source of truth, returns {id,email,role,plan,listingLimit,isAdmin,profileCompleted,listingUsed}
- [ ] `/api/sync-user`: force sync supabase→neon + defaults + admin

Frontend
- [ ] Extend roles to include `admin`; update ProtectedRoute + Admin layout
- [ ] Show `/admin` entry when `user.isAdmin === true`
- [ ] Keep “Разместить объявление” for any authenticated user; redirect to pricing if limit reached

Validation
- [ ] Telegram login + email login
- [ ] 1 listing OK, 2nd -> pricing
- [ ] Two devices sessions still alive (Supabase multi-session setting required)
- [ ] Admin user sees `/admin`

