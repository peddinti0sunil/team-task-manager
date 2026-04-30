# Team Task Manager

A full-stack team task management web application built with Node.js, Express, and SQLite. Inspired by Trello/Asana, it allows teams to collaborate on projects with role-based access control.

## Live Demo

🔗 **[https://team-task-manager-production-f8ce.up.railway.app]

## Features

- **User Authentication** — Secure signup/login with JWT
- **Project Management** — Create projects, add/remove members
- **Task Management** — Create tasks with title, description, due date, priority, and assignment
- **Status Tracking** — Update task status (To Do, In Progress, Done)
- **Role-Based Access** — Admins manage everything; members only see and update assigned tasks
- **Dashboard** — View total tasks, status counts, tasks per user, and overdue tasks

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3) with Railway persistent volume
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Frontend:** Plain HTML, CSS, JavaScript (no frameworks)
- **Deployment:** Railway

## Folder Structure


team-task-manager/
├── public/                    # Frontend HTML files
│   ├── index.html             # Login/Signup page
│   ├── dashboard.html         # User dashboard
│   └── tasks.html             # Project & task management
├── src/
│   ├── config/database.js     # Database setup
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Auth middleware
│   ├── routes/                # API routes
│   └── index.js               # Entry point
├── .env                       # Environment variables (not committed)
├── .gitignore
└── package.json



## Local Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/peddinti0sunil/team-task-manager.git
cd team-task-manager

# Install dependencies
npm install

# Create .env file in the project root with:
# PORT=3000
# JWT_SECRET=your_secret_key_here

# Start the server
npm start
```

The app will be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token

### Projects
- `GET /api/projects` — List user's projects
- `POST /api/projects` — Create a project (creator becomes admin)
- `DELETE /api/projects/:id` — Delete a project (creator only)
- `POST /api/projects/:id/members` — Add a member to project
- `GET /api/projects/:id/members` — List project members
- `DELETE /api/projects/:id/members/:userId` — Remove a member

### Tasks
- `GET /api/tasks` — List tasks (admin sees all, members see assigned)
- `POST /api/tasks` — Create a task (admin only)
- `PATCH /api/tasks/:id/status` — Update task status
- `DELETE /api/tasks/:id` — Delete a task (admin only)

### Users
- `GET /api/users` — List all users (admin only)

### Dashboard
- `GET /api/dashboard` — Get dashboard stats (total, by status, per user, overdue)

## Database Schema

- **users** — id, name, email, password (hashed), role, created_at
- **projects** — id, name, description, created_by, created_at
- **project_members** — project_id, user_id (junction table)
- **tasks** — id, title, description, status, priority, due_date, project_id, assigned_to, created_by, created_at

## Roles

- **Member** (default) — Can view and update tasks assigned to them in projects they belong to
- **Admin** — Created automatically when a user creates their first project. Can manage projects, tasks, and members

## Deployment Steps (Railway)

1. Push your code to a GitHub repository
2. Sign up at [railway.app](https://railway.app) and connect GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. In Variables tab, add:
   - `JWT_SECRET=your_secure_secret`
   - `NODE_ENV=production`
6. In Settings → Networking, generate a domain
7. Right-click the canvas → **Volume** → mount path `/app/data` → attach to service
8. Apply changes and deploy

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Railway sets this automatically) | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `random_secret_string` |
| `NODE_ENV` | Environment (use `production` on Railway) | `production` |

## Author

**Sunil Kumar** — [GitHub](https://github.com/peddinti0sunil)

## License

ISC