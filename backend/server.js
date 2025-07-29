const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/upload', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  // Add these lines at the very top of the handler:
  console.log('Received upload request');
  console.log('Files:', req.files);
  try {
    const imageFile = req.files['image'][0];
    const pdfFile = req.files['pdf'][0];
    // Extract text from image
    const imageText = await Tesseract.recognize(
      fs.readFileSync(imageFile.path),
      'eng'
    ).then(result => result.data.text);

    // Extract text from PDF
    const pdfText = await pdfParse(fs.readFileSync(pdfFile.path))
      .then(data => data.text);

    // Delete files after processing
    fs.unlinkSync(imageFile.path);
    fs.unlinkSync(pdfFile.path);

    // Call Gemini 2.5 API (Replace with actual endpoint if changed)
    const geminiResp = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBl7PNGSDrt1I_hfOAhnQ4OPvfj9TRMnW0',
      {
        contents: [{
          parts: [
            {
              text: `I have two texts extracted from an image and a PDF. Please compare both texts and present the comparison in a tabular form, highlighting key similarities and differences. Here are the texts:\n\nText from Image:\n${imageText}\n\nText from PDF:\n${pdfText}`
            }
          ]
        }]
      }
    );

    // Extract the response text from Gemini
    const comparisonText = geminiResp.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No result';

    res.json({ comparison: comparisonText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process files.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
