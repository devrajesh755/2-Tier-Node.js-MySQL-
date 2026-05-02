## Project URL 
[ https://github.com/devrajesh755/2-Tier-Node.js-MySQL-](https://roadmap.sh/projects/nodejs-service-deployment)
 
# ⬡ TaskFlow — 2-Tier Node.js + MySQL Application
 
A production-ready **2-Tier Architecture** task management app:

| Tier | Technology | Responsibility |
|------|-----------|----------------|
| **Tier 1** | Node.js + Express | REST API + Static Frontend (HTML/CSS/JS) |
| **Tier 2** | MySQL | Persistent Data Storage |

---

## 📐 Architecture Overview

```
┌────────────────────────────────────────┐
│           TIER 1 — App Server          │
│                                        │
│  ┌─────────────┐   ┌────────────────┐  │
│  │  Express    │   │  Static        │  │
│  │  REST API   │   │  Frontend SPA  │  │
│  │  /api/*     │   │  /public/*     │  │
│  └──────┬──────┘   └────────────────┘  │
│         │ mysql2 connection pool       │
└─────────┼──────────────────────────────┘
          │
┌─────────▼──────────────────────────────┐
│           TIER 2 — Database            │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  MySQL — twotier_db              │  │
│  │  • users  table                  │  │
│  │  • tasks  table                  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
2tier-mysql-nodejs-app/
├── src/
│   ├── server.js                  # Express entry point
│   ├── models/
│   │   ├── db.js                  # MySQL connection pool
│   │   └── init.js                # DB schema initializer
│   ├── controllers/
│   │   ├── authController.js      # Register / Login / Logout / Me
│   │   └── taskController.js      # CRUD for tasks
│   ├── routes/
│   │   ├── auth.js                # POST /api/auth/*
│   │   └── tasks.js               # GET|POST|PUT|DELETE /api/tasks
│   └── middleware/
│       └── auth.js                # Session-based auth guard
├── public/                        # Static frontend (served by Express)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── .env                           # Environment variables (see below)
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | v18+ | https://nodejs.org |
| npm | v8+ | Comes with Node |
| MySQL | v8+ | https://dev.mysql.com/downloads/ |

---

## 🚀 Installation & Setup

### 1. Clone / Download the project

```bash
git clone <your-repo-url>
cd 2tier-mysql-nodejs-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy or edit the `.env` file in the project root:

```bash
# Open .env and set your MySQL credentials
nano .env
```

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=twotier_db

SESSION_SECRET=supersecretkey_change_in_production
```

> **Important:** Replace `DB_PASSWORD` with your actual MySQL root (or user) password.

### 4. Initialize the database

This creates the `twotier_db` database and all required tables automatically:

```bash
npm run db:init
```

You should see:
```
✅  Database & tables initialized successfully
```

### 5. Start the application

**Development** (auto-restart on file changes):
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
✅  MySQL connected successfully
🚀  Server running → http://localhost:3000
📦  Environment   → development
```

### 6. Open the app

Visit **http://localhost:3000** in your browser.

---

## 🗄️ Database Schema

Only **one database** (`twotier_db`) is used, with two tables:

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM('admin','user') | default: user |
| created_at | TIMESTAMP | |

### `tasks`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users.id | CASCADE DELETE |
| title | VARCHAR(255) | |
| description | TEXT | nullable |
| status | ENUM('todo','in_progress','done') | default: todo |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | auto-updated |

---

## 🔌 REST API Reference

### Auth Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ name, email, password }` | Create account |
| POST | `/api/auth/login` | `{ email, password }` | Sign in |
| POST | `/api/auth/logout` | — | Sign out |
| GET | `/api/auth/me` | — | Get current user |

### Task Endpoints *(require auth)*

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | — | List all your tasks |
| GET | `/api/tasks/:id` | — | Get single task |
| POST | `/api/tasks` | `{ title, description?, status? }` | Create task |
| PUT | `/api/tasks/:id` | `{ title, description, status }` | Update task |
| DELETE | `/api/tasks/:id` | — | Delete task |

### Health Check

```
GET /api/health  →  { status: "ok", time: "..." }
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start dev server with nodemon |
| `npm run db:init` | Create database and tables |

---

## 🔒 Security Notes

- Passwords are hashed with **bcryptjs** (salt rounds: 10)
- Sessions use **express-session** with `httpOnly` cookies
- Each user only sees **their own tasks** (user_id scoping)
- Change `SESSION_SECRET` to a long random string in production
- Set `NODE_ENV=production` for production deployments

---

## 🐳 Docker Quick Start (Optional)

If you prefer Docker for MySQL instead of a local install:

```bash
docker run -d \
  --name mysql-twotier \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -e MYSQL_DATABASE=twotier_db \
  -p 3306:3306 \
  mysql:8
```

Then set your `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=twotier_db
```

Run `npm run db:init` and `npm start` as usual.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `MySQL connection failed` | Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env` |
| `Access denied for user` | Grant privileges: `GRANT ALL ON twotier_db.* TO 'youruser'@'localhost';` |
| `Port 3000 already in use` | Change `PORT=3001` in `.env` |
| `Cannot find module` | Run `npm install` |
| Tables not found | Run `npm run db:init` |

---


## 📜 License

MIT — free to use and modify.


