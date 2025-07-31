const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

function cleanExtractedText(text) {
  return text
    .replace(/\r\n|\r|\n/g, ' ')           
    .replace(/\s{2,}/g, ' ')               
    .replace(/([a-zA-Z])\s*:\s*/g, '$1: ') 
    .trim();
}

app.post('/upload', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  console.log('Received upload request');
  console.log('Files:', req.files);

  try {
    if (!req.files || !req.files['image'] || !req.files['pdf']) {
      throw new Error('Please upload both image and PDF files.');
    }

    const imageFile = req.files['image'][0];
    const pdfFile = req.files['pdf'][0];

    const rawImageText = await Tesseract.recognize(
      fs.readFileSync(imageFile.path),
      'eng'
    );

    const rawPdfText = await pdfParse(fs.readFileSync(pdfFile.path));

    const imageText = cleanExtractedText(rawImageText.data.text);
    const pdfText = cleanExtractedText(rawPdfText.text);

    console.log("IMAGE TEXT:\n", imageText);
    console.log("PDF TEXT:\n", pdfText);

    const fields = [
      "Operation Type", "Discretionary Discount", "Product", "Quantity", "Renewal Type",
      "Provisioning Date", "Service Start Date", "Partner Margin Discount", "Net Amount",
      "Billing Cycle", "Channel Type", "Contract Sign Date", "SKU", "Subscription Fee per Month",
      "Service End Date", "Billing Account"
    ];
    const prompt = `
You are a contract field extraction specialist. Your job is to extract each of the following fields from BOTH the Oreo Booking Form (image text) and the Order Form (PDF text).

**Instructions:**
- For each field, extract the value from both texts.
- If found, write the actual value in the proper column.
- If missing in one document, write "Missing" in that column.
- In the "Comparison Summary":
    - If only the Oreo Booking Form value is missing, write "Value Missing in Oreo Booking Form"
    - If only the Order Form value is missing, write "Value Missing in Order Form"
    - If both values are missing, write "Value Missing in Both"
    - If both values are present and match (allow for small formatting/case differences), write "true"
    - If both values are present and do not match, write "false"
- Never write "true", "false", or any comments in the value columns.

**Format your answer in this markdown table:**

| Field | Oreo Booking Form | Order Form | Comparison Summary |
|-------|------------------|------------|-------------------|
| ...   | ...              | ...        | ...               |

**Table Example:**
| Field | Oreo Booking Form | Order Form | Comparison Summary |
|-------|------------------|------------|-------------------|
| Operation Type       | New      | Missing   | Value Missing in Order Form         |
| Partner Margin Discount | Missing | 0       | Value Missing in Oreo Booking Form  |
| SKU                  | Missing  | Missing   | Value Missing in Both              |
| Product              | Widget   | Widget    | true                               |
| Quantity             | 4        | 5         | false                              |

**Fields to extract:**
${fields.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Here is the extracted text from each document:

Oreo Booking Form (image):
${imageText}

Order Form (PDF):
${pdfText}
`;
    const geminiResp = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD596wKbvBisFeR_QXpzNFKZ9BsaEgRWSc',
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const comparisonText = geminiResp.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No result';

    fs.unlinkSync(imageFile.path);
    fs.unlinkSync(pdfFile.path);

    res.json({ comparison: comparisonText });

  } catch (err) {
    console.error('Error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to process files.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));