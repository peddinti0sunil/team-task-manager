const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');
const db = require('../config/database');

// Get all users (admin only)
router.get('/', authenticate, adminOnly, (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, role FROM users'
  ).all();
  res.json(users);
});

module.exports = router;