# 🖼️📄 Image–PDF Comparison Tool  

## 📌 Overview  
The **Image–PDF Comparison Tool** is an AI-powered application that detects and highlights differences between images and PDF documents.  
Unlike simple pixel-level diffing, this tool uses **Google Gemini 1.5 Flash** (multimodal) to analyze both text and visuals, enabling **semantic** and **visual** comparison for more meaningful results.  

---

## ✨ Features  
- ✅ **AI-Powered Semantic Comparison** – Goes beyond pixels to understand text meaning, formatting, and structure.  
- ✅ **Supports Images & PDFs** – Upload, preview, and compare documents in multiple formats.  
- ✅ **Side-by-Side Preview** – Interactive visualization for easier identification of changes.  
- ✅ **PDF-to-Image Conversion** – Automatically processes PDF pages for comparison.  
- ✅ **OCR & Formatting Checks** – Detects OCR errors, missing words, and subtle layout mismatches.  
- ✅ **Responsive Frontend** – Clean, user-friendly interface for seamless experience.  

---

## 🛠️ Tech Stack  
- **AI Model:** Google **Gemini 1.5 Flash** (Multimodal)  
- **Backend:** Node.js + Express  
- **Frontend:** HTML, CSS, JavaScript  
- **Utilities:** PDF-to-Image conversion, Pixel-level comparison  

---

## 📂 Project Structure  
```plaintext
Image_PDF_Comparison/
│
├── backend/                   # Node.js + Express server
│   ├── routes/                # API routes for upload & processing
│   ├── controllers/           # Handles PDF-to-image conversion & AI calls
│   └── app.js                 # Entry point for backend server
│
├── frontend/                  # Web UI
│   ├── index.html             # Main UI layout
│   ├── style.css              # Styling for responsive layout
│   └── script.js              # Handles file upload & previews
│
├── .gitattributes
└── README.md
