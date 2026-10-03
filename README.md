# TaskFlow

A modern, full-stack project and task management web application built with React, Node.js, Express, and MongoDB.

TaskFlow helps individuals and teams organize projects, track progress with interactive Kanban boards, generate task breakdowns using AI, and collaborate in real time.

🔗 **Live Demo**: [https://taskflow-1-p7yr.onrender.com](https://taskflow-1-p7yr.onrender.com)

> [!NOTE]
> **Live Demo Wake-Up Note**: The application is hosted on Render's free tier. If the website has not been visited recently, the cloud instance automatically enters a sleep state to conserve resources. The initial visit may take **30–50 seconds** to wake up the backend server. Once active, it operates seamlessly and fast.

Users can click **Create account** on the sign-in page to register with their email address, initialize a personal workspace, and start managing projects.

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
</p>

---

## 🛠️ Tech Stack & What We Used

- **Frontend Core**: **React 18**, **TypeScript**, and **Vite** for fast, reactive UI development
- **UI & Styling**: **Tailwind CSS** with custom dark and light themes, and **Lucide Icons**
- **State Management**: **Zustand** for lightweight and fast global client state
- **Kanban Drag & Drop**: **@dnd-kit/core** & **@dnd-kit/sortable** for 60 FPS accessible task drag-and-drop
- **Charts & Visualizations**: **Recharts** for velocity graphs and continuous 360° task status rings
- **Backend API**: **Node.js** & **Express.js** (TypeScript) with modular REST architecture
- **Database & ODM**: **MongoDB** with **Mongoose** (featuring automatic persistent embedded DB fallback)
- **Real-Time Sockets**: **Socket.IO** for live multi-user board and task updates
- **AI Task Decomposition**: **Google Gemini AI** for smart project planning and automated task generation
- **Auth & Security**: **JWT** (JSON Web Tokens) with persistent sessions, bcrypt password hashing, and token reset

---

## 🚀 Key Features

- **Executive Dashboard**: High-level overview of workspace metrics, task velocity, 360° status donut ring, and upcoming deadlines built with **Recharts**. Clickable KPI cards filter tasks instantly.
- **My Tasks**: Multi-project aggregated task view with instant regex-safe search (by title, #number, labels, assignees) and list/grid card view toggles.
- **Kanban Board**: Drag-and-drop task management across customizable workflow columns powered by **@dnd-kit**.
- **AI Project Planner**: Break down project prompts into structured milestones and tasks using **Google Gemini AI**.
- **Real-Time Synchronization**: Instant multi-client updates for task moves, status changes, and comments with **Socket.IO**.
- **Interactive Calendar**: Monthly schedule and daily timeline views for tracking deadlines.
- **Dark & Light Themes**: Obsidian Blue dark theme and Warm Cream light theme built with **Tailwind CSS**.
- **Authentication & Security**: Secure **JWT** authentication with persistent sessions and password reset support.

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

This project is licensed under the [MIT License](LICENSE).

## Author

Created by [Vinay Krishna](https://github.com/VinayKrishna-7).
