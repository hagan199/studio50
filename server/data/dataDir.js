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

  const defaults = ["content.json", "services.json", "contact.json", "menu.json", "theme.json", "seo.json", "graduation.json"];

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

  await addGraduationMenuLink();
  await migrateGraduationAdditionalServices();
}

/**
 * Existing deployments already have a menu.json on their volume, so the new
 * Graduation link in the default file would never reach them. Add it once,
 * and record that we did so an admin who later removes it doesn't see it
 * come back on the next deploy.
 */
async function addGraduationMenuLink() {
  const MIGRATION = "graduation-menu-link";
  const menuPath = path.join(dataDir, "menu.json");
  try {
    const menu = JSON.parse(await fs.readFile(menuPath, "utf-8"));
    const applied = Array.isArray(menu.migrations) ? menu.migrations : [];
    if (applied.includes(MIGRATION)) return;

    const items = Array.isArray(menu.items) ? menu.items : [];
    if (!items.some((item) => item.href === "/graduation")) {
      const maxOrder = items.reduce((max, item) => Math.max(max, item.order ?? 0), 0);
      items.push({ id: "menu-graduation", label: "Graduation", href: "/graduation", order: maxOrder + 1 });
    }

    await fs.writeFile(
      menuPath,
      JSON.stringify({ ...menu, items, migrations: [...applied, MIGRATION] }, null, 2),
    );
    console.log("[data] Added Graduation link to menu");
  } catch (err) {
    console.warn("[data] Could not add Graduation menu link:", err.message);
  }
}

/**
 * If the persistent volume on Railway already has a graduation.json from an
 * earlier deploy, ensure the new additionalServices block and section entry
 * are seeded without losing any existing production edits.
 */
async function migrateGraduationAdditionalServices() {
  const gradPath = path.join(dataDir, "graduation.json");
  const defaultPath = path.join(defaultDir, "graduation.json");

  try {
    const raw = await fs.readFile(gradPath, "utf-8");
    const data = JSON.parse(raw);
    let updated = false;

    // Read default template
    let defaultData = null;
    const getDefaultData = async () => {
      if (!defaultData) {
        defaultData = JSON.parse(await fs.readFile(defaultPath, "utf-8"));
      }
      return defaultData;
    };

    // 1. Seed additionalServices content block if missing
    if (!data.additionalServices) {
      const defaults = await getDefaultData();
      data.additionalServices = defaults.additionalServices;
      updated = true;
    }

    // 2. Add additionalServices to sections array if missing
    if (Array.isArray(data.sections) && !data.sections.some((s) => s.id === "additionalServices")) {
      const pkgIndex = data.sections.findIndex((s) => s.id === "packages");
      const targetOrder = pkgIndex !== -1 ? (data.sections[pkgIndex].order ?? 2) + 1 : 3;

      // Shift subsequent sections up
      data.sections = data.sections.map((s) => ({
        ...s,
        order: s.order >= targetOrder ? s.order + 1 : s.order,
      }));

      data.sections.push({
        id: "additionalServices",
        label: "Additional Services",
        visible: true,
        order: targetOrder,
      });

      data.sections.sort((a, b) => a.order - b.order);
      updated = true;
    }

    if (updated) {
      await fs.writeFile(gradPath, JSON.stringify(data, null, 2));
      console.log("[data] Migrated graduation.json with additionalServices");
    }
  } catch (err) {
    console.warn("[data] Could not migrate graduation data:", err.message);
  }
}

/**
 * Returns the full path to a data file in the persistent directory.
 */
export function getDataPath(filename) {
  return path.join(dataDir, filename);
}

export { dataDir };
