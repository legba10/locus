-- AlterTable: add username, email, phone to Profile (Neon/Prisma)
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "phone" TEXT;
