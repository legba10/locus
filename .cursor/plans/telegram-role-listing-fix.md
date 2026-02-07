## Plan: Telegram users can create 1 listing (FREE)

Goal: After Telegram login user has profile, plan FREE, and can create 1 listing after selecting role.

- [x] Backend: expose `needsRoleSelection` (profile.role missing) in `/api/auth/me` + optional `/api/me` alias
- [x] Backend: allow setting role via `PATCH /api/profile` (`role: renter|landlord`)
- [x] Frontend: role selection modal for Telegram users when `needsRoleSelection`
- [x] Frontend: show “Разместить объявление” in header if `user.role === landlord`
- [ ] Build + commit + push

Status:
- Backend `me` contract updated + `/me` alias: DONE
- Profile role patch endpoint: DONE
- Role selection modal: DONE
- Header/menu/profile CTA: DONE

