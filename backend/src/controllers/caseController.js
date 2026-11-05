import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

// Get all 6 law categories
export const getCategories = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM law_categories ORDER BY title ASC');
    return res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await db.query('SELECT * FROM law_categories WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Law category not found.' });
    }
    return res.json({
      success: true,
      category: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get cases based on user role (Client views their own cases; Lawyer views assigned or pending cases)
export const getCases = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let result;

    if (role === 'client') {
      result = await db.query(
        'SELECT * FROM cases WHERE client_id = $1 ORDER BY created_at DESC',
        [id]
      );
    } else if (role === 'lawyer') {
      result = await db.query(
        'SELECT * FROM cases WHERE lawyer_id = $1 ORDER BY created_at DESC',
        [id]
      );
    } else {
      result = await db.query('SELECT * FROM cases ORDER BY created_at DESC');
    }

    return res.json({
      success: true,
      cases: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single case by ID with strict IDOR prevention
export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const result = await db.query('SELECT * FROM cases WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Case not found.' });
    }

    const currentCase = result.rows[0];

    // Authorization Guard: Client must own case, Lawyer must be assigned
    if (role === 'client' && currentCase.client_id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to view this case.' });
    }
    if (role === 'lawyer' && currentCase.lawyer_id && currentCase.lawyer_id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You are not the assigned attorney for this case.' });
    }

    return res.json({
      success: true,
      case: currentCase
    });
  } catch (error) {
    next(error);
  }
};

// Create a new legal case (Client action)
export const createCase = async (req, res, next) => {
  try {
    const { category_slug, title, description, lawyer_id, priority = 'Medium' } = req.body;
    const clientId = req.user.id;
    const caseId = uuidv4();

    // Verify category exists
    const catCheck = await db.query('SELECT slug FROM law_categories WHERE slug = $1', [category_slug]);
    if (catCheck.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid law category slug.' });
    }

    // Insert case
    await db.query(
      'INSERT INTO cases (id, client_id, lawyer_id, category_slug, title, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [caseId, clientId, lawyer_id || null, category_slug, title, description, priority]
    );

    // If a lawyer is assigned, automatically initiate a chat session
    if (lawyer_id) {
      const sessionId = uuidv4();
      await db.query(
        'INSERT INTO chat_sessions (id, client_id, lawyer_id, case_id) VALUES ($1, $2, $3, $4)',
        [sessionId, clientId, lawyer_id, caseId]
      );

      // Create initial greeting message
      const msgId = uuidv4();
      await db.query(
        'INSERT INTO chat_messages (id, session_id, sender_id, message_text) VALUES ($1, $2, $3, $4)',
        [msgId, sessionId, clientId, `Hello, I have initiated a new case: "${title}". Please review the case details.`]
      );
    }

    const created = await db.query('SELECT * FROM cases WHERE id = $1', [caseId]);

    return res.status(201).json({
      success: true,
      message: 'Legal case successfully opened.',
      case: created.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update case status (Lawyer action: Open -> In Review -> Closed)
export const updateCaseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const caseCheck = await db.query('SELECT * FROM cases WHERE id = $1', [id]);
    if (caseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Case not found.' });
    }

    const existingCase = caseCheck.rows[0];

    // Only assigned lawyer or lawyer taking on case can update
    if (role === 'lawyer' && existingCase.lawyer_id && existingCase.lawyer_id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You cannot modify cases assigned to other counsel.' });
    }

    await db.query('UPDATE cases SET status = $1 WHERE id = $2', [status, id]);

    return res.json({
      success: true,
      message: `Case status updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};
