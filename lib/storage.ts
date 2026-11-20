import { accessSync, constants, mkdirSync } from "fs";
import path from "path";

import { databaseURL, readEnv, sqliteFilePath } from "@/lib/sqlite-path";

function envDir(name: string) {
  const value = readEnv(name);
  // turbopackIgnore: absolute env path is outside the project and must not be traced.
  return value ? path.resolve(/*turbopackIgnore: true*/ value) : undefined;
}

export function mediaDir() {
  return envDir("MEDIA_DIR") ?? path.join(process.cwd(), "media");
}

export function documentsDir() {
  return envDir("DOCUMENTS_DIR") ?? path.join(process.cwd(), "media", "documents");
}

export function inquiriesDir() {
  return envDir("INQUIRY_DIR") ?? path.join(process.cwd(), "storage", "inquiries");
}

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
}

/** Create the directory. In a production server process, failure stops startup. */
export function ensureWritableDir(dir: string) {
  try {
    mkdirSync(dir, { recursive: true });
    accessSync(dir, constants.W_OK);
  } catch (error) {
    if (!isProductionRuntime()) return;
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Persistent directory is not writable: ${dir}. Create it and grant the service user write access. ${message}`,
    );
  }
}

export function ensureStorageDirs() {
  const url = databaseURL();
  if (url.startsWith("file:")) ensureWritableDir(path.dirname(sqliteFilePath(url)));
  ensureWritableDir(mediaDir());
  ensureWritableDir(documentsDir());
  ensureWritableDir(inquiriesDir());
}
