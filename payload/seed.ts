import type { Payload } from "payload";

type LocaleCopy = { ru: string; en: string };

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

  const existing = await payload.find({ collection: "expertise", limit: 1, overrideAccess: true });
  if (existing.totalDocs > 0) return;

  const saved = await payload.updateGlobal({
    slug: "site",
    locale: "ru",
    data: {
      companyName: "ООО «Нью Фостер»",
      legalName: "ООО «Нью Фостер»",
      slogan: "Инжиниринг, производство, результат",
      heroLead:
        "Инженерные решения и поставка оборудования для нефтеперерабатывающей и нефтехимической промышленности.",
      positioning:
        "New Foster — инженерная компания, специализирующаяся на разработке технических решений, производстве и поставке оборудования для нефтеперерабатывающей и нефтехимической промышленности.",
      furnacesIntro:
        "Разработка, комплектация и поставка технологических печей для нефтеперерабатывающих и нефтехимических производств.",
      seoTitle: "Нью Фостер — инжиниринг и оборудование для нефтепереработки",
      seoDescription:
        "Инженерные решения, производство и поставка оборудования для нефтеперерабатывающей и нефтехимической промышленности.",
      workflow: [
        { title: "Задача" },
        { title: "Инженерное решение" },
        { title: "Производство" },
        { title: "Поставка" },
        { title: "Результат" },
      ],
      principles: [
        {
          title: "Инженерная компетенция",
          text: "Понимаем технологическую задачу, а не только спецификацию оборудования.",
        },
        {
          title: "Комплексная поставка",
          text: "От инженерного решения до поставки оборудования на объект.",
        },
        {
          title: "Контроль производства",
          text: "Контроль изготовления и соответствия техническим требованиям.",
        },
        {
          title: "Ответственность за результат",
          text: "Сопровождение проекта до фактического результата.",
        },
      ],
    },
  });

  const rowIds = (value: unknown) =>
    Array.isArray(value)
      ? value.map((row) => (row && typeof row === "object" && "id" in row ? (row as { id: string | number }).id : undefined))
      : [];
  const workflowIds = rowIds((saved as { workflow?: unknown }).workflow);
  const principleIds = rowIds((saved as { principles?: unknown }).principles);

  await payload.updateGlobal({
    slug: "site",
    locale: "en",
    data: {
      companyName: "New Foster",
      legalName: "New Foster LLC",
      slogan: "Engineering, manufacturing, results",
      heroLead:
        "Engineering solutions and equipment supply for the oil refining and petrochemical industries.",
      positioning:
        "New Foster is an engineering company focused on technical solutions, manufacturing, and the supply of equipment for the oil refining and petrochemical industries.",
      furnacesIntro:
        "Development, configuration, and supply of process furnaces for oil refining and petrochemical facilities.",
      seoTitle: "New Foster — engineering and equipment for oil refining",
      seoDescription:
        "Engineering, manufacturing, and supply of equipment for the oil refining and petrochemical industries.",
      workflow: [
        { id: workflowIds[0], title: "Challenge" },
        { id: workflowIds[1], title: "Engineering solution" },
        { id: workflowIds[2], title: "Manufacturing" },
        { id: workflowIds[3], title: "Delivery" },
        { id: workflowIds[4], title: "Result" },
      ],
      principles: [
        {
          id: principleIds[0],
          title: "Engineering competence",
          text: "We understand the process problem, not only the equipment specification.",
        },
        {
          id: principleIds[1],
          title: "Integrated supply",
          text: "From the engineering solution to delivery of equipment to the facility.",
        },
        {
          id: principleIds[2],
          title: "Manufacturing control",
          text: "Control of fabrication and of compliance with the technical requirements.",
        },
        {
          id: principleIds[3],
          title: "Responsibility for the result",
          text: "Project support through implementation and the actual result.",
        },
      ],
    },
  });

  const expertise = [
    ["01", "engineering", "Инжиниринг", "Engineering", "Разработка технических проектов, разработка конструкторской документации, инженерное сопровождение.", "Technical design, design documentation, and engineering support."],
    ["02", "furnaces", "Промышленные печи", "Industrial furnaces", "Проектирование, комплектация и поставка технологических печей, в том числе печей парового риформинга.", "Design, configuration, and supply of process furnaces, including steam-reforming furnaces."],
    ["03", "equipment", "Оборудование", "Equipment", "Комплексная поставка технологического оборудования и комплектующих.", "Integrated supply of process equipment and components."],
    ["04", "manufacturing", "Производство", "Manufacturing", "Изготовление оборудования на аттестованной машиностроительной площадке, включая возможность производства оборудования на другой аттестованной площадке.", "Fabrication at a certified machine-building facility, including manufacture at another certified facility."],
    ["05", "support", "Сопровождение", "Support", "Технические консультации при монтаже, пусконаладке и вводе оборудования в эксплуатацию, техническое сопровождение и участие в реализации проекта.", "Technical advice during installation, commissioning, and start-up, with support through project implementation."],
  ] as const;

  for (const [index, slug, ruTitle, enTitle, ruText, enText] of expertise) {
    await createLocalized(
      payload,
      "expertise",
      { index, slug, sortOrder: Number(index), status: "published" },
      { title: { ru: ruTitle, en: enTitle }, text: { ru: ruText, en: enText } },
    );
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
