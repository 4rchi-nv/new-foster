export type MediaView = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type SpecRow = {
  label: string;
  value: string;
  unit: string;
  notes: string;
};

export type DocumentView = {
  id: string;
  title: string;
  kind: string;
  code: string;
  number: string;
  description: string;
  date: string;
  href: string;
  filename: string;
  size?: number;
};

export type NamedLink = {
  title: string;
  href: string;
  summary: string;
};

export type PageCopy = {
  lede: string;
  note: string;
};

export type SiteHome = {
  approach: string;
  strip: string[];
  aboutTitle: string;
  aboutLead: string;
  aboutText: string;
  aboutLink: string;
  skillsTitle: string;
  skillsLead: string;
  processTitle: string;
  processLead: string;
  heatTitle: string;
  heatLead: string;
  furnaces: string[];
  projectsTitle: string;
  projectsLead: string;
  practiceTitle: string;
  practiceText: string;
  whyTitle: string;
  standardsTitle: string;
  standardsText: string;
  standardsMeta: string;
  materialsTitle: string;
  materialsText: string;
  materialsMeta: string;
  askTitle: string;
  askText: string;
  askMeta: string;
};

export type SitePages = {
  company: PageCopy & {
    profileTitle: string;
    profileLead: string;
    profileText: string;
    directionsTitle: string;
    factsTitle: string;
    legal: string;
    docsLink: string;
  };
  expertise: PageCopy;
  equipment: PageCopy & { fitTitle: string; fitText: string };
  projects: PageCopy & { archiveTitle: string; archiveText: string };
  news: PageCopy & { title: string };
  documents: PageCopy & { requestTitle: string; requestText: string };
  contacts: PageCopy & {
    title: string;
    text: string;
    hours: string;
    map: string;
    mapText: string;
    formTitle: string;
    formText: string;
  };
  standards: PageCopy & { useTitle: string; useText: string };
};

export type SiteContent = {
  companyName: string;
  legalName: string;
  slogan: string;
  heroLead: string;
  positioning: string;
  furnacesIntro: string;
  phone: string;
  email: string;
  address: string;
  seoTitle: string;
  seoDescription: string;
  home: SiteHome;
  pages: SitePages;
  workflow: { title: string; text: string }[];
  principles: { title: string; text: string }[];
};

export type ExpertiseItem = {
  index: string;
  title: string;
  text: string;
  slug: string;
  steps: string[];
};

export type MetricItem = {
  label: string;
  value: string;
  suffix: string;
};

export type EquipmentGroup = {
  id: string;
  title: string;
  summary: string;
  slug: string;
  categories: EquipmentCategory[];
};

export type EquipmentCategory = {
  id: string;
  title: string;
  summary: string;
  slug: string;
  groupSlug: string;
  items: EquipmentCard[];
};

export type EquipmentCard = {
  title: string;
  summary: string;
  slug: string;
  href: string;
};

export type EquipmentDetail = EquipmentCard & {
  body: string;
  specs: SpecRow[];
  images: MediaView[];
  diagrams: MediaView[];
  documents: DocumentView[];
  projects: NamedLink[];
  articles: NamedLink[];
  inquiry: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type ProjectCard = {
  title: string;
  slug: string;
  href: string;
  customer: string;
  equipmentName: string;
  scope: string;
  year: string;
  status: string;
  category: string;
  categorySlug: string;
  cover: MediaView | null;
};

export type ProjectDetail = ProjectCard & {
  location: string;
  task: string;
  solution: string;
  execution: string;
  manufacturing: string;
  result: string;
  specs: SpecRow[];
  gallery: { media: MediaView; caption: string }[];
  documents: DocumentView[];
  equipment: NamedLink[];
  articles: NamedLink[];
  seoTitle: string;
  seoDescription: string;
};

export type ArticleCard = {
  title: string;
  slug: string;
  href: string;
  excerpt: string;
  date: string;
  category: string;
  hero: MediaView | null;
};

export type ArticleDetail = ArticleCard & {
  body: string;
  author: string;
  gallery: { media: MediaView; caption: string }[];
  documents: DocumentView[];
  equipment: NamedLink[];
  projects: NamedLink[];
  seoTitle: string;
  seoDescription: string;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  totalPages: number;
};
