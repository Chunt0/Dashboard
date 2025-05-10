# Video & Image Labeling App

A full-stack, web-based tool for efficient labeling of videos and images. Upload `.mp4` files, video URLs, and images; annotate them with flexible label tools; manage and review your labeled data; and export finalized datasets—ready for your ML pipeline.

---

## Features

- **Upload local folders of videos (mp4) or images (png, jpg, etc.)**
- **Add video sources via URL**
- **Flexible labeling UI** for both images and videos
- **Dataset browser**: View, filter, and edit labeled data
- **Edit, modify, and review** your existing labels
- **Save/export datasets** on the server in a machine-learning-ready format
- **User-friendly interface**, built with React + Vite
- **Backend**: Node.js/Express with TypeScript for secure file management and processing

---

## Quickstart

### Prerequisites

- Node.js (18.x+ recommended)
- npm
- [Optional] Docker (for deployment)
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

### 2. Install dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

---

### 3. Run in development mode

From your project root:

```bash
npm install      # to install concurrently at root if not already installed
npm run dev      # starts both frontend and backend concurrently
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:3000  

If running independently:

- `cd client && npm run dev` (frontend)
- `cd server && npm run dev` (backend, with auto-reload via nodemon)

---

### 4. Production build

```bash
# Build frontend
cd client
npm run build

# (Optional) Serve production build via backend
```

---

### 5. Configuration

- Backend configuration via environment variables in `server/.env`
- Frontend configuration via `.env` files in `client/`

See example env files for required values.

---

## Upload and Label

- **Videos:** Upload `.mp4` files or paste a video URL
- **Images:** Upload folder of images (e.g. `.png`, `.jpg`)
- Label using intuitive UI; edit and view labels in the "View" tab.

---

## Data Export & API

- Labeled datasets are saved on the server under `/uploads` or `/datasets`.
- Download/export your finished data as JSON/CSV (format depends on your implementation).

---

## Project Structure

```
repo-root/
  client/      # React frontend (Vite, TypeScript, TailwindCSS)
  server/      # Node.js Express backend (TypeScript)
  uploads/     # Saved/uploaded user files and finished datasets (ignored by git)
  README.md
  .gitignore
  package.json
```

---

## Development Notes

- **Persistent upload storage:** Server-side `/uploads` is volume-mountable for Docker  
- **Extensible labeling tools:** Easily add new label types with modular React components
- **API-first backend:** Add more endpoints for new data types as your use case grows

---

## License

MIT

---

## Contribution

Pull requests welcome! Please open issues for bugs or feature requests.

---

## TODO

- [ ] Add authentication/authorization
- [ ] Optimize video preview in labeling UI
- [ ] Enhance data export formats (TFRecord, COCO, etc.)

---

**Questions?**  
Open an [issue](https://github.com/your-username/your-repo/issues) or email maintainer@example.com.
