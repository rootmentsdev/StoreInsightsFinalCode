import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

/* Env */
const PORT = process.env.PORT || 3000;
const GAS_URL =
  process.env.GAS_URL ||
  "https://script.google.com/macros/s/AKfycbxbOYqflpZs1t11WK_Nd9uKxC_OHcs-iTLMK87jfmw7qt_suCnATt-iWqFRWhNECemS/exec";

const allowed = (process.env.FRONTEND_ORIGINS || "https://store-insights-final-code.vercel.app , https://cluster.rootments.live")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* Middleware */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Comprehensive CORS handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS] ${req.method} request from origin:`, origin);
  console.log('[CORS] Allowed origins:', allowed);
  
  // Allow requests from allowed origins
  if (allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('[CORS] Origin allowed:', origin);
  } else if (!origin) {
    // Allow requests without origin (curl, postman, etc.)
    res.header('Access-Control-Allow-Origin', '*');
    console.log('[CORS] No origin - allowing all');
  } else {
    console.log('[CORS] Origin NOT allowed:', origin);
  }
  
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});
app.use(compression());
app.use(morgan("tiny"));
app.use(
  "/api/",
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* Health */
app.get("/health", (_req, res) => {
  console.log('Health check requested');
  res.json({ ok: true, ts: new Date().toISOString() });
});

/* CORS Test endpoint */
app.get("/api/cors-test", (_req, res) => {
  console.log('CORS test endpoint hit');
  res.json({ 
    message: "CORS test successful", 
    timestamp: new Date().toISOString(),
    origin: _req.headers.origin 
  });
});

/* Simple auth test endpoint */
app.post("/api/auth/test", (_req, res) => {
  console.log('Auth test endpoint hit');
  res.json({ 
    message: "Auth endpoint CORS test successful", 
    timestamp: new Date().toISOString(),
    origin: _req.headers.origin 
  });
});

// OPTIONS requests are now handled in the main CORS middleware above

/* Authentication Routes with explicit CORS */
app.use("/api/auth", (req, res, next) => {
  // Ensure CORS headers are set for auth routes
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
}, authRoutes);

/* Fetch with timeout */
async function fetchWithTimeout(url, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

/* Main proxy: /api/sheet?sheet=South%20cluster */
app.get("/api/sheet", async (req, res) => {
  const raw = String(req.query.sheet || "South cluster");
  const sheet = /^[\w \-]+$/.test(raw) ? raw : "South cluster";
  const url = `${GAS_URL}?sheet=${encodeURIComponent(sheet)}&ts=${Date.now()}`;

  try {
    const r = await fetchWithTimeout(url, 20000);
    const ctype = (r.headers.get("content-type") || "").toLowerCase();
    const body = await r.text();

    console.log("[UPSTREAM]", r.status, ctype, `sheet="${sheet}"`);

    if (!r.ok || ctype.includes("text/html")) {
      return res.status(502).json({
        error: "upstream_failed",
        upstreamStatus: r.status,
        contentType: ctype,
        preview: body.slice(0, 200),
      });
    }

    res.set("Content-Type", "application/json; charset=utf-8");
    res.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return res.status(200).send(body);
  } catch (err) {
    console.error("Proxy fetch failed:", err.message || err);
    return res.status(502).json({ error: "upstream_error", detail: err.message || String(err) });
  }
});

/* Debug route: peek upstream content-type & snippet */
app.get("/api/debug", async (req, res) => {
  const raw = String(req.query.sheet || "South cluster");
  const sheet = /^[\w \-]+$/.test(raw) ? raw : "South cluster";
  const url = `${GAS_URL}?sheet=${encodeURIComponent(sheet)}&ts=${Date.now()}`;

  try {
    const r = await fetchWithTimeout(url, 20000);
    const ctype = (r.headers.get("content-type") || "").toLowerCase();
    const text = await r.text();

    res.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    res.json({ upstreamStatus: r.status, contentType: ctype, preview: text.slice(0, 500) });
  } catch (e) {
    res.status(502).json({ error: "debug_upstream_error", detail: String(e) });
  }
});

/* 404 + error */
app.use((req, res) => res.status(404).json({ error: "not_found" }));
app.use((err, _req, res, _next) => {
  console.error("Server error:", err.message || err);
  res.status(500).json({ error: "server_error", detail: err.message || String(err) });
});

/* Start */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Forwarding to GAS: ${GAS_URL}`);
  console.log("🔐 Allowed origins:", allowed.join(", "));
});