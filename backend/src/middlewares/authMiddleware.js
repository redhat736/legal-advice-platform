import jwt from 'jsonwebtoken';
import { SECURITY_CONFIG } from '../config/security.js';
import db from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // Check HttpOnly Cookie first (standard & most secure)
    if (req.cookies && req.cookies[SECURITY_CONFIG.COOKIE_NAME]) {
      token = req.cookies[SECURITY_CONFIG.COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Fallback for API clients / Postman
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication token is missing.'
      });
    }

    const decoded = jwt.verify(token, SECURITY_CONFIG.JWT_SECRET);

    // Verify user still exists in database
    const userResult = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User account not found or revoked.'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid authentication credentials.'
    });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};
