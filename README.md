# AI/ML Model Training & Data Management Dashboard

A full-stack, web-based dashboard for managing datasets, training machine learning models (e.g., SDXL, Flux, WAN), and performing quality assurance on model outputs.

---

## Features

- **Dataset Management**: Upload images and videos to create datasets for training.
- **Model Training**: Initiate and monitor training jobs for various model architectures.
- **Quality Assurance**: A dedicated interface to review and validate model results.
- **Modern Tech Stack**:
    - **Frontend**: React, Vite, TypeScript
    - **Backend**: Node.js, Express, TypeScript
- **Monorepo**: Managed with `pnpm` workspaces for streamlined development and dependency management.

---

## Quickstart

### Prerequisites

- Node.js (18.x+ recommended)
- **pnpm**
- [Optional] Docker (for containerized deployment)
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2. Install Dependencies

Install all dependencies for the client and server from the project root using `pnpm`.

```bash
pnpm install
```

---

### 3. Run in Development Mode

Start both the frontend and backend services concurrently from the project root.

```bash
pnpm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3000`

---

### 4. Production Build

Build the client and server for production.

```bash
pnpm run build
```

To run the production server, use:
```bash
pnpm run start
```

---

## Project Structure

The repository is a `pnpm` monorepo with the following structure:

```
dashboard/
├── client/         # React frontend application
├── server/         # Node.js backend API
├── datasets/       # Stores datasets for model training
├── models/         # Stores trained model artifacts
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

---

## Configuration

- Environment variables for the backend are managed in `server/.env`.
- Environment variables for the frontend are managed in `client/.env`.

See the `.env.example` files in both the `client` and `server` directories for required values.

---

---

## 📋 Development & Improvements

### Comprehensive TODO List
A detailed list of all necessary fixes, improvements, and upgrades has been created in [`TODO.md`](./TODO.md). The codebase analysis identified:
- **15+ Critical Security & Stability Issues**
- **20+ High Priority Core Issues** (architecture, performance, code quality)
- **25+ Medium Priority Improvements** (documentation, testing, accessibility)

Key areas identified for improvement:
- **Security**: Authentication, input validation, rate limiting, CORS configuration
- **Architecture**: Code duplication reduction, service extraction, async handling
- **Performance**: Memory optimization, stream-based file operations, caching
- **Testing**: Setup Jest/Vitest, write unit and integration tests (0% coverage currently)
- **Documentation**: API docs, architecture guides, deployment procedures
- **Code Quality**: Type safety improvements, error handling, code consistency

### Implementation Roadmap
The TODO list includes a 4-week implementation schedule with specific priorities:
- **Week 1**: Critical security & stability fixes
- **Week 2**: Architecture improvements & code refactoring
- **Week 3**: Testing framework setup & documentation
- **Week 4**: Polish, optimization, and E2E testing

See [`TODO.md`](./TODO.md) for the complete detailed breakdown with file locations, impact assessments, and specific timelines.

---

## License

MIT
