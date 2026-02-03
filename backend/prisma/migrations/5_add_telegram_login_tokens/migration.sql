-- CreateTable
CREATE TABLE "TelegramLoginToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramLoginToken_token_key" ON "TelegramLoginToken"("token");
CREATE INDEX "TelegramLoginToken_sessionId_idx" ON "TelegramLoginToken"("sessionId");
CREATE INDEX "TelegramLoginToken_expiresAt_idx" ON "TelegramLoginToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "TelegramLoginToken"
ADD CONSTRAINT "TelegramLoginToken_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "TelegramAuthSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
