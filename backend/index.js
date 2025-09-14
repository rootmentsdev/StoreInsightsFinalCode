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
  "https://script.google.com/macros/s/AKfycbyp_pNRxK3Z5SH81FJMbJ9DfM6bwzFYl0cHfRFk395ePGMqFc7ojCh1Uj5qZyx2c46liA/exec";

const allowed = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,https://store-insights-final-code.vercel.app")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* Middleware */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman
      if (allowed.includes(origin)) return cb(null, true);
      cb(new Error("CORS: origin not allowed"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  })
);
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
app.get("/health", (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

/* Handle preflight requests */
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('OPTIONS request from origin:', origin);
  
  if (allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS headers set for origin:', origin);
  } else {
    console.log('Origin not allowed:', origin);
  }
  res.sendStatus(200);
});

/* Authentication Routes */
app.use("/api/auth", authRoutes);

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