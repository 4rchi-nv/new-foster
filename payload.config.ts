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

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
mkdirSync(path.join(process.cwd(), "media"), { recursive: true });
mkdirSync(path.join(process.cwd(), "storage", "inquiries"), { recursive: true });

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
    client: { url: process.env.DATABASE_URL || "file:./data/payload.db" },
    // ponytail: schema push on boot suits one SQLite file. Use migrations before running more than one server.
    push: true,
  }),
  graphQL: { disable: true },
  onInit: async (payload) => {
    await seed(payload);
  },
});
