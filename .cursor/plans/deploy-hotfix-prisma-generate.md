# Deploy hotfix: Prisma client drift

## Status
completed

## Done
- Fixed `notifications.service` typing edge cases (`meta` JSON cast + `webPush` null guard).
- Identified root cause of Railway build failure: Prisma Client was stale during CI build.
- Updated `backend/package.json` build script to run `prisma generate` before TypeScript compile.
- Verified with local backend build: `npm run build` passes successfully.
