/*
  Warnings:

  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `secondName` on the `users` table. All the data in the column will be lost.
  - Added the required column `firstname` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "firstName",
DROP COLUMN "secondName",
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "secondname" TEXT NOT NULL;
