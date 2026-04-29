const db = require('../config/database');

const createTask = (req, res) => {
  const { title, description, due_date, project_id, assigned_to ,priority } = req.body;
  if (!title || !project_id) return res.status(400).json({ error: 'Title and project required' });

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, due_date,priority, project_id, assigned_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?,?)
  `);
  const result = stmt.run(title, description, due_date,  priority || 'medium', project_id, assigned_to, req.user.id);
  res.status(201).json({ message: 'Task created', taskId: result.lastInsertRowid });
};

const getTasks = (req, res) => {
  let tasks;
  if (req.user.role === 'admin') {
    tasks = db.prepare('SELECT * FROM tasks').all();
  } else {
    // Member only sees tasks if they are still a member of that project
    tasks = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.assigned_to = ? AND pm.user_id = ?
    `).all(req.user.id, req.user.id);
  }
  res.json(tasks);
};

const updateTaskStatus = (req, res) => {
  const { status } = req.body;
  const { taskId } = req.params;
  const validStatuses = ['todo', 'in-progress', 'done'];

  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, taskId);
  res.json({ message: 'Status updated' });
};

const deleteTask = (req, res) => {
  const { taskId } = req.params;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  res.json({ message: 'Task deleted' });
};

module.exports = { createTask, getTasks, updateTaskStatus, deleteTask };