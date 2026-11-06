import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { SECURITY_CONFIG } from '../config/security.js';

// Generate standard secure JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    SECURITY_CONFIG.JWT_SECRET,
    { expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN }
  );
};

export const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'client', 
      licenseNo, 
      court, 
      area_of_expertise, 
      experience_years, 
      bio, 
      achievements, 
      hourly_rate, 
      avatar_url 
    } = req.body;

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_SALT_ROUNDS);
    const userId = uuidv4();

    // Insert user
    await db.query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, name, email.toLowerCase(), passwordHash, role]
    );

    // If registered as lawyer, create professional profile
    let lawyerProfile = null;
    if (role === 'lawyer') {
      const profileId = uuidv4();
      const defaultAvatar = avatar_url || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300';
      
      const profResult = await db.query(
        'INSERT INTO lawyer_profiles (id, user_id, area_of_expertise, experience_years, achievements, bio, hourly_rate, license_no, court, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
          profileId,
          userId,
          area_of_expertise || 'General Legal Counsel',
          experience_years || 5,
          achievements || 'Bar Council Admitted Advocate • High Trial Record',
          bio || 'Dedicated legal advocate committed to professional courtroom advocacy.',
          hourly_rate || 2000.00,
          licenseNo || 'Verified Advocate License',
          court || 'High Court & District Courts',
          defaultAvatar
        ]
      );
      lawyerProfile = profResult.rows[0];
    }

    const newUser = { 
      id: userId, 
      name, 
      email: email.toLowerCase(), 
      role,
      avatar_url: avatar_url || (role === 'lawyer' ? 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'),
      profile: lawyerProfile 
    };
    const token = generateToken(newUser);

    // Set secure HttpOnly cookie
    res.cookie(SECURITY_CONFIG.COOKIE_NAME, token, SECURITY_CONFIG.COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered and permanently saved.',
      user: newUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // If lawyer, fetch full profile
    if (user.role === 'lawyer') {
      const profResult = await db.query('SELECT * FROM lawyer_profiles WHERE user_id = $1', [user.id]);
      if (profResult.rows.length > 0) {
        sanitizedUser.profile = profResult.rows[0];
        sanitizedUser.licenseNo = profResult.rows[0].license_no;
        sanitizedUser.court = profResult.rows[0].court;
        sanitizedUser.area_of_expertise = profResult.rows[0].area_of_expertise;
        sanitizedUser.hourly_rate = profResult.rows[0].hourly_rate;
        sanitizedUser.experience_years = profResult.rows[0].experience_years;
        sanitizedUser.achievements = profResult.rows[0].achievements;
        sanitizedUser.bio = profResult.rows[0].bio;
        sanitizedUser.avatar_url = profResult.rows[0].avatar_url;
        sanitizedUser.is_available = profResult.rows[0].is_available;
      }
    } else {
      sanitizedUser.avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
    }

    const token = generateToken(sanitizedUser);

    // Set secure HttpOnly cookie
    res.cookie(SECURITY_CONFIG.COOKIE_NAME, token, SECURITY_CONFIG.COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      user: sanitizedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie(SECURITY_CONFIG.COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

export const guestLogin = async (req, res, next) => {
  try {
    const { role = 'client' } = req.body;
    const email = role === 'lawyer' ? 'rahul.rawat@legaladvice.com' : 'client@example.com';
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Guest account not initialized.' });
    }

    const user = userResult.rows[0];
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'lawyer') {
      const profResult = await db.query('SELECT * FROM lawyer_profiles WHERE user_id = $1', [user.id]);
      if (profResult.rows.length > 0) {
        sanitizedUser.profile = profResult.rows[0];
        sanitizedUser.licenseNo = profResult.rows[0].license_no;
        sanitizedUser.court = profResult.rows[0].court;
        sanitizedUser.area_of_expertise = profResult.rows[0].area_of_expertise;
        sanitizedUser.hourly_rate = profResult.rows[0].hourly_rate;
        sanitizedUser.experience_years = profResult.rows[0].experience_years;
        sanitizedUser.achievements = profResult.rows[0].achievements;
        sanitizedUser.bio = profResult.rows[0].bio;
        sanitizedUser.avatar_url = profResult.rows[0].avatar_url;
        sanitizedUser.is_available = profResult.rows[0].is_available;
      }
    } else {
      sanitizedUser.avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
    }

    const token = generateToken(sanitizedUser);
    res.cookie(SECURITY_CONFIG.COOKIE_NAME, token, SECURITY_CONFIG.COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: `Logged in as Guest ${user.role === 'lawyer' ? 'Advocate (वकील)' : 'Client'}.`,
      user: sanitizedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userResult = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userResult.rows[0];
    if (user.role === 'lawyer') {
      const profResult = await db.query('SELECT * FROM lawyer_profiles WHERE user_id = $1', [user.id]);
      if (profResult.rows.length > 0) {
        user.profile = profResult.rows[0];
        user.licenseNo = profResult.rows[0].license_no;
        user.court = profResult.rows[0].court;
        user.area_of_expertise = profResult.rows[0].area_of_expertise;
        user.hourly_rate = profResult.rows[0].hourly_rate;
        user.experience_years = profResult.rows[0].experience_years;
        user.achievements = profResult.rows[0].achievements;
        user.bio = profResult.rows[0].bio;
        user.avatar_url = profResult.rows[0].avatar_url;
        user.is_available = profResult.rows[0].is_available;
      }
    } else {
      user.avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, avatar_url, bio, area_of_expertise, experience_years, hourly_rate, court, licenseNo, achievements } = req.body;

    const { embeddedStore, persistStore } = await import('../config/db.js');
    
    const user = embeddedStore.users.find(u => u.id === userId);
    if (user) {
      if (name) user.name = name;
      if (avatar_url !== undefined) user.avatar_url = avatar_url;
      if (bio !== undefined) user.bio = bio;
    }

    // Update or create lawyer profile if lawyer
    let prof = embeddedStore.lawyer_profiles.find(p => p.user_id === userId);
    if (user && user.role === 'lawyer') {
      if (prof) {
        if (avatar_url !== undefined) prof.avatar_url = avatar_url;
        if (bio !== undefined) prof.bio = bio;
        if (area_of_expertise !== undefined) prof.area_of_expertise = area_of_expertise;
        if (experience_years !== undefined) prof.experience_years = Number(experience_years);
        if (hourly_rate !== undefined) prof.hourly_rate = Number(hourly_rate);
        if (court !== undefined) prof.court = court;
        if (licenseNo !== undefined) prof.license_no = licenseNo;
        if (achievements !== undefined) prof.achievements = achievements;
        prof.updated_at = new Date().toISOString();
      } else {
        const { v4: uuidv4 } = await import('uuid');
        prof = {
          id: uuidv4(),
          user_id: userId,
          area_of_expertise: area_of_expertise || 'General Legal Counsel',
          experience_years: Number(experience_years) || 5,
          achievements: achievements || '',
          bio: bio || '',
          hourly_rate: Number(hourly_rate) || 2000,
          license_no: licenseNo || 'Verified Bar Advocate',
          court: court || 'High Court of Delhi',
          avatar_url: avatar_url || user.avatar_url || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300',
          is_available: true,
          rating: 4.90,
          currency: '₹',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        embeddedStore.lawyer_profiles.push(prof);
      }
    }
    
    persistStore();
    
    return res.json({ 
      success: true, 
      message: 'Profile updated!',
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url || (prof ? prof.avatar_url : null),
        bio: user.bio || (prof ? prof.bio : ''),
        profile: prof || null
      } : null
    });
  } catch (error) {
    next(error);
  }
};
