/*
  Warnings:

  - You are about to drop the `TaskTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TaskTag" DROP CONSTRAINT "TaskTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaskTag" DROP CONSTRAINT "TaskTag_taskId_fkey";

-- DropTable
DROP TABLE "public"."TaskTag";

-- CreateTable
CREATE TABLE "public"."_TagToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TagToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TagToTask_B_index" ON "public"."_TagToTask"("B");

-- AddForeignKey
ALTER TABLE "public"."_TagToTask" ADD CONSTRAINT "_TagToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TagToTask" ADD CONSTRAINT "_TagToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
