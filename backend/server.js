
import express from 'express';
import cors from 'cors';
import { generateUploadURL } from './s3.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static frontend files
const frontendPath = path.join(__dirname, 'front');
app.use(express.static(frontendPath));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// S3 presigned URL endpoint
// server.js
app.get('/s3Url', async (req, res) => {
  try {
    const { filename, filetype } = req.query; // <-- get from URL query string

    if (!filename || !filetype) {
      return res.status(400).send({ error: 'Missing filename or filetype' });
    }

    const url = await generateUploadURL(filename, filetype);
    res.send({ url });
  } catch (err) {
    console.error('Error generating S3 URL:', err);
    res.status(500).send({ error: 'Failed to generate S3 URL' });
  }
});



// Start server
app.listen(8080, () => console.log('Server listening on http://localhost:8080'));
