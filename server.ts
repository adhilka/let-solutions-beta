import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

// Github file upload settings
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB limit
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API route for GitHub upload
  app.post('/api/github/upload', upload.single('file'), async (req, res) => {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return res.status(500).json({ error: 'GitHub credentials are not configured on the server.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const { originalname, buffer } = req.file;
      const fileExt = originalname.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${uniqueName}`;
      
      const content = buffer.toString('base64');
      
      const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload file ${uniqueName}`,
          content: content,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`GitHub API Error: ${errData.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Get the download URL (raw GitHub user content URL or github pages URL depending on setup)
      // Usually github responds with a download_url
      const downloadUrl = data.content.download_url;

      res.json({ success: true, url: downloadUrl, name: originalname });
    } catch (error: any) {
      console.error('Upload Error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file to GitHub' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
