/*
  Warnings:

  - You are about to alter the column `title` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "text" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);
