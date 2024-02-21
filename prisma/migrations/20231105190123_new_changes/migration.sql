/*
  Warnings:

  - You are about to drop the `todos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[login]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `about` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "login" TEXT NOT NULL,
ADD COLUMN     "patronymic" TEXT,
ADD COLUMN     "photo" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "todos";

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "picture" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
