import { Router } from 'express';
import * as caseController from '../controllers/caseController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validate, createCaseSchema, updateCaseStatusSchema } from '../middlewares/validator.js';

const router = Router();

// Law Categories (Publicly accessible for browsing)
router.get('/categories', caseController.getCategories);
router.get('/categories/:slug', caseController.getCategoryBySlug);

// Case Management (Authenticated)
router.get('/', requireAuth, caseController.getCases);
router.get('/:id', requireAuth, caseController.getCaseById);
router.post('/', requireAuth, validate(createCaseSchema), caseController.createCase);
router.patch('/:id/status', requireAuth, requireRole('lawyer'), validate(updateCaseStatusSchema), caseController.updateCaseStatus);

export default router;
