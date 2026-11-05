import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate, registerSchema, loginSchema } from '../middlewares/validator.js';

const router = Router();

// Registration
router.post('/register', validate(registerSchema), authController.register);

// Login (Hardened with strict rate limiter)
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Logout
router.post('/logout', authController.logout);

// Guest Instant Login (Client or Advocate)
router.post('/guest-login', authController.guestLogin);

// Get current session user
router.get('/me', requireAuth, authController.getCurrentUser);

export default router;
