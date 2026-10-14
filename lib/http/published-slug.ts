import path from "path";
import { DatabaseSync } from "node:sqlite";

import { exampleArticleSlug, exampleProjectSlug } from "@/lib/i18n/frames";

const tables = {
  equipment: "equipment",
  projects: "projects",
  news: "articles",
} as const;

export type SlugSection = keyof typeof tables;

let database: DatabaseSync | null | undefined;

function db() {
  if (database !== undefined) return database;
  try {
    database = new DatabaseSync(path.join(process.cwd(), "data", "payload.db"), { readOnly: true });
  } catch {
    database = null;
  }
  return database;
}

// ponytail: one read of the local sqlite file. If the file is missing or locked, the page render decides.
export function isPublishedSlug(section: SlugSection, slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return false;
  const handle = db();
  if (!handle) return null;
  try {
    if (section === "projects" && slug === exampleProjectSlug) return true;
    if (section === "news" && slug === exampleArticleSlug) return true;
    const row = handle.prepare(`SELECT 1 AS ok FROM ${tables[section]} WHERE slug = ? AND status = 'published' LIMIT 1`).get(slug);
    if (row) return true;
    if (section !== "equipment") return false;
    const category = handle.prepare("SELECT 1 AS ok FROM equipment_categories WHERE slug = ? AND status = 'published' LIMIT 1").get(slug);
    return Boolean(category);
  } catch {
    return null;
  }
}
