-- CreateEnum
CREATE TYPE "ResignationStatus" AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- CreateTable
CREATE TABLE "resignations" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "lastWorkingDay" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ResignationStatus" NOT NULL DEFAULT 'pending',
    "remarks" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,

    CONSTRAINT "resignations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resignations" ADD CONSTRAINT "resignations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resignations" ADD CONSTRAINT "resignations_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
