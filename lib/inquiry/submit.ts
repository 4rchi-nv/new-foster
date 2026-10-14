"use server";

import { headers } from "next/headers";
import { randomUUID } from "crypto";

import { getPayload } from "payload";
import config from "@payload-config";

import { extensionOf, inspectUpload, MAX_FILES, sanitizeFilename } from "@/lib/inquiry/files";
import { sendInquiryEmail } from "@/lib/inquiry/mail";
import { allowInquiry } from "@/lib/inquiry/rate-limit";
import { fieldErrors, inquirySchema } from "@/lib/inquiry/schema";

export type InquiryState = {
  ok: boolean;
  error?: "validation" | "rate" | "file" | "save";
  fields?: Record<string, string>;
  file?: "type" | "size" | "count";
};

export async function submitInquiry(_prev: InquiryState | null, formData: FormData): Promise<InquiryState> {
  if (String(formData.get("website") ?? "").length > 0) return { ok: true };

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local";
  if (!allowInquiry(ip)) return { ok: false, error: "rate" };

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message") || "",
    consent: formData.get("consent"),
    website: formData.get("website") || "",
    source: formData.get("source") || "",
  });
  if (!parsed.success) return { ok: false, error: "validation", fields: fieldErrors(parsed.error) };

  const uploads = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  if (uploads.length > MAX_FILES) return { ok: false, error: "file", file: "count" };
  for (const file of uploads) {
    const issue = inspectUpload({ name: file.name, type: file.type, size: file.size });
    if (issue) return { ok: false, error: "file", file: issue };
  }

  try {
    const payload = await getPayload({ config });
    const fileIds: Array<number | string> = [];
    const names: string[] = [];
    for (const file of uploads) {
      const ext = extensionOf(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await payload.create({
        collection: "inquiry-files",
        data: { originalName: sanitizeFilename(file.name) },
        file: {
          data: buffer,
          mimetype: file.type || "application/octet-stream",
          name: `${randomUUID()}.${ext}`,
          size: buffer.length,
        },
        overrideAccess: true,
      });
      fileIds.push(stored.id);
      names.push(sanitizeFilename(file.name));
    }

    await payload.create({
      collection: "inquiries",
      data: {
        name: parsed.data.name,
        company: parsed.data.company,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message || "",
        source: parsed.data.source || "",
        locale: String(formData.get("locale") || ""),
        files: fileIds,
      },
      overrideAccess: true,
    });

    try {
      await sendInquiryEmail({ ...parsed.data, message: parsed.data.message || "", source: parsed.data.source || "", files: names });
    } catch (error) {
      console.error("Inquiry email failed", error);
    }
    return { ok: true };
  } catch (error) {
    console.error("Inquiry save failed", error);
    return { ok: false, error: "save" };
  }
}
