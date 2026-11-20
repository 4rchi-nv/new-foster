import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { ru } from "@payloadcms/translations/languages/ru";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { databaseAuthToken, databaseURL } from "@/lib/sqlite-path";
import { ensureStorageDirs, isProductionRuntime } from "@/lib/storage";
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

const url = databaseURL();
const authToken = databaseAuthToken();
const fileDatabase = url.startsWith("file:");
const secret = process.env.PAYLOAD_SECRET?.trim() || "";

if (isProductionRuntime() && secret.length < 32) {
  throw new Error("PAYLOAD_SECRET must be a random string of at least 32 characters in production.");
}

ensureStorageDirs();

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
  secret,
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
      url,
      // Turso / remote LibSQL. Leave unset for a local file database.
      ...(authToken ? { authToken } : {}),
    },
    // Payload already skips push when NODE_ENV=production. Do not add prodMigrations
    // until this database leaves dev-push: a pushed file has payload_migrations.batch = -1,
    // and an unattended migrate prompt exits the process.
    push: true,
    ...(fileDatabase && isProductionRuntime() ? { wal: true as const, busyTimeout: 5000 } : {}),
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
