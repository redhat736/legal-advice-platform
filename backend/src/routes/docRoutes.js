import { Router } from 'express';
import * as docController from '../controllers/docController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Upload document (authenticated, restricted to PDF/Images, max 5MB)
router.post('/upload', requireAuth, upload.single('document'), docController.uploadDocument);

// List user's documents
router.get('/', requireAuth, docController.listDocuments);

// Authorized download/view (BOLA/IDOR protected)
router.get('/:id/download', requireAuth, docController.downloadDocument);

// Delete document (strictly owner only)
router.delete('/:id', requireAuth, docController.deleteDocument);

export default router;
