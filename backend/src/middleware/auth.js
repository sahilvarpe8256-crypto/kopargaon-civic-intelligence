const jwt = require('jsonwebtoken');
const { User } = require('../models');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'kopargaon_civic_intelligence_jwt_secret_dev_key')) {
    throw new Error('JWT_SECRET must be securely set in production environment.');
  }
  return secret || 'kopargaon_civic_intelligence_jwt_secret_dev_key';
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. No token provided.' }
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = getJwtSecret();

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: err.message || 'Invalid or expired token.' }
    });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Access restricted. Requires ${role} role.` }
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  getJwtSecret
};