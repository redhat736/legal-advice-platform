import { Router } from 'express';
import * as agentController from '../controllers/agentController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validate, updateLawyerProfileSchema } from '../middlewares/validator.js';

const router = Router();

// Browse Specialist Lawyers directory
router.get('/', agentController.listLawyers);

// Toggle advocate active / inactive status (Lawyer only)
router.patch('/toggle-status', requireAuth, requireRole('lawyer'), agentController.toggleLawyerStatus);
router.post('/toggle-status', requireAuth, requireRole('lawyer'), agentController.toggleLawyerStatus);

// Update lawyer's own profile
router.put('/profile', requireAuth, requireRole('lawyer'), validate(updateLawyerProfileSchema), agentController.updateLawyerProfile);

// Get single lawyer details
router.get('/:id', agentController.getLawyerById);

export default router;
