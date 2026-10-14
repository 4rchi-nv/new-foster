import assert from "node:assert/strict";
import test from "node:test";

import { slugify } from "./slug.ts";

test("slugify transliterates Russian titles", () => {
  assert.equal(slugify("Печь нагрева"), "pech-nagreva");
});

test("slugify keeps an existing latin slug stable", () => {
  assert.equal(slugify("tubular-furnaces"), "tubular-furnaces");
});
