-- CreateTable
CREATE TABLE "whop_processed_events" (
    "eventId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whop_processed_events_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "whop_intake_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whop_intake_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whop_processed_events_processedAt_idx" ON "whop_processed_events"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "whop_intake_tokens_token_key" ON "whop_intake_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "whop_intake_tokens_eventId_key" ON "whop_intake_tokens"("eventId");

-- CreateIndex
CREATE INDEX "whop_intake_tokens_token_idx" ON "whop_intake_tokens"("token");

-- CreateIndex
CREATE INDEX "whop_intake_tokens_expiresAt_idx" ON "whop_intake_tokens"("expiresAt");
