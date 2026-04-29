const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');
const { createProject, getProjects, addMember, getMembers, removeMember, deleteProject } = require('../controllers/projectController');

router.get('/', authenticate, getProjects);
router.post('/', authenticate, createProject);
router.post('/:projectId/members', authenticate, adminOnly, addMember);
router.get('/:projectId/members', authenticate, getMembers);
router.delete('/:projectId/members/:userId', authenticate, adminOnly, removeMember);
router.delete('/:projectId', authenticate, adminOnly, deleteProject);

module.exports = router;