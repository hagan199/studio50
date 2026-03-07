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
app.use("/uploads", express.static(uploadsDir));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/menu", menuRoutes);

// Serve React build in production
const distDir = path.join(__dirname, "..", "dist");
const hasDist = fs.existsSync(distDir);

// Serve the built React app when available (Railway/Nixpacks often builds dist during deploy)
if (process.env.NODE_ENV === "production" || hasDist) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
