# TaskFlow

A modern, full-stack project and task management web application built with React, Node.js, Express, and MongoDB.

TaskFlow helps individuals and teams organize projects, track progress with interactive Kanban boards, generate task breakdowns using AI, and collaborate in real time.

---

## Features

- **Dashboard**: High-level overview of workspace metrics, task statuses, completion velocity, and recent activity.
- **My Tasks**: Unified view of all assigned tasks across projects with real-time search, filters, and list/card toggles.
- **Kanban Board**: Drag-and-drop task management organized across customizable workflow columns.
- **AI Task Planner**: Break down project requirements into structured milestones and actionable tasks using AI.
- **Real-Time Collaboration**: Live synchronization for task updates, status changes, and comments powered by Socket.IO.
- **Interactive Calendar**: Schedule tasks and track upcoming deadlines with monthly and daily timeline views.
- **Analytics**: Visual charts for team velocity, priority distributions, and completion rates.
- **Theme Support**: Clean dark and light modes with persistent user preference.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, @dnd-kit
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO, Mongoose
- **Database**: MongoDB (supports local MongoDB, MongoDB Atlas, or automatic embedded instance for development)
- **Authentication**: JWT authentication with persistent sessions and password reset support

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [MongoDB](https://www.mongodb.com/) *(optional — an embedded database will automatically run if a local instance is not detected)*

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VinayKrishna-7/TaskFlow.git
   cd TaskFlow
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**

   Copy the example environment files for both server and client:
   ```bash
   # Server environment
   cp server/.env.example server/.env

   # Client environment
   cp client/.env.example client/.env
   ```

4. **Seed Sample Data (Optional)**

   Populate the database with sample users, workspaces, projects, and tasks:
   ```bash
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api`

---

## Project Structure

```
TaskFlow/
├── client/          # React frontend (Vite + Tailwind CSS + TypeScript)
│   ├── src/
│   │   ├── components/  # Reusable UI & layout components
│   │   ├── pages/       # Page views (Dashboard, Kanban, Tasks, Calendar, etc.)
│   │   ├── store/       # Zustand client state stores
│   │   └── services/    # API & WebSocket client services
├── server/          # Express backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/ # Route handlers & business logic
│   │   ├── models/      # Mongoose schemas & data models
│   │   ├── routes/      # REST API route endpoints
│   │   └── sockets/     # Real-time Socket.IO handlers
└── package.json     # Root scripts & workspaces
```

---

## Available Scripts

In the root project directory, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Starts both server and client in development mode |
| `npm run build` | Builds both server and client for production |
| `npm run seed` | Seeds the database with demo projects and tasks |
| `npm run test` | Runs automated test suites |
| `npm run lint` | Runs ESLint checks on client code |

---

## License

This project is licensed under the MIT License.

## Author

Created by [Vinay Krishna](https://github.com/VinayKrishna-7).
