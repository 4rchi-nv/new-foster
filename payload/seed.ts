import type { Payload } from "payload";

import { defaultSiteEn, defaultSiteRu, expertiseSteps } from "@/payload/default-site-copy";

type LocaleCopy = { ru: string; en: string };

function rowIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((row) =>
    row && typeof row === "object" && "id" in row ? (row as { id: string | number }).id : undefined,
  );
}

function withRowIds<T extends Record<string, unknown>>(saved: unknown, rows: T[]) {
  const ids = rowIds(saved);
  return rows.map((row, index) => (ids[index] != null ? { ...row, id: ids[index] } : row));
}

async function createLocalized(
  payload: Payload,
  collection: "expertise" | "equipment-groups" | "equipment-categories" | "project-categories" | "article-categories",
  shared: Record<string, unknown>,
  localized: Record<string, LocaleCopy>,
) {
  const ru: Record<string, unknown> = { ...shared };
  for (const [key, value] of Object.entries(localized)) ru[key] = value.ru;
  const doc = await payload.create({
    collection,
    locale: "ru",
    data: ru,
    overrideAccess: true,
  });
  const en: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(localized)) en[key] = value.en;
  await payload.update({
    collection,
    id: doc.id,
    locale: "en",
    data: en,
    overrideAccess: true,
  });
  return doc.id;
}

async function upsertSiteCopy(payload: Payload, mode: "full" | "pages-only" = "full") {
  const ruData =
    mode === "full"
      ? { ...defaultSiteRu }
      : {
          home: defaultSiteRu.home,
          pages: defaultSiteRu.pages,
          workflow: defaultSiteRu.workflow,
          principles: defaultSiteRu.principles,
        };
  const saved = await payload.updateGlobal({
    slug: "site",
    locale: "ru",
    data: ruData,
    overrideAccess: true,
  });
  const home = (saved as { home?: Record<string, unknown> }).home ?? {};
  const enData =
    mode === "full"
      ? {
          ...defaultSiteEn,
          home: {
            ...defaultSiteEn.home,
            strip: withRowIds(home.strip, [...defaultSiteEn.home.strip]),
            furnaces: withRowIds(home.furnaces, [...defaultSiteEn.home.furnaces]),
          },
          workflow: withRowIds((saved as { workflow?: unknown }).workflow, [...defaultSiteEn.workflow]),
          principles: withRowIds((saved as { principles?: unknown }).principles, [...defaultSiteEn.principles]),
        }
      : {
          home: {
            ...defaultSiteEn.home,
            strip: withRowIds(home.strip, [...defaultSiteEn.home.strip]),
            furnaces: withRowIds(home.furnaces, [...defaultSiteEn.home.furnaces]),
          },
          pages: defaultSiteEn.pages,
          workflow: withRowIds((saved as { workflow?: unknown }).workflow, [...defaultSiteEn.workflow]),
          principles: withRowIds((saved as { principles?: unknown }).principles, [...defaultSiteEn.principles]),
        };
  await payload.updateGlobal({
    slug: "site",
    locale: "en",
    data: enData,
    overrideAccess: true,
  });
}

async function createExpertise(
  payload: Payload,
  index: string,
  slug: keyof typeof expertiseSteps,
  ruTitle: string,
  enTitle: string,
  ruText: string,
  enText: string,
) {
  const steps = expertiseSteps[slug];
  const doc = await payload.create({
    collection: "expertise",
    locale: "ru",
    data: {
      index,
      slug,
      sortOrder: Number(index),
      status: "published",
      title: ruTitle,
      text: ruText,
      steps: steps.ru.map((title) => ({ title })),
    },
    overrideAccess: true,
  });
  const stepIds = rowIds((doc as { steps?: unknown }).steps);
  await payload.update({
    collection: "expertise",
    id: doc.id,
    locale: "en",
    data: {
      title: enTitle,
      text: enText,
      steps: steps.en.map((title, i) => (stepIds[i] != null ? { id: stepIds[i], title } : { title })),
    },
    overrideAccess: true,
  });
}

async function ensureExpertiseSteps(payload: Payload) {
  const result = await payload.find({
    collection: "expertise",
    locale: "ru",
    limit: 20,
    depth: 0,
    overrideAccess: true,
  });
  for (const doc of result.docs) {
    const row = doc as { id: string | number; slug?: string; steps?: unknown[] };
    const slug = row.slug as keyof typeof expertiseSteps | undefined;
    if (!slug || !(slug in expertiseSteps)) continue;
    if (Array.isArray(row.steps) && row.steps.length > 0) continue;
    const steps = expertiseSteps[slug];
    const updated = await payload.update({
      collection: "expertise",
      id: row.id,
      locale: "ru",
      data: { steps: steps.ru.map((title) => ({ title })) },
      overrideAccess: true,
    });
    const stepIds = rowIds((updated as { steps?: unknown }).steps);
    await payload.update({
      collection: "expertise",
      id: row.id,
      locale: "en",
      data: {
        steps: steps.en.map((title, i) => (stepIds[i] != null ? { id: stepIds[i], title } : { title })),
      },
      overrideAccess: true,
    });
  }
}

export async function seed(payload: Payload) {
  const email = process.env.PAYLOAD_ADMIN_EMAIL;
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;
  if (email && password) {
    const users = await payload.find({ collection: "users", limit: 1, overrideAccess: true });
    if (users.totalDocs === 0) {
      await payload.create({
        collection: "users",
        data: { email, password },
        overrideAccess: true,
      });
    }
  }

  const site = await payload.findGlobal({ slug: "site", locale: "ru", overrideAccess: true });
  const home = (site as { home?: { aboutTitle?: string } }).home;
  const existing = await payload.find({ collection: "expertise", limit: 1, overrideAccess: true });

  if (existing.totalDocs === 0) {
    await upsertSiteCopy(payload, "full");
  } else if (!home?.aboutTitle?.trim()) {
    // Existing DB before homepage/pages fields: fill new tabs without clobbering company/contacts.
    await upsertSiteCopy(payload, "pages-only");
  }

  await ensureExpertiseSteps(payload);

  if (existing.totalDocs > 0) return;

  const expertise = [
    ["01", "engineering", "Инжиниринг", "Engineering", "От исходных данных к согласованному техническому решению.", "From source data to an agreed technical solution."],
    ["02", "furnaces", "Промышленные печи", "Industrial furnaces", "Теплотехнические решения для технологических процессов.", "Thermal solutions for process units."],
    ["03", "equipment", "Оборудование", "Equipment", "Подбор и комплектация оборудования под задачу проекта.", "Selection and configuration of equipment for the project."],
    ["04", "manufacturing", "Производство", "Manufacturing", "Подготовка производства и контроль исполнения.", "Preparation of manufacture and control of execution."],
    ["05", "support", "Сопровождение", "Support", "Техническая координация на всех этапах проекта.", "Technical coordination through every project stage."],
  ] as const;

  for (const [index, slug, ruTitle, enTitle, ruText, enText] of expertise) {
    await createExpertise(payload, index, slug, ruTitle, enTitle, ruText, enText);
  }

  const furnaces = await createLocalized(
    payload,
    "equipment-groups",
    { slug: "industrial-furnaces", sortOrder: 1, status: "published" },
    {
      title: { ru: "Промышленные печи", en: "Industrial furnaces" },
      summary: {
        ru: "Разработка, комплектация и поставка технологических печей для нефтеперерабатывающих и нефтехимических производств.",
        en: "Development, configuration, and supply of process furnaces for oil refining and petrochemical facilities.",
      },
    },
  );
  const processGroup = await createLocalized(
    payload,
    "equipment-groups",
    { slug: "process-equipment", sortOrder: 2, status: "published" },
    { title: { ru: "Технологическое оборудование", en: "Process equipment" } },
  );
  const components = await createLocalized(
    payload,
    "equipment-groups",
    { slug: "components", sortOrder: 3, status: "published" },
    { title: { ru: "Комплектующие", en: "Components" } },
  );

  const categories: Array<[string, string, string, number | string, number]> = [
    ["tubular-furnaces", "Трубчатые печи", "Tubular furnaces", furnaces, 1],
    ["heating-furnaces", "Печи нагрева", "Heating furnaces", furnaces, 2],
    ["vacuum-furnaces", "Вакуумные печи", "Vacuum furnaces", furnaces, 3],
    ["unit-furnaces", "Печи технологических установок", "Process-unit furnaces", furnaces, 4],
    ["modernization", "Оборудование для модернизации и реконструкции", "Modernization and reconstruction equipment", furnaces, 5],
    ["columns", "Колонны", "Columns", processGroup, 1],
    ["column-internals", "Внутренние устройства колонн", "Column internals", processGroup, 2],
    ["vessels", "Емкости", "Vessels", processGroup, 3],
    ["auxiliary", "Сопутствующее оборудование", "Auxiliary equipment", components, 1],
  ];

  for (const [slug, ru, en, group, order] of categories) {
    await createLocalized(
      payload,
      "equipment-categories",
      { slug, group, sortOrder: order, status: "published" },
      { title: { ru, en } },
    );
  }

  const projectCategories = [
    ["oil-refining", "Нефтепереработка", "Oil refining"],
    ["petrochemicals", "Нефтехимия", "Petrochemicals"],
    ["other", "Другие проекты", "Other projects"],
  ] as const;
  for (const [index, item] of projectCategories.entries()) {
    await createLocalized(
      payload,
      "project-categories",
      { slug: item[0], sortOrder: index + 1, status: "published" },
      { title: { ru: item[1], en: item[2] } },
    );
  }

  const articleCategories = [
    ["technical", "Технические статьи", "Technical articles"],
    ["solutions", "Инженерные решения", "Engineering solutions"],
    ["regulatory", "Нормативные изменения", "Regulatory changes"],
    ["events", "Отраслевые мероприятия", "Industry events"],
    ["company-news", "Новости компании", "Company news"],
  ] as const;
  for (const [index, item] of articleCategories.entries()) {
    await createLocalized(
      payload,
      "article-categories",
      { slug: item[0], sortOrder: index + 1, status: "published" },
      { title: { ru: item[1], en: item[2] } },
    );
  }
}
