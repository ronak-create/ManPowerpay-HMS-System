/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,type]` on the table `employee_documents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "form16" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "pdfPath" TEXT,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "totalTDS" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form16_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "form16_employeeId_year_key" ON "form16"("employeeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "employee_documents_employeeId_type_key" ON "employee_documents"("employeeId", "type");

-- AddForeignKey
ALTER TABLE "form16" ADD CONSTRAINT "form16_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
