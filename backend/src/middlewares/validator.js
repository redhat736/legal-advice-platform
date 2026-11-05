import { z } from 'zod';

export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: formattedErrors
      });
    }
    req[property] = result.data;
    next();
  };
};

// 1. Auth Schemas
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'lawyer']).default('client'),
  // Optional lawyer specific fields if registering as lawyer
  licenseNo: z.string().optional(),
  court: z.string().optional(),
  avatar_url: z.string().optional(),
  area_of_expertise: z.string().optional(),
  experience_years: z.coerce.number().min(0).optional(),
  bio: z.string().optional(),
  achievements: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// 2. Case Schemas
export const createCaseSchema = z.object({
  category_slug: z.string().min(2, 'Category is required'),
  title: z.string().trim().min(4, 'Case title must be at least 4 characters').max(200),
  description: z.string().trim().min(10, 'Please provide a detailed case description'),
  lawyer_id: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium')
});

export const updateCaseStatusSchema = z.object({
  status: z.enum(['Open', 'In Review', 'Closed'])
});

// 3. Lawyer Profile Schemas
export const updateLawyerProfileSchema = z.object({
  area_of_expertise: z.string().min(2).optional(),
  experience_years: z.coerce.number().min(0).max(70).optional(),
  achievements: z.string().optional(),
  bio: z.string().optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
  is_available: z.boolean().optional(),
  court: z.string().optional(),
  licenseNo: z.string().optional()
});

// 4. Chat Schemas
export const sendMessageSchema = z.object({
  session_id: z.string().optional(),
  lawyer_id: z.string().optional(),
  client_id: z.string().optional(),
  message_text: z.string().trim().min(1, 'Message cannot be empty').max(3000)
});
