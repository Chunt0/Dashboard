import cv2
import asyncio
import aiohttp
import base64
import os
import subprocess
import argparse

async def clip_video(batch_name, vids_dir: str = "./src/uploads/", output_root: str = "../datasets/video/"):
    for video in os.listdir(vids_dir):
        if not video.lower().endswith(".mp4"):
            continue

        base, ext = os.path.splitext(video)
        inp_path = os.path.join(vids_dir, video)
        tgt_dir = os.path.join(output_root, batch_name)
        os.makedirs(tgt_dir, exist_ok=True)
        os.makedirs(f"{tgt_dir}/completed", exist_ok=True)

        # Get total duration of the video
        cmd_scenedetect = [
            "scenedetect", "-i", inp_path, "split-video", "-o", tgt_dir]

        subprocess.run(cmd_scenedetect, stdout=subprocess.PIPE, text=True, check=True)
        os.remove(inp_path)

        for filename in os.listdir(tgt_dir):
            if filename.endswith('.mp4'):
                video_path = os.path.join(tgt_dir, filename)  # Construct video path
                txt_file_path = os.path.splitext(video_path)[0] + '.txt'  # Corresponding .txt file path
                if not os.path.exists(txt_file_path):  # If .txt file does not exist
                    cap = cv2.VideoCapture(video_path)  # Open the video file
                    ret, frame = cap.read()  # Read the first frame
                    if ret:
                        _, img_encoded = cv2.imencode('.jpg', frame)  # Encode the frame as JPEG
                        img_64 = base64.b64encode(img_encoded).decode('utf-8')  # Convert to base64
                        await create_image_label(img_64, tgt_dir, filename)  # Create image label if .txt does not exist
                    cap.release()  # Release the video capture object

async def create_image_label(img_64, tgt_dir, filename):
    payload = {
        "model": "gemma3:27b",
        "messages": [
            {
                "role": "user",
                "content": "create a comma separated image label describing this picture. only return this label, no extra commentary, no quotation marks, and no redundant words. make sure this label contains cinematographic directions, the label will be used to train an image2video model.",
                "images": [img_64]
            }
        ],
        "stream": False
    }

    url = 'http://localhost:11434/api/chat'
    headers = {'Content-Type': 'application/json'}

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload) as response:
            txt_path = os.path.join(tgt_dir, filename.replace('.mp4', '.txt'))
            if response.status == 200:
                res = await response.json()  # Parse JSON directly
                content = res["message"]["content"]
                # Save content to the text file
                with open(txt_path, 'w') as f:
                    f.write(content)
            else:
                # Create an empty file if response is not successful
                if not os.path.exists(txt_path):
                    with open(txt_path, 'w') as f:
                        pass  # or write default info if needed

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-dir', type=str, required=True)
    args = parser.parse_args()
    await clip_video(args.dir)


if __name__ == "__main__":
    asyncio.run(main())
