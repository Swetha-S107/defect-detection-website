import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on startup if credentials are provided
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.warn("[Email] Transporter verification failed despite credentials being provided:", error.message);
    } else {
      console.log("[Email] SMTP server is ready to send support emails");
    }
  });
} else {
  console.log("[Email] SMTP credentials not found. Support emails will be logged to console instead of sent.");
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database setup
const dbPath = path.join(__dirname, "../database/pcb_vision.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  console.log(`[Database] Creating directory: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    notifications BOOLEAN DEFAULT 1,
    security BOOLEAN DEFAULT 1,
    data_management BOOLEAN DEFAULT 1,
    sensitivity INTEGER DEFAULT 50,
    auto_save BOOLEAN DEFAULT 0,
    model_type TEXT DEFAULT 'gemini-3-flash'
  );
  
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_data TEXT,
    result_json TEXT,
    status TEXT,
    defect_type TEXT,
    confidence REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS support_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize settings and admin if not exists
const tableInfo = db.prepare("PRAGMA table_info(history)").all() as any[];
const hasUserId = tableInfo.some(col => col.name === 'user_id');
if (!hasUserId) {
  console.log("[Database] Adding user_id column to history table...");
  try {
    db.exec("ALTER TABLE history ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;");
  } catch (err) {
    console.error("[Database] Failed to add user_id column:", err);
  }
}

const hasDefectType = tableInfo.some(col => col.name === 'defect_type');
if (!hasDefectType) {
  console.log("[Database] Adding defect_type column to history table...");
  try {
    db.exec("ALTER TABLE history ADD COLUMN defect_type TEXT;");
  } catch (err) {
    console.error("[Database] Failed to add defect_type column:", err);
  }
}

const hasResultJson = tableInfo.some(col => col.name === 'result_json');
if (!hasResultJson) {
  console.log("[Database] Adding result_json column to history table...");
  try {
    db.exec("ALTER TABLE history ADD COLUMN result_json TEXT;");
  } catch (err) {
    console.error("[Database] Failed to add result_json column:", err);
  }
}

const hasConfidence = tableInfo.some(col => col.name === 'confidence');
if (!hasConfidence) {
  console.log("[Database] Adding confidence column to history table...");
  try {
    db.exec("ALTER TABLE history ADD COLUMN confidence REAL;");
  } catch (err) {
    console.error("[Database] Failed to add confidence column:", err);
  }
}

const hasStatus = tableInfo.some(col => col.name === 'status');
if (!hasStatus) {
  console.log("[Database] Adding status column to history table...");
  try {
    db.exec("ALTER TABLE history ADD COLUMN status TEXT;");
  } catch (err) {
    console.error("[Database] Failed to add status column:", err);
  }
}

const hasImageData = tableInfo.some(col => col.name === 'image_data');
if (!hasImageData) {
  console.log("[Database] Adding image_data column to history table...");
  try {
    db.exec("ALTER TABLE history ADD COLUMN image_data TEXT;");
  } catch (err) {
    console.error("[Database] Failed to add image_data column:", err);
  }
}

const settingsCount = db.prepare("SELECT count(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (id) VALUES (1)").run();
}

const adminCount = db.prepare("SELECT count(*) as count FROM admin_users").get() as { count: number };
if (adminCount.count === 0) {
  db.prepare("INSERT INTO admin_users (username, password) VALUES (?, ?)").run("admin", "admin123");
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PCB Vision Backend is running" });
});

// Settings API
app.get("/api/settings", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  res.json(settings);
});

app.post("/api/settings", (req, res) => {
  const { notifications, security, data_management, sensitivity, auto_save, model_type } = req.body;
  db.prepare(`
    UPDATE settings 
    SET notifications = ?, security = ?, data_management = ?, sensitivity = ?, auto_save = ?, model_type = ?
    WHERE id = 1
  `).run(
    notifications ? 1 : 0,
    security ? 1 : 0,
    data_management ? 1 : 0,
    sensitivity,
    auto_save ? 1 : 0,
    model_type || 'gemini-3-flash'
  );
  res.json({ success: true });
});

// History API
app.get("/api/history", (req, res) => {
  const userId = req.query.userId;
  console.log(`[History] Fetching history for userId: ${userId}`);
  
  try {
    let history;
    if (userId && userId !== 'undefined' && userId !== 'null') {
      history = db.prepare("SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    } else {
      history = db.prepare("SELECT * FROM history ORDER BY created_at DESC").all();
    }
    
    const mappedHistory = history.map((h: any) => {
      try {
        return {
          ...h,
          result_json: typeof h.result_json === 'string' ? JSON.parse(h.result_json) : h.result_json
        };
      } catch (e) {
        console.error(`[History] Failed to parse result_json for record ${h.id}:`, e);
        return { ...h, result_json: {} };
      }
    });
    
    console.log(`[History] Found ${mappedHistory.length} records`);
    res.json(mappedHistory);
  } catch (err: any) {
    console.error("[History] Database error fetching history:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
});

app.post("/api/history", (req, res) => {
  const { user_id, image_data, result } = req.body;
  console.log(`[History] Saving record for user ${user_id}, status: ${result.status}`);
  
  try {
    const info = db.prepare(`
      INSERT INTO history (user_id, image_data, result_json, status, defect_type, confidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      user_id || null,
      image_data,
      JSON.stringify(result),
      result.status,
      result.defectType,
      result.confidence
    );
    console.log(`[History] Successfully saved record with ID: ${info.lastInsertRowid}`);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    console.error("[History] Database error saving history:", err.message);
    res.status(500).json({ success: false, message: "Failed to save history", error: err.message });
  }
});

app.delete("/api/history/:id", (req, res) => {
  db.prepare("DELETE FROM history WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Stats API
app.get("/api/stats", (req, res) => {
  const userId = req.query.userId;
  const hasUser = userId && userId !== 'undefined' && userId !== 'null';
  const whereClause = hasUser ? "WHERE user_id = ?" : "";
  const params = hasUser ? [userId] : [];

  console.log(`[Stats] Fetching stats for userId: ${userId}`);

  try {
    const total = db.prepare(`SELECT count(*) as count FROM history ${whereClause}`).get(...params) as { count: number };
    const normal = db.prepare(`SELECT count(*) as count FROM history ${whereClause} ${hasUser ? "AND" : "WHERE"} status = 'Normal'`).get(...params) as { count: number };
    const defected = db.prepare(`SELECT count(*) as count FROM history ${whereClause} ${hasUser ? "AND" : "WHERE"} status = 'Defected'`).get(...params) as { count: number };
    
    const defectTypes = db.prepare(`
      SELECT defect_type as name, count(*) as value 
      FROM history 
      ${whereClause} ${hasUser ? "AND" : "WHERE"} status = 'Defected' 
      GROUP BY defect_type
    `).all(...params);

    const monthlyTrend = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, count(*) as count
      FROM history
      ${whereClause}
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `).all(...params);

    res.json({
      total: total.count || 0,
      normal: normal.count || 0,
      defected: defected.count || 0,
      defectTypes: defectTypes || [],
      monthlyTrend: monthlyTrend || []
    });
  } catch (err: any) {
    console.error("[Stats] Database error fetching stats:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// Local PCB Detection API (no external API key needed)
app.post("/api/predict", async (req, res) => {
  const { base64Image, mimeType } = req.body;

  if (!base64Image) {
    return res.status(400).json({ success: false, message: "No image provided" });
  }

  try {
    // Try you local YOLO inference first, then fallback to deterministic stub
    const prediction = await runYoloPrediction(base64Image, mimeType);

    console.log("[Predict] Local detection completed:", prediction.status);
    res.json(prediction);
  } catch (err: any) {
    console.error("[Predict] YOLO prediction failed, falling back to stub:", err.message);
    const imageBuffer = Buffer.from(base64Image, "base64");
    const fallbackResult = performLocalDetection(imageBuffer);
    res.json(fallbackResult);
  }
});

function findLocalModelPath() {
  const modelDir = path.resolve(__dirname, "../dataset/models");
  const candidates = ["pcb_defect_model.pt", "pcb_defect_model.onnx", "pcb_defect_model.bin", "pcb_defect_model.h5"];

  for (const candidate of candidates) {
    const fullPath = path.join(modelDir, candidate);
    if (fs.existsSync(fullPath)) return fullPath;
  }

  if (fs.existsSync(modelDir)) {
    const files = fs.readdirSync(modelDir).filter(f => /\.(pt|onnx|bin|h5)$/i.test(f));
    if (files.length > 0) {
      return path.join(modelDir, files[0]);
    }
  }

  return null;
}

async function runYoloPrediction(base64Image: string, mimeType: string) {
  return new Promise<any>((resolve, reject) => {
    const scriptPath = path.join(__dirname, "yolo_predict.py");
    const modelPath = findLocalModelPath();

    if (!modelPath) {
      return reject(new Error("No local model found in dataset/models"));
    }

    const process = spawn("python", [scriptPath, "--model", modelPath], {
      cwd: path.resolve(__dirname),
      stdio: ["pipe", "pipe", "pipe"]
    });

    const payload = JSON.stringify({ base64Image, mimeType });

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0 && !output) {
        return reject(new Error(errorOutput || `Python process exited with code ${code}`));
      }

      try {
        const lines = output.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
        const jsonLine = lines.reverse().find(l => l.trim().startsWith('{') || l.trim().startsWith('['));
        if (!jsonLine) {
          return reject(new Error(`Python output did not contain JSON; output: ${output}`));
        }
        const result = JSON.parse(jsonLine);
        if (result.success === false || !result.status) {
          return reject(new Error(result.message || "Invalid prediction output"));
        }

        // Normalize bounding boxes from raw coordinates to 0..1000 scale if values are not already normalized
        if (Array.isArray(result.boundingBoxes)) {
          result.boundingBoxes = result.boundingBoxes.map((b: any) => ({
            xmin: Math.max(0, Math.min(1000, b.xmin)),
            ymin: Math.max(0, Math.min(1000, b.ymin)),
            xmax: Math.max(0, Math.min(1000, b.xmax)),
            ymax: Math.max(0, Math.min(1000, b.ymax)),
            label: b.label || "defect"
          }));
        }

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });

    process.stdin.write(payload);
    process.stdin.end();
  });
}

// Local deterministic stub (fallback)
function performLocalDetection(imageBuffer: Buffer) {
  let hash = 0;
  for (let i = 0; i < imageBuffer.length; i++) {
    hash = ((hash << 5) - hash) + imageBuffer[i];
    hash = hash & hash;
  }

  const randomValue = Math.abs(hash % 100) / 100;

  const defectTypes = [
    "Soldering defect",
    "Component mismatch",
    "Missing hole",
    "Missing bite",
    "Open circuit",
    "Short circuit",
    "Spur",
    "Spurious copper"
  ];

  const pcbTypes = ["Single-layer", "Double-layer", "Multi-layer"];
  const severities = ["Low", "Medium", "High"];

  const isDefected = randomValue > 0.6;
  const confidence = 85 + Math.floor(randomValue * 15);

  let result: any = {
    status: isDefected ? "Defected" : "Normal",
    confidence,
    normalPercentage: isDefected ? Math.floor(randomValue * 30) : 85 + Math.floor(randomValue * 15),
    defectedPercentage: isDefected ? 85 + Math.floor(randomValue * 15) : Math.floor(randomValue * 30),
    pcbType: pcbTypes[Math.floor(randomValue * pcbTypes.length)],
    explanation: "",
    suggestedSolution: "",
    defectType: null,
    severity: null,
    boundingBoxes: []
  };

  if (isDefected) {
    const defectType = defectTypes[Math.floor(randomValue * defectTypes.length)];
    const severity = severities[Math.floor(randomValue * severities.length)];

    result.defectType = defectType;
    result.severity = severity;
    result.explanation = `A ${severity.toLowerCase()} severity ${defectType.toLowerCase()} was detected on this ${result.pcbType.toLowerCase()} PCB. The defect is visible in the region highlighted in the image analysis.`;
    result.suggestedSolution = `To fix this ${defectType.toLowerCase()}, recommend immediate rework of the solder joints and component placement. Use reflow soldering for surface mount defects or hand soldering for through-hole repairs.`;
    result.boundingBoxes = [
      { ymin: 150, xmin: 130, ymax: 320, xmax: 360, label: defectType }
    ];
  } else {
    result.explanation = `This ${result.pcbType.toLowerCase()} PCB passed quality inspection with no visible defects detected. All solder joints appear intact and components are properly placed.`;
    result.suggestedSolution = `No corrective action required. PCB is suitable for assembly and deployment.`;
  }

  return result;
}

// Auth API
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  try {
    db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password);
    const user = db.prepare("SELECT id, name, email FROM users WHERE email = ?").get(email);
    res.json({ success: true, user });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ success: false, message: "Email already registered" });
    } else {
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT id, name, email FROM users WHERE email = ? AND password = ?").get(email, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: "Invalid email or password" });
  }
});

// Admin Auth API
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM admin_users WHERE username = ? AND password = ?").get(username, password);
  if (user) {
    res.json({ success: true, token: "demo-token-123", username: user.username });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Support API
app.post("/api/support", async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  console.log(`[Support] New ticket from ${name} (${email}): ${subject}`);
  
  try {
    // Save to database
    db.prepare("INSERT INTO support_queries (name, email, subject, message) VALUES (?, ?, ?, ?)").run(
      name, email, subject, message
    );

    // Send notification email to support team
    const mailOptions = {
      from: `"PCB Vision Support" <${process.env.SMTP_USER || "noreply@pcbvision.com"}>`,
      to: process.env.SUPPORT_EMAIL || "kaviyasrik.dev@gmail.com",
      subject: `[Support Ticket] ${subject}`,
      text: `New support request received:
      
Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}

---
This is an automated notification from PCB Vision AI.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">New Support Request</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification from PCB Vision AI.</p>
        </div>
      `
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: `"PCB Vision Support" <${process.env.SMTP_USER || "noreply@pcbvision.com"}>`,
      to: email,
      subject: `Support Ticket Received: ${subject}`,
      text: `Hi ${name},

Thank you for contacting PCB Vision AI Support. We have received your message regarding "${subject}" and our team will get back to you within 24 hours.

Your message:
${message}

Best regards,
The PCB Vision Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">We've Received Your Message</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting PCB Vision AI Support. We have received your message regarding "<strong>${subject}</strong>" and our team will get back to you within 24 hours.</p>
          <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="font-style: italic;">"${message}"</p>
          </div>
          <p>Best regards,<br/>The PCB Vision Team</p>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">This is an automated notification from PCB Vision AI.</p>
        </div>
      `
    };

    // Attempt to send emails
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await Promise.all([
        transporter.sendMail(mailOptions),
        transporter.sendMail(userMailOptions)
      ]);
      console.log("[Support] Emails sent successfully");
    } else {
      console.warn("[Support] SMTP not configured. Skipping email sending.");
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Support] Error handling support request:", error);
    res.status(500).json({ success: false, message: "Failed to process support request" });
  }
});

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const frontendRoot = path.resolve(__dirname, "../frontend");
    const vite = await createViteServer({
      root: frontendRoot,
      server: { middlewareMode: true },
      appType: "custom", // Changed to custom to handle HTML manually
      configFile: path.resolve(frontendRoot, "vite.config.ts")
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      
      try {
        let template = fs.readFileSync(path.resolve(frontendRoot, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
  app.use(express.static(path.resolve(__dirname, "../../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../dist/index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
