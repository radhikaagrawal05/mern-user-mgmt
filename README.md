# User Management System — MERN Stack

A full-stack User Management System built with MongoDB, Express, React, and Node.js featuring role-based access control (RBAC), JWT authentication with refresh token rotation, and full audit logging.

---

## 🚀 Live Demo

- **Frontend:** `https://your-frontend.vercel.app`
- **Backend API:** `https://your-backend.onrender.com`

### Test Credentials

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@example.com       | Admin@123    |
| Manager | manager@example.com     | Manager@123  |
| User    | user@example.com        | User@123     |

---

## 📋 Features

### Authentication
- JWT-based login with access token (15 min) + refresh token (7 days)
- Refresh token rotation via httpOnly cookies
- Bcrypt password hashing (salt rounds: 12)
- Protected API endpoints

### Role-Based Access Control (RBAC)

| Feature                        | Admin | Manager | User |
|-------------------------------|-------|---------|------|
| View all users (paginated)    | ✅    | ✅      | ❌   |
| Create users                  | ✅    | ❌      | ❌   |
| Assign/change roles           | ✅    | ❌      | ❌   |
| Delete/deactivate users       | ✅    | ❌      | ❌   |
| Update non-admin users        | ✅    | ✅      | ❌   |
| View own profile              | ✅    | ✅      | ✅   |
| Update own profile            | ✅    | ✅      | ✅   |

### User Management
- Paginated, searchable, filterable user list
- Create user with optional auto-generated password
- Soft delete (deactivate) — inactive users cannot log in
- Hard delete (permanent removal)
- Audit trail: createdAt, updatedAt, createdBy, updatedBy

---

## 🏗️ Project Structure

```
mern-user-mgmt/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login, register, refresh, logout
│   │   └── userController.js     # CRUD with RBAC logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect, authorize, requirePermission
│   │   ├── errorMiddleware.js    # Global error handler
│   │   └── validationMiddleware.js # express-validator rules
│   ├── models/
│   │   └── User.js               # Mongoose schema + RBAC permissions
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── jwtUtils.js           # Token generation/verification
│   │   └── seed.js               # Database seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Layout.jsx    # Sidebar + navigation
    │   │   └── users/
    │   │       └── CreateUserModal.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state + login/logout
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── UsersPage.jsx
    │   │   ├── UserDetailPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── services/
    │   │   └── api.js            # Axios instance + interceptors
    │   ├── App.jsx               # Routes + protected route guards
    │   ├── index.css             # Global styles
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/mern-user-mgmt.git
cd mern-user-mgmt
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/user-management
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES=7d
FRONTEND_URL=http://localhost:5173
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint           | Access  | Description         |
|--------|--------------------|---------|---------------------|
| POST   | /api/auth/register | Public  | Register new user   |
| POST   | /api/auth/login    | Public  | Login               |
| POST   | /api/auth/refresh  | Public  | Refresh access token|
| POST   | /api/auth/logout   | Private | Logout              |
| GET    | /api/auth/me       | Private | Get current user    |

### User Endpoints

| Method | Endpoint              | Access         | Description              |
|--------|-----------------------|----------------|--------------------------|
| GET    | /api/users            | Admin, Manager | Get all users (paginated)|
| POST   | /api/users            | Admin          | Create user              |
| GET    | /api/users/:id        | Role-based     | Get user by ID           |
| PUT    | /api/users/:id        | Role-based     | Update user              |
| DELETE | /api/users/:id        | Admin          | Soft delete (deactivate) |
| DELETE | /api/users/:id/hard   | Admin          | Hard delete              |

#### Query Parameters for GET /api/users
```
?page=1&limit=10&search=john&role=user&status=active
```

---

## 🚀 Deployment

### Backend — Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `.env.example`

### Frontend — Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. From the `frontend` directory: `vercel`
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Add `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🔒 Security Features

- Helmet.js for HTTP security headers
- Rate limiting (100 req/15min global, 20 req/15min on auth routes)
- Input validation with express-validator on all endpoints
- Passwords never returned in API responses
- JWT stored in memory + refresh token in httpOnly cookie
- CORS restricted to frontend origin
- Environment variables for all secrets
- Mongoose query sanitization (no raw string interpolation)

---

## 🗄️ Database Schema

### User

```js
{
  name:         String (required, 2-50 chars)
  email:        String (required, unique, lowercase)
  password:     String (hashed, select: false)
  role:         Enum ['admin', 'manager', 'user'] (default: 'user')
  status:       Enum ['active', 'inactive'] (default: 'active')
  refreshToken: String (select: false)
  createdBy:    ObjectId ref User
  updatedBy:    ObjectId ref User
  createdAt:    Date (auto)
  updatedAt:    Date (auto)
}
```

---

## 📝 Git Commit Strategy

```
feat: initialize project structure and dependencies
feat: add User model with RBAC and audit fields
feat: implement JWT authentication with refresh tokens
feat: add RBAC middleware (protect, authorize, requirePermission)
feat: implement user CRUD endpoints with role-based logic
feat: add input validation and error handling middleware
feat: add database seed script
feat: build React frontend with auth context and routing
feat: implement role-based navigation and protected routes
feat: add users list page with search, filter, pagination
feat: add user detail page with inline editing and audit view
feat: add profile page with password update
feat: deploy backend to Render, frontend to Vercel
docs: update README with setup and API reference
```

---

## 👨‍💻 Author

Built for Purple Merit Technologies — MERN Stack Developer Intern Assessment
