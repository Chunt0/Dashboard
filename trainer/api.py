import os
import subprocess
from fastapi import FastAPI, Request
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()  # support local `.env` files in dev

# Config paths (can be overridden by Docker env)
PIPE_PATH = os.getenv("DIFFUSION_PIPE_PATH", "../../diffusion-pipe")
DATASETS_PATH = os.getenv("DATASETS_PATH", "../datasets")
MODELS_PATH = os.getenv("MODELS_PATH", "../models")

app = FastAPI()

class TrainRequest(BaseModel):
    dataset: str  # name only, not full path
    config: dict = {}

@app.get("/api/health")
def get_health(req: Request):
    # Return a simple JSON response indicating health status
    return {"status": "healthy"}


@app.post("/api/train")
def launch_training(req: TrainRequest):
    dataset_dir = os.path.join(DATASETS_PATH, req.dataset)
    model_out = os.path.join(MODELS_PATH, f"{req.dataset}_model.pt")

    train_script = os.path.join(PIPE_PATH, "train.py")

    # Build the command
    cmd = [
        "python", train_script,
        "--dataset", dataset_dir,
        "--output", model_out,
        # Include other args if needed
    ]

    # Optional: pass config as JSON file or individual args
    # Or save req.config to a file and pass that

    # Run non-blocking (fire and forget)
    subprocess.Popen(cmd)

    return {"status": "started", "dataset": req.dataset}

