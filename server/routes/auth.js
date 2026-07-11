const express = require('express');
const router = express.Router();
const { login, logout, changePassword, getMe } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login — Public (rate limited)
router.post('/login', loginRateLimiter, login);

// POST /api/auth/logout — Authenticated
router.post('/logout', verifyToken, logout);

// PATCH /api/auth/change-password — Authenticated
router.patch('/change-password', verifyToken, changePassword);

// GET /api/auth/me — Authenticated (get current user info)
router.get('/me', verifyToken, getMe);

module.exports = router;
