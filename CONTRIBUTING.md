# Contributing to TaskFlow

Thank you for your interest in contributing to **TaskFlow**! We welcome contributions from developers of all skill levels.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## How Can I Contribute?

### 1. Reporting Bugs
- Check existing [GitHub Issues](https://github.com/VinayKrishna-7/TaskFlow/issues) before opening a new one.
- Use the **Bug Report** template and provide:
  - Clear steps to reproduce
  - Expected vs. actual behavior
  - Screenshots or console logs if applicable
  - Environment details (Node version, browser, OS)

### 2. Suggesting Enhancements
- Open a **Feature Request** issue detailing the motivation, proposed solution, and potential alternatives.

### 3. Code Contributions
1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Make your changes** following the project standards:
   - Write clean, type-safe TypeScript.
   - Maintain consistent styling using Tailwind CSS.
   - Ensure existing tests pass.

4. **Verify your changes locally**:
   ```bash
   # Run backend tests
   npm run test:server

   # Run frontend tests
   npm run test:client

   # Run production build checks
   npm run build
   ```

5. **Commit your changes**:
   Use clear, conventional commit messages:
   ```bash
   git commit -m "feat(kanban): add task priority color indicator"
   # or
   git commit -m "fix(tasks): resolve filter reset on project switch"
   ```

6. **Push to your fork and submit a Pull Request**:
   - Provide a clear PR title and fill in the PR template description.
   - Reference any relevant issue numbers (e.g., `Fixes #12`).

---

## Project Architecture Overview

- **`client/`**: React 18, Vite, TypeScript, Tailwind CSS, Zustand, Recharts, `@dnd-kit`.
- **`server/`**: Express.js, TypeScript, MongoDB (Mongoose), Socket.IO, JWT.

---

## Questions?

Feel free to open an issue or reach out via [GitHub Discussions](https://github.com/VinayKrishna-7/TaskFlow/discussions).
