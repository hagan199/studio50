import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import servicesRoutes from "./routes/services.js";
import contactRoutes from "./routes/contact.js";
import themeRoutes from "./routes/theme.js";
import imagesRoutes from "./routes/images.js";
import menuRoutes from "./routes/menu.js";
import seoRoutes from "./routes/seo.js";
import graduationRoutes from "./routes/graduation.js";
import videosRoutes from "./routes/videos.js";
import teamRoutes from "./routes/team.js";
import { initDataDir } from "./data/dataDir.js";

dotenv.config();

// Initialize persistent data directory (copies defaults on first deploy)
await initDataDir();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

console.log("[auth] ADMIN_PASSWORD set:", Boolean(process.env.ADMIN_PASSWORD));
console.log("[auth] JWT_SECRET set:", Boolean(process.env.JWT_SECRET));

app.use(cors());
app.use(express.json());

// Serve uploaded files (use persistent volume in production)
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
app.use(
  "/uploads",
  express.static(uploadsDir, {
    // Upload filenames are timestamp-prefixed and never reused, so they can be
    // cached hard — a changed image always means a changed URL.
    maxAge: "1y",
    immutable: true,
    setHeaders: (res) => {
      res.set("X-Content-Type-Options", "nosniff");
      // Uploaded SVGs are same-origin documents; sandbox them so a malicious
      // file cannot run script if opened directly.
      res.set("Content-Security-Policy", "sandbox; default-src 'none'");
    },
  }),
);

// CMS data must never be served from the browser cache, otherwise a stale
// response paints the previous image/logo before the current one loads.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/graduation", graduationRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/team", teamRoutes);

// Serve React build in production
const distDir = path.join(__dirname, "..", "dist");
const hasDist = fs.existsSync(distDir);

// Serve the built React app when available (Railway/Nixpacks often builds dist during deploy)
if (process.env.NODE_ENV === "production" || hasDist) {
  // index.html names the current JS/CSS bundles, so the browser must check
  // for a new one on every load; otherwise a cached copy keeps pointing at the
  // previous deploy's bundles. The bundles themselves have content hashes in
  // their names (a new build means new file names), so they can be cached for
  // good.
  const noCacheHtml = (res) => {
    res.set("Cache-Control", "no-cache, must-revalidate");
  };
  app.use(
    express.static(distDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) noCacheHtml(res);
        else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.set("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );
  // Unknown /assets files (e.g. a bundle from a previous deploy) must 404
  // instead of receiving index.html as "JavaScript".
  app.use("/assets", (req, res) => res.status(404).end());
  app.get("*", (req, res) => {
    noCacheHtml(res);
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
