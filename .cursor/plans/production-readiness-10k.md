## Plan: Production Readiness (1k → 10k concurrency)

Goal: Bring LOCUS to production-grade stability, security, and scalability for 100 → 10,000 concurrent users.

Deliverables:
- `architecture_report.md` (full audit + bottlenecks + prioritized fixes)
- Implement P0/P1 fixes (auth/session, proxy cookies, DB indexes, rate limit, logging)
- Add load-test harness (100/1000/5000 simulated) + documented results

Constraints:
- No breaking API changes without explicit mapping.
- Changes must be incremental, testable, and reversible.
- Keep auth/profile/chat/favorites intact.

Phases:
- [x] Audit (frontend/backend/prisma/supabase) and produce report
- [ ] P0 fixes (stability/security)
- [ ] P1 fixes (performance/scale)
- [ ] Load testing + final readiness verdict

