## Plan: Unified userId + auth/me + admin + sync-user

Backend (Neon + Supabase)
- [x] Neon: add `User.supabase_id` UUID UNIQUE (keep `User.id` = Supabase user id for FKs)
- [x] NeonUserService: upsert user on every login (create if new, update if exists)
- [x] Supabase profiles: add `plan`, `listing_limit`, `listing_used`, `is_admin` (SQL migrations)
- [x] `/api/auth/me`: single source of truth, returns {id,email,role,plan,listingLimit,isAdmin,profileCompleted,listingUsed}
- [x] `/api/sync-user`: force sync supabase→neon + defaults + admin

Frontend
- [x] Extend roles to include `admin`; update ProtectedRoute + Admin layout
- [x] Show `/admin` entry when `user.isAdmin === true`
- [x] Keep “Разместить объявление” for any authenticated user; redirect to pricing if limit reached

Validation
- [ ] Telegram login + email login
- [ ] 1 listing OK, 2nd -> pricing
- [ ] Two devices sessions still alive (Supabase multi-session setting required)
- [ ] Admin user sees `/admin`

