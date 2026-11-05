import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Retrieve all user's chat sessions
router.get('/sessions', requireAuth, chatController.getUserSessions);

// Direct get-or-create active conversation with partner & fetch its message history
router.get('/conversation/:partnerId', requireAuth, chatController.getOrCreateConversation);

// Retrieve messages of a specific session (BOLA guarded)
router.get('/sessions/:sessionId/messages', requireAuth, chatController.getSessionMessages);

// Send message (Pure human to human - zero bot automation)
router.post('/messages', requireAuth, chatController.sendMessage);

export default router;
