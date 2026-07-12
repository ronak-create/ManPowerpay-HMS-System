import { Router } from 'express';
import prisma from '../../config/db.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT, requireRole('admin'));

router.get('/', asyncHandler(async (req, res) => {
  const templates = await prisma.salaryTemplate.findMany({ include: { components: { orderBy: { sequence: 'asc' } } } });
  res.json(new ApiResponse(200, templates));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, components } = req.body;
  const company = await prisma.company.findFirst();
  const template = await prisma.salaryTemplate.create({
    data: { name, companyId: company.id, components: { create: components } }
  });
  res.status(201).json(new ApiResponse(201, template, 'Template created'));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { name, components } = req.body;
  await prisma.$transaction([
    prisma.salaryComponent.deleteMany({ where: { templateId: req.params.id } }),
    prisma.salaryTemplate.update({ where: { id: req.params.id }, data: { name, components: { create: components } } })
  ]);
  res.json(new ApiResponse(200, null, 'Template updated'));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if any employees are using this template
  const empCount = await prisma.employee.count({ where: { salaryTemplateId: id } });
  if (empCount > 0) {
    throw new ApiError(400, `Cannot delete template. ${empCount} employee(s) are currently assigned to it.`);
  }

  await prisma.$transaction([
    prisma.salaryComponent.deleteMany({ where: { templateId: id } }),
    prisma.salaryTemplate.delete({ where: { id } })
  ]);
  
  res.json(new ApiResponse(200, null, 'Template deleted successfully'));
}));

export default router;
