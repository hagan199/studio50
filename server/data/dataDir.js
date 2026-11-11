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

  const defaults = ["content.json", "services.json", "contact.json", "menu.json", "theme.json", "seo.json", "graduation.json", "team.json"];

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
  await runMigration("graduation.json", "additional-services-fill-defaults", fillAdditionalServicesDefaults);
  await runMigration("menu.json", "team-menu-link", addTeamMenuLink);
  await runMigration("content.json", "team-homepage-section", addTeamHomepageSection);
  await runMigration("content.json", "hide-legacy-cta-section", hideLegacyCtaSection);
}

/**
 * Apply `apply(data)` to a JSON file in the persistent dir exactly once.
 * The migration name is recorded in the file's `migrations` list, so a later
 * admin edit (e.g. removing a seeded link) is never undone by a redeploy.
 * `apply` mutates data and returns a short log message (or nothing).
 */
async function runMigration(file, name, apply) {
  const target = path.join(dataDir, file);
  try {
    const data = JSON.parse(await fs.readFile(target, "utf-8"));
    const applied = Array.isArray(data.migrations) ? data.migrations : [];
    if (applied.includes(name)) return;

    const message = await apply(data);
    data.migrations = [...applied, name];

    const tmp = `${target}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2));
    await fs.rename(tmp, target);
    console.log(`[data] ${file}: ${message || name}`);
  } catch (err) {
    console.warn(`[data] Migration ${name} on ${file} failed:`, err.message);
  }
}

/**
 * A graduation.json saved by the CMS before the Additional Services block
 * existed can hold a partial block (e.g. only a label and an empty items
 * list, with no `visible` flag). The block-level migration above skips it
 * because the key exists, and the section never rendered. Fill in only the
 * fields that are missing; values an admin has typed are left alone.
 */
async function fillAdditionalServicesDefaults(data) {
  const defaults = JSON.parse(await fs.readFile(path.join(defaultDir, "graduation.json"), "utf-8")).additionalServices;
  const block = data.additionalServices && typeof data.additionalServices === "object" ? data.additionalServices : {};
  const filled = [];

  for (const key of ["label", "heading", "intro", "closing", "ctaText", "ctaLink", "visible"]) {
    if (block[key] === undefined && defaults[key] !== undefined) {
      block[key] = defaults[key];
      filled.push(key);
    }
  }
  if (!Array.isArray(block.items) || block.items.length === 0) {
    block.items = defaults.items;
    filled.push("items");
  }

  data.additionalServices = block;
  return filled.length ? `Filled additionalServices defaults: ${filled.join(", ")}` : "additionalServices already complete";
}

/** Add the "Our Team" link (#team) to the menu, just before Graduation. */
function addTeamMenuLink(menu) {
  const items = Array.isArray(menu.items) ? menu.items : [];
  if (items.some((item) => item.href === "#team")) return "Our Team link already present";

  const grad = items.find((item) => item.href === "/graduation");
  const order = grad ? grad.order ?? 0 : items.reduce((max, item) => Math.max(max, item.order ?? 0), 0) + 1;
  if (grad) {
    for (const item of items) if ((item.order ?? 0) >= order) item.order = (item.order ?? 0) + 1;
  }
  items.push({ id: "menu-team", label: "Our Team", href: "#team", order });
  menu.items = items;
  return "Added Our Team link to menu";
}

/** Add the Our Team block to a saved homepage layout, before the CTA/Contact. */
function addTeamHomepageSection(content) {
  if (!Array.isArray(content.sections) || content.sections.some((s) => s.id === "team")) {
    return "Homepage layout already has (or does not need) a team section";
  }
  const sorted = [...content.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const before = sorted.find((s) => s.id === "cta") || sorted.find((s) => s.id === "contact");
  const order = before ? before.order : sorted.length;
  content.sections = content.sections.map((s) => ((s.order ?? 0) >= order ? { ...s, order: (s.order ?? 0) + 1 } : s));
  content.sections.push({ id: "team", label: "Our Team", visible: true, order });
  return "Added Our Team section to homepage layout";
}

/**
 * The homepage CTA block ("Ready to join the movement…") predates the
 * Get in Touch footer, which now carries the page's call to action. Shown
 * together, the homepage ended differently from every other page. Hide it
 * once; its text is kept and it can be switched back on in Page Layout.
 */
function hideLegacyCtaSection(content) {
  const cta = Array.isArray(content.sections) && content.sections.find((s) => s.id === "cta");
  if (!cta || cta.visible === false) return "Homepage CTA section already hidden";
  cta.visible = false;
  return "Hid homepage CTA section (content kept; re-enable in Page Layout)";
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
