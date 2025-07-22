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

## License

MIT
