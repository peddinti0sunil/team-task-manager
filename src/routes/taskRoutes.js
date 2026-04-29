const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');

router.get('/', authenticate, getTasks);
router.post('/', authenticate, adminOnly, createTask);
router.patch('/:taskId/status', authenticate, updateTaskStatus);
router.delete('/:taskId', authenticate, adminOnly, deleteTask);

module.exports = router;