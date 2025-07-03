import { useState, useEffect } from "react";
import axios from 'axios';
import {Col, Container, Row} from 'react-bootstrap';
import '../styles/imgIntensity.css'
import {FileUploader} from "react-drag-drop-files";

import ToolGuide from "./ToolGuide";
import data from "../toolGuides/colorExtraction/data.json";
import toolImg from "../toolGuides/colorExtraction/toolImage.png"

import download from "../svgIcons/download-svgrepo-com.svg"
import copy from "../svgIcons/copy-svgrepo-com.svg"



const ImageCluster = () => {

    const fileTypes = ["JPG","PNG","JPEG"];
    const [file,setFile] = useState(null);
    
    const [imgURL, setImgURL] = useState("");
    const [cluster,setCluster] = useState(1);
    const [images,setImages] = useState([]);

    const[copyClip,setCopyClip] = useState(false);

    const uploadImage = () => {
        
        if (file && file.name) {
            const formData = new FormData();
            formData.append("clusters",cluster)
            formData.append("image", file);
            axios.post('http://localhost:8000/cluster', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }).then((response) => setImages(response.data))
                .catch((error) => console.error("Upload error:", error));
        }
    }

    const updateImage = (file) => {
        cleanImages();
        if (file) {
            setFile(file);
            const previewURL = URL.createObjectURL(file);
            setImgURL(previewURL);
        }
    }

    const cleanImages = () =>{
        setFile(null);
        setImages([]);
        setCluster(1);
    }

    const downloadImage = (image) => {
        const a = document.createElement('a');
        a.href = image.image_base64;
        a.download = image.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

    const copyClipboard = (img_value,name) =>{
        navigator.clipboard.writeText(img_value)
        setCopyClip(name);
        setTimeout(() =>{
            setCopyClip(false)
        },1000);
    }

    useEffect(() => {
        return () => {
            if (imgURL) {
                URL.revokeObjectURL(imgURL);
            }
        };
    }, [imgURL]);

    return (
        <Container className="img-intensity-container">
            <h1 className="tool-header">Color Extraction</h1>
            <ToolGuide data={data} toolImg={toolImg}/>
            <Row>
             <Col className="img-upload" align="center">
                <p>Upload your image:</p>
                <FileUploader handleChange={updateImage} name="file" types={fileTypes}/>
             </Col>
            </Row>
            <Row>
                <Col className="img-container">
                    {file && file.name ?
                        <div className="file-uploaded">
                        <button className="img-delete" onClick={cleanImages}>x</button>
                        <img src={imgURL ? imgURL : null} width='300px' height='300px' alt="Uploaded file"/>
                        </div>
                        :
                        <></>
                    }
                </Col>
            </Row>
            <Row>
                <Col className="cluster-number">
                <div className="number-input">
                    <p>Select the number of fluorophores used ( 5 max )</p>
                    <button className={cluster === 1 ? 'disabled':''} onClick={()=>cluster > 1 ? setCluster(cluster-1):''}>-</button>
                    <p>{cluster}</p>
                    <button  className={cluster === 5 ? 'disabled':''} onClick={()=>cluster < 5 ? setCluster(cluster+1):''}>+</button>
                </div>
                <button  className={file && file.name ? '':'disabled'} onClick={uploadImage}>Upload</button>
                </Col>
            </Row>
            <Row>
            {images.length>0 ? (
                images.map((image)=>
                    <Col className="img-result-container">
                    <p className="img-bold">{image.name}</p>
                    <img src={image.image_base64} width='300px' height='300px' alt="Clustered"/>
                    <div className="download-cont">
                        <p className="img-bold">Total intensity:</p>
                        <p>{image.img_intensity.toLocaleString()}</p>
                        <img src={copy} className="intensity" onClick={()=>copyClipboard(image.img_intensity, image.name)} width="40px" height="40px" alt="Download"/>
                        <p className={`copied ${copyClip ===image.name ? 'visible' : ''}`}>Copied to clipboard!</p>
                        <img src={download} className="download-img" onClick={()=>downloadImage(image)} width="40px" height="40px" alt="Download"/>
                    </div>
                    </Col> 
                )
            ):(
                <></>
            )}
            </Row>
        </Container>
    )
}
export default ImageCluster;