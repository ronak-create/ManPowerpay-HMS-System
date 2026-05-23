import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin user
  const hash = await bcrypt.hash('Admin@1234', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@manpowerpay.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@manpowerpay.com',
      mobile: '9000000000',
      passwordHash: hash,
      role: 'admin',
    }
  });

  // Create Company
  const company = await prisma.company.upsert({
    where: { id: 'company_default' },
    update: {},
    create: {
      id: 'company_default',
      name: 'ManPower Solutions Pvt Ltd',
      registeredAddress: 'Vadodara, Gujarat',
      ptState: 'Gujarat',
      workingDaysBase: 26,
      otMultiplier: 2.0,
      financialYearStart: 4,
    }
  });

  // PT slab for Gujarat
  await prisma.ptSlab.createMany({
    skipDuplicates: true,
    data: [
      { companyId: company.id, state: 'Gujarat', minSalary: 0, maxSalary: 5999, ptAmount: 0 },
      { companyId: company.id, state: 'Gujarat', minSalary: 6000, maxSalary: 8999, ptAmount: 80 },
      { companyId: company.id, state: 'Gujarat', minSalary: 9000, maxSalary: 11999, ptAmount: 150 },
      { companyId: company.id, state: 'Gujarat', minSalary: 12000, maxSalary: null, ptAmount: 200 },
    ]
  });

  // Default site
  const site = await prisma.site.create({
    data: { companyId: company.id, name: 'Head Office', address: 'Vadodara, Gujarat' }
  });

  // Default department
  await prisma.department.create({
    data: { companyId: company.id, name: 'General' }
  });

  // Default salary template
  const template = await prisma.salaryTemplate.create({
    data: {
      companyId: company.id,
      name: 'Standard Template',
      components: {
        create: [
          { name: 'Basic', type: 'earning', basis: 'percent_of_gross', value: 50, sequence: 1, isEpfApplicable: true, isEsicApplicable: true },
          { name: 'HRA', type: 'earning', basis: 'percent_of_basic', value: 40, sequence: 2 },
          { name: 'Travel Allowance', type: 'earning', basis: 'fixed', value: 1600, sequence: 3 },
          { name: 'Special Allowance', type: 'earning', basis: 'fixed', value: 0, sequence: 4 }, // residual
          { name: 'Employee PF', type: 'deduction', basis: 'percent_of_basic', value: 12, sequence: 10 },
          { name: 'Employee ESIC', type: 'deduction', basis: 'percent_of_gross', value: 0.75, sequence: 11 },
          { name: 'Professional Tax', type: 'deduction', basis: 'state_slab', value: 0, sequence: 12 },
          { name: 'TDS', type: 'deduction', basis: 'tds_formula', value: 0, sequence: 13 },
          { name: 'Employer PF', type: 'employer_contribution', basis: 'percent_of_basic', value: 12, sequence: 20 },
          { name: 'Employer ESIC', type: 'employer_contribution', basis: 'percent_of_gross', value: 3.25, sequence: 21 },
        ]
      }
    }
  });

  console.log(`Admin created: admin@manpowerpay.com / Admin@1234`);
  console.log(`Company, default site, department and salary template created.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
