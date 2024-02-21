/*
  Warnings:

  - Made the column `secondName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `patronymic` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "secondName" SET NOT NULL,
ALTER COLUMN "patronymic" SET NOT NULL;
