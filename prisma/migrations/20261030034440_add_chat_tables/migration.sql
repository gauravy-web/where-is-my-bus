-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('MESSAGE', 'ANNOUNCEMENT');

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "busId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "Role" NOT NULL,
    "senderName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'MESSAGE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),
    "deletedBy" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReadStatus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "busId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageId" TEXT,

    CONSTRAINT "ChatReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_busId_createdAt_idx" ON "ChatMessage"("busId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_busId_type_isPinned_idx" ON "ChatMessage"("busId", "type", "isPinned");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatReadStatus_busId_userId_key" ON "ChatReadStatus"("busId", "userId");

-- CreateIndex
CREATE INDEX "ChatReadStatus_userId_idx" ON "ChatReadStatus"("userId");
