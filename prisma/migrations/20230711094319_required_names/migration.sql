/*
  Warnings:

  - Made the column `firstname` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastname` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstname" SET NOT NULL,
ALTER COLUMN "firstname" DROP DEFAULT,
ALTER COLUMN "lastname" SET NOT NULL,
ALTER COLUMN "lastname" DROP DEFAULT;
