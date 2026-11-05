import dotenv from 'dotenv';
dotenv.config();

export const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'legal_advice_super_secret_jwt_key_2026_production_standard',
  JWT_EXPIRES_IN: '7d',
  COOKIE_NAME: 'legal_advice_token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // 'lax' for local dev ease across origins
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  },
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  BCRYPT_SALT_ROUNDS: 12,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB limit
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
};
