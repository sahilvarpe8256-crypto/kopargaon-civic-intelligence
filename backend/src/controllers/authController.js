const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'kopargaon_civic_intelligence_jwt_secret_dev_key')) {
    throw new Error('JWT_SECRET must be securely configured in production environment.');
  }
  return secret || 'kopargaon_civic_intelligence_jwt_secret_dev_key';
};

class AuthController {
  static isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Officer / Citizen Login
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' }
        });
      }

      let user = null;
      if (AuthController.isDbConnected()) {
        user = await User.findOne({ email: email.toLowerCase() });
      }

      const isNonProduction = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_AUTH === 'true';
      const isDemoOfficer = isNonProduction && (
        email.toLowerCase() === 'supervisor@kopargaon.gov.in' ||
        email.toLowerCase() === 'admin@kopargaon.gov.in' ||
        email.toLowerCase() === 'officer@kopargaon.gov.in'
      );

      if (!user && !isDemoOfficer) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' }
        });
      }

      let role = 'officer';
      let name = 'Municipal Officer';

      if (user) {
        role = user.role;
        name = user.name;
      } else if (email.toLowerCase().includes('supervisor')) {
        role = 'supervisor';
        name = 'Municipal Supervisor';
      } else if (email.toLowerCase().includes('admin')) {
        role = 'admin';
        name = 'Municipal Administrator';
      }

      const userId = user ? user._id : 'demo-officer-id';
      const secret = getJwtSecret();
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

      const token = jwt.sign(
        { userId, email, role, name },
        secret,
        { expiresIn }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: { id: userId, email, name, role }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Citizen Registration
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Name, email, and phone number are required.' }
        });
      }

      let user = null;
      if (AuthController.isDbConnected()) {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          return res.status(409).json({
            success: false,
            error: { code: 'CONFLICT', message: 'Email address is already registered.' }
          });
        }

        user = await User.create({
          name,
          email: email.toLowerCase(),
          phone,
          role: 'citizen'
        });
      } else {
        user = { _id: `demo-${Date.now()}`, name, email, phone, role: 'citizen' };
      }

      const secret = getJwtSecret();
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: 'citizen', name: user.name },
        secret,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Citizen account registered successfully.',
        data: {
          token,
          user: { id: user._id, name: user.name, email: user.email, role: 'citizen' }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Current Authenticated User Profile
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user.userId || req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;