import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [comparison, setComparison] = useState('');
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = e => {
    setImageFile(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
  };

  const handlePdfChange = e => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !pdfFile) {
      alert('Please upload both an image and a PDF.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('pdf', pdfFile);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComparison(res.data.comparison);
    } catch (err) {
      setComparison('Failed to compare files.');
    } finally {
      setLoading(false);
    }
  };

  // optional: parse markdown table to HTML table for better display
  function renderTableFromMarkdown(markdown) {
    const match = markdown.match(/\|(.|\n)*\|/); // crude regex for table
    if (!match) return <pre>{markdown}</pre>;
    const lines = match[0].trim().split('\n').filter(line => line?.includes('|'));
    const headers = lines[0].split('|').map(cell=>cell.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line=>line.split('|').map(cell=>cell.trim()).filter(Boolean));
    return (
      <table className="comparison-table">
        <thead>
          <tr>{headers.map((cell,i)=><th key={i}>{cell}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row,ri)=>
            <tr key={ri}>{row.map((cell,ci)=><td key={ci}>{cell}</td>)}</tr>
          )}
        </tbody>
      </table>
    );
  }

  return (
    <div className="container">
      <h2>Image & PDF Content Comparison (Gemini 2.5)</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <div>
          <label>Upload Image: </label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" className="preview-img" />}
        </div>
        <div>
          <label>Upload PDF: </label>
          <input type="file" accept="application/pdf" onChange={handlePdfChange} />
        </div>
        <button className="compare-btn" type="submit" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>
      {comparison && (
        <div className="result-section">
          <h3>Comparison Table</h3>
          {renderTableFromMarkdown(comparison)}
        </div>
      )}
      <footer>Made by AMEEN KHAN</footer>
    </div>
  );
}

export default App;
