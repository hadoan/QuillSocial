-- CreateTable
CREATE TABLE "OpenAIUsage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "prompt" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "requestType" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenAIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpenAIUsage_userId_idx" ON "OpenAIUsage"("userId");

-- CreateIndex
CREATE INDEX "OpenAIUsage_teamId_idx" ON "OpenAIUsage"("teamId");

-- CreateIndex
CREATE INDEX "OpenAIUsage_createdAt_idx" ON "OpenAIUsage"("createdAt");

-- CreateIndex
CREATE INDEX "OpenAIUsage_userId_createdAt_idx" ON "OpenAIUsage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "OpenAIUsage" ADD CONSTRAINT "OpenAIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenAIUsage" ADD CONSTRAINT "OpenAIUsage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
