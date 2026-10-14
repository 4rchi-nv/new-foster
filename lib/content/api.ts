import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import type {
  ArticleCard,
  ArticleDetail,
  DocumentView,
  EquipmentDetail,
  EquipmentGroup,
  ExpertiseItem,
  MediaView,
  MetricItem,
  NamedLink,
  PageResult,
  ProjectCard,
  ProjectDetail,
  SiteContent,
  SpecRow,
} from "@/lib/content/types";

const cms = cache(async () => getPayload({ config }));

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function idOf(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return "";
}

function record(value: unknown) {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  return null;
}

function mediaOf(value: unknown, fallbackAlt: string): MediaView | null {
  const doc = record(value);
  if (!doc || !("filename" in doc || "url" in doc)) return null;
  const filename = str(doc.filename);
  const src = str(doc.url) || (filename ? `/api/media/file/${encodeURIComponent(filename)}` : "");
  if (!src) return null;
  return {
    src,
    alt: str(doc.alt) || fallbackAlt,
    width: typeof doc.width === "number" ? doc.width : undefined,
    height: typeof doc.height === "number" ? doc.height : undefined,
  };
}

function specsOf(value: unknown): SpecRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const item = record(row);
    if (!item) return [];
    const label = str(item.label);
    const cell = str(item.value);
    if (!label || !cell) return [];
    return [{ label, value: cell, unit: str(item.unit), notes: str(item.notes) }];
  });
}

function documentOf(value: unknown): DocumentView | null {
  const doc = record(value);
  if (!doc) return null;
  const filename = str(doc.filename);
  if (!filename) return null;
  return {
    id: idOf(doc),
    title: str(doc.title) || filename,
    kind: str(doc.kind),
    code: str(doc.standardCode),
    number: str(doc.documentNumber),
    description: str(doc.description),
    date: str(doc.issueDate).slice(0, 10),
    href: `/api/documents/file/${encodeURIComponent(filename)}`,
    filename,
    size: typeof doc.filesize === "number" ? doc.filesize : undefined,
  };
}

function documentsOf(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const doc = documentOf(item);
    return doc ? [doc] : [];
  });
}

function galleryOf(value: unknown, fallbackAlt: string) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const item = record(row);
    if (!item) return [];
    const media = mediaOf(item.image, str(item.caption) || fallbackAlt);
    if (!media) return [];
    return [{ media, caption: str(item.caption) }];
  });
}

function linksOf(value: unknown, locale: Locale, base: string): NamedLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const doc = record(item);
    if (!doc || !str(doc.slug) || !str(doc.title)) return [];
    return [{ title: str(doc.title), href: localePath(locale, `${base}/${str(doc.slug)}`), summary: str(doc.summary) }];
  });
}

const published = { status: { equals: "published" } } as const;

export const getSite = cache(async (locale: Locale): Promise<SiteContent> => {
  const payload = await cms();
  const site = await payload.findGlobal({ slug: "site", locale, fallbackLocale: false });
  const data = site as Record<string, unknown>;
  const workflow = Array.isArray(data.workflow)
    ? data.workflow.flatMap((step) => {
        const title = str(record(step)?.title);
        return title ? [{ title }] : [];
      })
    : [];
  const principles = Array.isArray(data.principles)
    ? data.principles.flatMap((step) => {
        const row = record(step);
        const title = str(row?.title);
        const text = str(row?.text);
        return title && text ? [{ title, text }] : [];
      })
    : [];
  return {
    companyName: str(data.companyName),
    legalName: str(data.legalName),
    slogan: str(data.slogan),
    heroLead: str(data.heroLead),
    positioning: str(data.positioning),
    furnacesIntro: str(data.furnacesIntro),
    phone: str(data.phone),
    email: str(data.email),
    address: str(data.address),
    seoTitle: str(data.seoTitle),
    seoDescription: str(data.seoDescription),
    workflow,
    principles,
  };
});

export const getExpertise = cache(async (locale: Locale): Promise<ExpertiseItem[]> => {
  const payload = await cms();
  const result = await payload.find({
    collection: "expertise",
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 20,
    sort: "sortOrder",
    overrideAccess: false,
    where: published,
  });
  return result.docs.flatMap((doc) => {
    const row = doc as Record<string, unknown>;
    const title = str(row.title);
    const text = str(row.text);
    if (!title || !text) return [];
    return [{ index: str(row.index), title, text, slug: str(row.slug) }];
  });
});

export const getMetrics = cache(async (locale: Locale): Promise<MetricItem[]> => {
  const payload = await cms();
  const result = await payload.find({
    collection: "metrics",
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 12,
    sort: "sortOrder",
    overrideAccess: false,
    where: { and: [published, { approved: { equals: true } }, { value: { not_equals: "" } }] },
  });
  return result.docs.flatMap((doc) => {
    const row = doc as Record<string, unknown>;
    const label = str(row.label);
    const value = str(row.value);
    if (!label || !value) return [];
    return [{ label, value, suffix: str(row.suffix) }];
  });
});

export const getEquipmentTree = cache(async (locale: Locale): Promise<EquipmentGroup[]> => {
  const payload = await cms();
  const args = { locale, fallbackLocale: false as const, overrideAccess: false as const, where: published, limit: 100 };
  const [groups, categories, items] = await Promise.all([
    payload.find({ collection: "equipment-groups", sort: "sortOrder", depth: 0, ...args }),
    payload.find({ collection: "equipment-categories", sort: "sortOrder", depth: 1, ...args }),
    payload.find({ collection: "equipment", sort: "sortOrder", depth: 0, ...args }),
  ]);

  const cards = new Map<string, EquipmentGroup["categories"][number]["items"]>();
  for (const doc of items.docs) {
    const row = doc as Record<string, unknown>;
    const categoryId = idOf(row.category);
    const title = str(row.title);
    const slug = str(row.slug);
    if (!categoryId || !title || !slug) continue;
    const list = cards.get(categoryId) ?? [];
    list.push({
      title,
      summary: str(row.summary),
      slug,
      href: localePath(locale, `/equipment/${slug}`),
    });
    cards.set(categoryId, list);
  }

  const byGroup = new Map<string, EquipmentGroup["categories"]>();
  for (const doc of categories.docs) {
    const row = doc as Record<string, unknown>;
    const groupId = idOf(row.group);
    const title = str(row.title);
    const slug = str(row.slug);
    if (!groupId || !title || !slug) continue;
    const list = byGroup.get(groupId) ?? [];
    list.push({
      id: idOf(row),
      title,
      summary: str(row.summary),
      slug,
      groupSlug: str(record(row.group)?.slug),
      items: cards.get(idOf(row)) ?? [],
    });
    byGroup.set(groupId, list);
  }

  return groups.docs.flatMap((doc) => {
    const row = doc as Record<string, unknown>;
    const title = str(row.title);
    const slug = str(row.slug);
    if (!title || !slug) return [];
    return [{
      id: idOf(row),
      title,
      summary: str(row.summary),
      slug,
      categories: byGroup.get(idOf(row)) ?? [],
    }];
  });
});

export const getEquipment = cache(async (locale: Locale, slug: string): Promise<EquipmentDetail | null> => {
  const payload = await cms();
  const result = await payload.find({
    collection: "equipment",
    locale,
    fallbackLocale: false,
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { and: [published, { slug: { equals: slug } }] },
  });
  const row = result.docs[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const title = str(row.title);
  const seo = record(row.seo);
  return {
    title,
    summary: str(row.summary),
    slug,
    href: localePath(locale, `/equipment/${slug}`),
    body: str(row.body),
    specs: specsOf(row.specifications),
    images: Array.isArray(row.images) ? row.images.flatMap((item) => {
      const media = mediaOf(item, title);
      return media ? [media] : [];
    }) : [],
    diagrams: Array.isArray(row.diagrams) ? row.diagrams.flatMap((item) => {
      const media = mediaOf(item, title);
      return media ? [media] : [];
    }) : [],
    documents: documentsOf(row.documents),
    projects: linksOf(row.relatedProjects, locale, "/projects"),
    articles: linksOf(row.relatedArticles, locale, "/news"),
    inquiry: row.inquiry !== false,
    seoTitle: str(seo?.title),
    seoDescription: str(seo?.description),
  };
});

function projectCard(row: Record<string, unknown>, locale: Locale): ProjectCard | null {
  const title = str(row.title);
  const slug = str(row.slug);
  if (!title || !slug) return null;
  const category = record(row.category);
  return {
    title,
    slug,
    href: localePath(locale, `/projects/${slug}`),
    customer: str(row.customer),
    equipmentName: str(row.equipmentName),
    scope: str(row.scope),
    year: typeof row.year === "number" ? String(row.year) : "",
    status: str(row.projectStatus),
    category: str(category?.title),
    categorySlug: str(category?.slug),
    cover: mediaOf(row.cover, title),
  };
}

export async function getProjects(
  locale: Locale,
  options: { page?: number; category?: string } = {},
): Promise<PageResult<ProjectCard> & { filters: { title: string; slug: string }[] }> {
  const payload = await cms();
  const page = options.page && options.page > 0 ? options.page : 1;
  const where = options.category
    ? { and: [published, { "category.slug": { equals: options.category } }] }
    : published;
  const [result, all] = await Promise.all([
    payload.find({
      collection: "projects",
      locale,
      fallbackLocale: false,
      depth: 1,
      limit: 12,
      page,
      sort: "-year",
      overrideAccess: false,
      where,
    }),
    payload.find({
      collection: "projects",
      locale,
      fallbackLocale: false,
      depth: 1,
      limit: 100,
      overrideAccess: false,
      where: published,
    }),
  ]);
  const filters = new Map<string, string>();
  for (const doc of all.docs) {
    const category = record((doc as Record<string, unknown>).category);
    const slug = str(category?.slug);
    const title = str(category?.title);
    if (slug && title) filters.set(slug, title);
  }
  return {
    items: result.docs.flatMap((doc) => {
      const card = projectCard(doc as Record<string, unknown>, locale);
      return card ? [card] : [];
    }),
    page: result.page ?? page,
    totalPages: result.totalPages ?? 1,
    filters: [...filters.entries()].map(([slug, title]) => ({ slug, title })),
  };
}

export const getProject = cache(async (locale: Locale, slug: string): Promise<ProjectDetail | null> => {
  const payload = await cms();
  const result = await payload.find({
    collection: "projects",
    locale,
    fallbackLocale: false,
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { and: [published, { slug: { equals: slug } }] },
  });
  const row = result.docs[0] as Record<string, unknown> | undefined;
  const card = row ? projectCard(row, locale) : null;
  if (!row || !card) return null;
  const seo = record(row.seo);
  return {
    ...card,
    location: str(row.location),
    task: str(row.task),
    solution: str(row.solution),
    execution: str(row.execution),
    manufacturing: str(row.manufacturing),
    result: str(row.result),
    specs: specsOf(row.specifications),
    gallery: galleryOf(row.gallery, card.title),
    documents: documentsOf(row.documents),
    equipment: linksOf(row.relatedEquipment, locale, "/equipment"),
    articles: linksOf(row.relatedArticles, locale, "/news"),
    seoTitle: str(seo?.title),
    seoDescription: str(seo?.description),
  };
});

function articleCard(row: Record<string, unknown>, locale: Locale): ArticleCard | null {
  const title = str(row.title);
  const slug = str(row.slug);
  if (!title || !slug) return null;
  return {
    title,
    slug,
    href: localePath(locale, `/news/${slug}`),
    excerpt: str(row.excerpt),
    date: str(row.publishedOn).slice(0, 10),
    category: str(record(row.category)?.title),
    hero: mediaOf(row.hero, title),
  };
}

export async function getArticles(locale: Locale, page = 1): Promise<PageResult<ArticleCard>> {
  const payload = await cms();
  const result = await payload.find({
    collection: "articles",
    locale,
    fallbackLocale: false,
    depth: 1,
    limit: 12,
    page: page > 0 ? page : 1,
    sort: "-publishedOn",
    overrideAccess: false,
    where: published,
  });
  return {
    items: result.docs.flatMap((doc) => {
      const card = articleCard(doc as Record<string, unknown>, locale);
      return card ? [card] : [];
    }),
    page: result.page ?? page,
    totalPages: result.totalPages ?? 1,
  };
}

export const getArticle = cache(async (locale: Locale, slug: string): Promise<ArticleDetail | null> => {
  const payload = await cms();
  const result = await payload.find({
    collection: "articles",
    locale,
    fallbackLocale: false,
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { and: [published, { slug: { equals: slug } }] },
  });
  const row = result.docs[0] as Record<string, unknown> | undefined;
  const card = row ? articleCard(row, locale) : null;
  if (!row || !card) return null;
  const seo = record(row.seo);
  return {
    ...card,
    body: str(row.body),
    author: str(row.author),
    gallery: galleryOf(row.gallery, card.title),
    documents: documentsOf(row.documents),
    equipment: linksOf(row.relatedEquipment, locale, "/equipment"),
    projects: linksOf(row.relatedProjects, locale, "/projects"),
    seoTitle: str(seo?.title),
    seoDescription: str(seo?.description),
  };
});

export async function getDocuments(locale: Locale, placement: "standards" | "company") {
  const payload = await cms();
  const result = await payload.find({
    collection: "documents",
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 100,
    sort: "-issueDate",
    overrideAccess: false,
    where: { and: [published, { placement: { equals: placement } }] },
  });
  return result.docs.flatMap((doc) => {
    const item = documentOf(doc);
    return item ? [item] : [];
  });
}

export async function publishedSlugs(collection: "equipment" | "projects" | "articles") {
  const payload = await cms();
  const result = await payload.find({
    collection,
    locale: "ru",
    depth: 0,
    limit: 500,
    overrideAccess: false,
    where: published,
  });
  return result.docs.flatMap((doc) => {
    const slug = str((doc as Record<string, unknown>).slug);
    return slug ? [slug] : [];
  });
}
