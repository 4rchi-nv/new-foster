import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(200),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(40)
    .refine((value) => (value.match(/\d/g) ?? []).length >= 6),
  email: z.string().trim().email().max(200),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  consent: z.literal("yes"),
  website: z.string().max(0).optional().or(z.literal("")),
  source: z.string().trim().max(200).optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

const fieldMap = {
  name: "name",
  company: "company",
  phone: "phone",
  email: "email",
  message: "message",
  consent: "consent",
} as const;

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key in fieldMap && !errors[key]) errors[key] = key;
  }
  return errors;
}
