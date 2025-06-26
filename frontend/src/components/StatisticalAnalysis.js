import { useState, useEffect } from "react";
import axios from 'axios';
import {Col, Container, Row} from 'react-bootstrap';
import '../styles/imgIntensity.css'
import {FileUploader} from "react-drag-drop-files";
import Swal from "sweetalert2";

import download from "../svgIcons/download-svgrepo-com.svg"

import ToolGuide from "./ToolGuide";
import toolImg from "../toolGuides/clusterStatistics/toolImage.png"
import data from "../toolGuides/clusterStatistics/data.json"


const StatisticalAnalysis = () =>{
    const fileTypes = ["JPG","PNG","JPEG"];
    const [file,setFile] = useState(null);
    
    const [imgURL, setImgURL] = useState("");
    const [images,setImages] = useState(null);

    const apiURL = process.env.REACT_APP_API_URL;
    const endpoint = `${apiURL}/statistical`;

    const uploadImage = () => {
         
        
        if (file && file.name) {
            Swal.fire({
            title: 'Processing your request...',
            text: 'Please wait a moment.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

            const formData = new FormData();
            formData.append("image", file);
            axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }).then((response) => {
                if (response.status === 200) {
                    setImages(response.data[0]);
                        Swal.fire({
                          icon: 'success',
                          title: 'Processed!',
                          text: 'Your images were generated succesfully.',
                          timer: 1500,
                          showConfirmButton: false,
                        });
                      } else {
                        throw new Error(`Unexpected status: ${response.status}`);
                      }
                })
                .catch((error) => {
                    console.error(error);
                      Swal.fire({
                        icon: 'error',
                        title: 'Failed to process',
                        text: 'There was an error processing your request. Please try again.',
                      });
                    });
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
        setImages(null);
    }

    const downloadImage = (image,name) => {
        const a = document.createElement('a');
        a.href = image;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };



    useEffect(() => {
        return () => {
            if (imgURL) {
                URL.revokeObjectURL(imgURL);
            }
        };
    }, [imgURL]);

    return (
        <Container>
            <h1 className="tool-header">Cluster Statistics</h1>
            <ToolGuide data={data} toolImg={toolImg}/>
            <Row>
             <Col className="img-upload">
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
                <Col align="center">
                <button className={file && file.name ? '':'disabled'} onClick={uploadImage}>Upload</button>
                </Col>
            </Row>
            {images ? (
                <>
            <Row>
                    <Col className="img-result-container">
                    <p>Binarized Image</p>
                    <img src={images.binarized_img} width='300px' height='300px' alt="Clustered"/>
                    <img className="download-img" src={download} onClick={()=>downloadImage(images.binarized_img,"binarized")} width="40px" height="40px" alt="Download"/>
                    </Col> 
            </Row>
            <Row>
                    <Col className="img-result-container">
                    <p>Ripley's K Function</p>
                    <img src={`http://127.0.0.1:8000/download/ripley-k/${images.plot_id}`} width='800px' height='500px' alt="Clustered"/>
                    <img className="download-img" src={download} onClick={()=>downloadImage(`http://127.0.0.1:8000/download/ripley-k/${images.plot_id}`,"ripleyk")} width="40px" height="40px" alt="Download"/>
                    </Col> 
                </Row>
                </>
            ):(
                <></>
            )}
            
        </Container>
    )
}
export default StatisticalAnalysis;
