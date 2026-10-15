import Link from "next/link";

import { FurnaceDiagram } from "@/components/graphics/FurnaceDiagram";
import { CtaLink } from "@/components/layout/CtaLink";
import { ProjectInquiryForm } from "@/components/inquiry/ProjectInquiryForm";
import { ChamferedButton, Container, Section, TechnicalLabel, TechnicalMedia } from "@/components/ui/primitives";
import { pick } from "@/lib/content/pick";
import type { ArticleCard, EquipmentGroup, ExpertiseItem, MetricItem, ProjectCard, SiteContent } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { exampleProjectSlug } from "@/lib/i18n/frames";
import { copy } from "@/lib/i18n/ui";

const copyHome = {
  ru: {
    mark: "ООО «НЬЮ ФОСТЕР»",
    title: "Инжиниринг, производство, результат",
    lead: "Инженерные решения и поставка оборудования для нефтеперерабатывающей и нефтехимической промышленности.",
    concept: "NF / THERMAL — CONCEPT",
    schematic: "ПРИНЦИПИАЛЬНАЯ СХЕМА · НЕ РАБОЧИЙ ЧЕРТЁЖ",
    approach: "Теплотехника / системный подход",
    strip: ["Нефтепереработка", "Нефтехимия", "От задачи к техническому решению ↓"],
    aboutLabel: "01 / О компании",
    aboutTitle: "Соединяем инженерную проработку и исполнение",
    aboutLead: "NEW FOSTER объединяет инжиниринг, производство и поставку оборудования в одной логике проекта.",
    aboutText: "Фокус — задачи нефтепереработки и нефтехимии: от проработки решения до технического сопровождения.",
    aboutLink: "Подробнее о компании",
    stats: ["Опыт компании", "Реализованные проекты", "Производственные возможности"],
    statValue: "Показатель уточняется",
    skillsLabel: "02 / Компетенции",
    skillsTitle: "От замысла до реализации",
    skillsLead: "Пять направлений. Один согласованный технический подход.",
    skills: [
      ["Инжиниринг", "От исходных данных к согласованному техническому решению."],
      ["Промышленные печи", "Теплотехнические решения для технологических процессов."],
      ["Оборудование", "Подбор и комплектация оборудования под задачу проекта."],
      ["Производство", "Подготовка производства и контроль исполнения."],
      ["Сопровождение", "Техническая координация на всех этапах проекта."],
    ],
    processTitle: "Последовательность, которая связывает направления",
    processLead: "От задачи к результату — та же логика, что связывает компетенции в один проект.",
    steps: [
      ["Задача", "Исходные данные и границы проекта."],
      ["Инженерное решение", "Концепция и техническая проработка."],
      ["Производство", "Комплектация и контроль исполнения."],
      ["Поставка", "Подготовка и координация поставки."],
      ["Результат", "Передача решения и сопровождение."],
    ],
    heatLabel: "03 / Теплотехника",
    heatTitle: "Промышленные печи",
    heatLead: "Конфигурация печи начинается с требований технологического процесса.",
    furnaces: ["Трубчатые печи", "Нагревательные печи", "Вакуумные печи", "Технологические печи", "Модернизация печей"],
    equipmentLink: "Оборудование и решения",
    projectsLabel: "04 / Практика",
    projectsTitle: "Проекты",
    projectsLead: "Технические задачи, состав решений и проектная документация.",
    caseMeta: "Нефтепереработка / промышленные печи",
    caseTitle: "Афипский НПЗ / Печь ПМ-3 Н-101N",
    caseText: "Состав работ и результаты ожидают подтверждения.",
    openCase: "Открыть кейс",
    practice: "Проектная практика",
    practiceTitle: "За каждым решением — инженерная задача.",
    practiceText: "Другие проекты будут добавлены после согласования материалов и разрешения на публикацию.",
    whyLabel: "05 / Подход",
    whyTitle: "Почему New Foster",
    reasons: [
      ["Компетенции", "Связываем технологические требования с конструктивным решением."],
      ["Комплексная поставка", "Рассматриваем оборудование как часть единой системы."],
      ["Контроль производства", "Согласуем требования к исполнению и контрольные точки."],
      ["Ответственность", "Фиксируем границы задачи и порядок взаимодействия."],
    ],
    docsLabel: "06 / Знания и документация",
    standardsTitle: "Нормативная база",
    standardsText: "Структурированный каталог требований к проектированию, оборудованию и промышленной безопасности.",
    standardsMeta: "ГОСТ / технические регламенты / правила",
    standardsLink: "К нормативной базе",
    materialsTitle: "Материалы",
    materialsText: "Технические статьи, новости компании и документы для работы над проектом.",
    materialsMeta: "Публикации / документы",
    askLabel: "07 / Начнём с задачи",
    askTitle: "Запрос по проекту",
    askText: "Расскажите о задаче. Приложите техническое задание или исходные данные — это поможет начать предметный разговор.",
    askMeta: "Инжиниринг / оборудование / производство",
  },
  en: {
    mark: "NEW FOSTER LLC",
    title: "Engineering, manufacturing, results",
    lead: "Engineering solutions and equipment supply for the oil refining and petrochemical industries.",
    concept: "NF / THERMAL — CONCEPT",
    schematic: "PRINCIPAL SCHEME · NOT A WORKING DRAWING",
    approach: "Thermal engineering / systems approach",
    strip: ["Oil refining", "Petrochemicals", "From the task to the technical solution ↓"],
    aboutLabel: "01 / Company",
    aboutTitle: "We connect engineering development and execution",
    aboutLead: "NEW FOSTER combines engineering, manufacturing, and equipment supply in one project logic.",
    aboutText: "The focus is oil refining and petrochemical tasks, from the technical solution through project support.",
    aboutLink: "About the company",
    stats: ["Company experience", "Completed projects", "Manufacturing capability"],
    statValue: "Figure to be confirmed",
    skillsLabel: "02 / Expertise",
    skillsTitle: "From concept to implementation",
    skillsLead: "Five directions. One coordinated technical approach.",
    skills: [
      ["Engineering", "From source data to an agreed technical solution."],
      ["Industrial furnaces", "Thermal solutions for process units."],
      ["Equipment", "Selection and configuration of equipment for the project."],
      ["Manufacturing", "Preparation of manufacture and control of execution."],
      ["Support", "Technical coordination through every project stage."],
    ],
    processTitle: "The sequence that connects the directions",
    processLead: "From the task to the result — the same logic that joins the competencies into one project.",
    steps: [
      ["Challenge", "Source data and the boundaries of the project."],
      ["Engineering solution", "Concept and technical development."],
      ["Manufacturing", "Configuration and control of execution."],
      ["Delivery", "Preparation and coordination of delivery."],
      ["Result", "Handover of the solution and support."],
    ],
    heatLabel: "03 / Thermal engineering",
    heatTitle: "Industrial furnaces",
    heatLead: "A furnace configuration starts from the process requirements.",
    furnaces: ["Tubular furnaces", "Heating furnaces", "Vacuum furnaces", "Process furnaces", "Furnace modernization"],
    equipmentLink: "Equipment and solutions",
    projectsLabel: "04 / Practice",
    projectsTitle: "Projects",
    projectsLead: "Technical tasks, the scope of the solution, and project documentation.",
    caseMeta: "Oil refining / industrial furnaces",
    caseTitle: "Afipsky refinery / Furnace PM-3 N-101N",
    caseText: "Scope of work and results are awaiting confirmation.",
    openCase: "Open case",
    practice: "Project practice",
    practiceTitle: "Behind every solution is an engineering task.",
    practiceText: "Further projects will be added after the materials are approved for publication.",
    whyLabel: "05 / Approach",
    whyTitle: "Why New Foster",
    reasons: [
      ["Competence", "We connect process requirements with the structural solution."],
      ["Integrated supply", "We treat equipment as part of one system."],
      ["Manufacturing control", "We agree the execution requirements and the control points."],
      ["Responsibility", "We fix the task boundaries and how the parties work together."],
    ],
    docsLabel: "06 / Knowledge and documentation",
    standardsTitle: "Standards",
    standardsText: "A structured catalogue of requirements for design, equipment, and industrial safety.",
    standardsMeta: "GOST / technical regulations / rules",
    standardsLink: "To the standards",
    materialsTitle: "Materials",
    materialsText: "Technical articles, company news, and documents for project work.",
    materialsMeta: "Publications / documents",
    askLabel: "07 / Start with the task",
    askTitle: "Project inquiry",
    askText: "Describe the task. Attach a specification or the source data — that starts a concrete conversation.",
    askMeta: "Engineering / equipment / manufacturing",
  },
} as const;

export function HomeView({
  locale,
  site,
  expertise,
  metrics,
  projects,
  articles,
}: {
  locale: Locale;
  site: SiteContent;
  expertise: ExpertiseItem[];
  metrics: MetricItem[];
  groups: EquipmentGroup[];
  projects: ProjectCard[];
  articles: ArticleCard[];
}) {
  const t = copy(locale);
  const h = copyHome[locale];
  const home = site.home;
  const skillRows = expertise.length
    ? expertise.map((item) => [item.title, item.text] as const)
    : h.skills;
  const furnaceNames = home.furnaces.length ? home.furnaces : [...h.furnaces];
  const strip = home.strip.length ? home.strip : [...h.strip];
  const steps = site.workflow.length
    ? site.workflow.map((step) => [step.title, step.text] as const)
    : h.steps;
  const reasons = site.principles.length
    ? site.principles.map((item) => [item.title, item.text] as const)
    : h.reasons;

  return (
    <>
      <section className="border-b border-border bg-background">
        <Container className="grid items-end gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:py-24">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{h.mark}</p>
            <h1 className="type-display mt-6 max-w-3xl">{pick(site.slogan, h.title)}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{pick(site.heroLead, h.lead)}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ChamferedButton href={localePath(locale, "/projects")}>{t.ctaProjects} <span aria-hidden>↗</span></ChamferedButton>
              <CtaLink href={localePath(locale, "/contacts")} place="hero" className="inline-flex">
                <span className="inline-flex min-h-11 items-center gap-2 border border-border bg-surface px-5 py-2.5 font-medium">{t.cta} <span aria-hidden>↗</span></span>
              </CtaLink>
            </div>
          </div>
          <div>
            <FurnaceDiagram title={h.concept} caption={h.schematic} />
            <p className="mt-4 flex items-center gap-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
              {pick(home.approach, h.approach)}
              <span className="h-px flex-1 bg-brand" />
            </p>
          </div>
        </Container>
        <Container>
          <ul className="grid border-t border-border sm:grid-cols-3">
            {strip.map((item) => (
              <li key={item} className="border-b border-border py-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted sm:border-b-0">{item}</li>
            ))}
          </ul>
        </Container>
      </section>

      <Section surface>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.6fr)]">
          <div>
            <TechnicalLabel>{h.aboutLabel}</TechnicalLabel>
            <h2 className="type-h2 mt-4 max-w-xl">{pick(home.aboutTitle, h.aboutTitle)}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8">{pick(home.aboutLead, h.aboutLead)}</p>
            <p className="mt-3 max-w-2xl leading-7 text-muted">{pick(home.aboutText, h.aboutText)}</p>
            <Link href={localePath(locale, "/company")} className="mt-6 inline-flex items-center gap-2 text-sm">{pick(home.aboutLink, h.aboutLink)} <span aria-hidden>↗</span></Link>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {skillRows.map(([title], index) => (
              <li key={title} className="flex gap-4 py-3">
                <span className="font-mono text-sm text-brand">{String(index + 1).padStart(2, "0")}</span>
                <span>{title}</span>
              </li>
            ))}
          </ol>
        </div>
        <dl className="mt-12 grid border-t border-border sm:grid-cols-3">
          {(metrics.length ? metrics.map((metric) => [metric.label, `${metric.value}${metric.suffix}`]) : h.stats.map((label) => [label, h.statValue])).map(([label, value]) => (
            <div key={label} className="border-b border-border py-6 sm:border-b-0 sm:pr-6">
              <dt className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{label}</dt>
              <dd className="mt-3 text-lg">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <TechnicalLabel>{h.skillsLabel}</TechnicalLabel>
        <h2 className="type-h2 mt-4">{pick(home.skillsTitle, h.skillsTitle)}</h2>
        <p className="mt-4 max-w-2xl text-muted">{pick(home.skillsLead, h.skillsLead)}</p>
        <ol className="mt-8 divide-y divide-border border-y border-border">
          {skillRows.map(([title, text], index) => (
            <li key={title}>
              <Link href={localePath(locale, "/expertise")} className="grid gap-2 py-5 md:grid-cols-[4rem_minmax(0,16rem)_1fr_auto] md:items-center md:gap-8">
                <span className="font-mono text-sm text-brand">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-lg">{title}</span>
                <span className="text-muted">{text}</span>
                <span aria-hidden>↗</span>
              </Link>
            </li>
          ))}
        </ol>
        <h3 className="type-h3 mt-12 max-w-3xl">{pick(home.processTitle, h.processTitle)}</h3>
        <p className="mt-3 max-w-2xl text-muted">{pick(home.processLead, h.processLead)}</p>
        <ol className="mt-8 grid gap-px bg-border md:grid-cols-5">
          {steps.map(([title, text], index) => (
            <li key={title} className="bg-surface p-5">
              <p className="font-mono text-sm text-brand">{String(index + 1).padStart(2, "0")} {index === steps.length - 1 ? "↗" : "→"}</p>
              <h4 className="mt-6 text-lg">{title}</h4>
              {text ? <p className="mt-3 text-sm leading-6 text-muted">{text}</p> : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section surface>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <TechnicalLabel>{h.heatLabel}</TechnicalLabel>
            <h2 className="type-h2 mt-4">{pick(home.heatTitle, h.heatTitle)}</h2>
            <div className="mt-8 max-w-md">
              <FurnaceDiagram title={h.concept} caption={h.schematic} />
            </div>
            <p className="mt-5 max-w-md leading-7">{pick(home.heatLead, pick(site.furnacesIntro, h.heatLead))}</p>
          </div>
          <div>
            <ol className="divide-y divide-border border-y border-border">
              {furnaceNames.map((name, index) => (
                <li key={name} className="flex gap-4 py-4">
                  <span className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
                  <span>{name}</span>
                </li>
              ))}
            </ol>
            <Link href={localePath(locale, "/equipment")} className="mt-6 inline-flex items-center gap-2 text-sm">{h.equipmentLink} <span aria-hidden>↗</span></Link>
          </div>
        </div>
      </Section>

      <Section>
        <TechnicalLabel>{h.projectsLabel}</TechnicalLabel>
        <h2 className="type-h2 mt-4">{pick(home.projectsTitle, h.projectsTitle)}</h2>
        <p className="mt-4 max-w-2xl text-muted">{pick(home.projectsLead, h.projectsLead)}</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.7fr)]">
          {projects.length ? (
            <ul className="grid gap-px bg-border">
              {projects.map((project) => (
                <li key={project.slug} className="bg-background">
                  <Link href={project.href} className="grid gap-5 p-5 sm:grid-cols-[220px_1fr]">
                    <TechnicalMedia media={project.cover} label={t.noImage} />
                    <div>
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{[project.category, project.equipmentName].filter(Boolean).join(" / ")}</p>
                      <h3 className="type-h3 mt-2">{project.title}</h3>
                      {project.scope ? <p className="mt-3 text-muted">{project.scope}</p> : null}
                      <p className="mt-4 text-sm">{h.openCase} ↗</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <article className="grid gap-5 bg-surface p-5 sm:grid-cols-[220px_1fr]">
              <div className="grid min-h-36 place-items-center bg-surface-muted px-4">
                <p className="text-center font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{t.noImage}</p>
              </div>
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{h.caseMeta}</p>
                <h3 className="type-h3 mt-2">{h.caseTitle}</h3>
                <p className="mt-3 text-muted">{h.caseText}</p>
                <Link href={localePath(locale, `/projects/${exampleProjectSlug}`)} className="mt-4 inline-flex items-center gap-2 text-sm">{h.openCase} <span aria-hidden>↗</span></Link>
              </div>
            </article>
          )}
          <aside>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{h.practice}</p>
            <h3 className="type-h3 mt-3">{pick(home.practiceTitle, h.practiceTitle)}</h3>
            <p className="mt-3 leading-7 text-muted">{pick(home.practiceText, h.practiceText)}</p>
            <Link href={localePath(locale, "/projects")} className="mt-6 inline-flex items-center gap-2 text-sm">{t.allProjects} <span aria-hidden>↗</span></Link>
          </aside>
        </div>
      </Section>

      <Section surface>
        <TechnicalLabel>{h.whyLabel}</TechnicalLabel>
        <h2 className="type-h2 mt-4">{pick(home.whyTitle, h.whyTitle)}</h2>
        <ol className="mt-8 divide-y divide-border border-y border-border">
          {reasons.map(([title, text], index) => (
            <li key={title} className="grid gap-2 py-6 md:grid-cols-[4rem_minmax(0,16rem)_1fr] md:gap-8">
              <p className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="text-lg">{title}</h3>
              <p className="leading-7 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <TechnicalLabel>{h.docsLabel}</TechnicalLabel>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="type-h2">{pick(home.standardsTitle, h.standardsTitle)}</h2>
            <p className="mt-4 max-w-md leading-7 text-muted">{pick(home.standardsText, h.standardsText)}</p>
            <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{pick(home.standardsMeta, h.standardsMeta)}</p>
            <Link href={localePath(locale, "/standards")} className="mt-6 inline-flex items-center gap-2 text-sm">{h.standardsLink} <span aria-hidden>↗</span></Link>
          </div>
          <div>
            <h2 className="type-h2">{pick(home.materialsTitle, h.materialsTitle)}</h2>
            <p className="mt-4 max-w-md leading-7 text-muted">{pick(home.materialsText, h.materialsText)}</p>
            <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{pick(home.materialsMeta, h.materialsMeta)}</p>
            <div className="mt-6 flex gap-6 text-sm">
              <Link href={localePath(locale, "/news")} className="inline-flex items-center gap-2">{t.nav.news} <span aria-hidden>↗</span></Link>
              <Link href={localePath(locale, "/documents")} className="inline-flex items-center gap-2">{t.documents} <span aria-hidden>↗</span></Link>
            </div>
            {articles.length ? (
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {articles.slice(0, 3).map((article) => (
                  <li key={article.slug}>
                    <Link href={article.href} className="block py-3">{article.title}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Section>

      <Section surface>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)]">
          <div>
            <TechnicalLabel>{h.askLabel}</TechnicalLabel>
            <h2 className="type-h2 mt-4">{pick(home.askTitle, h.askTitle)}</h2>
            <p className="mt-4 max-w-md leading-7 text-muted">{pick(home.askText, h.askText)}</p>
            <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{pick(home.askMeta, h.askMeta)}</p>
          </div>
          <ProjectInquiryForm locale={locale} source="home" />
        </div>
      </Section>
    </>
  );
}
