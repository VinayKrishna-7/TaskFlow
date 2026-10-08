# TaskFlow

TaskFlow is a collaborative task and workflow management application designed to simplify project tracking and sprint planning. It brings together interactive drag-and-drop Kanban boards, real-time multi-user synchronization, AI-assisted task breakdown, and progress analytics into a focused, responsive interface.

[Live Demo](https://taskflow-1-p7yr.onrender.com)

> **Note:** The demo is hosted on Render's free tier. If the service has been idle, please allow 30–50 seconds for the server to spin up on your first visit.

---

## Features

- **Kanban Board** — Drag-and-drop task management across customizable stages (To Do, In Progress, In Review, Done).
- **Workspaces & Projects** — Organize tasks by project, set priorities, and track due dates.
- **Real-Time Updates** — Live board sync across teammates using WebSockets (Socket.IO).
- **AI Task Assistant** — Generate task breakdowns and checklists from a project description.
- **Analytics & Calendar** — Track task progress, completion rates, and upcoming deadlines.
- **Authentication** — Email-based authentication with JWT tokens and password reset.
- **Dark & Light Themes** — Dark mode with plum accents and warm cream light mode.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Drag & Drop:** `@dnd-kit`
- **Charts & Icons:** Recharts, Lucide React
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose
- **Real-Time:** Socket.IO
- **AI:** Google Gemini API
- **Deployment:** Render

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally (or MongoDB Atlas connection string)

### 1. Clone the repository

```bash
git clone https://github.com/VinayKrishna-7/TaskFlow.git
cd TaskFlow
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Environment Variables

Create `.env` in the `server` directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

Create `.env` in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. (Optional) Seed sample data

```bash
npm run seed
```

### 5. Run the application

```bash
npm run dev
```

This starts both servers concurrently:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts frontend and backend concurrently in dev mode |
| `npm run build` | Builds both frontend and backend for production |
| `npm run seed` | Seeds database with initial sample projects and tasks |
| `npm test` | Runs backend test suite |
| `npm run lint` | Runs ESLint on frontend code |

---

## License

[MIT](LICENSE)
