import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In production, DATA_DIR should point to a Railway persistent volume (e.g. /data)
// Locally, it falls back to the repo's server/data/ folder
const dataDir = process.env.DATA_DIR || __dirname;

// Default data files shipped with the repo
const defaultDir = __dirname;

/**
 * On first deploy, copy default JSON files into the persistent directory
 * so CMS data survives redeployments.
 */
export async function initDataDir() {
  await fs.mkdir(dataDir, { recursive: true });

  const defaults = ["content.json", "services.json", "contact.json", "menu.json", "theme.json"];

  for (const file of defaults) {
    const target = path.join(dataDir, file);
    try {
      await fs.access(target);
      // File already exists in persistent dir — keep it
    } catch {
      // File doesn't exist yet — copy the default
      const source = path.join(defaultDir, file);
      await fs.copyFile(source, target);
      console.log(`[data] Initialized ${file} from defaults`);
    }
  }
}

/**
 * Returns the full path to a data file in the persistent directory.
 */
export function getDataPath(filename) {
  return path.join(dataDir, filename);
}

export { dataDir };
