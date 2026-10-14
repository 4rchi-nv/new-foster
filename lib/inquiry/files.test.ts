import assert from "node:assert/strict";
import test from "node:test";

import { inspectUpload, sanitizeFilename } from "./files.ts";

test("accepts a pdf with a matching type", () => {
  assert.equal(inspectUpload({ name: "ТЗ.pdf", type: "application/pdf", size: 1024 }), null);
});

test("rejects html disguised as a document", () => {
  assert.equal(inspectUpload({ name: "spec.pdf", type: "text/html", size: 1024 }), "type");
});

test("rejects oversized files", () => {
  assert.equal(inspectUpload({ name: "spec.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 20 * 1024 * 1024 }), "size");
});

test("sanitizes path fragments and non-latin names", () => {
  assert.equal(sanitizeFilename("../tz/спека.docx"), "file.docx");
  assert.equal(sanitizeFilename("spec.v2.pdf"), "spec.v2.pdf");
});
