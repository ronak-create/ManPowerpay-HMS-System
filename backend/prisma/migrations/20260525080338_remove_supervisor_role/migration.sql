/*
  Warnings:

  - The values [supervisor] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `supervisorId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the `supervisors` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'employee');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "supervisors" DROP CONSTRAINT "supervisors_siteId_fkey";

-- DropForeignKey
ALTER TABLE "supervisors" DROP CONSTRAINT "supervisors_userId_fkey";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "supervisorId";

-- DropTable
DROP TABLE "supervisors";
