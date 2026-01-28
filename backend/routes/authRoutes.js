const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// User routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Admin routes
router.post('/admin/login', authController.adminLogin);

// Verify Token
router.get('/me', authController.protect, authController.getMe);

module.exports = router;