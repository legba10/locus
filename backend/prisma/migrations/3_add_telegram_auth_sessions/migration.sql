-- CreateEnum
CREATE TYPE "TelegramAuthStatus" AS ENUM ('PENDING', 'PHONE_RECEIVED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "TelegramAuthSession" (
    "id" TEXT NOT NULL,
    "loginToken" TEXT NOT NULL,
    "telegramUserId" BIGINT,
    "phoneNumber" TEXT,
    "username" TEXT,
    "firstName" TEXT,
    "policyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" "TelegramAuthStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAuthSession_loginToken_key" ON "TelegramAuthSession"("loginToken");
