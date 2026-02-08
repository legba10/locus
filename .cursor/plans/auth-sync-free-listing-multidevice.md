## Plan: Auth sync + FREE listing + multi-device sessions

Backend
- [ ] Rewrite `/api/auth/me` to: validate Supabase user → ensure profile → ensure Neon user → enforce FREE plan defaults → return contract
- [ ] Telegram login: ensure `profiles.role` default + `needsRoleSelection` semantics remain correct
- [ ] Listings: ensure FREE limit enforced (2nd listing => `LIMIT_REACHED`)
- [ ] Multi-device sessions: add `Session` table in Neon (Prisma + migration) and store refresh tokens per device without deleting old
- [ ] Add `POST /api/auth/logout` to revoke only current device session (keep others)

Frontend
- [ ] Show role selection modal when `needsRoleSelection=true` after Telegram login
- [ ] Show “Разместить объявление” CTA when `role=landlord` in header/mobile/profile
- [ ] Pricing: add “1 объявление бесплатно” block + “Разместить бесплатно” button

Validation
- [ ] Test 1: Telegram login → choose landlord → CTA visible
- [ ] Test 2: Create 1 listing → ok
- [ ] Test 3: Create 2nd → LIMIT_REACHED
- [ ] Test 4: Login on phone + PC → both sessions alive

