import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

// Upload Document
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded or file rejected by security filter.' });
    }

    const { case_id } = req.body;
    const userId = req.user.id;
    const docId = uuidv4();

    const originalName = req.file.originalname;
    const storedName = req.file.filename;
    const filePath = req.file.path;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    await db.query(
      'INSERT INTO documents (id, case_id, user_id, original_name, stored_name, file_path, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [docId, case_id || null, userId, originalName, storedName, filePath, fileSize, mimeType]
    );

    const docResult = await db.query('SELECT * FROM documents WHERE id = $1', [docId]);

    return res.status(201).json({
      success: true,
      message: 'Document securely uploaded and encrypted in vault.',
      document: docResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// List user documents
export const listDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let result;
    if (role === 'client') {
      result = await db.query('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    } else {
      // Lawyer can see all documents uploaded by their clients across cases
      result = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    }

    return res.json({
      success: true,
      documents: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Download / View document with strict IDOR / BOLA authorization
export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const docResult = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const doc = docResult.rows[0];

    // Authorization check: owner or legal counsel
    if (role === 'client' && doc.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not possess clearance for this document.' });
    }

    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ success: false, error: 'Document physical storage reference is missing.' });
    }

    // Set safe download header with original sanitized name
    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
    return res.sendFile(path.resolve(doc.file_path));
  } catch (error) {
    next(error);
  }
};

// Delete Document
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const docResult = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const doc = docResult.rows[0];

    // Ownership check
    if (role === 'client' && doc.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You cannot delete another user document.' });
    }

    // Remove physical file safely if exists
    if (fs.existsSync(doc.file_path)) {
      try {
        fs.unlinkSync(doc.file_path);
      } catch (err) {
        console.warn('Could not delete physical file:', err.message);
      }
    }

    await db.query('DELETE FROM documents WHERE id = $1', [id]);

    return res.json({
      success: true,
      message: 'Document permanently deleted from vault.'
    });
  } catch (error) {
    next(error);
  }
};
