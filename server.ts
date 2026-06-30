import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  app.use(compression());
  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    if (req.url === '/api/health' || req.url === '/api/ping') return next();
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    console.log('Health check requested at:', new Date().toISOString());
    res.set('X-Robots-Tag', 'noindex');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get('/api/ping', (req, res) => {
    res.send('pong');
  });

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.post('/api/github/upload', upload.single('file'), async (req, res) => {
    const authStatus = await verifyAdminToken(req);
    if (!authStatus.authorized) {
      console.warn(`[GitHub Upload Rejected] Unauthorized: ${authStatus.reason}`);
      return res.status(403).json({ error: `Unauthorized Access: ${authStatus.reason || 'Admin credentials required.'}` });
    }

    const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.VITE_GITHUB_OWNER;
    const GITHUB_REPO = process.env.VITE_GITHUB_REPO;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      const missingDetails = [];
      if (!GITHUB_TOKEN) missingDetails.push("VITE_GITHUB_TOKEN");
      if (!GITHUB_OWNER) missingDetails.push("VITE_GITHUB_OWNER");
      if (!GITHUB_REPO) missingDetails.push("VITE_GITHUB_REPO");
      
      return res.status(500).json({ 
        error: `GitHub registration is incomplete. Please check server environment variables.` 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const { originalname, buffer } = req.file;
      const fileExt = originalname.split('.').pop() || '';
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${uniqueName}`;
      
      const content = buffer.toString('base64');
      const targetUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
      
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Studio-Applet',
        },
        body: JSON.stringify({
          message: `Upload file ${uniqueName}`,
          content: content,
        }),
      });

      console.log(`[GitHub Upload Response] Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`[GitHub Upload Error] Status: ${response.status}`);
        throw new Error(`GitHub Service Error: Could not complete upload.`);
      }

      const data = await response.json();
      const downloadUrl = data.content?.download_url;

      if (!downloadUrl) {
        console.warn(`[GitHub Upload Success] File added but no download_url in response. DataKeys:`, Object.keys(data));
      } else {
        console.log(`[GitHub Upload Success] File successfully uploaded to repository. URL: ${downloadUrl}`);
      }

      res.json({ success: true, url: downloadUrl || '', name: originalname });
    } catch (error: any) {
      console.error('[GitHub Upload Handler Error]:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file to GitHub' });
    }
  });

  function getSecurePasscode(): string {
    try {
      const rulesPath = path.join(process.cwd(), 'firestore.rules');
      if (fs.existsSync(rulesPath)) {
        const content = fs.readFileSync(rulesPath, 'utf-8');
        const match = content.match(/password\s*==\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (err) {
      console.error('[Backup System] Error reading firestore.rules:', err);
    }
    return '#09';
  }

  let dbA_server: any = null;
  let dbB_server: any = null;

  function getServerDbA() {
    if (dbA_server) return dbA_server;
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const app = getApps().find(a => a.name === '[DEFAULT]') || initializeApp(config);
        dbA_server = getFirestore(app, config.firestoreDatabaseId);
      }
    } catch (err) {
      console.error("[Backup System] Failed to initialize Server DB A:", err);
    }
    return dbA_server;
  }

  function getServerDbB() {
    if (dbB_server) return dbB_server;
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config-b.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const app = getApps().find(a => a.name === 'projectB_server') || initializeApp(config, 'projectB_server');
        dbB_server = getFirestore(app, config.firestoreDatabaseId);
      }
    } catch (err) {
      console.warn("[Backup System] Project B config not found or failed to initialize.");
    }
    return dbB_server;
  }

  async function verifyAdminToken(req: express.Request): Promise<{ authorized: boolean; reason?: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, reason: 'Missing or malformed Authorization header.' };
    }

    const idToken = authHeader.substring(7);
    if (!idToken || idToken === 'undefined' || idToken === 'null' || idToken === '') {
      return { authorized: false, reason: 'Empty token.' };
    }

    let apiKey = '';
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        apiKey = config.apiKey;
      }
    } catch (err) {
      console.error('[Auth verification] Failed to read firebase config:', err);
    }

    if (!apiKey) {
      return { authorized: false, reason: 'Server is missing Firebase API Key configuration.' };
    }

    try {
      const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
      const verifyRes = await fetch(lookupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!verifyRes.ok) {
        const errJson = await verifyRes.json().catch(() => ({}));
        console.warn('[Auth verification] Google token verification rejected:', errJson);
        return { authorized: false, reason: 'Token verification failed on Google servers.' };
      }

      const verifyData = await verifyRes.json();
      const userObj = verifyData?.users?.[0];
      if (!userObj) {
        return { authorized: false, reason: 'No user profile found for provided token.' };
      }

      const email = userObj.email;
      const emailVerified = userObj.emailVerified;
      const uid = userObj.localId;

      const ALLOWED_EMAILS = ['muhammedadhil856@gmail.com', 'sp.sanal3@gmail.com'];

      if (email && ALLOWED_EMAILS.includes(email) && emailVerified) {
        return { authorized: true };
      }

      if (uid) {
        const db = getServerDbA();
        if (db) {
          const sessionSnapshotRes = await getDocs(
            collection(db, 'artifacts/tech-institute/public/data/admin_sessions')
          );
          const sessionDoc = sessionSnapshotRes.docs.find(d => d.id === uid);
          if (sessionDoc) {
            const linkId = sessionDoc.data().linkId;
            if (linkId) {
              const linkDocRes = await getDocs(
                collection(db, 'artifacts/tech-institute/public/data/admin_links')
              );
              const linkDoc = linkDocRes.docs.find(d => d.id === linkId);
              if (linkDoc && linkDoc.data().expiresAt) {
                const expiresVal = linkDoc.data().expiresAt;
                const expiresDate = typeof expiresVal.toDate === 'function' ? expiresVal.toDate() : new Date(expiresVal);
                if (expiresDate > new Date()) {
                  console.log(`[Auth verification] Validating shared admin session in AI Studio environment for UID: ${uid}`);
                  return { authorized: true };
                }
              }
            }
          }
        }
      }

      return { authorized: false, reason: `Email '${email || 'Anonymous'}' is not registered as an administrator.` };
    } catch (e: any) {
      console.error('[Auth verification] Error verifying token:', e);
      return { authorized: false, reason: 'Internal exception during validation.' };
    }
  }

  app.post('/api/admin/maintenance/verify', async (req, res) => {
    const authStatus = await verifyAdminToken(req);
    if (!authStatus.authorized) {
      console.warn(`[Maintenance Verify Rejected] Unauthorized: ${authStatus.reason}`);
      return res.status(403).json({ error: `Unauthorized Access: ${authStatus.reason || 'Admin credentials required.'}` });
    }

    const { passcode } = req.body;
    if (!passcode) {
      return res.status(400).json({ error: 'Passcode is required.' });
    }
    const realPasscode = getSecurePasscode();
    if (passcode === realPasscode) {
      return res.json({ success: true });
    } else {
      return res.status(403).json({ error: 'Authentication Rejected: Access code incorrect.' });
    }
  });

  app.post('/api/admin/maintenance/backup', async (req, res) => {
    const authStatus = await verifyAdminToken(req);
    if (!authStatus.authorized) {
      console.warn(`[Maintenance Backup Rejected] Unauthorized: ${authStatus.reason}`);
      return res.status(403).json({ error: `Unauthorized Access: ${authStatus.reason || 'Admin credentials required.'}` });
    }

    const { passcode } = req.body;
    const realPasscode = getSecurePasscode();
    if (passcode !== realPasscode) {
      return res.status(403).json({ error: 'Authentication Rejected: Access code incorrect.' });
    }

    const collectionsToBackup = [
      "courses",
      "testimonials",
      "batches",
      "enquiries",
      "offers",
      "posts",
      "settings",
      "gallery",
      "admin_sessions",
      "admin_links"
    ];

    const dbA = getServerDbA();
    const dbB = getServerDbB();

    const backupPayload: any = {
      meta: {
        exportedAt: new Date().toISOString(),
        totalCollectionsCount: collectionsToBackup.length,
        projects: {
          hasMirrorDb: !!dbB
        }
      },
      server_a: {},
      server_b: {}
    };

    if (!dbA) {
      return res.status(500).json({ error: "Server Database A could not be initialized." });
    }

    try {
      for (const col of collectionsToBackup) {
        try {
          const snap = await getDocs(
            collection(dbA, `artifacts/tech-institute/public/data/${col}`)
          );
          backupPayload.server_a[col] = snap.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
          }));
        } catch (colErr: any) {
          console.error(`[Server A] Error backing up ${col}:`, colErr);
          backupPayload.server_a[col] = { error: colErr.message || String(colErr) };
        }
      }

      if (dbB) {
        for (const col of collectionsToBackup) {
          try {
            const snap = await getDocs(
              collection(dbB, `artifacts/tech-institute/public/data/${col}`)
            );
            backupPayload.server_b[col] = snap.docs.map(doc => ({
              _id: doc.id,
              ...doc.data()
            }));
          } catch (colErr: any) {
            console.error(`[Server B] Error backing up ${col}:`, colErr);
            backupPayload.server_b[col] = { error: colErr.message || String(colErr) };
          }
        }
      } else {
        backupPayload.server_b = { status: "Server B is offline or not configured." };
      }

      res.json(backupPayload);
    } catch (err: any) {
      console.error("Backup extraction error:", err);
      res.status(500).json({ error: err.message || "Failed to create complete backup." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log('[Server] Initializing Vite middleware (Development Mode)');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`[Server] Serving static files from: ${distPath} (Production Mode)`);
    
    if (!fs.existsSync(distPath)) {
      console.error(`[Server Error] dist directory not found at ${distPath}`);
    } else {
      console.log(`[Server] dist directory found with ${fs.readdirSync(distPath).length} items`);
    }

    app.use(express.static(distPath, { 
      index: false,
      fallthrough: true
    }));
    
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }

      const isAssetRequest = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|otf)$/.test(req.path);
      if (isAssetRequest) {
        console.warn(`[Server] Missing asset requested: ${req.path}`);
        return res.status(404).send('Asset not found');
      }

      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[Server Error] index.html not found at ${indexPath}`);
        res.status(500).send('Application build missing. Please run build.');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
