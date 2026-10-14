import assert from "node:assert/strict";
import test from "node:test";

import { fieldErrors, inquirySchema } from "./schema.ts";

const valid = {
  name: "Иван Петров",
  company: "НПЗ",
  phone: "+7 900 000-00-00",
  email: "engineer@example.com",
  message: "Печь ПМ",
  consent: "yes" as const,
  website: "",
  source: "/ru/contacts",
};

test("accepts a complete inquiry", () => {
  assert.equal(inquirySchema.safeParse(valid).success, true);
});

test("rejects a missing company and consent", () => {
  const result = inquirySchema.safeParse({ ...valid, company: " ", consent: "" });
  assert.equal(result.success, false);
  if (!result.success) {
    const errors = fieldErrors(result.error);
    assert.equal(errors.company, "company");
    assert.equal(errors.consent, "consent");
  }
});
