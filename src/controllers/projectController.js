const db = require('../config/database');

const jwt = require('jsonwebtoken');

const createProject = (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name required' });

  const stmt = db.prepare(
    'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)'
  );
  const result = stmt.run(name, description, req.user.id);

  // Auto add creator as member
  db.prepare('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)')
    .run(result.lastInsertRowid, req.user.id);

  let newToken = null;
  let newUser = null;
  let promoted = false;

  // Promote creator to admin if they aren't already
  if (req.user.role !== 'admin') {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', req.user.id);
    promoted = true;

    // Issue a fresh token with the new role
    newUser = { 
      id: req.user.id, 
      name: req.user.name, 
      email: req.user.email, 
      role: 'admin' 
    };
    newToken = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: '7d' });
  }

  res.status(201).json({ 
    message: 'Project created', 
    projectId: result.lastInsertRowid,
    promoted,
    newToken,
    newUser
  });
};

const getProjects = (req, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = db.prepare('SELECT * FROM projects').all();
  } else {
    projects = db.prepare(`
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
    `).all(req.user.id);
  }
  res.json(projects);
};

const addMember = (req, res) => {
  const { userId } = req.body;
  const { projectId } = req.params;

  try {
    db.prepare('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)')
      .run(projectId, userId);
    res.json({ message: 'Member added' });
  } catch {
    res.status(400).json({ error: 'Already a member' });
  }
};

const getMembers = (req, res) => {
  const { projectId } = req.params;
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, u.role FROM users u
    JOIN project_members pm ON u.id = pm.user_id
    WHERE pm.project_id = ?
  `).all(projectId);
  res.json(members);
};
const removeMember = (req, res) => {
  const { projectId, userId } = req.params;
  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?')
    .run(projectId, userId);
  res.json({ message: 'Member removed' });
};

const deleteProject = (req, res) => {
  const { projectId } = req.params;

  // Check if the project belongs to this admin (only creator can delete)
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Only the creator can delete this project' });
  }

  // Delete in order: tasks → members → project
  db.prepare('DELETE FROM tasks WHERE project_id = ?').run(projectId);
  db.prepare('DELETE FROM project_members WHERE project_id = ?').run(projectId);
  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);

  res.json({ message: 'Project deleted' });
};

module.exports = { createProject, getProjects, addMember, getMembers, removeMember, deleteProject };