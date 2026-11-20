import path from "path";

export function readEnv(name: string) {
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

export function databaseURL() {
  return readEnv("DATABASE_URL") || readEnv("TURSO_DATABASE_URL") || "file:./data/payload.db";
}

export function databaseAuthToken() {
  return readEnv("DATABASE_AUTH_TOKEN") || readEnv("TURSO_AUTH_TOKEN");
}

/** Filesystem path for a libSQL `file:` URL. A leading `/` stays absolute on every OS. */
export function sqliteFilePath(url: string, cwd = process.cwd()) {
  const rest = url.slice(url.indexOf(":") + 1).split(/[?#]/)[0];
  let pathname = decodeURIComponent(rest);
  if (pathname.startsWith("//")) pathname = pathname.replace(/^\/\/[^/]*/, "");
  if (pathname.startsWith("/") || path.win32.isAbsolute(pathname) || path.posix.isAbsolute(pathname)) {
    return pathname;
  }
  return path.resolve(/*turbopackIgnore: true*/ cwd, pathname);
}
