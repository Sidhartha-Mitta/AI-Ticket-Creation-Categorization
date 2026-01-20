const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ====================== SIGNUP ======================
router.post(
  '/signup',
  [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const user = new User({
        username,
        email,
        password,
        role: 'user'
      });

      await user.save();

      // ✅ NO fallback secret
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        access_token: token,
        token_type: 'Bearer'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ====================== LOGIN ======================
router.post(
  '/login',
  [
    body('username').trim().escape(),
    body('password').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // ✅ NO fallback secret
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        access_token: token,
        token_type: 'Bearer'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ====================== PROFILE ======================
router.get('/profile', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    supportCategory: req.user.supportCategory
  });
});

module.exports = router;
