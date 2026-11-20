import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { sqliteFilePath } from "./sqlite-path.ts";

const cwd = path.resolve("/srv/new-foster");

test("relative file url resolves under the project", () => {
  assert.equal(sqliteFilePath("file:./data/payload.db", cwd), path.resolve(cwd, "data", "payload.db"));
});

test("absolute file url is not prefixed with the project directory", () => {
  assert.equal(
    sqliteFilePath("file:/var/lib/new-foster/database/payload.db", cwd),
    "/var/lib/new-foster/database/payload.db",
  );
});

test("three-slash file url is absolute", () => {
  assert.equal(
    sqliteFilePath("file:///var/lib/new-foster/database/payload.db", cwd),
    "/var/lib/new-foster/database/payload.db",
  );
});
