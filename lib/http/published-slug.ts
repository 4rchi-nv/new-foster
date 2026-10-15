import path from "path";
import { DatabaseSync } from "node:sqlite";

import { exampleArticleSlug, exampleProjectSlug } from "@/lib/i18n/frames";

const tables = {
  equipment: "equipment",
  projects: "projects",
  news: "articles",
} as const;

export type SlugSection = keyof typeof tables;

let localDb: DatabaseSync | null | undefined;
let remoteClient: { execute: (stmt: { sql: string; args: string[] }) => Promise<{ rows: unknown[] }> } | null | undefined;

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function databaseURL() {
  return env("DATABASE_URL") || env("TURSO_DATABASE_URL") || "file:./data/payload.db";
}

function databaseAuthToken() {
  return env("DATABASE_AUTH_TOKEN") || env("TURSO_AUTH_TOKEN");
}

function localHandle() {
  if (localDb !== undefined) return localDb;
  const url = databaseURL();
  if (!url.startsWith("file:")) {
    localDb = null;
    return localDb;
  }
  try {
    localDb = new DatabaseSync(path.join(process.cwd(), "data", "payload.db"), { readOnly: true });
  } catch {
    localDb = null;
  }
  return localDb;
}

async function remoteHandle() {
  if (remoteClient !== undefined) return remoteClient;
  const url = databaseURL();
  if (url.startsWith("file:")) {
    remoteClient = null;
    return remoteClient;
  }
  try {
    // HTTP client works in Edge proxy and Node; avoids node-native sqlite bindings.
    const { createClient } = await import("@libsql/client/http");
    const client = createClient({
      url,
      ...(databaseAuthToken() ? { authToken: databaseAuthToken() } : {}),
    });
    remoteClient = {
      execute: async (stmt) => {
        const result = await client.execute({ sql: stmt.sql, args: stmt.args });
        return { rows: result.rows as unknown[] };
      },
    };
  } catch {
    remoteClient = null;
  }
  return remoteClient;
}

function exampleAllowed(section: SlugSection, slug: string) {
  if (section === "projects" && slug === exampleProjectSlug) return true;
  if (section === "news" && slug === exampleArticleSlug) return true;
  return false;
}

function localLookup(section: SlugSection, slug: string): boolean | null {
  const handle = localHandle();
  if (!handle) return null;
  try {
    if (exampleAllowed(section, slug)) return true;
    const row = handle.prepare(`SELECT 1 AS ok FROM ${tables[section]} WHERE slug = ? AND status = 'published' LIMIT 1`).get(slug);
    if (row) return true;
    if (section !== "equipment") return false;
    const category = handle.prepare("SELECT 1 AS ok FROM equipment_categories WHERE slug = ? AND status = 'published' LIMIT 1").get(slug);
    return Boolean(category);
  } catch {
    return null;
  }
}

async function remoteLookup(section: SlugSection, slug: string): Promise<boolean | null> {
  const client = await remoteHandle();
  if (!client) return null;
  try {
    if (exampleAllowed(section, slug)) return true;
    const row = await client.execute({
      sql: `SELECT 1 AS ok FROM ${tables[section]} WHERE slug = ? AND status = 'published' LIMIT 1`,
      args: [slug],
    });
    if (row.rows.length) return true;
    if (section !== "equipment") return false;
    const category = await client.execute({
      sql: "SELECT 1 AS ok FROM equipment_categories WHERE slug = ? AND status = 'published' LIMIT 1",
      args: [slug],
    });
    return category.rows.length > 0;
  } catch {
    return null;
  }
}

// ponytail: proxy needs a sync-friendly path for local file DB and async Turso on Vercel.
// Upgrade: shared Payload query helper once edge/runtime support is settled.
export async function isPublishedSlug(section: SlugSection, slug: string): Promise<boolean | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return false;
  if (exampleAllowed(section, slug)) return true;
  const local = localLookup(section, slug);
  if (local !== null) return local;
  return remoteLookup(section, slug);
}
