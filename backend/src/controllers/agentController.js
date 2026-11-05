import db from '../config/db.js';

// List lawyers with optional category filtering, search, and availability check
export const listLawyers = async (req, res, next) => {
  try {
    const { category, search, include_inactive } = req.query;
    let queryText = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        p.area_of_expertise, 
        p.experience_years, 
        p.achievements, 
        p.bio, 
        p.avatar_url, 
        p.hourly_rate, 
        p.is_available, 
        p.rating,
        p.license_no,
        p.court,
        p.currency
      FROM users u
      JOIN lawyer_profiles p ON u.id = p.user_id
      WHERE u.role = 'lawyer'
    `;
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      queryText += ` AND p.area_of_expertise = $${params.length}`;
    }

    const result = await db.query(queryText, params);
    let lawyers = result.rows;

    // Filter: Only show active advocates unless explicitly requested (e.g. for admin or self check)
    if (include_inactive !== 'true') {
      lawyers = lawyers.filter(l => l.is_available === true || l.is_available === 'true');
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      lawyers = lawyers.filter(l => 
        (l.name && l.name.toLowerCase().includes(q)) || 
        (l.area_of_expertise && l.area_of_expertise.toLowerCase().includes(q)) ||
        (l.court && l.court.toLowerCase().includes(q)) ||
        (l.license_no && l.license_no.toLowerCase().includes(q)) ||
        (l.achievements && l.achievements.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: lawyers.length,
      lawyers
    });
  } catch (error) {
    next(error);
  }
};

// Get single lawyer details
export const getLawyerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        p.area_of_expertise, 
        p.experience_years, 
        p.achievements, 
        p.bio, 
        p.avatar_url, 
        p.hourly_rate, 
        p.is_available, 
        p.rating,
        p.license_no,
        p.court,
        p.currency
      FROM users u
      JOIN lawyer_profiles p ON u.id = p.user_id
      WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Legal agent not found.' });
    }

    return res.json({
      success: true,
      lawyer: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Lawyer active status (Lawyer only)
export const toggleLawyerStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existing = await db.query('SELECT * FROM lawyer_profiles WHERE user_id = $1', [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lawyer profile not initialized.' });
    }

    const current = existing.rows[0];
    const newStatus = !current.is_available;

    await db.query(
      'UPDATE lawyer_profiles SET is_available = $1 WHERE user_id = $2',
      [newStatus, userId]
    );

    return res.json({
      success: true,
      message: newStatus 
        ? 'Your profile is now ACTIVE and visible in the Personal Agents roster.'
        : 'Your profile is now INACTIVE (Hidden from clients).',
      is_available: newStatus
    });
  } catch (error) {
    next(error);
  }
};

// Update Lawyer profile (Lawyer only)
export const updateLawyerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { area_of_expertise, experience_years, achievements, bio, hourly_rate, is_available } = req.body;

    const existing = await db.query('SELECT * FROM lawyer_profiles WHERE user_id = $1', [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lawyer profile not initialized.' });
    }

    const current = existing.rows[0];
    const newArea = area_of_expertise !== undefined ? area_of_expertise : current.area_of_expertise;
    const newExp = experience_years !== undefined ? experience_years : current.experience_years;
    const newAchievements = achievements !== undefined ? achievements : current.achievements;
    const newBio = bio !== undefined ? bio : current.bio;
    const newRate = hourly_rate !== undefined ? hourly_rate : current.hourly_rate;
    const newAvail = is_available !== undefined ? is_available : current.is_available;

    await db.query(
      `UPDATE lawyer_profiles 
       SET area_of_expertise = $1, experience_years = $2, achievements = $3, bio = $4, hourly_rate = $5, is_available = $6, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7`,
      [newArea, newExp, newAchievements, newBio, newRate, newAvail, userId]
    );

    const updated = await db.query('SELECT * FROM lawyer_profiles WHERE user_id = $1', [userId]);

    return res.json({
      success: true,
      message: 'Professional profile updated successfully.',
      profile: updated.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
