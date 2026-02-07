## Plan: Fix email login + Telegram buttons + free landlord CTA

- [x] Backend: make `/auth/me` resilient when `profiles` missing (auto-upsert minimal profile)
- [x] Backend: make profile upsert tolerant to missing optional columns (username/first_name/last_name/avatar_url)
- [x] Backend: ensure Supabase admin client uses service role key (avoid RLS violations)
- [x] Frontend: remove extra Telegram button; keep bot button styled blue
- [x] Frontend: add clear “Сдать жильё бесплатно (1 объявление)” entry point
- [x] Commit, push

