/*
  Warnings:

  - Added the required column `tag` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Made the column `patronymic` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "tag" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "patronymic" SET NOT NULL;
