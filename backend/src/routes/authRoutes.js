const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', verifyToken, AuthController.getMe);

module.exports = router;