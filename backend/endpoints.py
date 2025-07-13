from fastapi import FastAPI,File,UploadFile,Form,HTTPException,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import json
import cv2,base64
from sklearn.cluster import KMeans
import matplotlib
matplotlib.use("Agg")  # Headless mode
import matplotlib.pyplot as plt
import numpy as np
from skimage.filters import threshold_otsu
import pointpats as pp 
import tempfile
import uuid
import os
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()

# ---------- configurable “safety” constants -------------------
MAX_DIM = 2048          # longest side in pixels after optional resize
MAX_PTS = 17_500        # max foreground points sent to K estimator
RIPLEY_DIR = Path("/app/ripley_output")
RIPLEY_DIR.mkdir(exist_ok=True, parents=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:80",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST","OPTIONS"],
    allow_headers=["*"],
)

#Encode image array to base64 blob for response(only small images)
def encode_image_to_base64(img_array):
    #Starts buffer of encoding
    _, buffer = cv2.imencode('.png', img_array)
    #Generates img bytes
    img_bytes = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{img_bytes}"

#Generates a Ripleys K Function plot
def plot_ripley(support, k_emp, k_csr):
    """Return a matplotlib Figure comparing empirical vs. CSR K."""
    fig, ax = plt.subplots()
    ax.plot(support, k_emp, label="Empirical K(r)")
    ax.plot(support, k_csr, "--", label="CSR expectation π r²")
    ax.set_xlabel("Radius r (px)")
    ax.set_ylabel("K(r)")
    ax.legend()
    ax.set_title("Ripley’s K vs. CSR")
    fig.tight_layout()
    return fig

#Endpoint to select colors in img. 
@app.post("/cluster")
async def upload(
    image: UploadFile = File(...),
    clusters: int = Form(...)):

    #Reads the img
    contents = await image.read()
    #Load the img and reshape it for kmeans
    img = Image.open(io.BytesIO(contents)).convert('RGB')
    img_np = np.array(img)
    pixels = img_np.reshape((-1, 3))  

    
    #Run KMeans with number of colors selected by user+1 for the background group
    kmeans = KMeans(n_clusters=clusters+1, n_init=10)
    #Labels the pixels by group
    labels = kmeans.fit_predict(pixels)
    #Create a 2d label array
    labels_2d = labels.reshape((img_np.shape[0], img_np.shape[1]))

    #Create the images by KMeans group 
    img_results = []
    for i in range(clusters+1):
        #Creates a mask for the img pixels to be selected
        mask = labels_2d == i
        cluster_img = np.zeros_like(img_np)
        cluster_img[mask] = img_np[mask]
        #Calculates the total intensity of the img by group
        img_intensity = int(np.sum(cluster_img))
        img_b64 = encode_image_to_base64(cluster_img)

        #Return results for every img, img name, the image itself and the
        #intensity value for that img.
        img_results.append({
            'name': f"cluster_{i}",
            'image_base64': img_b64,
            'img_intensity': img_intensity
        })

    return img_results
    

#Endpoint for Ripleys K analysis of a selected color or binary mask
# -----------------------  ENDPOINT  ----------------------------
@app.post("/statistical")
async def statanalysis(image: UploadFile = File(...)):
    """Compute Ripley’s K on a binary mask using pointpats (memory‑safe)."""
    
    # --- load & optional down‑scale --------------------------------------
    raw_bytes = await image.read()
    img = Image.open(io.BytesIO(raw_bytes)).convert("L")  # 8‑bit gray

    if max(img.size) > MAX_DIM:
        img.thumbnail((MAX_DIM, MAX_DIM))  # keeps aspect ratio

    np_gray = np.array(img)

    # --- Otsu threshold → binary mask ------------------------------------
    thresh = threshold_otsu(np_gray)
    binary = np_gray > thresh
    bin_uint8 = (binary * 255).astype(np.uint8)
    b64_mask = encode_image_to_base64(bin_uint8)

    # --- point coordinates of foreground pixels --------------------------
    ys, xs = np.nonzero(binary)
    points = np.column_stack((xs, ys))          # shape (N, 2)

    downsampled = False
    if len(points) > MAX_PTS:
        indices = np.random.choice(len(points), size=MAX_PTS, replace=False)
        points = points[indices]
        downsampled = True

    # --- Ripley’s K via pointpats ----------------------------------------
    h, w = binary.shape
    area = h * w
    r_max = min(w, h) / 2
    support = np.linspace(0, r_max, 50)         # 50 radii from 0 → r_max

    support, k_vals = pp.k(points, support=support)        
    k_csr = np.pi * support**2                  # CSR expectation

    # --- plot & persist ---------------------------------------------------
    user_dir = RIPLEY_DIR / f"user_{uuid.uuid4().hex}"
    user_dir.mkdir(parents=True, exist_ok=True)
    plot_path = user_dir / "ripley_k.png"

    fig = plot_ripley(support, k_vals, k_csr)
    fig.savefig(plot_path, dpi=150)
    plt.close(fig)

    return {
        "binarized_img": b64_mask,
        "plot_id": user_dir.name,
        "n_points": int(len(points)),
        "downsampled": len(points) < len(xs),   # True if we sampled
    }

@app.get("/download/ripley-k/{tempdir}")
def download_ripley_k(tempdir: str):
    base_path = Path("/app/ripley_output") / tempdir
    file_path = base_path / "ripley_k.png"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Not found")

    return FileResponse(
        path=str(file_path),
        media_type="image/png",
        filename="ripley_k.png"
    )
