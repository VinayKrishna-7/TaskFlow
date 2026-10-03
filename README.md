# TaskFlow

> A modern, full-stack project and task management web application to organize projects, track progress with Kanban boards, generate task breakdowns with AI, and collaborate in real time.

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-RENDER-20e8b6?style=for-the-badge&logo=render&logoColor=white)](https://taskflow-1-p7yr.onrender.com)
[![React](https://img.shields.io/badge/REACT-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/NODE.JS-20+-43853d?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind](https://img.shields.io/badge/TAILWIND-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MONGODB-8.9-47a248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/SOCKET.IO-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

---

## 🌐 Live Website

Open the live website:  
👉 **[https://taskflow-1-p7yr.onrender.com](https://taskflow-1-p7yr.onrender.com)**

> ⏳ **Note about the live link:**  
> The site is hosted on Render's free tier. If no one has visited recently, the server goes into sleep mode to save resources. When opening the link for the first time, it might take **30 to 50 seconds** to wake up. Please wait a moment for the page to load!

---

## 📖 What is TaskFlow?

**TaskFlow** makes it easy for individuals and teams to organize tasks, track project delivery, and collaborate in real time.

Users can create an account using their **email address**, set up workspaces, invite team members, and manage deliverables across multiple project boards:

1. 📋 **Workspace & Project Hub**  
   Organize your work into dedicated workspaces and projects. Easily switch between project contexts or aggregate deliverables across all projects in a unified view.

2. 📌 **Interactive Kanban Board**  
   Drag and drop tasks across workflow stages (`To Do`, `In Progress`, `In Review`, `Completed`) with zero latency and instant real-time sync for all teammates.

3. 🤖 **AI Project Decomposition**  
   Type a high-level project requirement (e.g., *"Build a responsive e-commerce checkout flow"*), and TaskFlow automatically generates structured milestones, subtasks, and estimates using Google Gemini AI.

---

## ✨ Features

- **Interactive Kanban**: Fluid 60 FPS drag-and-drop task movement across customizable stages.
- **My Tasks Hub**: Unified view of all assigned tasks across projects with real-time search and filter toggles.
- **AI Task Planner**: Break down requirements into actionable subtasks with one click using Google Gemini AI.
- **Live Synchronization**: Real-time multi-user board and task updates powered by Socket.IO.
- **Executive Dashboard**: Visual metrics for task velocity, deadlines, and a continuous 360° completion donut chart.
- **Calendar & Timeline**: Plan and track deliverables on a month/day timeline with overdue indicators.
- **Secure Email Authentication**: JWT authentication with 30-day session persistence and password reset.
- **Light & Dark Themes**: Obsidian Blue dark mode and Warm Cream light mode with zero screen flicker.
- **Mobile Friendly**: Designed to look clean and work smoothly on phones, tablets, and desktops.

---

## 🛠️ Tech Stack

| Layer | Tools Used |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| **Kanban & UI** | `@dnd-kit/core`, `@dnd-kit/sortable`, Recharts, Lucide Icons |
| **Backend** | Node.js 20+, Express.js, TypeScript |
| **Database** | MongoDB, Mongoose ODM |
| **Real-Time** | Socket.IO (WebSockets) |
| **AI Integration** | Google Gemini AI |
| **Hosting** | Render (Static Site + Web Service) + MongoDB Atlas |

---

## 🚀 Getting Started Locally

Follow these quick steps to run the project on your computer.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** *(or use the built-in automatic runner)*

### 1. Clone the Repository

```bash
git clone https://github.com/VinayKrishna-7/TaskFlow.git
cd TaskFlow
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Set Up Environment Files

Create a `.env` file in the `server` folder:
```env
PORT=5000
CLIENT_URL="http://localhost:5173"
MONGO_URI="mongodb://127.0.0.1:27017/taskflow"
JWT_ACCESS_SECRET="taskflow_secret_access_key_123"
JWT_REFRESH_SECRET="taskflow_secret_refresh_key_123"
```

Create a `.env` file in the `client` folder:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

### 4. (Optional) Seed Sample Data

Populate demo projects, Kanban tasks, and workspace data:
```bash
npm run seed
```

### 5. Start Development Server

Run both client and server together:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Running Tests

Run the automated tests:
```bash
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
