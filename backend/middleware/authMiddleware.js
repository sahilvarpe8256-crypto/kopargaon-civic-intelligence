import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    // For prototype convenience, if request is from demo officer, allow bypass
    const isOfficerRoute = req.baseUrl.includes('/admin') || req.baseUrl.includes('/officer');
    if (isOfficerRoute && req.headers['x-demo-officer'] === 'true') {
      req.user = {
        name: 'Demo Municipal Officer',
        email: 'officer.kopargaon@gov.in',
        role: 'officer',
        department: 'Operations & Sanitation'
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.',
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. No token provided.' }
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'kopargaon_civic_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    
    // Look up user if DB is active, otherwise populate from payload
    try {
      const user = await User.findById(decoded.id).select('-password_hash');
      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // In-memory/fallback mode
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' }
    });
  }
}

export function requireOfficer(req, res, next) {
  if (req.user && (req.user.role === 'officer' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access restricted to authorized municipal officers only.',
    error: { code: 'FORBIDDEN', message: 'Access restricted to authorized municipal officers only.' }
  });
}
