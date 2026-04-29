const db = require('../config/database');

const getDashboard = (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  let tasks, overdue,tasksByUser = [];


  if (req.user.role === 'admin') {
    tasks = db.prepare('SELECT * FROM tasks').all();
    overdue = db.prepare(`
      SELECT * FROM tasks WHERE due_date < ? AND status != 'done'
    `).all(today);
    tasksByUser = db.prepare(`
      SELECT u.name, COUNT(t.id) as task_count
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      GROUP BY u.id, u.name
    `).all();
  } else {
    // Only show tasks where member is still part of the project
    tasks = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.assigned_to = ? AND pm.user_id = ?
    `).all(req.user.id, req.user.id);
    overdue = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.assigned_to = ? AND pm.user_id = ?
      AND t.due_date < ? AND t.status != 'done'
    `).all(req.user.id, req.user.id, today);
  }

  const statusCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  res.json({
    total: tasks.length,
    statusCounts,
    overdue,
    tasks,
    tasksByUser

  });
};

module.exports = { getDashboard };