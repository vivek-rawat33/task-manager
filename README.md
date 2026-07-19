# Team Task Manager

A full-stack team task management application built with the MERN stack.  
It allows users to create teams, manage team members, assign tasks, track progress, and view productivity analytics through an interactive dashboard.

## Live Demo

[View Live Project](https://task-manager-mu-jet-14.vercel.app/)

## GitHub Repository

[Repository Link](https://github.com/vivek-rawat33/task-manager)

---

## Features

### Authentication

- User signup and signin
- JWT-based authentication
- Protected dashboard routes
- Persistent login using stored auth token
- Logout functionality

### Team Management

- Create teams
- View all joined teams
- Switch between teams
- Add members to a team using email
- Role-based team access
- Delete/update teams based on permission

### Role-Based Access Control

The app supports multiple roles inside a team:

| Role   | Permissions                             |
| ------ | --------------------------------------- |
| Owner  | Full access to team, members, and tasks |
| Admin  | Can manage tasks and team members       |
| Member | Can work on assigned tasks              |
| Viewer | Read-only access                        |

### Task Management

- Create tasks inside a team
- Assign tasks to team members
- Update task status
- Set task priority
- Set deadlines
- Categorize tasks
- Delete tasks based on permission
- Mark tasks as completed
- Search and filter task data

### Dashboard and Analytics

- Total tasks overview
- Task status distribution
- Priority distribution
- Deadline overview
- Member performance chart
- Task activity chart
- Responsive analytics layout

### Responsive UI

- Desktop dashboard layout
- Mobile and tablet optimized views
- Responsive task table
- Sidebar navigation
- Dark UI design using shadcn/ui and Tailwind CSS

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
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```
