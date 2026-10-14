import assert from "node:assert/strict";
import test from "node:test";

import { localePath, swapLocale } from "./locales.ts";

test("locale path keeps the home route short", () => {
  assert.equal(localePath("ru"), "/ru");
  assert.equal(localePath("en", "/projects"), "/en/projects");
});

test("language switch keeps the current page", () => {
  assert.equal(swapLocale("/ru/equipment/columns", "en"), "/en/equipment/columns");
  assert.equal(swapLocale("/en", "ru"), "/ru");
});
