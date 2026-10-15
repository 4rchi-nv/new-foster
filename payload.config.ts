import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { ru } from "@payloadcms/translations/languages/ru";
import { mkdirSync } from "fs";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { seed } from "@/payload/seed";
import {
  ArticleCategories,
  Articles,
  Documents,
  Equipment,
  EquipmentCategories,
  EquipmentGroups,
  Expertise,
  Inquiries,
  InquiryFiles,
  Media,
  Metrics,
  ProjectCategories,
  Projects,
  Site,
  Users,
} from "@/payload/schema";

const dirname = path.dirname(fileURLToPath(import.meta.url));

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

const databaseURL = env("DATABASE_URL") || env("TURSO_DATABASE_URL") || "file:./data/payload.db";
const databaseAuthToken = env("DATABASE_AUTH_TOKEN") || env("TURSO_AUTH_TOKEN");
const isLocalFileDB = databaseURL.startsWith("file:");

function ensureDir(dir: string) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    // Vercel (and similar) may ship a read-only filesystem outside /tmp.
  }
}

if (isLocalFileDB) ensureDir(path.join(process.cwd(), "data"));
ensureDir(path.join(process.cwd(), "media"));
ensureDir(path.join(process.cwd(), "storage", "inquiries"));

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: "— New Foster" },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
    Users,
    Media,
    Documents,
    EquipmentGroups,
    EquipmentCategories,
    Equipment,
    ProjectCategories,
    Projects,
    ArticleCategories,
    Articles,
    Expertise,
    Metrics,
    InquiryFiles,
    Inquiries,
  ],
  globals: [Site],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  localization: {
    locales: [
      { label: "Русский", code: "ru" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "ru",
    fallback: false,
  },
  i18n: {
    supportedLanguages: { en, ru },
    fallbackLanguage: "ru",
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: databaseURL,
      // Turso / remote LibSQL. Leave unset for local `file:./data/payload.db`.
      ...(databaseAuthToken ? { authToken: databaseAuthToken } : {}),
    },
    // ponytail: schema push on boot suits one SQLite/Turso DB. Use migrations before multiple apps share a schema.
    push: true,
  }),
  graphQL: { disable: true },
  onInit: async (payload) => {
    try {
      await seed(payload);
    } catch (error) {
      payload.logger.error({ err: error }, "Seed failed");
    }
  },
});
