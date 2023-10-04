-- AlterTable
ALTER TABLE "todos" ALTER COLUMN "completed" DROP NOT NULL,
ALTER COLUMN "completed" SET DEFAULT false;
