# Team Task Manager

A full-stack team-based task management application built with the MERN stack.  
It allows users to create teams, manage members, assign tasks, track progress, and analyze team productivity through an interactive dashboard.

This project focuses on team collaboration, role-based access control, task tracking, responsive UI, and analytics.

---

## Live Demo

[View Live Project](https://task-manager-mu-jet-14.vercel.app/)

---

## Repository

[GitHub Repository](https://github.com/vivek-rawat33/task-manager)

---

## Overview

Team Task Manager is designed for small teams, student groups, project teams, and collaborative workspaces where tasks need to be assigned, tracked, and managed based on user roles.

The application supports multiple teams, team members, role-based permissions, task assignment, task status tracking, deadlines, categories, priorities, and analytics charts.

---

## Features

### Authentication

- User signup
- User signin
- JWT-based authentication
- Password hashing using bcrypt
- Protected dashboard routes
- Persistent login using stored auth token
- Logout functionality

---

### Team Management

- Create a new team
- View joined teams
- Switch between teams
- Add members to a team using email
- View team members
- Manage team members based on role
- Delete or update team based on permissions

---

### Role-Based Access Control

The application uses team-level roles to control what each user can do inside a team.

| Role   | Permissions                                       |
| ------ | ------------------------------------------------- |
| Owner  | Full access to team, members, tasks, and settings |
| Admin  | Can manage members and tasks                      |
| Member | Can view tasks and update assigned tasks          |
| Viewer | Read-only access                                  |

Role-based permissions are enforced on both frontend and backend.

---

### Task Management

- Create tasks inside a selected team
- Assign tasks to team members
- Update task status
- Mark tasks as completed
- Set task priority
- Set task deadline
- Add task category
- Delete tasks based on permission
- View assigned users
- Search and filter tasks
- Responsive task table

---

### Task Categories

Tasks can be categorized into:

- General
- Frontend
- Backend
- UI
- Feature
- Bug Fix
- Planning

---

### Task Priorities

Tasks support three priority levels:

- Low
- Medium
- High

---

### Dashboard and Analytics

The dashboard provides visual insights into team progress.

Implemented analytics include:

- Total task overview
- Task activity chart
- Status distribution chart
- Priority distribution chart
- Deadline overview chart
- Member performance chart

The analytics section is responsive and optimized for desktop, tablet, and mobile screens.

---

### Responsive Design

The application is optimized for:

- Desktop
- Tablet
- Mobile

Responsive features include:

- Adaptive sidebar
- Responsive dashboard layout
- Mobile-friendly task table
- Proper table scrolling on smaller screens
- Optimized charts for mobile and tablet views

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```txt
task-manager/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## Environment Variables

### Backend `.env`

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend `.env`

Create a `.env` file inside the `frontend` folder.

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/vivek-rawat33/task-manager.git
cd task-manager
```

---

### 2. Install backend dependencies

```bash
cd backend
npm install
```

---

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

### 4. Start backend server

```bash
cd backend
npm run dev
```

Backend will run on:

```txt
http://localhost:5000
```

---

### 5. Start frontend development server

```bash
cd frontend
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

---

## API Routes Overview

### Auth Routes

```txt
POST /api/auth/signup
POST /api/auth/signin
GET  /api/auth/me
```

---

### Team Routes

```txt
POST   /api/teams
GET    /api/teams
GET    /api/teams/:teamId
GET    /api/teams/:teamId/members
POST   /api/teams/:teamId/members
PATCH  /api/teams/:teamId
DELETE /api/teams/:teamId
```

---

### Task Routes

```txt
POST   /api/teams/:teamId/tasks
GET    /api/teams/:teamId/tasks
PATCH  /api/tasks/:taskId
DELETE /api/tasks/:taskId
```

---

## Role Permissions

| Action               | Owner | Admin   | Member  | Viewer |
| -------------------- | ----- | ------- | ------- | ------ |
| Create team          | Yes   | No      | No      | No     |
| Update team          | Yes   | Limited | No      | No     |
| Delete team          | Yes   | No      | No      | No     |
| Add members          | Yes   | Yes     | No      | No     |
| Remove members       | Yes   | Yes     | No      | No     |
| Change roles         | Yes   | Limited | No      | No     |
| Create task          | Yes   | Yes     | Limited | No     |
| Update any task      | Yes   | Yes     | No      | No     |
| Update assigned task | Yes   | Yes     | Yes     | No     |
| Delete task          | Yes   | Yes     | No      | No     |
| View tasks           | Yes   | Yes     | Yes     | Yes    |

---

## Screenshots

Add your screenshots inside a `screenshots` folder and update the image paths below.

```md
![Dashboard](./screenshots/dashboard.png)
![Task Table](./screenshots/tasks.png)
![Analytics](./screenshots/analytics.png)
![Mobile View](./screenshots/mobile.png)
```

---

## Suggested Screenshots to Add

For a better GitHub presentation, add screenshots of:

1. Signup page
2. Signin page
3. Dashboard overview
4. Task table
5. Analytics charts
6. Team members section
7. Mobile/tablet view

---

## Main Learning Outcomes

This project helped me understand and implement:

- Full-stack MERN architecture
- REST API design
- JWT authentication
- Password hashing using bcrypt
- Protected backend routes
- Role-based access control
- MongoDB schema design
- Mongoose relationships
- Team-based data modeling
- Task assignment logic
- Dashboard analytics
- Data visualization using Recharts
- Responsive UI using Tailwind CSS and shadcn/ui
- Frontend-backend integration using Axios
- CORS configuration
- Deployment using Vercel and Render

---

## Known Limitation

The backend is deployed on Render free tier.  
Because of this, the server may take a few seconds to respond after a period of inactivity due to cold start.

This does not affect the stored data. It only causes a delay when the backend wakes up.

---

## Future Improvements

Planned improvements for future versions:

- Email verification
- Google OAuth login
- Forgot password flow
- Real-time updates using Socket.IO
- Push notifications
- Notification center
- Task comments
- File attachments
- Activity logs
- Advanced filtering
- Advanced analytics
- Better team invitation system

---

## Current Status

Version 1 is focused on:

- Authentication
- Team management
- Role-based access
- Task management
- Assignment workflow
- Dashboard analytics
- Responsive UI
- Production deployment

---

## Author

**Vivek Singh Rawat**

- GitHub: [vivek-rawat33](https://github.com/vivek-rawat33)
- Project: Team Task Manager

---

## License

This project is open source and available under the MIT License.
