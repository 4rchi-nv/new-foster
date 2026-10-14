import type { CollectionBeforeValidateHook } from "payload";

import { slugify } from "@/lib/slug";

export const fillSlug: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data;
  const typed = data as { slug?: unknown; title?: unknown };
  const current = typeof typed.slug === "string" ? typed.slug.trim() : "";
  const previous =
    originalDoc && typeof originalDoc.slug === "string" ? originalDoc.slug : "";
  if (current) {
    typed.slug = slugify(current);
    return data;
  }
  if (previous) {
    typed.slug = previous;
    return data;
  }
  if (typeof typed.title === "string" && typed.title.trim()) {
    typed.slug = slugify(typed.title);
  }
  return data;
};
