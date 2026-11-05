import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { SECURITY_CONFIG } from '../config/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Disk Storage with sanitized UUID filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.bin';
    const uniqueName = `${uuidv4()}${sanitizedExt}`;
    cb(null, uniqueName);
  }
});

// File filter checking MIME types
const fileFilter = (req, file, cb) => {
  if (SECURITY_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Unsupported file type: ${file.mimetype}. Allowed formats: PDF, JPG, PNG, WEBP.`),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: SECURITY_CONFIG.MAX_FILE_SIZE_BYTES, // 5MB
    files: 1
  },
  fileFilter
});
