/*
  Warnings:

  - You are about to drop the column `picture` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "picture",
ADD COLUMN     "pictures" TEXT[];
