# 🧪 Cell Tools


[![Docker Build](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Frontend: React](https://img.shields.io/badge/frontend-react-61dafb)](https://reactjs.org/)
[![Backend: FastAPI](https://img.shields.io/badge/backend-fastapi-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![Last Commit](https://img.shields.io/github/last-commit/HexVexDev/cell-tools)](https://github.com/HexVexDev/cell-tools)
[![Repo Size](https://img.shields.io/github/repo-size/HexVexDev/cell-tools)](https://github.com/HexVexDev/cell-tools)

This project was designed to analyze fluorescent microscopy images. These images typically represent samples treated with fluorophores that bind to specific molecules or proteins. The pixel intensity in such images correlates with the concentration of the target, making it possible to compare experimental conditions and assess treatment effects on the sample.

The core use case for this project is the analysis of cellular images stained with one or more fluorophores. It includes two main tools:

A color extraction module to separate distinct fluorophore signals, and

A clustering analysis module that uses Ripley’s K Function to evaluate spatial distributions.

Although initially intended for public deployment via a Cloudflare tunnel, self-hosting presented memory limitations. As a result, this project is now released as a containerized version suitable for local use.

🛠️ Tech Stack
React – Frontend (browser-based interface)

FastAPI (Python) – Backend (image processing + API endpoints)

Docker – Containerization for easy deployment

🧰 Tools
1. Color Extraction
This tool extracts multiple color clusters from a microscopy image (if present). The UI is designed to be user-friendly: simply upload an image and select how many colors (fluorophores) are present. For example:

<img width="424" height="474" alt="Image" src="https://github.com/user-attachments/assets/2846d5a2-6d72-4960-a26a-c14f30c3f263" />

If 3 colors are selected, the tool uses k-means clustering to segment them. The results are highlighted using high-contrast pseudocolors to enhance visibility:

<img width="1434" height="935" alt="Image" src="https://github.com/user-attachments/assets/d254a0d3-d88b-4663-838c-fe849180d922" />

The output includes:

n + 1 images (1 for each color, plus the background for correction purposes)

Signal intensity values, which can be compared against control (untreated) samples.

Note: Maximum of 5 colors to manage RAM usage.

2. Clustering Analysis with Ripley’s K Function
This tool allows users to upload an image (either binary or RGB), which is analyzed using Ripley’s K Function. The result is compared against a Complete Spatial Randomness (CSR) model to determine if the observed spatial pattern exhibits clustering, dispersion, or is random.

The idea is to pair this with the color extraction tool: you first segment relevant molecules/proteins, then assess whether they are spatially clustered — potentially reflecting biological organization or treatment effects.

Interpretation:

K(r) > CSR → Clustering

K(r) < CSR → Dispersion

K(r) ≈ CSR → Random

a. Random Control

<img width="512" height="512" alt="Image" src="https://github.com/user-attachments/assets/c46b186b-20db-4c5d-b276-d871ef324f8c" /> <img width="960" height="720" alt="Image" src="https://github.com/user-attachments/assets/95bb0468-e0b0-49da-a38f-4a4ba9162fab" />

b. Clustered Control

<img width="512" height="512" alt="Image" src="https://github.com/user-attachments/assets/ca4d411a-17c7-4f8e-9c08-22e9160b6ac5" /> <img width="960" height="720" alt="Image" src="https://github.com/user-attachments/assets/7ab5fcbf-a41d-48ac-ba27-686ffa1a8d24" />


📈 Use Case Inspiration
This tool was inspired by my own research with MDA-MB-231 cells. I applied it to analyze spatial clustering of Reactive Oxygen Species (ROS) across full cell cultures in wound healing assays — aiming to detect possible signaling mechanisms at the culture scale.

<img width="169" height="177" alt="Image" src="https://github.com/user-attachments/assets/9bd6dd36-53fd-4e30-9ae3-42aafe25711b" />

By HexVexDev

🚀 Quickstart (Docker Compose)
To get started, you’ll need:

- Git

- Docker

- At least 8 GB of RAM (or configure Docker to allow 8 GB).
  Despite successful downsampling and RAM optimizations, Ripley’s K Function analysis remains resource-intensive.

1. Clone the repo and build the containers:

- git clone https://github.com/HexVexDev/cell-tools.git

- cd cell-tools

- docker compose up --build

2. Visit http://localhost:3000 in your browser.

