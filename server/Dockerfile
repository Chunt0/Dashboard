# ------------------------------------------------------------
# Base image: CUDA 12.8 + nvcc (GPU capable) on Ubuntu 22.04
# ------------------------------------------------------------
FROM nvidia/cuda:12.8.0-devel-ubuntu22.04

# ---------- System packages --------------------------------------------------
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl git ffmpeg ca-certificates build-essential python3-pip && \
    rm -rf /var/lib/apt/lists/*

# ---------- Node 18 LTS -------------------------------------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm --version

# ---------- Python & PyTorch (CUDA 12.8) -------------------------------------
RUN python3 -m pip install --upgrade pip && \
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
RUN pip install packaging

# ---------- Clone diffusion‑pipe (+ submodules) ------------------------------
WORKDIR /opt
RUN git clone --recurse-submodules https://github.com/tdrussell/diffusion-pipe
WORKDIR /opt/diffusion-pipe
RUN pip install -r requirements.txt

# ---------- App directory ----------------------------------------------------
WORKDIR /usr/src/app

# Copy shared lockfile from root and server-specific files
COPY pnpm-lock.yaml ./
COPY server/package.json ./package.json

# Install pnpm and only server dependencies
RUN npm install -g pnpm && pnpm install --prod --filter ./...

# ---------- Copy built JS/TS + built client ----------------------------------
COPY server/dist ./dist
COPY client/dist ./client/dist

# ---------- Runtime configuration -------------------------------------------
ENV PORT=3003 \
    NODE_ENV=production \
    UPLOAD_DIR=/usr/src/app/uploads \
    DATA_DIR=/usr/src/app/datasets \
    MODEL_DIR=/usr/src/app/models \
    DIFFUSION_PIPE_DIR=/opt/diffusion-pipe

EXPOSE 3003

CMD ["node", "dist/index.js"]
