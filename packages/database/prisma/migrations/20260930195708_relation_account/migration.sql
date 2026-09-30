/*
  Warnings:

  - A unique constraint covering the columns `[profile_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "profile_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_id_key" ON "user"("profile_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
