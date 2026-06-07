import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
dotenv.config();

// Github file upload settings
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB limit
  },
});

import nodemailer from 'nodemailer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Essential for Cloud Run/Load Balancer to trust headers like X-Forwarded-For
  app.set('trust proxy', 1);

  app.use(compression());
  app.use(cors());
  app.use(express.json());

  // --- Enquiry Handler ---
  app.post('/api/enquiries', async (req, res) => {
    console.log('[Enquiry Service] Received new enquiry request');
    try {
      const enquiry = req.body;
      const newId = `enquiry-${Date.now()}`;
      const payload = {
        ...enquiry,
        status: enquiry.status || 'new',
        submittedAt: enquiry.submittedAt || new Date().toISOString()
      };

      console.log(`[Enquiry Service] Payload prepared. ID: ${newId}`);

      // 1. Write to Firestore
      const dbA = getServerDbA();
      const dbB = getServerDbB();

      if (!dbA) {
        console.error('[Enquiry Service] Primary database (dbA) could not be initialized');
      } else {
        console.log('[Enquiry Service] Writing to Primary DB...');
        await setDoc(doc(dbA, 'artifacts/tech-institute/public/data/enquiries', newId), payload);
        console.log('[Enquiry Service] Write to Primary DB successful');
      }

      if (dbB) {
        try {
          console.log('[Enquiry Service] Writing to Mirror DB...');
          await setDoc(doc(dbB, 'artifacts/tech-institute/public/data/enquiries', newId), payload);
          console.log('[Enquiry Service] Write to Mirror DB successful');
        } catch (bErr) {
          console.warn('[Enquiry Service] Mirror DB write failed:', bErr);
        }
      }

      // 2. Fetch Email Settings from Firestore (A is primary)
      let emailConfig: any = {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
        notificationEmail: process.env.NOTIFICATION_EMAIL || 'enquiries@letsolutions.in'
      };

      if (dbA) {
        try {
          const settingsDoc = await getDoc(doc(dbA, "artifacts/tech-institute/public/data/settings", "global"));
          if (settingsDoc.exists()) {
            const settingsData = settingsDoc.data();
            if (settingsData.email) {
              console.log('[Enquiry Service] Using email settings from Firestore');
              emailConfig = {
                smtpHost: settingsData.email.smtpHost || emailConfig.smtpHost,
                smtpPort: settingsData.email.smtpPort || emailConfig.smtpPort,
                smtpUser: settingsData.email.smtpUser || emailConfig.smtpUser,
                smtpPass: settingsData.email.smtpPass || emailConfig.smtpPass,
                notificationEmail: settingsData.email.notificationEmail || emailConfig.notificationEmail,
              };
            } else {
              console.log('[Enquiry Service] No email settings in Firestore, using environment variables');
            }
          }
        } catch (settingsErr) {
          console.warn('[Enquiry Service] Could not fetch settings from Firestore, using env fallback:', settingsErr);
        }
      }

      // 3. Send Email Notification
      let emailResult = { sent: false, error: null as string | null };
      if (emailConfig.smtpUser && emailConfig.smtpPass) {
        console.log('[Enquiry Service] Attempting to send email via SMTP...');
        try {
          const transporter = nodemailer.createTransport({
            host: emailConfig.smtpHost,
            port: parseInt(emailConfig.smtpPort),
            secure: String(emailConfig.smtpPort) === '465',
            auth: {
              user: emailConfig.smtpUser,
              pass: emailConfig.smtpPass,
            },
            // Add a timeout
            connectionTimeout: 10000, 
            greetingTimeout: 10000,
          });

          const mailOptions = {
            from: `"Let Solutions Website" <${emailConfig.smtpUser}>`,
            to: emailConfig.notificationEmail,
            replyTo: payload.email || emailConfig.smtpUser,
            subject: `New Technical Institute Enquiry: ${payload.name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New Website Enquiry</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px; font-weight: bold; width: 30%; color: #64748b;">Full Name</td>
                    <td style="padding: 10px; color: #0f172a;">${payload.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #64748b;">Phone</td>
                    <td style="padding: 10px; color: #0f172a;">${payload.phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #64748b;">Email</td>
                    <td style="padding: 10px; color: #0f172a;">${payload.email || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #64748b;">Course</td>
                    <td style="padding: 10px; color: #0f172a; font-weight: bold;">${payload.courseInterested}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #64748b; vertical-align: top;">Message</td>
                    <td style="padding: 10px; color: #0f172a;">${payload.message || 'No message provided'}</td>
                  </tr>
                </table>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                  This enquiry was submitted on ${new Date(payload.submittedAt).toLocaleString()}
                </div>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log(`[Enquiry Service] Email notification sent to ${emailConfig.notificationEmail}`);
          emailResult.sent = true;
        } catch (mailErr: any) {
          console.error('[Enquiry Service] SMTP send failed:', mailErr);
          emailResult.error = mailErr.message || 'SMTP Error';
        }
      } else {
        console.warn('[Enquiry Service] SMTP credentials not configured. Email notification skipped.');
        emailResult.error = 'SMTP credentials not configured in Admin panel Settings.';
      }

      res.status(200).json({ 
        success: true, 
        message: 'Enquiry processed successfully',
        emailStatus: emailResult
      });
    } catch (error: any) {
      console.error('[Enquiry Service Error]:', error);
      res.status(500).json({ error: error.message || 'Failed to process enquiry' });
    }
  });

  // Health check endpoint for Load Balancer
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

  // Simple logging for all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API route for GitHub upload
  app.post('/api/github/upload', upload.single('file'), async (req, res) => {
    // 1. Enforce strict admin email authentication
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

  // --- Maintenance & Security Endpoints ---

  // Helper to dynamically extract passcode from local firestore.rules
  function getSecurePasscode(): string {
    try {
      const rulesPath = path.join(process.cwd(), 'firestore.rules');
      if (fs.existsSync(rulesPath)) {
        const content = fs.readFileSync(rulesPath, 'utf-8');
        // Looks for rules matching password == '#09'
        const match = content.match(/password\s*==\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (err) {
      console.error('[Backup System] Error reading firestore.rules:', err);
    }
    return '#09'; // Fallback
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
        dbA_server = getFirestore(app);
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
        dbB_server = getFirestore(app);
      }
    } catch (err) {
      console.warn("[Backup System] Project B config not found or failed to initialize.");
    }
    return dbB_server;
  }

  // Helper to verify Firebase Auth ID token and check if it belongs to an authorized administrator.
  async function verifyAdminToken(req: express.Request): Promise<{ authorized: boolean; reason?: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, reason: 'Missing or malformed Authorization header.' };
    }

    const idToken = authHeader.substring(7);
    if (!idToken || idToken === 'undefined' || idToken === 'null' || idToken === '') {
      return { authorized: false, reason: 'Empty token.' };
    }

    // Load API Key from project config
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
      // Validate the ID token against Google Identity Toolkit API
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

      // Master admin emails
      const ALLOWED_EMAILS = ['muhammedadhil856@gmail.com', 'sp.sanal3@gmail.com'];

      if (email && ALLOWED_EMAILS.includes(email) && emailVerified) {
        return { authorized: true };
      }

      // Check if it's an anonymous session used in AI studio preview
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

  // Verify passcode endpoint
  app.post('/api/admin/maintenance/verify', async (req, res) => {
    // Enforce strict admin email authentication
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

  // Secure backup downloader
  app.post('/api/admin/maintenance/backup', async (req, res) => {
    // Enforce strict admin email authentication
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
      // Extract from Server A
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

      // Extract from Server B
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      // For all other GET requests, serve index.html
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
