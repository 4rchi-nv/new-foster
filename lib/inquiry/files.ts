export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_FILES = 3;

const allowed = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.ms-excel", "xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
]);

const extensionMime = new Map<string, string>(
  [...allowed.entries()].map(([mime, ext]) => [ext, mime]),
);

export function extensionOf(filename: string) {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  const match = base.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function sanitizeFilename(filename: string) {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "file";
  const ext = extensionOf(base);
  const stem = base.slice(0, base.length - (ext ? ext.length + 1 : 0));
  const cleanStem = stem
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^\.+/, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "file";
  return ext ? `${cleanStem}.${ext}` : cleanStem;
}

export type FileIssue = "type" | "size" | "count";

export function inspectUpload(file: { name: string; type: string; size: number }): FileIssue | null {
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) return "size";
  const ext = extensionOf(file.name);
  const expected = extensionMime.get(ext);
  if (!expected) return "type";
  const mime = file.type.trim().toLowerCase();
  if (mime && mime !== "application/octet-stream" && mime !== expected) return "type";
  return null;
}

export function allowedExtensions() {
  return [...allowed.values()];
}
