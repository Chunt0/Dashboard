import io
import argparse
import asyncio
import aiohttp
import base64
import os
from PIL import Image

async def prep_img(batch_name: str, img_dir: str = "./src/uploads/", output_root: str = "../datasets/image/"):
    tgt_dir = os.path.join(output_root, batch_name)
    for image in os.listdir(img_dir):
        if not image.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            continue

        # take each image, find the shortest side and scale the image such that that shortest side is 1024 pixels


        os.makedirs(tgt_dir, exist_ok=True)
        os.makedirs(f"{tgt_dir}/completed", exist_ok=True)
        

        root, ext = os.path.splitext(image)
        root = root + ".png"
        inp_path = os.path.join(img_dir, image)
        tgt_path = os.path.join(tgt_dir, root)

        img = Image.open(inp_path)
        width, height = img.size
        if width < height:
            new_width = 1024
            new_height = int((1024 / width) * height)
        else:
            new_height = 1024
            new_width = int((1024 / height) * width)
        img = img.resize((new_width, new_height))
        
        # save the image to tgt path but ensuring that it is a png then encode the PIL image into base 64
        img.save(tgt_path, format="PNG")  # Save as PNG
        os.remove(inp_path)

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")  # Save image to buffer as PNG
        img_64 = base64.b64encode(buffered.getvalue()).decode("utf-8")  # Encode to base64
        await create_image_label(img_64, tgt_dir, tgt_path)

async def create_image_label(img_64, tgt_dir, filename):
    payload = {
        "model": "gemma3:27b",
        "messages": [
            {
                "role": "user",
                "content": "create a comma separated image label describing this picture. only return this label, no extra commentary, no quotation marks, and no redundant words. the label will be used to train a text2image model.",
                "images": [img_64]
            }
        ],
        "stream": False
    }

    url = 'http://localhost:11434/api/chat'
    headers = {'Content-Type': 'application/json'}

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload) as response:
            txt_path = filename.replace('.png', '.txt')
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
    await prep_img(args.dir)



if __name__ == "__main__":
    asyncio.run(main())
