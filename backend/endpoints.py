from fastapi import FastAPI,File,UploadFile,Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import json
import cv2,base64
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import numpy as np
from skimage.filters import threshold_otsu
from astropy.stats import RipleysKEstimator
import tempfile
import uuid
import os
from fastapi.responses import FileResponse

app = FastAPI()


origins = [
    "http://localhost:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          
    allow_credentials=True,
    allow_methods=["GET,POST"],            
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
def plot_ripleys_k_vs_csr(radii, k_vals, k_csr):
    #Sets fig size
    fig, ax = plt.subplots(figsize=(8, 5))
    #Plots K response
    ax.plot(radii, k_vals, label="Observed K(r)", marker='o')
    #Plots CSR as control
    ax.plot(radii, k_csr, label="CSR", linestyle='--', color='gray')
    ax.set_xlabel("Radius (r)")
    ax.set_ylabel("K(r)")
    ax.set_title("Ripley's K Function vs CSR")
    ax.legend()
    ax.grid(True)
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
@app.post("/statistical")
async def statanalysis(
    image: UploadFile = File(...)):
    #Reads the img
    contents = await image.read()
    img = Image.open(io.BytesIO(contents)).convert("L")
    np_image = np.array(img)
    
    #Binarizes the img using otsu's Method
    threshold = threshold_otsu(np_image)
    binary = np_image > threshold
    img_binary = Image.fromarray((binary * 255).astype(np.uint8))

    #Generates a binary base64 img to return
    image_b64 = encode_image_to_base64(np.array(img_binary))
   
    ys, xs = np.nonzero(binary)  #Coords of foreground
    

    # Get image dimensions
    height, width = binary.shape
    area = height * width

    # Initialize estimator
    rk = RipleysKEstimator(area=area, x_max=width, y_max=height, x_min=0, y_min=0)

    #Sets a maximum radius of evaluation based on the img dimensions
    r_max = min(width,height)/2
    #Creates the set of radii to evaluate from 0 to r_max
    radii = np.linspace(0, r_max, 20)

    #Estimator entities for both the img and a CSR control
    k_vals = rk(data=np.column_stack((xs, ys)), radii=radii, mode='ripley')
    k_csr = rk.poisson(radii)

    #Generation of a temp directory with a unique user id to save the img
    user_tempdir = tempfile.mkdtemp(prefix=f"user_{uuid.uuid4().hex}_")

    #Generation of ripleys k plot
    fig = plot_ripleys_k_vs_csr(radii, k_vals, k_csr)

    #Final path to save the img using the unique id and a plots name
    plot_path = os.path.join(user_tempdir, "ripley_k.png")
    fig.savefig(plot_path)

    #Return the binarized img of the color and a path to access from a get
    #endpoint
    results = [{
        'binarized_img': image_b64,
        'plot_id' : os.path.basename(user_tempdir) 
        }]

    return results

#Endpoint for img viewing
@app.get("/download/ripley-k/{tempdir}")
def download_ripley_k(tempdir: str):
    #Location of base temp path and join of the unique temp dir
    base_path = os.path.join(tempfile.gettempdir(), tempdir)
    #Final img path
    file_path = os.path.join(base_path, "ripley_k.png")

    #If there is not path, raise a 404 which will be handled by the front. 
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Not found")
    #Return the img view to an img element
    return FileResponse(path=file_path, media_type="image/png", filename="ripley_k.png")
